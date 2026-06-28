import logging
from datetime import datetime, timedelta, timezone

from app.db.prisma_client import prisma

logger = logging.getLogger(__name__)


async def delete_old_messages(minutes: int = 1440):
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)

    deleted_count = await prisma.message.delete_many(
        where={
            "timestamp": {
                "lt": cutoff
            }
        }
    )

    logger.info("Deleted %s messages older than %s minutes.", deleted_count, minutes)
    return deleted_count
