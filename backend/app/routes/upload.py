import logging
import re

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import JSONResponse

from app.services.vector_store import store_chunks_in_vector_db
from app.utils.chunker import chunk_text
from app.utils.dependencies import require_admin_key
from app.utils.pdf_processor import extract_text_from_bytes, extract_text_from_pdf

logger = logging.getLogger(__name__)
router = APIRouter()

_SECTION_RE = re.compile(r"\bSection\s+(\d+[A-Z]?)\b", re.IGNORECASE)


def _build_metadata(chunks, source):
    """Attach the source and a best-effort section number to each chunk."""
    metadata = []
    for chunk in chunks:
        match = _SECTION_RE.search(chunk)
        metadata.append({
            "source": source,
            "section": f"Section {match.group(1)}" if match else None,
        })
    return metadata


# Route to ingest a PDF into the RAG vector store (admin only).
@router.post("/upload-pdf", dependencies=[Depends(require_admin_key)])
async def upload_pdf(
    file_url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    """
    Ingest a PDF — provided either as a direct/Drive URL (`file_url`) or as an
    uploaded `file` — and store its chunks in the vector database for RAG.
    """
    if not file_url and file is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": "Provide either 'file_url' or an uploaded 'file'.",
                "errors": {"input": "No PDF source supplied."},
                "status_code": 400
            }
        )

    try:
        if file is not None:
            text = extract_text_from_bytes(await file.read())
            source = file.filename
        else:
            text = extract_text_from_pdf(file_url)
            source = file_url

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
        store_chunks_in_vector_db(chunks, _build_metadata(chunks, source))
        logger.info("Ingested %d chunks from %s", len(chunks), source)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "PDF processed and chunks stored successfully.",
                "data": {
                    "source": source,
                    "total_chunks": len(chunks)
                },
                "status_code": 200
            }
        )

    except Exception as e:
        logger.exception("PDF ingestion failed")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred while processing the PDF.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
