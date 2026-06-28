import logging
import os

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.db.prisma_client import prisma
from app.routes import auth, chat, documents, upload, users
from app.utils.cleanup import delete_old_messages
from app.utils.rate_limit import limiter

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Only allow configured frontend origins (drop any that are unset).
origins = [o for o in [os.getenv("FRONTEND_URL")] if o]
if not origins:
    logger.warning("FRONTEND_URL is not set; CORS will block browser requests.")

# How often the cleanup job runs, and how long messages are retained.
CLEANUP_INTERVAL_MINUTES = int(os.getenv("CLEANUP_INTERVAL_MINUTES", "60"))
MESSAGE_RETENTION_MINUTES = int(os.getenv("MESSAGE_RETENTION_MINUTES", "1440"))  # 24h

app = FastAPI()

# Wire up rate limiting (slowapi).
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

scheduler = AsyncIOScheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
async def ping():
    return {"status": "ok"}


app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(upload.router, prefix="/admin", tags=["Upload"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])


@app.on_event("startup")
async def startup():
    await prisma.connect()

    async def scheduled_cleanup():
        await delete_old_messages(MESSAGE_RETENTION_MINUTES)

    scheduler.add_job(
        scheduled_cleanup,
        trigger=IntervalTrigger(minutes=CLEANUP_INTERVAL_MINUTES),
        id="delete_old_messages",
        replace_existing=True
    )

    scheduler.start()
    logger.info(
        "Scheduler started: cleanup every %s min, retention %s min.",
        CLEANUP_INTERVAL_MINUTES,
        MESSAGE_RETENTION_MINUTES,
    )


@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown(wait=False)
    await prisma.disconnect()
