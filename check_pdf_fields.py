from pypdf import PdfReader

file_path = r"d:\Pooya\Project\machine-list\Files\001-فرم شناسنامه ماشین آلات.pdf"

try:
    reader = PdfReader(file_path)
    fields = reader.get_fields()
    if fields:
        print("Fields found:")
        for key, value in fields.items():
            print(f"{key}: {value}")
    else:
        print("No form fields found.")
except Exception as e:
    print(f"Error reading PDF: {e}")
