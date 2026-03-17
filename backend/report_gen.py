"""PDF report generator for GIS Land Analysis.

Generates professional, fully dynamic PDF reports from user-session data:
  - Initial area selection statistics
  - Applied filters / queries
  - Filtered-subset statistics (when a category or NL filter was applied)
  - Individual parcel capacity calculations performed by the user
  - LLM-generated narrative analysis
"""
import io
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_pdf_report(
    stats: dict,
    report_text: str = "",
    applied_filters: list = None,
    capacity_calculations: list = None,
    filtered_summary: dict = None,
    report_title: str = None,
) -> bytes:
    """Generate a dynamic PDF report from user-session data.

    Args:
        stats: Full selection summary (total_parcels, total_area_m2, breakdown, …)
        report_text: LLM-generated narrative text.
        applied_filters: List of human-readable filter descriptions.
        capacity_calculations: Individual parcel capacity calc results.
        filtered_summary: Stats for the queried/filtered parcel subset.
        report_title: Optional custom title.

    Returns:
        PDF bytes.
    """
    today = date.today().strftime("%B %d, %Y")
    title = report_title or "GIS Land Analysis Report"
    applied_filters = applied_filters or []
    capacity_calculations = capacity_calculations or []

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.whitesmoke,
        backColor=colors.HexColor("#1a365d"),
        alignment=1,
        spaceAfter=6,
        spaceBefore=10,
        leftIndent=10,
        rightIndent=10,
        leading=30,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#e2e8f0"),
        backColor=colors.HexColor("#1a365d"),
        alignment=1,
        spaceAfter=20,
        leftIndent=10,
        rightIndent=10,
        leading=14,
    )
    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1a365d"),
        spaceAfter=8,
        spaceBefore=16,
    )
    subsection_style = ParagraphStyle(
        "SubsectionStyle",
        parent=styles["Heading3"],
        fontSize=11,
        textColor=colors.HexColor("#2d3748"),
        spaceAfter=6,
        spaceBefore=10,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        spaceAfter=6,
    )
    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        spaceAfter=3,
        leftIndent=16,
        bulletIndent=6,
    )
    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.gray,
        alignment=1,
    )

    # ---- Table style helpers ----
    def _header_table_style(header_color: str = "#1a365d"):
        return TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_color)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 9),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f7fafc")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f7fafc"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e0")),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ])

    story = []

    # ==========================================================================
    # Cover / Title
    # ==========================================================================
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Generated on {today}  |  GIS Land Analysis System", subtitle_style))
    story.append(Spacer(1, 10))

    # ==========================================================================
    # Applied Filters section (only if present)
    # ==========================================================================
    if applied_filters:
        story.append(Paragraph("Applied Filters &amp; Queries", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        story.append(Spacer(1, 6))
        for f_desc in applied_filters:
            safe = f_desc.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(f"\u2022  {safe}", bullet_style))
        story.append(Spacer(1, 12))

    # ==========================================================================
    # Primary statistics — use filtered_summary if available, else full stats
    # ==========================================================================
    primary = filtered_summary if filtered_summary else stats
    primary_label = "Filtered Selection Statistics" if filtered_summary else "Selection Statistics"

    story.append(Paragraph(primary_label, section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
    story.append(Spacer(1, 6))

    total_p = primary.get("total_parcels", 0)
    total_a = primary.get("total_area_m2", 0)
    vac = primary.get("vacant_count", 0)
    dev = primary.get("developed_count", 0)
    blocks = primary.get("block_ids_covered", [])
    rel_cap = primary.get("total_religious_capacity", stats.get("total_religious_capacity", 0))
    shops_est = primary.get("total_shops_estimated", stats.get("total_shops_estimated", 0))

    vac_rate = f"{vac / total_p * 100:.1f}%" if total_p > 0 else "N/A"
    dev_rate = f"{dev / total_p * 100:.1f}%" if total_p > 0 else "N/A"

    kpi_rows = [
        ["Metric", "Value"],
        ["Total Parcels", f"{total_p:,}"],
        ["Total Area", f"{total_a:,.0f} m\xb2  ({total_a / 10_000:.2f} ha)"],
        ["Vacant Parcels", f"{vac:,}  ({vac_rate})"],
        ["Developed Parcels", f"{dev:,}  ({dev_rate})"],
        ["Blocks Covered", f"{len(blocks):,}"],
    ]
    if rel_cap > 0:
        kpi_rows.append(["Religious Facility Capacity", f"{rel_cap:,} worshippers"])
    if shops_est > 0:
        kpi_rows.append(["Estimated Commercial Shops", f"{shops_est:,} units"])

    # If filtered summary present, add a "compared to full selection" row
    if filtered_summary:
        full_total = stats.get("total_parcels", 0)
        pct = f"{total_p / full_total * 100:.1f}%" if full_total > 0 else "N/A"
        kpi_rows.append(["Share of Full Selection", f"{pct} ({full_total:,} total parcels)"])

    kpi_table = Table(kpi_rows, colWidths=[250, 240])
    kpi_table.setStyle(_header_table_style("#1a365d"))
    story.append(kpi_table)
    story.append(Spacer(1, 16))

    # ==========================================================================
    # Land Use Breakdown — primary (filtered or full)
    # ==========================================================================
    story.append(Paragraph("Land Use Breakdown", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
    story.append(Spacer(1, 6))

    primary_breakdown = primary.get("breakdown", {})
    if primary_breakdown:
        bd_rows = [["Category", "Count", "Area (m\xb2)", "% of Set", "Capacity / Shops"]]
        sorted_bd = sorted(primary_breakdown.items(), key=lambda x: x[1].get("count", 0) if isinstance(x[1], dict) else 0, reverse=True)
        for cat, data in sorted_bd:
            if not isinstance(data, dict):
                continue
            cnt = data.get("count", 0)
            area = data.get("total_area_m2", 0)
            cap = data.get("total_capacity_estimated", 0)
            shp = data.get("total_shops_estimated", 0)
            pct_val = f"{cnt / total_p * 100:.1f}%" if total_p > 0 else "-"
            if cap > 0:
                cap_str = f"{cap:,} worshippers"
            elif shp > 0:
                cap_str = f"{shp:,} shops"
            else:
                cap_str = "-"
            bd_rows.append([cat, f"{cnt:,}", f"{area:,.0f}", pct_val, cap_str])
        bd_table = Table(bd_rows, colWidths=[115, 55, 100, 60, 120])
        bd_table.setStyle(_header_table_style("#2c5282"))
        story.append(bd_table)
    else:
        story.append(Paragraph("No breakdown data available.", body_style))
    story.append(Spacer(1, 16))

    # ==========================================================================
    # Full Selection Breakdown (shown only when a filtered view is active)
    # ==========================================================================
    if filtered_summary:
        story.append(Paragraph("Full Selection — Land Use Breakdown", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        story.append(Spacer(1, 6))
        full_breakdown = stats.get("breakdown", {})
        full_total = stats.get("total_parcels", 0)
        if full_breakdown:
            fb_rows = [["Category", "Count", "Area (m\xb2)", "% of Full Selection"]]
            for cat, data in sorted(full_breakdown.items(), key=lambda x: x[1].get("count", 0) if isinstance(x[1], dict) else 0, reverse=True):
                if not isinstance(data, dict):
                    continue
                cnt = data.get("count", 0)
                area = data.get("total_area_m2", 0)
                pct_val = f"{cnt / full_total * 100:.1f}%" if full_total > 0 else "-"
                fb_rows.append([cat, f"{cnt:,}", f"{area:,.0f}", pct_val])
            fb_table = Table(fb_rows, colWidths=[150, 75, 130, 130])
            fb_table.setStyle(_header_table_style("#4a5568"))
            story.append(fb_table)
        story.append(Spacer(1, 16))

    # ==========================================================================
    # Individual Capacity Calculations
    # ==========================================================================
    if capacity_calculations:
        story.append(Paragraph("Capacity Calculations", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        story.append(Spacer(1, 6))

        mosque_calcs = [c for c in capacity_calculations if c.get("type") == "mosque"]
        commercial_calcs = [c for c in capacity_calculations if c.get("type") == "commercial"]

        if mosque_calcs:
            story.append(Paragraph("Religious Facility Capacity", subsection_style))
            mc_rows = [["Parcel ID", "Subtype", "Area (m\xb2)", "Floors", "Capacity (worshippers)"]]
            for c in mosque_calcs:
                mc_rows.append([
                    str(c.get("parcel_id", "N/A")),
                    c.get("subtype", "Mosque"),
                    f"{c.get('area_m2', 0):,.0f}",
                    str(c.get("floors_estimated", 1)),
                    f"{c.get('capacity_worshippers', 0):,}",
                ])
            mc_table = Table(mc_rows, colWidths=[75, 140, 75, 45, 115])
            mc_table.setStyle(_header_table_style("#2b6cb0"))
            story.append(mc_table)
            story.append(Spacer(1, 10))

        if commercial_calcs:
            story.append(Paragraph("Commercial Plot Capacity", subsection_style))
            cc_rows = [["Parcel ID", "Subtype", "Area (m\xb2)", "Shop Size (m\xb2)", "Est. Shops"]]
            for c in commercial_calcs:
                cc_rows.append([
                    str(c.get("parcel_id", "N/A")),
                    c.get("subtype", "Commercial"),
                    f"{c.get('area_m2', 0):,.0f}",
                    f"{c.get('shop_size_m2', 120):.0f}",
                    f"{c.get('shops_estimated', 0):,}",
                ])
            cc_table = Table(cc_rows, colWidths=[75, 140, 75, 90, 75])
            cc_table.setStyle(_header_table_style("#b7791f"))
            story.append(cc_table)
            story.append(Spacer(1, 10))

        story.append(Spacer(1, 6))

    # ==========================================================================
    # LLM Narrative Report
    # ==========================================================================
    if report_text:
        story.append(PageBreak())
        story.append(Paragraph("AI-Generated Analysis", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        story.append(Spacer(1, 10))

        for line in report_text.split("\n"):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 5))
            elif (
                line.startswith("#")
                or (line.isupper() and len(line) > 3)
                or (line.endswith(":") and len(line) < 80 and not line.startswith("-"))
            ):
                clean = line.lstrip("#").strip().rstrip(":")
                story.append(Spacer(1, 8))
                safe = clean.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(safe, subsection_style))
            elif line.startswith(("-", "\u2022", "*")):
                clean = line.lstrip("-\u2022* ").strip()
                safe = clean.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(f"\u2022  {safe}", bullet_style))
            else:
                safe = (
                    line.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                )
                story.append(Paragraph(safe, body_style))

    # ==========================================================================
    # Footer
    # ==========================================================================
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor("#e2e8f0")))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"Generated by GIS Land Analysis System  \u2022  {today}",
        footer_style,
    ))

    doc.build(story)
    return buffer.getvalue()
