import io
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import arabic_reshaper
from bidi.algorithm import get_display
from pypdf import PdfReader, PdfWriter

def register_persian_font():
    # Try common Persian-supporting fonts on Windows
    possible_fonts = [
        ("Tahoma", "C:/Windows/Fonts/tahoma.ttf"),
        ("Arial", "C:/Windows/Fonts/arial.ttf"),
        ("Segoe UI", "C:/Windows/Fonts/segoeui.ttf")
    ]
    
    for font_name, font_path in possible_fonts:
        if os.path.exists(font_path):
            try:
                pdfmetrics.registerFont(TTFont(font_name, font_path))
                return font_name
            except Exception as e:
                print(f"Error registering font {font_name}: {e}")
                continue
                
    return 'Helvetica'

def reshape_text(text):
    if not text:
        return ""
    if not isinstance(text, str):
        text = str(text)
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    return bidi_text

def fill_machine_pdf(machine_data):
    # Path to template
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Go up one more level to project root
    project_root = os.path.dirname(base_dir)
    template_path = os.path.join(project_root, "Files", "001-فرم شناسنامه ماشین آلات.pdf")

    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at {template_path}")

    # Create text overlay
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    font_name = register_persian_font()
    c.setFont(font_name, 7)

    # Coordinates Mapping (Approximate - needs tuning)
    # Origin is bottom-left. A4 is ~595 x 842 points.
    
    # Helper to draw RTL text aligned correctly
    def draw_value(x, y, value):
        text = reshape_text(value)
        c.drawRightString(x, y, text)

    # Helper to draw a checkmark
    def draw_checkmark(x, y):
        c.saveState()
        c.setLineWidth(1)
        # Draw a small checkmark shape
        # Adjust size as needed
        c.line(x, y, x+3, y-3)
        c.line(x+3, y-3, x+8, y+5)
        c.restoreState()

    # Row 1
    # Machine Name
    draw_value(475, 640, machine_data.get('machine_name', ''))
    # Machine Code
    draw_value(325, 640, machine_data.get('machine_code', ''))
    # Model
    draw_value(210, 640, machine_data.get('machine_model', ''))
    # Serial
    draw_value(77, 640, machine_data.get('machine_serial', ''))

    # Row 2
    # Year
    draw_value(475, 615, str(machine_data.get('manufacture_year', '')))
    # Entry Date
    draw_value(300, 615, str(machine_data.get('company_entry_date', '')))
    # Install Date
    draw_value(202, 615, str(machine_data.get('installation_date', '')))
    # Criticality
    draw_value(77, 615, machine_data.get('criticality_level', ''))

    # Row 3
    # Location
    draw_value(475, 590, machine_data.get('location_name', ''))
    # Location Code
    draw_value(77, 590, machine_data.get('location_code', ''))

    # Section 1 - General Specs
    # Length, Width, Height, Weight
    draw_value(525, 547, str(machine_data.get('length_mm', '')))
    draw_value(460, 547, str(machine_data.get('width_mm', '')))
    draw_value(380, 547, str(machine_data.get('height_mm', '')))
    draw_value(320, 547, str(machine_data.get('weight_kg', '')))

    # Foundation
    foundation = machine_data.get('foundation_type', '')
    if foundation == 'بتنی':
        draw_checkmark(168, 550) 
    elif foundation == 'فلزی':
        draw_checkmark(168, 550) 
    elif foundation == 'پیش ساخته':
        draw_checkmark(103, 550)
    elif foundation == 'ندارد':
        draw_checkmark(66, 550)

    # Automation
    automation = machine_data.get('automation_level', '')
    if automation == 'اتوماتیک':
        draw_checkmark(323, 530)
    elif automation == 'نیمه اتوماتیک':
        draw_checkmark(371, 530)
    elif automation == 'دستی':
        draw_checkmark(440, 530)

    # Warranty/Guarantee
    if machine_data.get('has_guarantee'):
         draw_checkmark(257, 530)
         draw_value(205, 526, str(machine_data.get('guarantee_expiry_date', '')))
    
    if machine_data.get('has_warranty'):
         # Draw checkmark for Warranty
         # Waranti box/text is approx x=152-226
         draw_checkmark(138, 530)
         draw_value(74, 526, str(machine_data.get('warranty_expiry_date', '')))

    # Section 2 - Electrical
    # Current Type
    draw_value(530, 445, machine_data.get('current_type', ''))
    # Phase
    phase_val = machine_data.get('phase_count', '')
    if str(phase_val) == '1':
        phase_text = "تک فاز"
    elif str(phase_val) == '3':
        phase_text = "سه فاز"
    else:
        phase_text = str(phase_val)
    draw_value(465, 445, phase_text)
    # Voltage
    draw_value(400, 445, str(machine_data.get('nominal_voltage', '')))
    # Power
    draw_value(335, 445, str(machine_data.get('nominal_power', '')))
    # Current
    draw_value(265, 445, str(machine_data.get('nominal_current', '')))
    
    # Description
    draw_value(215, 445, machine_data.get('electrical_technical_description', ''))

    # Section 3 - Consumption
    draw_value(460, 394, str(machine_data.get('maximum_consumption', '')))
    draw_value(220, 394, str(machine_data.get('operating_pressure', '')))

    # Section 4 - Lubricants
    lubricants = machine_data.get('lubricants', [])
    # Starting Y position for the first row of lubricants table
    # Based on previous layout, headers are around y=344
    # Let's assume the first row starts around y=330 and decreases
    current_y = 325
    row_height = 20 # Approximate height per row

    for i, lub in enumerate(lubricants):
        # Limit to 5 rows to fit in the page section (approx space 340 -> 170)
        if i >= 5:
            break
            
        # Row Number (فیدر) - x~540
        draw_value(540, current_y, str(i + 1))
        
        # Lubricant Type (هدننک ناور عون) - x~450
        draw_value(460, current_y, lub.get('lubricant_type', ''))
        
        # Alternative (نیزگیاج) - x~300
        draw_value(310, current_y, lub.get('alternative_lubricant_type', ''))
        
        # Description (تاحیضوت) - x~120
        draw_value(160, current_y, lub.get('description', ''))
        
        current_y -= row_height

    # Section 5 - Vendor/Manufacturer
    # Vendor
    draw_value(440, 146, machine_data.get('supplier_company_name', ''))
    draw_value(440, 120, machine_data.get('supplier_phone', ''))
    draw_value(440, 90, machine_data.get('supplier_address', ''))

    # Manufacturer
    draw_value(200, 146, machine_data.get('manufacturer_company_name', ''))
    draw_value(200, 120, machine_data.get('manufacturer_phone', ''))
    draw_value(200, 80, machine_data.get('manufacturer_address', ''))


    c.save()
    packet.seek(0)
    new_pdf = PdfReader(packet)
    
    # Read existing PDF
    existing_pdf = PdfReader(template_path)
    output = PdfWriter()

    # Merge page 1
    page = existing_pdf.pages[0]
    page.merge_page(new_pdf.pages[0])
    output.add_page(page)

    # Return as bytes
    output_stream = io.BytesIO()
    output.write(output_stream)
    output_stream.seek(0)
    return output_stream
