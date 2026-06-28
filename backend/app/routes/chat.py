import logging
from datetime import datetime

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.db.prisma_client import prisma
from app.services.rag_pipeline import generate_answer
from app.utils.dependencies import get_current_user_id
from app.utils.rate_limit import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


# Route that chats with the user
@router.post("/message")
@limiter.limit("20/minute")
async def chat(
    request: Request,
    req: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        history = await prisma.message.find_many(
            where={"userId": user_id},
            order={"timestamp": "asc"}
        )
        past_turns = [(m.user, m.bot) for m in history[-10:]]  # last 10 turns
        result = generate_answer(req.message, past_turns)
        answer = result["reply"]

        await prisma.message.create(data={
            "userId": user_id,
            "user": req.message,
            "bot": answer
        })

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Response generated successfully.",
                "data": {
                    "reply": answer,
                    "sources": result["sources"],
                    "grounded": result["grounded"],
                    "refused": result["refused"],
                },
                "status_code": 200
            }
        )

    except Exception as e:
        logger.exception("Chat request failed")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An error occurred while processing the chat.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )


def serialize_message(message):
    data = message.model_dump()
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data


@router.get("/history")
async def history(user_id: str = Depends(get_current_user_id)):
    try:
        messages = await prisma.message.find_many(
            where={"userId": user_id},
            order={"timestamp": "asc"},
        )
        serialized_messages = [serialize_message(message) for message in messages]

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Chat history fetched successfully.",
                "data": {"history": serialized_messages},
                "status_code": 200
            }
        )

    except Exception as e:
        logger.exception("Failed to fetch chat history")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Failed to fetch chat history.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
