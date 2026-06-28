"""Load a SINGLE law PDF (backend/law) into the active vector store.

Usage (from backend/):
    ./venv/bin/python scripts/load_one.py <filename.pdf>

Self-resuming: records the file in backend/law/.loaded.txt and skips it if
already loaded. Run one file at a time, smallest to biggest.
"""
import re
import sys
import time
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from app.services.vector_store import store_chunks_in_vector_db  # noqa: E402
from app.utils.chunker import chunk_text  # noqa: E402
from app.utils.pdf_processor import extract_text_from_bytes  # noqa: E402

LAW_DIR = BACKEND / "law"
LEDGER = LAW_DIR / ".loaded.txt"

# filename -> human-readable citation label.
LABELS = {
    "a202345.pdf": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
    "bnss,_2023.pdf": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
    "constitution_of_india.pdf": "Constitution of India",
    "aa202347.pdf": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
    "a2016-2.pdf": "Juvenile Justice (Care and Protection of Children) Act, 2015",
    "a2019-35.pdf": "Consumer Protection Act, 2019",
    "it_act_2000_updated.pdf": "Information Technology Act, 2000",
    "the_code_on_wages.pdf": "Code on Wages, 2019",
    "THE-INDIAN-PENAL-CODE-1860.pdf": "Indian Penal Code, 1860 (IPC)",
    "the_code_of_criminal_procedure,_1973.pdf": "Code of Criminal Procedure, 1973 (CrPC)",
    "protection_of_women_from_domestic_violence_act,_2005.pdf": "Protection of Women from Domestic Violence Act, 2005",
    "AA2012-32.pdf": "POCSO Act, 2012",
    "a1961-28.pdf": "Dowry Prohibition Act, 1961",
    "scheduled_castes_and_the_scheduled_tribes.pdf": "SC and ST (Prevention of Atrocities) Act, 1989",
    "maintenance_and_welfare_of_parents_and_senior_citizens_act.pdf": "Maintenance and Welfare of Parents and Senior Citizens Act, 2007",
}

_SEC = re.compile(r"\bSection\s+(\d+[A-Z]?)\b", re.IGNORECASE)


def build_metadata(chunks, source):
    out = []
    for ch in chunks:
        m = _SEC.search(ch)
        out.append({"source": source, "section": f"Section {m.group(1)}" if m else None})
    return out


def main():
    if len(sys.argv) < 2:
        print("usage: load_one.py <filename.pdf>")
        sys.exit(1)
    fname = sys.argv[1]
    path = LAW_DIR / fname
    if not path.exists():
        print(f"!! file not found: {path}")
        sys.exit(1)

    done = set(LEDGER.read_text().split()) if LEDGER.exists() else set()
    if fname in done:
        print(f"SKIP (already loaded): {fname}")
        return

    source = LABELS.get(fname, fname)
    print(f"-> {source}  [{fname}]")

    t0 = time.time()
    text = extract_text_from_bytes(path.read_bytes())
    if not text.strip():
        print("   !! no extractable text — skipping")
        sys.exit(1)
    chunks = chunk_text(text)
    print(f"   {len(chunks)} chunks — embedding + storing...", flush=True)

    n = store_chunks_in_vector_db(chunks, build_metadata(chunks, source))
    with LEDGER.open("a") as f:
        f.write(fname + "\n")
    print(f"   OK stored {n} vectors in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
