"""Lightweight sentence-based text chunking.

Previously this used spaCy (`en_core_web_sm`), which pulled a large model into
the deployment image. We split on sentence boundaries with a regex and measure
length by word count instead — good enough for RAG chunking and dependency-free.
"""
import re
from typing import List

# Split after ., ! or ? followed by whitespace (keeps the punctuation).
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def _split_sentences(text: str) -> List[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    return [s.strip() for s in _SENTENCE_RE.split(text) if s.strip()]


def _word_count(text: str) -> int:
    return len(text.split())


def chunk_text(text: str, max_tokens: int = 200, overlap: int = 50) -> List[str]:
    sentences = _split_sentences(text)

    chunks: List[str] = []
    current_chunk: List[str] = []
    current_length = 0

    for sentence in sentences:
        token_count = _word_count(sentence)

        if current_length + token_count <= max_tokens or not current_chunk:
            current_chunk.append(sentence)
            current_length += token_count
        else:
            chunks.append(" ".join(current_chunk))

            # Carry over the tail of the previous chunk for context overlap.
            overlap_sentences: List[str] = []
            overlap_length = 0
            for s in reversed(current_chunk):
                s_len = _word_count(s)
                if overlap_length + s_len <= overlap:
                    overlap_sentences.insert(0, s)
                    overlap_length += s_len
                else:
                    break

            current_chunk = overlap_sentences + [sentence]
            current_length = overlap_length + token_count

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
