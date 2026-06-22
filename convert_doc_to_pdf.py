import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

def convert_md_to_pdf(md_path, pdf_path):
    print(f"[+] Reading Markdown file: {md_path}")
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"[+] Setting up ReportLab PDF layout...")
    # Margins: 0.75 in (54 pt)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=54, leftMargin=54,
        topMargin=54, bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Premium branding colors matching AcademixIQ
    primary_color = HexColor('#0a192f')  # Deep navy
    accent_color = HexColor('#10b981')   # Emerald green
    teal_color = HexColor('#0d9488')     # Teal
    text_color = HexColor('#1e293b')     # Dark slate
    code_bg = HexColor('#f8fafc')        # Light background
    border_color = HexColor('#cbd5e1')   # Light gray
    
    # Custom typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'DocH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=teal_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=text_color,
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_color,
        leftIndent=15,
        firstLineIndent=-8,
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.0,
        leading=11,
        textColor=HexColor('#0f172a'),
        spaceAfter=0
    )

    story = []
    
    # State flags
    in_code_block = False
    code_block_text = ""
    in_mermaid = False
    in_table = False
    table_data = []

    for line in lines:
        stripped = line.strip()
        
        # 1. Mermaid Code Block Handler
        if stripped.startswith('```mermaid'):
            in_mermaid = True
            continue
        elif in_mermaid and stripped.startswith('```'):
            # Close mermaid diagram, replace with ASCII flowchart
            in_mermaid = False
            diagram_text = (
                "<b>SYSTEM DATA FLOW DIAGRAM</b><br/>"
                "----------------------------------------------------------------------------------------------------------------<br/>"
                "<b>[STUDENT INTERACTION LAYER]</b><br/>"
                "  ├── Input Topic / PDF Notes ──> <b>VisualMind Concept Canvas</b> ──> /api/generate-mindmap ──> Gemini AI<br/>"
                "  ├── Voice Transcript Stream ──> <b>BhashaTranslate Live Hub</b> ──> /api/translate ────────> Gemini AI<br/>"
                "  ├── MCQ Interactive Quizzes ──> <b>SkillBridge Evaluation</b>   ──> /api/generate-quiz ─────> Gemini AI<br/>"
                "  └── Accessibility Toggles ───> <b>EduAccess Engine</b><br/>"
                "----------------------------------------------------------------------------------------------------------------"
            )
            t = Table([[Paragraph(diagram_text, code_style)]], colWidths=[doc.width])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), HexColor('#ecfdf5')), # Soft green tint
                ('BOX', (0,0), (-1,-1), 1, HexColor('#a7f3d0')),
                ('PADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))
            continue

        if in_mermaid:
            continue

        # 2. Standard Code Block Handler
        if stripped.startswith('```'):
            if in_code_block:
                # End of code block, build ReportLab table
                t = Table([[Paragraph(code_block_text.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]], colWidths=[doc.width])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), code_bg),
                    ('BOX', (0,0), (-1,-1), 0.5, border_color),
                    ('PADDING', (0,0), (-1,-1), 8),
                    ('TOPPADDING', (0,0), (-1,-1), 8),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ]))
                story.append(t)
                story.append(Spacer(1, 10))
                in_code_block = False
                code_block_text = ""
            else:
                in_code_block = True
            continue

        if in_code_block:
            escaped = stripped.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            code_block_text += escaped + "\n"
            continue

        # 3. Table Handler
        if stripped.startswith('|') and stripped.endswith('|'):
            if '---|' in stripped or '--- |' in stripped:
                continue
            cells = [c.strip() for c in stripped.split('|')[1:-1]]
            formatted_cells = []
            for cell in cells:
                cell_formatted = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', cell)
                cell_formatted = re.sub(r'`(.*?)`', r"<font face='Courier' color='#0f172a'>\1</font>", cell_formatted)
                formatted_cells.append(cell_formatted)
            table_data.append(formatted_cells)
            in_table = True
            continue
        elif in_table:
            if table_data:
                paragraph_table_data = []
                col_widths = [doc.width / len(table_data[0])] * len(table_data[0])
                
                # Custom column ratios for typical 3-column architecture tables
                if len(table_data[0]) == 3:
                    col_widths = [1.2 * inch, 1.8 * inch, 4.0 * inch]
                elif len(table_data[0]) == 2:
                    col_widths = [2.2 * inch, 4.8 * inch]
                
                for r_idx, row in enumerate(table_data):
                    p_row = []
                    for c_idx, cell_text in enumerate(row):
                        cell_style = ParagraphStyle(
                            f'TableCell_{r_idx}_{c_idx}',
                            parent=body_style if r_idx > 0 else ParagraphStyle('TableHeader', parent=body_style, fontName='Helvetica-Bold', textColor=HexColor('#ffffff')),
                            spaceAfter=0
                        )
                        p_row.append(Paragraph(cell_text, cell_style))
                    paragraph_table_data.append(p_row)
                
                t = Table(paragraph_table_data, colWidths=col_widths)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), primary_color), # Primary header color
                    ('BACKGROUND', (0,1), (-1,-1), code_bg),
                    ('GRID', (0,0), (-1,-1), 0.5, border_color),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('PADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(t)
                story.append(Spacer(1, 10))
            table_data = []
            in_table = False

        # 4. Blank lines
        if not stripped:
            story.append(Spacer(1, 6))
            continue

        # 5. Horizontal rules
        if stripped == '---':
            story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceAfter=15, spaceBefore=10))
            continue

        # 6. Headings
        if stripped.startswith('# '):
            story.append(Paragraph(stripped[2:], title_style))
            # Header rule under the main document title
            story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceAfter=15, spaceBefore=5))
            continue
        elif stripped.startswith('## '):
            story.append(Paragraph(stripped[3:], h2_style))
            continue
        elif stripped.startswith('### '):
            story.append(Paragraph(stripped[4:], h3_style))
            continue

        # 7. List items (bullets)
        if stripped.startswith('• ') or stripped.startswith('* ') or stripped.startswith('- '):
            content = stripped[2:]
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            content = re.sub(r'`(.*?)`', r"<font face='Courier' color='#0f172a'>\1</font>", content)
            story.append(Paragraph(f"&bull; {content}", bullet_style))
            continue

        # 8. Standard Paragraph Text
        content = stripped
        content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
        content = re.sub(r'`(.*?)`', r"<font face='Courier' color='#0f172a'>\1</font>", content)
        story.append(Paragraph(content, body_style))

    print(f"[+] Compiling Document Elements into PDF...")
    doc.build(story)
    print(f"[+] PDF Generation Completed: {pdf_path}")

if __name__ == '__main__':
    md_file = os.path.join(os.path.dirname(__file__), 'TECHNICAL_DOCUMENTATION.md')
    pdf_file = os.path.join(os.path.dirname(__file__), 'TECHNICAL_DOCUMENTATION.pdf')
    convert_md_to_pdf(md_file, pdf_file)
