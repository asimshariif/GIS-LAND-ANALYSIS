"""PDF report generation utilities."""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def generate_pdf_report(
    parcel_stats: dict,
    llm_analysis: str = "",
) -> bytes:
    """Generate a PDF land analysis report and return as bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=6,
        textColor=colors.HexColor("#1a3a5c"),
    )
    story.append(Paragraph("GIS Land Analysis Report", title_style))
    story.append(
        Paragraph(
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 0.25 * inch))

    # --- Summary stats table ---
    story.append(Paragraph("Parcel Summary Statistics", styles["Heading2"]))
    stats_data = [["Metric", "Value"]] + [
        [k.replace("_", " ").title(), str(round(v, 4) if isinstance(v, float) else v)]
        for k, v in parcel_stats.items()
        if k != "land_use_breakdown"
    ]
    story.append(_make_table(stats_data, header_color="#1a3a5c"))
    story.append(Spacer(1, 0.2 * inch))

    # --- Land use breakdown ---
    breakdown = parcel_stats.get("land_use_breakdown", {})
    if breakdown:
        story.append(Paragraph("Land Use Breakdown", styles["Heading2"]))
        lu_data = [["Land Use", "Parcel Count"]] + [
            [k, str(v)] for k, v in breakdown.items()
        ]
        story.append(_make_table(lu_data, header_color="#2c7be5"))
        story.append(Spacer(1, 0.2 * inch))

    # --- LLM analysis ---
    if llm_analysis:
        story.append(Paragraph("AI-Powered Land Analysis Insights", styles["Heading2"]))
        for para in llm_analysis.split("\n\n"):
            if para.strip():
                story.append(Paragraph(para.strip(), styles["Normal"]))
                story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    return buffer.getvalue()


def _make_table(data: list[list], header_color: str = "#1a3a5c") -> Table:
    table = Table(data, colWidths=[3 * inch, 3 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_color)),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4f8")]),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table
