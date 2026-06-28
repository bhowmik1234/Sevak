import logging
from typing import Dict

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.documents import generate_document, list_templates
from app.utils.dependencies import get_current_user_id
from app.utils.rate_limit import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


class DocumentRequest(BaseModel):
    template_id: str = Field(min_length=1, max_length=40)
    fields: Dict[str, str] = Field(default_factory=dict)
    language: str = Field(default="English", max_length=40)


@router.get("/templates")
async def templates():
    """List the available document templates and the fields each one needs."""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "message": "Templates fetched successfully.",
            "data": {"templates": list_templates()},
            "status_code": 200,
        },
    )


@router.post("/generate")
@limiter.limit("10/minute")
async def generate(
    request: Request,
    req: DocumentRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Draft a legal document from the user's facts."""
    try:
        document = generate_document(req.template_id, req.fields, language=req.language)
        if not document:
            raise ValueError("Empty document generated.")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Document drafted successfully.",
                "data": {"document": document},
                "status_code": 200,
            },
        )
    except ValueError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": str(e),
                "errors": {"template_id": str(e)},
                "status_code": 400,
            },
        )
    except Exception as e:
        logger.exception("Document generation failed")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An error occurred while drafting the document.",
                "errors": {"exception": str(e)},
                "status_code": 500,
            },
        )
