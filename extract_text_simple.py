from pypdf import PdfReader
import os

file_path = r"Files\001-فرم شناسنامه ماشین آلات.pdf"
full_path = os.path.join(os.getcwd(), file_path)

print(f"Reading file: {full_path}")

try:
    reader = PdfReader(full_path)
    for i, page in enumerate(reader.pages):
        print(f"Page {i+1} text:")
        print(page.extract_text())
except Exception as e:
    print(f"Error: {e}")
