# ********************************************* Chroma DB ********************************************************
# import chromadb
# from chromadb.config import Settings
# from sentence_transformers import SentenceTransformer
# import os

# model = SentenceTransformer(os.getenv("EMBEDDINGS_MODEL"))
# # model = SentenceTransformer("BAAI/bge-small-en-v1.5")


# chroma_client = chromadb.PersistentClient(
#     path=os.getenv("CHROMA_DB_PATH", "./chroma_store")
# )

# collection = chroma_client.get_or_create_collection(name="pdf_chunks")

# Store text chunks
# def store_chunks_in_vector_db(chunks: list):
#     """
#     Store text chunks into ChromaDB with generated embeddings.
#     """
#     inputs = [f"passage: {chunk}" for chunk in chunks]
#     embeddings = model.encode(inputs, normalize_embeddings=True).tolist()
#     # embeddings = model.encode(chunks).tolist()
#     ids = [f"chunk_{i}" for i in range(len(chunks))]
#     collection.add(documents=chunks, embeddings=embeddings, ids=ids)

# Retrieve similar chunks
# def retrieve_similar_chunks(query: str, k=5):
#     """
#     Retrieve top-k most similar chunks for the given query.
#     """
#     query_embedding = model.encode(
#         [f"query: {query}"], normalize_embeddings=True
#     ).tolist()[0]
#     query_embedding = model.encode([query]).tolist()[0]
#     results = collection.query(query_embeddings=[query_embedding], n_results=k)
#     # return results["documents"][0]
#     return results["documents"][0] if results["documents"] else []

# ******************************** Delete Chroma DB Collection **************************

# from chromadb import PersistentClient

# client = PersistentClient(path="./chroma")
# collections = client.list_collections()

# # Delete each collection
# for collection in collections:
#     client.delete_collection(name=collection.name)

# print("✅ All collections deleted from ChromaDB.")



# ****************************************************** Qdrant DB ****************************************************************

import os
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Load embedding model
model = SentenceTransformer(os.getenv("EMBEDDINGS_MODEL", "BAAI/bge-small-en-v1.5"))

# Connect to Qdrant (local server)
qdrant_client = QdrantClient(host="localhost", port=6333)

# use this in case of cloud database
# qdrant_client = QdrantClient(
#     url="QDRANT_CLUSTER_URL",
#     api_key="QDRANT_API_KEY"
# )

# Define collection name and vector size
COLLECTION_NAME = "pdf_chunks"
VECTOR_SIZE = model.get_sentence_embedding_dimension()

# Create collection if it doesn't exist
qdrant_client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
)

# Store text chunks
def store_chunks_in_vector_db(chunks: list):
    inputs = [f"passage: {chunk}" for chunk in chunks]
    embeddings = model.encode(inputs, normalize_embeddings=True).tolist()

    points = [
        PointStruct(id=i, vector=embeddings[i], payload={"text": chunks[i]})
        for i in range(len(chunks))
    ]

    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)

# Retrieve similar chunks
def retrieve_similar_chunks(query: str, k=5):
    query_embedding = model.encode([f"query: {query}"], normalize_embeddings=True).tolist()[0]

    results = qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        limit=k,
        with_payload=True
    )

    return [hit.payload["text"] for hit in results]
