from fastapi import FastAPI
from app.db.prisma_client import prisma
from app.routes import upload, chat, users

app = FastAPI()

# Mount routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(upload.router, prefix="/admin", tags=["Upload"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
