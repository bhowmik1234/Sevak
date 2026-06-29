# Deploying prisma-client-py reliably requires the query-engine binary to live on
# the SAME filesystem that runs the app. With Render's native Python runtime the
# build cache (~/.cache) is wiped before the app starts -> BinaryNotFoundError.
# A Docker image makes build == runtime, so the engine is baked in and always found.
FROM python:3.12-slim

# libssl: Prisma query engine. ca-certificates: HTTPS downloads.
# libatomic1: the Node binary Prisma fetches (via nodeenv) links against it,
# and python:slim doesn't ship it -> "libatomic.so.1: cannot open shared object".
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates libatomic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Generate the Python client AND download the query engine INTO the image layer.
RUN prisma generate && prisma py fetch

# Apply migrations at startup (DATABASE_URL is only present at runtime), then
# launch. Render injects $PORT.
CMD ["sh", "-c", "prisma migrate deploy && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
