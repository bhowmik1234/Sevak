import logging
import uuid

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

from app.db.prisma_client import prisma
from app.utils.security import create_access_token, hash_password

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic model for user registration
class UserCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


@router.post("/signup")
async def create_user(user: UserCreateRequest):
    """
    Create a new user with name, email, and password.
    """
    existing_user = await prisma.user.find_unique(where={"email": user.email})
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": "Email already registered",
                "errors": {"email": "This email is already in use."},
                "status_code": 400
            }
        )

    user_id = str(uuid.uuid4())
    await prisma.user.create(
        data={
            "id": user_id,
            "name": user.name,
            "email": user.email,
            "password": hash_password(user.password),
        }
    )
    logger.info("Created new user %s", user_id)

    token = create_access_token(user_id)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True,
            "message": "User created successfully.",
            "data": {
                "userId": user_id,
                "name": user.name,
                "email": user.email,
                "token": token,
            },
            "status_code": 201
        }
    )
