"""Pluggable text generation.

Backends:
* GeminiLLM — Google Gemini via API (free-tier friendly, default).
* OllamaLLM — local instruct model via the Ollama HTTP API (self-host).
* HybridLLM — try local first, fall back to the API on error/timeout.

Select with LLM_PROVIDER.
"""
import logging
from functools import lru_cache
from typing import Protocol

import requests

from app.config import settings

logger = logging.getLogger(__name__)


class LLM(Protocol):
    def generate(self, prompt: str, *, temperature: float = 0.2) -> str: ...


class GeminiLLM:
    def __init__(self, model_name: str | None = None) -> None:
        import google.generativeai as genai

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self._model = genai.GenerativeModel(model_name or settings.GEMINI_MODEL)

    def generate(self, prompt: str, *, temperature: float = 0.2) -> str:
        response = self._model.generate_content(
            prompt,
            generation_config={"temperature": temperature},
        )
        return (response.text or "").strip()


class OllamaLLM:
    def __init__(self) -> None:
        self._host = settings.OLLAMA_HOST.rstrip("/")
        self._model = settings.OLLAMA_MODEL
        self._timeout = settings.OLLAMA_TIMEOUT

    def generate(self, prompt: str, *, temperature: float = 0.2) -> str:
        resp = requests.post(
            f"{self._host}/api/generate",
            json={
                "model": self._model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": temperature},
            },
            timeout=self._timeout,
        )
        resp.raise_for_status()
        return (resp.json().get("response") or "").strip()


class HybridLLM:
    """Local-first generation with an API fallback for resilience/quality."""

    def __init__(self) -> None:
        self._local = OllamaLLM()
        self._fallback = GeminiLLM()

    def generate(self, prompt: str, *, temperature: float = 0.2) -> str:
        try:
            text = self._local.generate(prompt, temperature=temperature)
            if text:
                return text
            logger.warning("Local LLM returned empty output; falling back to API.")
        except Exception as e:
            logger.warning("Local LLM failed (%s); falling back to API.", e)
        return self._fallback.generate(prompt, temperature=temperature)


@lru_cache(maxsize=1)
def get_llm() -> LLM:
    provider = settings.LLM_PROVIDER
    logger.info("Initializing LLM provider: %s", provider)
    if provider == "ollama":
        return OllamaLLM()
    if provider == "hybrid":
        return HybridLLM()
    if provider == "gemini":
        return GeminiLLM()
    raise ValueError(f"Unknown LLM_PROVIDER: {provider}")


@lru_cache(maxsize=1)
def get_judge_llm() -> LLM:
    """A cheap, fast model used for query rewriting and groundedness judging."""
    return GeminiLLM(model_name=settings.GEMINI_JUDGE_MODEL)
