from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTChar

file_path = r"Files\001-فرم شناسنامه ماشین آلات.pdf"
import os
full_path = os.path.join(os.getcwd(), file_path)

print(f"Analyzing PDF layout: {full_path}")

try:
    for page_layout in extract_pages(full_path):
        for element in page_layout:
            if isinstance(element, LTTextContainer):
                text = element.get_text().strip()
                if text:
                    print(f"Text: '{text}' | BBox: {element.bbox}")
except Exception as e:
    print(f"Error: {e}")
