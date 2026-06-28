import logging

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from app.db.prisma_client import prisma
from app.utils.security import create_access_token, verify_password

logger = logging.getLogger(__name__)
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

        if not user or not verify_password(credentials.password, user.password):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Invalid email or password.",
                    "errors": {"credentials": "Email or password is incorrect."},
                    "status_code": 401
                }
            )

        token = create_access_token(user.id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "User authenticated successfully.",
                "data": {
                    "userId": user.id,
                    "name": user.name,
                    "email": user.email,
                    "token": token,
                },
                "status_code": 200
            }
        )

    except Exception as e:
        logger.exception("Authentication failed")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred during authentication.",
                "errors": {"exception": str(e)},
                "status_code": 500
            }
        )
