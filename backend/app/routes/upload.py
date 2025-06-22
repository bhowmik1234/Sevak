from fastapi import APIRouter
import os
from pydantic import BaseModel
from app.utils.pdf_processor import extract_text_from_pdf
from app.utils.chunker import chunk_text
from app.services.vector_store import store_chunks_in_vector_db

router = APIRouter()

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

class FileUrl(BaseModel):
    file_url: str

# Route to upload the pdf as RAG
@router.post("/upload-pdf")
async def upload_pdf(req: FileUrl):
    '''
        A Function that takes pdf url from user and upload it in the vector database which can be
        use for further Query.
    '''
    file_path = req.file_url

    text = extract_text_from_pdf(file_path)
    # print("test here->", text)
    chunks = chunk_text(text)
    print("chunks here ->", chunks)
    store_chunks_in_vector_db(chunks)
    return {"status": "success", "chunks": len(chunks)}
