"""RAG orchestration: rewrite -> retrieve -> verify -> generate -> verify."""
import logging
from typing import List, Tuple

from app.config import settings
from app.services.llm import get_judge_llm, get_llm
from app.services.vector_store import retrieve_candidates
from app.services.verification import check_groundedness, select_relevant

logger = logging.getLogger(__name__)

REFUSAL_MESSAGE = (
    "I'm sorry — I couldn't find anything in my legal reference sources that "
    "reliably answers this. I don't want to risk giving you incorrect legal "
    "information.\n\n"
    "Please consider reaching out to a qualified lawyer or your nearest free "
    "legal aid centre (District Legal Services Authority). If you are in "
    "immediate danger, call 112."
)

GROUNDEDNESS_CAVEAT = (
    "\n\n_Note: parts of this answer could not be fully verified against my "
    "legal sources. Please confirm important details with a qualified lawyer._"
)

_REWRITE_PROMPT = """Rewrite the user's latest message into a single, standalone \
search query for a legal knowledge base. Resolve references like "it"/"that" \
using the conversation. Reply with ONLY the query text.

Conversation:
{history}

Latest message: {query}
Standalone query:"""

_ANSWER_PROMPT = """You are an empathetic, responsible AI Legal Assistant trained \
in Indian law (IPC, CrPC, Constitution, civil/criminal codes, and protective acts).

You help users who may be victims of crime or injustice. Use ONLY the CONTEXT \
below to answer — do not invent laws, sections, or punishments. If the context is \
insufficient for part of the question, say so plainly.

Guidelines:
- Identify the relevant Indian laws found in the context.
- For each, explain in simple English: what it protects, what is criminalized, \
the punishment, and the practical steps the user should take.
- Be supportive and clear. Answer in points, using new lines.

CONTEXT:
{context}

CONVERSATION:
{history}

USER QUESTION: {query}

ANSWER:"""


def _format_history(history: List[Tuple[str, str]]) -> str:
    if not history:
        return "(none)"
    turns = history[-settings.HISTORY_TURNS:]
    return "\n".join(f"User: {q}\nAssistant: {a}" for q, a in turns)


def _rewrite_query(query: str, history: List[Tuple[str, str]]) -> str:
    if not settings.QUERY_REWRITE_ENABLED or not history:
        return query
    try:
        rewritten = get_judge_llm().generate(
            _REWRITE_PROMPT.format(history=_format_history(history), query=query),
            temperature=0.0,
        )
        rewritten = rewritten.strip().splitlines()[0] if rewritten.strip() else query
        logger.debug("Query rewritten: %r -> %r", query, rewritten)
        return rewritten or query
    except Exception:
        logger.exception("Query rewrite failed; using original query.")
        return query


def _collect_sources(chunks: List[dict]) -> List[dict]:
    seen, sources = set(), []
    for c in chunks:
        src = c.get("source")
        section = c.get("section")
        key = (src, section)
        if src and key not in seen:
            seen.add(key)
            sources.append({"source": src, "section": section})
    return sources


def generate_answer(query: str, user_history: List[Tuple[str, str]] = []) -> dict:
    """Run the full RAG pipeline. Returns {reply, sources, grounded, refused}."""
    search_query = _rewrite_query(query, user_history)

    # Retrieve + pre-generation relevance gate.
    candidates = retrieve_candidates(search_query)
    kept, passed = select_relevant(search_query, candidates)
    if not passed:
        return {"reply": REFUSAL_MESSAGE, "sources": [], "grounded": True, "refused": True}

    context = "\n\n".join(c["text"] for c in kept)
    prompt = _ANSWER_PROMPT.format(
        context=context, history=_format_history(user_history), query=query
    )

    try:
        answer = get_llm().generate(prompt, temperature=0.2)
    except Exception:
        logger.exception("Generation failed")
        return {
            "reply": "Sorry, I couldn't process your question right now.",
            "sources": [],
            "grounded": True,
            "refused": False,
        }

    if not answer:
        return {
            "reply": "Sorry, I couldn't process your question right now.",
            "sources": [],
            "grounded": True,
            "refused": False,
        }

    # Post-generation groundedness verification.
    verdict = check_groundedness(answer, kept)
    if not verdict["grounded"]:
        logger.info("Answer flagged as not fully grounded: %s", verdict["unsupported"])
        answer += GROUNDEDNESS_CAVEAT

    return {
        "reply": answer,
        "sources": _collect_sources(kept),
        "grounded": verdict["grounded"],
        "refused": False,
    }
