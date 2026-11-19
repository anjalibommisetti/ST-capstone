import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable
)

class ReportGenerator:
    """
    Generates professional PDF test audit reports using ReportLab.
    """

    @staticmethod
    def generate_pdf_report(
        output_path: str,
        execution_meta: dict,
        white_box_data: dict = None,
        black_box_results: list = None
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Palette
        c_primary = colors.HexColor("#0369a1")    # Deep Sky Blue
        c_secondary = colors.HexColor("#0284c7")  # Sky Blue
        c_dark = colors.HexColor("#0f172a")       # Slate 900
        c_gray_bg = colors.HexColor("#f8fafc")    # Slate 50
        c_border = colors.HexColor("#cbd5e1")     # Slate 300
        c_green = colors.HexColor("#16a34a")      # Emerald 600
        c_red = colors.HexColor("#dc2626")        # Rose 600

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=c_dark
        )

        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )

        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=c_primary,
            spaceAfter=6
        )

        normal_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155")
        )

        cell_bold = ParagraphStyle(
            'CellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=c_dark
        )

        cell_pass = ParagraphStyle(
            'CellPass',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=c_green
        )

        cell_fail = ParagraphStyle(
            'CellFail',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=c_red
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("TestFusion – Software Testing Platform", title_style))
        story.append(Paragraph("Integrated Software Testing Audit Report (White Box & Black Box)", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceBefore=4, spaceAfter=14))

        # 2. Execution Metadata Table
        exec_date = execution_meta.get("executed_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        filename = execution_meta.get("filename", "Unknown File")
        exec_id = execution_meta.get("id", "N/A")
        total_tests = execution_meta.get("total_tests", 0)
        passed_tests = execution_meta.get("passed_tests", 0)
        failed_tests = execution_meta.get("failed_tests", 0)
        pass_rate = round((passed_tests / total_tests * 100), 1) if total_tests > 0 else 0.0

        meta_data = [
            [
                Paragraph("<b>Execution ID:</b>", normal_style),
                Paragraph(f"RUN-{exec_id:04d}" if isinstance(exec_id, int) else str(exec_id), cell_bold),
                Paragraph("<b>Tested Source File:</b>", normal_style),
                Paragraph(filename, cell_bold)
            ],
            [
                Paragraph("<b>Date & Time:</b>", normal_style),
                Paragraph(str(exec_date), normal_style),
                Paragraph("<b>Test Mode:</b>", normal_style),
                Paragraph(execution_meta.get("test_type", "INTEGRATED"), normal_style)
            ],
            [
                Paragraph("<b>Total Test Cases:</b>", normal_style),
                Paragraph(str(total_tests), cell_bold),
                Paragraph("<b>Pass / Fail Ratio:</b>", normal_style),
                Paragraph(f"<font color='#16a34a'><b>{passed_tests} PASS</b></font> / <font color='#dc2626'><b>{failed_tests} FAIL</b></font> ({pass_rate}%)", normal_style)
            ]
        ]

        meta_table = Table(meta_data, colWidths=[110, 160, 120, 150])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), c_gray_bg),
            ('BOX', (0, 0), (-1, -1), 1, c_border),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 16))

        # 3. White Box Coverage Section
        if white_box_data:
            story.append(Paragraph("1. White Box Code Coverage Analysis", heading_style))
            
            stmt_cov = white_box_data.get("statement_coverage", 0.0)
            branch_cov = white_box_data.get("branch_coverage", 0.0)
            tot_stmts = white_box_data.get("total_statements", 0)
            cov_stmts = white_box_data.get("covered_statements", 0)
            tot_branches = white_box_data.get("total_branches", 0)
            cov_branches = white_box_data.get("covered_branches", 0)
            exec_lines = white_box_data.get("executed_lines", [])
            miss_lines = white_box_data.get("missing_lines", [])

            wb_rows = [
                [
                    Paragraph("<b>Metric</b>", cell_bold),
                    Paragraph("<b>Calculated Value</b>", cell_bold),
                    Paragraph("<b>Details / Ratio</b>", cell_bold)
                ],
                [
                    Paragraph("Statement Coverage", normal_style),
                    Paragraph(f"<b>{stmt_cov}%</b>", cell_bold),
                    Paragraph(f"{cov_stmts} / {tot_stmts} executable statements covered", normal_style)
                ],
                [
                    Paragraph("Branch Coverage", normal_style),
                    Paragraph(f"<b>{branch_cov}%</b>", cell_bold),
                    Paragraph(f"{cov_branches} / {tot_branches} decision branch outcomes exercised", normal_style)
                ],
                [
                    Paragraph("Executed Line Numbers", normal_style),
                    Paragraph(f"{len(exec_lines)} lines", normal_style),
                    Paragraph(str(exec_lines[:15]) + ("..." if len(exec_lines) > 15 else ""), normal_style)
                ],
                [
                    Paragraph("Unexecuted (Missing) Lines", normal_style),
                    Paragraph(f"{len(miss_lines)} lines", normal_style),
                    Paragraph(str(miss_lines) if miss_lines else "None (100% statements covered)", normal_style)
                ]
            ]

            wb_table = Table(wb_rows, colWidths=[150, 110, 280])
            wb_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
                ('TEXTCOLOR', (0, 0), (-1, 0), c_primary),
                ('GRID', (0, 0), (-1, -1), 0.5, c_border),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(wb_table)
            story.append(Spacer(1, 16))

        # 4. Black Box Results Section
        if black_box_results:
            story.append(Paragraph("2. Black Box Test Case Execution Results", heading_style))
            
            bb_headers = [
                Paragraph("<b>TC ID</b>", cell_bold),
                Paragraph("<b>Function</b>", cell_bold),
                Paragraph("<b>Input</b>", cell_bold),
                Paragraph("<b>Expected</b>", cell_bold),
                Paragraph("<b>Actual</b>", cell_bold),
                Paragraph("<b>Status</b>", cell_bold)
            ]
            bb_rows = [bb_headers]

            for r in black_box_results[:40]:  # Limit rows in PDF to keep clean
                status = r.get("status", "PASS")
                st_style = cell_pass if status == "PASS" else cell_fail

                inp_str = str(r.get("input", ""))
                exp_str = str(r.get("expected", ""))
                act_str = str(r.get("actual", ""))

                if len(inp_str) > 25: inp_str = inp_str[:22] + "..."
                if len(exp_str) > 25: exp_str = exp_str[:22] + "..."
                if len(act_str) > 25: act_str = act_str[:22] + "..."

                bb_rows.append([
                    Paragraph(r.get("test_case_id", ""), normal_style),
                    Paragraph(r.get("function_name", ""), normal_style),
                    Paragraph(inp_str, normal_style),
                    Paragraph(exp_str, normal_style),
                    Paragraph(act_str, normal_style),
                    Paragraph(status, st_style)
                ])

            bb_table = Table(bb_rows, colWidths=[70, 100, 100, 110, 110, 50])
            bb_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
                ('GRID', (0, 0), (-1, -1), 0.5, c_border),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(bb_table)
            story.append(Spacer(1, 16))

        # 5. Final Summary & Quality Verdict
        story.append(Paragraph("3. Final Quality Summary & Assessment", heading_style))
        summary_text = (
            f"The software module <b>'{filename}'</b> was tested using integrated White Box and Black Box methodology. "
            f"A total of <b>{total_tests} test cases</b> were evaluated, resulting in <b>{passed_tests} Passed</b> and "
            f"<b>{failed_tests} Failed</b>. "
        )
        if white_box_data:
            summary_text += f"The actual measured statement coverage was <b>{white_box_data.get('statement_coverage', 0)}%</b> and branch coverage was <b>{white_box_data.get('branch_coverage', 0)}%</b>. "

        if failed_tests == 0:
            summary_text += "<font color='#16a34a'><b>VERDICT: ACCEPTED.</b> All test assertions and boundary checks succeeded without regressions.</font>"
        else:
            summary_text += f"<font color='#dc2626'><b>VERDICT: ATTENTION REQUIRED.</b> {failed_tests} assertion discrepancies detected. Inspect failed test cases in Section 2.</font>"

        story.append(Paragraph(summary_text, normal_style))
        story.append(Spacer(1, 20))

        # Footer signoff
        story.append(HRFlowable(width="100%", thickness=0.5, color=c_border, spaceBefore=10, spaceAfter=8))
        story.append(Paragraph("Generated by TestFusion Platform • Automated Testing Report Engine", subtitle_style))

        doc.build(story)
        return output_path
