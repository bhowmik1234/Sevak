from fastapi import APIRouter
import uuid
from app.db.prisma_client import prisma

router = APIRouter()

@router.post("/users")
async def create_user():
    '''
        Function to create a new User.
    '''
    user_id = str(uuid.uuid4())
    await prisma.user.create(data={"id": user_id})
    return {"userId": user_id}
