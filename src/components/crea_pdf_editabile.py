from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.acroform import AcroForm
import io

input_pdf = "ok (1).pdf"  # Inserisci percorso corretto
output_pdf = "ok_8_squadre_editabile.pdf"

reader = PdfReader(input_pdf)
writer = PdfWriter()

base_page = reader.pages[0]

packet = io.BytesIO()
c = canvas.Canvas(packet, pagesize=A4)
form = AcroForm(c)

fields = [
    ("Squadra_1", 60, 645),
    ("Squadra_2", 360, 645),
    ("Squadra_3", 60, 565),
    ("Squadra_4", 360, 565),
    ("Squadra_5", 60, 485),
    ("Squadra_6", 360, 485),
    ("Squadra_7", 60, 405),
    ("Squadra_8", 360, 405),
    ("Semifinale_1", 210, 525),
    ("Semifinale_2", 210, 445),
    ("Finale", 210, 345),
    ("Vincitore", 210, 265),
]

for name, x, y in fields:
    form.textfield(
        name=name,
        x=x,
        y=y,
        width=180,
        height=18,
        borderWidth=0,
        forceBorder=False,
        textColor=None
    )

c.save()
packet.seek(0)

overlay = PdfReader(packet)
base_page.merge_page(overlay.pages[0])
writer.add_page(base_page)

with open(output_pdf, "wb") as f:
    writer.write(f)

print("PDF editabile creato:", output_pdf)
