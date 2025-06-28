from fastapi import FastAPI
from app.db.prisma_client import prisma
from app.routes import upload, chat, users, auth
from app.utils.cleanup import delete_old_messages
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app = FastAPI()
# Create the scheduler
scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(upload.router, prefix="/admin", tags=["Upload"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])


@app.on_event("startup")
async def startup():
    await prisma.connect()
    # Define a proper async task for deletion
    async def scheduled_cleanup():
        await delete_old_messages(5)

    # Schedule it every 1 minute
    scheduler.add_job(
        scheduled_cleanup,
        trigger=IntervalTrigger(minutes=360000),
        id="delete_old_messages",
        replace_existing=True
    )

    scheduler.start()
    print("[Scheduler] Started automatic cleanup task.")

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
