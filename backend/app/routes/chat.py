from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.rag_pipeline import generate_answer
from app.db.prisma_client import prisma

router = APIRouter()

class ChatRequest(BaseModel):
    userId: str
    message: str

# Route that chats with the user
@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        history = await prisma.message.find_many(
            where={"userId": req.userId},
            order={"timestamp": "asc"}
        )
        past_turns = [(m.user, m.bot) for m in history[-10:]]  # last 10 turns
        answer = generate_answer(req.message, past_turns)

        await prisma.message.create(data={
            "userId": req.userId,
            "user": req.message,
            "bot": answer
        })

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Response generated successfully.",
                "data": {"reply": answer},
                "status_code": 200
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An error occurred while processing the chat.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )

from datetime import datetime

def serialize_message(message):
    data = message.model_dump()
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data

@router.get("/history/{userId}")
async def history(userId: str):
    try:
        messages = await prisma.message.find_many(where={"userId": userId})
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
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Failed to fetch chat history.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
