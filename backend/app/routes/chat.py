from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_pipeline import generate_answer
from app.db.prisma_client import prisma

router = APIRouter()

class ChatRequest(BaseModel):
    userId: str
    message: str

# Route that chat with the User
@router.post("/chat")
async def chat(req: ChatRequest):
    '''
        A Route Function that takes Query from user and give output based on that query.
    '''
    history = await prisma.message.find_many(
        where={"userId": req.userId},
        order={"timestamp": "asc"}
    )
    past_turns = [(m.user, m.bot) for m in history[-5:]]  # last 5 turns
    answer = generate_answer(req.message, past_turns)

    await prisma.message.create(data={
        "userId": req.userId,
        "user": req.message,
        "bot": answer
    })
    return {"reply": answer}

# Route that shows User chat history
@router.get("/history/{userId}")
async def history(userId: str):
    '''
        A Route that gives User history
    '''
    messages = await prisma.message.find_many(where={"userId": userId})
    return {"history": messages}
