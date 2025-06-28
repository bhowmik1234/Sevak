from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from app.db.prisma_client import prisma

router = APIRouter()

class UserAuthRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def authenticate_user(credentials: UserAuthRequest):
    """
    Authenticate user using email and password.
    """
    try:
        user = await prisma.user.find_unique(where={"email": credentials.email})

        if not user or user.password != credentials.password:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Invalid email or password.",
                    "errors": {"credentials": "Email or password is incorrect."},
                    "status_code": 401
                }
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "User authenticated successfully.",
                "data": {
                    "userId": user.id,
                    "name": user.name,
                    "email": user.email
                },
                "status_code": 200
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred during authentication.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
