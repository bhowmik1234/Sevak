"""Central RAG configuration, driven by environment variables.

Two profiles are supported via env without code changes:

* free / deployed (defaults): everything through the Gemini API, no local ML.
* local / self-host: fastembed embeddings, Ollama generation, ONNX verifiers.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env so os.getenv works in local dev. On a deployed host the real
# environment variables are already set, so this is a harmless no-op.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _flag(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


class Settings:
    # --- Providers -------------------------------------------------------
    # embeddings: "gemini" (API) | "fastembed" (local ONNX)
    EMBEDDINGS_PROVIDER = os.getenv("EMBEDDINGS_PROVIDER", "gemini").lower()
    # llm: "gemini" (API) | "ollama" (local) | "hybrid" (local-first, API fallback)
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()

    # --- Gemini ----------------------------------------------------------
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
    GEMINI_JUDGE_MODEL = os.getenv("GEMINI_JUDGE_MODEL", "models/gemini-2.5-flash-lite")
    GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "models/gemini-embedding-001")
    GEMINI_EMBED_DIM = int(os.getenv("GEMINI_EMBED_DIM", "768"))

    # --- Ollama (local generation) --------------------------------------
    OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b-instruct")
    OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "60"))

    # --- fastembed (local embeddings) -----------------------------------
    FASTEMBED_MODEL = os.getenv("FASTEMBED_MODEL", "BAAI/bge-small-en-v1.5")
    FASTEMBED_DIM = int(os.getenv("FASTEMBED_DIM", "384"))

    # --- Vector store ----------------------------------------------------
    # backend: "qdrant" (local/self-host) | "pinecone" (always-on serverless)
    VECTOR_STORE = os.getenv("VECTOR_STORE", "qdrant").lower()
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX", "sevak")
    PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
    PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")

    # --- Retrieval -------------------------------------------------------
    QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "pdf_chunks")
    RETRIEVE_TOP_K = int(os.getenv("RETRIEVE_TOP_K", "20"))   # initial candidates
    FINAL_K = int(os.getenv("FINAL_K", "5"))                  # chunks fed to the LLM

    # --- Reranking (local profile only) ---------------------------------
    RERANK_ENABLED = _flag("RERANK_ENABLED", False)
    RERANK_MODEL = os.getenv("RERANK_MODEL", "Xenova/ms-marco-MiniLM-L-6-v2")

    # --- Verification ----------------------------------------------------
    # Pre-gen relevance gate: refuse to answer if the best chunk scores below this.
    RELEVANCE_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.30"))
    # Post-gen groundedness check
    GROUNDEDNESS_ENABLED = _flag("GROUNDEDNESS_ENABLED", True)
    # method: "judge" (LLM-as-judge, API) | "nli" (local entailment model) | "off"
    GROUNDEDNESS_METHOD = os.getenv("GROUNDEDNESS_METHOD", "judge").lower()
    NLI_MODEL = os.getenv("NLI_MODEL", "cross-encoder/nli-deberta-v3-small")

    # --- Query rewriting -------------------------------------------------
    QUERY_REWRITE_ENABLED = _flag("QUERY_REWRITE_ENABLED", True)

    # --- Conversation ----------------------------------------------------
    HISTORY_TURNS = int(os.getenv("HISTORY_TURNS", "6"))


settings = Settings()
