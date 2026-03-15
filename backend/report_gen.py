import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(stats: dict, report_text: str = "") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        textColor=colors.whitesmoke,
        backColor=colors.navy,
        alignment=1,
        spaceAfter=20,
        padding=10
    )
    
    body_style = styles['Normal']
    
    story = []
    
    story.append(Paragraph("GIS Land Analysis Report", title_style))
    story.append(Spacer(1, 12))
    
    data = [["Metric", "Value"]]
    data.append(["Total Parcels", str(stats.get('total_parcels', 0))])
    data.append(["Total Area (m²)", str(stats.get('total_area_m2', 0))])
    data.append(["Vacant Parcels", str(stats.get('vacant_count', 0))])
    data.append(["Developed Parcels", str(stats.get('developed_count', 0))])
    
    data.append(["--- MAINLANDUSE ---", ""])
    for k, v in stats.get("mainlanduse_label", {}).items():
        data.append([k, str(v)])
        
    data.append(["--- DETAILSLANDUSE ---", ""])
    for k, v in stats.get("landuse_category", {}).items():
        data.append([str(k), str(v)])
        
    table = Table(data, colWidths=[250, 150])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 20))
    
    if report_text:
        for line in report_text.split('\n'):
            if line.strip():
                story.append(Paragraph(line.strip(), body_style))
                story.append(Spacer(1, 6))
                
    doc.build(story)
    return buffer.getvalue()
