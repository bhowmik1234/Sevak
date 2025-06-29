

from datetime import datetime, timedelta
from app.db.prisma_client import prisma

async def delete_old_messages(minutes: int = 5):
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)

    deleted_count = await prisma.message.delete_many(
        where={
            "timestamp": {
                "lt": cutoff
            }
        }
    )

    print(f"[Cleanup] Deleted {deleted_count} messages older than {minutes} minutes.")
    return deleted_count