from pypdf import PdfReader

file_path = r"d:\Pooya\Project\machine-list\Files\001-فرم شناسنامه ماشین آلات.pdf"

try:
    reader = PdfReader(file_path)
    for i, page in enumerate(reader.pages):
        print(f"Page {i+1} text:")
        print(page.extract_text())
except Exception as e:
    print(f"Error: {e}")
