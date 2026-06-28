"""Pluggable vector store.

Backends (select with VECTOR_STORE):
* qdrant   — local Docker / self-hosted Qdrant (default).
* pinecone — Pinecone serverless (always-on, free tier; good for deployment).

Both expose the same interface used by the rest of the app:
    store_chunks_in_vector_db(chunks, metadata) -> int
    retrieve_candidates(query, k) -> list[dict]   # each has text/score/source/section

Vector dimensionality follows the active embedder (Gemini=768, fastembed=384),
so switching the embedding provider requires re-ingesting documents.
"""
import logging
import os
import time
import uuid
from functools import lru_cache
from typing import List, Optional

from app.config import settings
from app.services.embeddings import get_embedder

logger = logging.getLogger(__name__)


class QdrantStore:
    def __init__(self) -> None:
        from qdrant_client import QdrantClient

        if os.getenv("QDRANT_URL"):
            self.client = QdrantClient(
                url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY")
            )
        else:
            self.client = QdrantClient(
                host=os.getenv("QDRANT_HOST", "localhost"),
                port=int(os.getenv("QDRANT_PORT", "6333")),
            )
        self.collection = settings.QDRANT_COLLECTION

    def _ensure(self) -> None:
        from qdrant_client.models import Distance, VectorParams

        existing = {c.name for c in self.client.get_collections().collections}
        if self.collection not in existing:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=get_embedder().dim, distance=Distance.COSINE
                ),
            )
            logger.info("Created Qdrant collection '%s'.", self.collection)

    def store(self, chunks: List[str], metadata: Optional[List[dict]] = None) -> int:
        from qdrant_client.models import PointStruct

        self._ensure()
        embeddings = get_embedder().embed_documents(chunks)
        start_id = self.client.count(collection_name=self.collection).count
        points = []
        for i, (chunk, vec) in enumerate(zip(chunks, embeddings)):
            payload = {"text": chunk}
            if metadata and i < len(metadata):
                payload.update(metadata[i])
            points.append(PointStruct(id=start_id + i, vector=vec, payload=payload))
        self.client.upsert(collection_name=self.collection, points=points)
        return len(points)

    def retrieve(self, query: str, k: Optional[int] = None) -> List[dict]:
        self._ensure()
        k = k or settings.RETRIEVE_TOP_K
        qv = get_embedder().embed_query(query)
        results = self.client.search(
            collection_name=self.collection,
            query_vector=qv,
            limit=k,
            with_payload=True,
        )
        out = []
        for hit in results:
            payload = dict(hit.payload or {})
            payload["score"] = float(hit.score)
            out.append(payload)
        return out


class PineconeStore:
    def __init__(self) -> None:
        from pinecone import Pinecone, ServerlessSpec

        if not settings.PINECONE_API_KEY:
            raise RuntimeError("PINECONE_API_KEY is not set.")
        self._pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self._spec = ServerlessSpec(
            cloud=settings.PINECONE_CLOUD, region=settings.PINECONE_REGION
        )
        self.index_name = settings.PINECONE_INDEX
        self._index = None

    def _ensure(self):
        if self._index is not None:
            return self._index
        names = self._pc.list_indexes().names()
        if self.index_name not in names:
            self._pc.create_index(
                name=self.index_name,
                dimension=get_embedder().dim,
                metric="cosine",
                spec=self._spec,
            )
            # Wait until the new index is ready before using it.
            for _ in range(60):
                status = self._pc.describe_index(self.index_name).status
                ready = status.get("ready") if hasattr(status, "get") else getattr(status, "ready", False)
                if ready:
                    break
                time.sleep(1)
            logger.info("Created Pinecone index '%s'.", self.index_name)
        self._index = self._pc.Index(self.index_name)
        return self._index

    def store(self, chunks: List[str], metadata: Optional[List[dict]] = None) -> int:
        index = self._ensure()
        embeddings = get_embedder().embed_documents(chunks)
        vectors = []
        for i, (chunk, vec) in enumerate(zip(chunks, embeddings)):
            md = {"text": chunk}
            if metadata and i < len(metadata):
                # Pinecone rejects null metadata values.
                md.update({k: v for k, v in metadata[i].items() if v is not None})
            vectors.append({"id": str(uuid.uuid4()), "values": vec, "metadata": md})
        for j in range(0, len(vectors), 100):  # upsert in batches
            index.upsert(vectors=vectors[j:j + 100])
        return len(vectors)

    def retrieve(self, query: str, k: Optional[int] = None) -> List[dict]:
        index = self._ensure()
        k = k or settings.RETRIEVE_TOP_K
        qv = get_embedder().embed_query(query)
        res = index.query(vector=qv, top_k=k, include_metadata=True)
        out = []
        for m in res.matches:
            payload = dict(m.metadata or {})
            payload["score"] = float(m.score)
            out.append(payload)
        return out


@lru_cache(maxsize=1)
def get_vector_store():
    backend = settings.VECTOR_STORE
    logger.info("Initializing vector store: %s", backend)
    if backend == "pinecone":
        return PineconeStore()
    return QdrantStore()


def store_chunks_in_vector_db(chunks: List[str], metadata: Optional[List[dict]] = None) -> int:
    return get_vector_store().store(chunks, metadata)


def retrieve_candidates(query: str, k: Optional[int] = None) -> List[dict]:
    return get_vector_store().retrieve(query, k)
