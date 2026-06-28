"""PDF text extraction (PyMuPDF)."""
import logging
import re
from io import BytesIO

import fitz  # PyMuPDF
import requests

logger = logging.getLogger(__name__)

_DRIVE_ID_RE = re.compile(r"/d/([a-zA-Z0-9_-]+)")


def _normalize_url(url: str) -> str:
    """Convert a Google Drive share link to a direct-download URL.

    Direct PDF URLs are returned unchanged.
    """
    match = _DRIVE_ID_RE.search(url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return url


def extract_text_from_bytes(data: bytes) -> str:
    text = []
    with fitz.open(stream=BytesIO(data), filetype="pdf") as pdf:
        for i, page in enumerate(pdf):
            page_text = page.get_text()
            if not page_text.strip():
                logger.warning("Page %d has no extractable text (likely image-based).", i + 1)
            text.append(page_text)
    return "".join(text).strip()


def extract_text_from_pdf(url: str) -> str:
    """Download a PDF (direct URL or Google Drive link) and extract its text."""
    download_url = _normalize_url(url)
    response = requests.get(download_url, timeout=30)
    if response.status_code != 200:
        raise Exception(f"Failed to download PDF. Status code: {response.status_code}")
    return extract_text_from_bytes(response.content)
