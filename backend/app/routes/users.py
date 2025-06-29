from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import uuid
from app.db.prisma_client import prisma

router = APIRouter()

# Pydantic model for user registration
class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/signup")
async def create_user(user: UserCreateRequest):
    """
    Create a new user with name, email, and password.
    """
    existing_user = await prisma.user.find_unique(where={"email": user.email})
    print(existing_user)
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
    print("here 1")
    await prisma.user.create(
        data={
            "id": user_id,
            "name": user.name,
            "email": user.email,
            "password": user.password  
        }
    )
    print("here 2")
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True,
            "message": "User created successfully.",
            "data": {
                "id": user_id,
                "name": user.name,
                "email": user.email
            },
            "status_code": 201
        }
    )
