import spacy
from typing import List

# Load spacy English model
nlp = spacy.load("en_core_web_sm")

def chunk_text(text: str, max_tokens: int = 200) -> List[str]:
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents]

    # Intialization
    chunks = []
    current_chunk = []
    current_length = 0
    overlap=50

    for sentence in sentences:
        token_count = len(nlp(sentence))
        if current_length + token_count <= max_tokens:
            current_chunk.append(sentence)
            current_length += token_count
        else:
            # Add chunk
            chunks.append(" ".join(current_chunk))

            # Create new chunk with overlap
            overlap_sentences = []
            overlap_length = 0
            for s in reversed(current_chunk):
                s_len = len(nlp(s))
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
