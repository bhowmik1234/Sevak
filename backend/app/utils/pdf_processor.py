# import fitz  # PyMuPDF

# def extract_text_from_pdf(file_path: str) -> str:
#     file_path="/Users/bhowmikchawda/Desktop/resume/bhowmikResum.pdf"
#     text = ""
#     with fitz.open(file_path) as pdf:
#         for i, page in enumerate(pdf):
#             page_text = page.get_text()
#             print(f"Page {i+1} length:", len(page_text))
#             if not page_text.strip():
#                 print(f"Page {i+1} is likely image-based.")
#             else:
#                 print(f"Page {i+1} has extractable text.")
#             text += page_text
#     return text.strip()

import fitz  
import requests
from io import BytesIO
import re

def extract_text_from_pdf(drive_url: str) -> str:
    # Download the PDF
    # drive_url="https://drive.google.com/file/d/1VowxyVbeIjHE-QTopjBnCfALLMopQxBp/view?usp=sharing"
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', drive_url)
    if not match:
        raise ValueError("Invalid Google Drive link format")
    
    file_id = match.group(1)
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    # Download the PDF
    response = requests.get(download_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download PDF. Status code: {response.status_code}")
    
    text = ""
    # Text extraction process
    with fitz.open(stream=BytesIO(response.content), filetype="pdf") as pdf:
        for i, page in enumerate(pdf):
            page_text = page.get_text()
            print(f"Page {i+1} length:", len(page_text))
            if not page_text.strip():
                print(f"Page {i+1} is likely image-based.")
            else:
                print(f"Page {i+1} has extractable text.")
            text += page_text
    return text.strip()
