from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.utils.pdf_processor import extract_text_from_pdf
from app.utils.chunker import chunk_text
from app.services.vector_store import store_chunks_in_vector_db

router = APIRouter()

class FileUrl(BaseModel):
    file_url: str

# Route to upload the pdf as RAG

@router.post("/upload-pdf")
async def upload_pdf(req: FileUrl):
    """
    Upload a PDF and store its chunks in the vector database for RAG purposes.
    """
    try:
        file_path = req.file_url

        text = extract_text_from_pdf(file_path)
        if not text.strip():
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "message": "PDF has no extractable text.",
                    "errors": {"file": "The PDF file appears to be empty or unreadable."},
                    "status_code": 400
                }
            )

        chunks = chunk_text(text)
        store_chunks_in_vector_db(chunks)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "PDF processed and chunks stored successfully.",
                "data": {
                    "file_url": file_path,
                    "total_chunks": len(chunks)
                },
                "status_code": 200
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred while processing the PDF.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
