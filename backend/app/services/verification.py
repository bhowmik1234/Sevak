"""Verification steps for the RAG pipeline.

Pre-generation : relevance gate — is the retrieved context actually on-topic?
                 If not, we refuse instead of letting the model hallucinate.
Post-generation: groundedness — are the answer's claims supported by the context?

Both are pluggable so the free profile stays API-only (no local ML):
* relevance  : cosine score threshold (free) or cross-encoder rerank (self-host).
* groundedness: LLM-as-judge (free) or local NLI entailment (self-host).
"""
import json
import logging
import math
import re
from functools import lru_cache
from typing import List, Tuple

from app.config import settings

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# Pre-generation: relevance gate
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def _get_reranker():
    from sentence_transformers import CrossEncoder  # lazy, self-host extra

    return CrossEncoder(settings.RERANK_MODEL)


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def select_relevant(query: str, candidates: List[dict]) -> Tuple[List[dict], bool]:
    """Rank candidates, keep the top FINAL_K, and decide whether to answer.

    Each candidate is a dict with at least {"text", "score"} (cosine score from
    Qdrant). Returns (kept_chunks, passed_gate).
    """
    if not candidates:
        return [], False

    if settings.RERANK_ENABLED:
        reranker = _get_reranker()
        pairs = [(query, c["text"]) for c in candidates]
        for c, raw in zip(candidates, reranker.predict(pairs)):
            c["relevance"] = _sigmoid(float(raw))
    else:
        # Cosine distance in Qdrant returns scores in roughly [-1, 1]; treat as-is.
        for c in candidates:
            c["relevance"] = float(c.get("score", 0.0))

    ranked = sorted(candidates, key=lambda c: c["relevance"], reverse=True)
    best = ranked[0]["relevance"]
    passed = best >= settings.RELEVANCE_THRESHOLD

    if not passed:
        logger.info("Relevance gate failed: best=%.3f < %.3f", best, settings.RELEVANCE_THRESHOLD)

    return ranked[: settings.FINAL_K], passed


# --------------------------------------------------------------------------- #
# Post-generation: groundedness
# --------------------------------------------------------------------------- #
_JUDGE_PROMPT = """You are a strict fact-checker. Decide whether the ANSWER is \
fully supported by the CONTEXT below. A claim is "supported" only if the context \
states or directly implies it. Ignore differences in wording.

Respond with ONLY a JSON object:
{{"grounded": true|false, "unsupported": ["<short claim>", ...]}}

CONTEXT:
{context}

ANSWER:
{answer}
"""


def _judge_groundedness(answer: str, context: str) -> dict:
    from app.services.llm import get_judge_llm

    raw = get_judge_llm().generate(
        _JUDGE_PROMPT.format(context=context, answer=answer), temperature=0.0
    )
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        logger.warning("Groundedness judge returned no JSON; assuming grounded.")
        return {"grounded": True, "unsupported": []}
    try:
        data = json.loads(match.group(0))
        return {
            "grounded": bool(data.get("grounded", True)),
            "unsupported": list(data.get("unsupported", []) or []),
        }
    except json.JSONDecodeError:
        logger.warning("Groundedness judge JSON parse failed; assuming grounded.")
        return {"grounded": True, "unsupported": []}


@lru_cache(maxsize=1)
def _get_nli():
    from sentence_transformers import CrossEncoder  # lazy, self-host extra

    return CrossEncoder(settings.NLI_MODEL)


def _split_sentences(text: str) -> List[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 15]


def _nli_groundedness(answer: str, context: str) -> dict:
    """Check each answer sentence is entailed by the context (label index 1)."""
    nli = _get_nli()
    sentences = _split_sentences(answer)
    if not sentences:
        return {"grounded": True, "unsupported": []}

    scores = nli.predict([(context, s) for s in sentences])
    unsupported = []
    for sent, score in zip(sentences, scores):
        # CrossEncoder NLI returns [contradiction, entailment, neutral] logits.
        label = int(score.argmax()) if hasattr(score, "argmax") else 1
        if label != 1:
            unsupported.append(sent)
    return {"grounded": not unsupported, "unsupported": unsupported}


def check_groundedness(answer: str, chunks: List[dict]) -> dict:
    """Return {"grounded": bool, "unsupported": [...]}."""
    if not settings.GROUNDEDNESS_ENABLED or settings.GROUNDEDNESS_METHOD == "off":
        return {"grounded": True, "unsupported": []}

    context = "\n\n".join(c["text"] for c in chunks)
    if not context.strip():
        return {"grounded": True, "unsupported": []}

    try:
        if settings.GROUNDEDNESS_METHOD == "nli":
            return _nli_groundedness(answer, context)
        return _judge_groundedness(answer, context)
    except Exception:
        logger.exception("Groundedness check failed; assuming grounded.")
        return {"grounded": True, "unsupported": []}
