"""Pluggable text embeddings.

Two backends:
* GeminiEmbedder  — Google `text-embedding-004` via API (no local ML; free-tier).
* FastEmbedEmbedder — local ONNX model via `fastembed` (self-host, optional dep).

Select with EMBEDDINGS_PROVIDER.
"""
import logging
from functools import lru_cache
from typing import List, Protocol

from app.config import settings

logger = logging.getLogger(__name__)


class Embedder(Protocol):
    dim: int

    def embed_documents(self, texts: List[str]) -> List[List[float]]: ...

    def embed_query(self, text: str) -> List[float]: ...


class GeminiEmbedder:
    """Embeddings via the Google Generative AI API."""

    def __init__(self) -> None:
        import google.generativeai as genai

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self._genai = genai
        self._model = settings.GEMINI_EMBED_MODEL
        self.dim = settings.GEMINI_EMBED_DIM

    def _embed(self, text: str, task_type: str) -> List[float]:
        result = self._genai.embed_content(
            model=self._model,
            content=text,
            task_type=task_type,
            # gemini-embedding-001 defaults to 3072 dims; pin to our collection size.
            output_dimensionality=self.dim,
        )
        return result["embedding"]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed(t, "retrieval_document") for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed(text, "retrieval_query")


class FastEmbedEmbedder:
    """Local ONNX embeddings via fastembed (no torch). Self-host profile."""

    def __init__(self) -> None:
        from fastembed import TextEmbedding  # lazy: optional dependency

        # Default threading; an explicit high thread count oversubscribes cores
        # and is dramatically slower on this hardware.
        self._model = TextEmbedding(model_name=settings.FASTEMBED_MODEL)
        self.dim = settings.FASTEMBED_DIM

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [v.tolist() for v in self._model.embed(texts)]

    def embed_query(self, text: str) -> List[float]:
        return next(iter(self._model.query_embed(text))).tolist()


@lru_cache(maxsize=1)
def get_embedder() -> Embedder:
    provider = settings.EMBEDDINGS_PROVIDER
    logger.info("Initializing embeddings provider: %s", provider)
    if provider == "fastembed":
        return FastEmbedEmbedder()
    if provider == "gemini":
        return GeminiEmbedder()
    raise ValueError(f"Unknown EMBEDDINGS_PROVIDER: {provider}")
