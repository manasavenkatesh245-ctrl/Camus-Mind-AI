from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_sample_handbook_pdf(output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading3'],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#2563eb'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=body_style,
        leftIndent=15,
        spaceAfter=4
    )

    story = []

    # --- PAGE 1: COVER & ACADEMIC CALENDAR ---
    story.append(Paragraph("APEX INSTITUTE OF TECHNOLOGY", title_style))
    story.append(Paragraph("<b>Student Academic & Campus Life Handbook (2024–2025)</b>", h1_style))
    story.append(Paragraph("<i>Official guidelines, academic regulations, student conduct, and campus resources. Published by the Office of the Provost and Dean of Academic Affairs.</i>", body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Message from the Provost", h2_style))
    story.append(Paragraph("Welcome to Apex Institute of Technology. This handbook serves as the governing contract of academic standards, student responsibilities, and campus privileges. All enrolled students are expected to familiarize themselves with and abide by these regulations throughout their matriculation.", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Key Academic Calendar Deadlines (Fall 2024)", h2_style))
    cal_data = [
        ["Event / Milestone", "Date", "Notes"],
        ["Fall Semester Classes Begin", "September 3, 2024", "All enrolled courses begin"],
        ["Add / Drop Deadline", "September 15, 2024", "100% refund; no transcript record"],
        ["Midterm Examination Period", "October 21–25, 2024", "Mandatory attendance"],
        ["Course Withdrawal (W) Deadline", "November 10, 2024", "Grade recorded as W; no GPA penalty"],
        ["Final Examinations", "December 12–18, 2024", "Comprehensive final exams"]
    ]
    t = Table(cal_data, colWidths=[200, 130, 170])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.append(t)
    story.append(PageBreak())

    # --- PAGE 2: ACADEMIC POLICIES & ATTENDANCE ---
    story.append(Paragraph("Section 1: Academic Policies, Grading, and Attendance", h1_style))
    story.append(Paragraph("1.1 Grading Scale and Quality Points", h2_style))
    story.append(Paragraph("Apex Institute utilizes a 4.0 cumulative grade point average (CGPA) system. Grades are awarded as follows: A (4.00, 93-100%), A- (3.70, 90-92%), B+ (3.30, 87-89%), B (3.00, 83-86%), B- (2.70, 80-82%), C+ (2.30, 77-79%), C (2.00, 73-76%), D (1.00, 60-72%), and F (0.00, below 60%).", body_style))

    story.append(Paragraph("1.2 Dean's List Honors", h2_style))
    story.append(Paragraph("Students achieving a semester GPA of 3.75 or higher while completing a minimum of 15 registered credits with no incomplete or failing grades are recognized on the Dean's List. Dean's List status is formally noted on the official academic transcript.", body_style))

    story.append(Paragraph("1.3 Academic Probation and Dismissal", h2_style))
    story.append(Paragraph("Any student whose cumulative grade point average falls below 2.00 at the end of any regular semester is automatically placed on Academic Probation for the subsequent term. While on probation:", body_style))
    story.append(Paragraph("• The student is limited to a maximum enrollment of 13 credit hours.", bullet_style))
    story.append(Paragraph("• The student must attend mandatory weekly tutoring at the Academic Success Center.", bullet_style))
    story.append(Paragraph("• Failure to raise cumulative GPA to 2.00 after two consecutive probationary semesters results in academic dismissal.", bullet_style))

    story.append(Paragraph("1.4 Mandatory 75% Attendance Requirement", h2_style))
    story.append(Paragraph("Regular and punctual attendance is required in all scheduled lectures, tutorials, and laboratories. Students must maintain a minimum attendance of 75% of scheduled class sessions in each course. Students with attendance below 75% will be denied permission to sit for the final examination and will receive an administrative grade of FA (Failure due to Absence). Medical absences must be certified by an approved health clinic within 5 business days.", body_style))
    story.append(PageBreak())

    # --- PAGE 3: COURSE REGISTRATION & TUITION ---
    story.append(Paragraph("Section 2: Course Registration, Credit Caps, and Tuition Fees", h1_style))
    story.append(Paragraph("2.1 Credit Limits and Overload Permission", h2_style))
    story.append(Paragraph("A normal full-time course load is between 15 and 18 credit hours per semester. A student wishing to register for up to 21 credit hours (academic overload) must obtain written authorization from their Department Chair and have maintained a cumulative GPA of at least 3.50 during the preceding academic year.", body_style))

    story.append(Paragraph("2.2 Course Withdrawal Policy", h2_style))
    story.append(Paragraph("After the Add/Drop deadline, students may withdraw from a course up to the end of Week 10 (November 10, 2024). A grade of 'W' will be assigned, which carries no penalty toward the student's cumulative GPA. A maximum of four 'W' grades are permitted across an entire undergraduate degree program.", body_style))

    story.append(Paragraph("2.3 Tuition Payment Deadlines and Late Fees", h2_style))
    story.append(Paragraph("Tuition and associated student activity fees must be paid in full or enrolled in an approved monthly installment plan according to the following deadlines:", body_style))
    story.append(Paragraph("• Fall Semester Tuition: Due August 15, 2024.", bullet_style))
    story.append(Paragraph("• Spring Semester Tuition: Due January 15, 2025.", bullet_style))
    story.append(Paragraph("A late administrative fee of $75 is assessed immediately upon any unpaid balance past 5:00 PM on the deadline date. Unpaid balances past 30 days trigger an academic hold preventing course registration and transcript issuance.", body_style))

    story.append(Paragraph("2.4 Academic Merit Scholarships", h2_style))
    story.append(Paragraph("The Apex Presidential Merit Scholarship provides $5,000 per academic year ($2,500 per semester) toward tuition costs. To maintain eligibility, recipients must maintain a continuous CGPA of 3.80 or higher and complete at least 30 credit hours each academic year without any disciplinary violations.", body_style))
    story.append(PageBreak())

    # --- PAGE 4: CODE OF CONDUCT & ACADEMIC INTEGRITY ---
    story.append(Paragraph("Section 3: Student Code of Conduct and Academic Integrity", h1_style))
    story.append(Paragraph("3.1 Academic Honor Code and Plagiarism", h2_style))
    story.append(Paragraph("Apex Institute of Technology is dedicated to the highest standard of intellectual honesty. Academic dishonesty includes, but is not limited to: cheating on exams, plagiarizing written material, unapproved collaboration on individual assignments, falsifying lab data, and unauthorized submission of AI-generated content without instructor consent.", body_style))

    story.append(Paragraph("3.2 Penalties for Academic Misconduct", h2_style))
    story.append(Paragraph("Sanctions for academic integrity violations depend on severity and prior record:", body_style))
    story.append(Paragraph("• <b>First Violation (Level 1):</b> Grade of zero (0) on the disputed assignment or exam, course grade reduction of one letter grade, and mandatory enrollment in the Academic Ethics Workshop.", bullet_style))
    story.append(Paragraph("• <b>Major or Second Violation (Level 2):</b> Automatic failure ('F') in the course and immediate referral to the University Disciplinary Committee for possible suspension of 1 to 2 academic semesters.", bullet_style))
    story.append(Paragraph("• <b>Third Violation:</b> Permanent expulsion from Apex Institute of Technology with an indelible notation on the official academic transcript.", bullet_style))

    story.append(Paragraph("3.3 Disciplinary Appeals Process", h2_style))
    story.append(Paragraph("Students have the right to appeal any disciplinary finding within seven (7) business days following written notice. Appeals must be submitted in writing to the Appeals Board chair detailing specific procedural errors or new substantial evidence not previously available.", body_style))
    story.append(PageBreak())

    # --- PAGE 5: CAMPUS FACILITIES & HEALTH SERVICES ---
    story.append(Paragraph("Section 4: Campus Facilities, Library Services, and Student Health Clinic", h1_style))
    story.append(Paragraph("4.1 Central Library Services and Borrowing", h2_style))
    story.append(Paragraph("The Apex Central Library operates Monday through Friday from 8:00 AM to 10:00 PM, and Saturday/Sunday from 10:00 AM to 8:00 PM. During final exam weeks, the library provides 24-hour study facilities on Floors 1 and 2.", body_style))
    story.append(Paragraph("• Undergraduate loan period: 21 calendar days for up to 10 circulating books.", bullet_style))
    story.append(Paragraph("• Overdue fines: $0.50 per day per book; $2.00 per hour for reserve materials.", bullet_style))
    story.append(Paragraph("• Group study rooms: Bookable up to 72 hours in advance via the student portal for groups of 3 or more.", bullet_style))

    story.append(Paragraph("4.2 Student Health & Counseling Center", h2_style))
    story.append(Paragraph("The Student Health and Wellness Clinic is located in the Student Life Pavilion, Room 204. Operating hours are Monday through Friday, 8:30 AM to 5:00 PM. Services provided include:", body_style))
    story.append(Paragraph("• Primary acute healthcare and prescription dispensary.", bullet_style))
    story.append(Paragraph("• Free, confidential psychological counseling sessions (up to 12 sessions per academic year).", bullet_style))
    story.append(Paragraph("• 24/7 Apex Emergency Mental Health Hotline: 1-800-555-APEX (2739).", bullet_style))

    story.append(Paragraph("4.3 Campus Parking Permits and Traffic Rules", h2_style))
    story.append(Paragraph("All motorized vehicles parked on campus property must display a valid digital parking permit. Student commuter permits cost $120 per semester and authorize parking in Lots C, D, and South Garage. Parking in Faculty Lot A or in designated fire lanes incurs an immediate $50 citation and vehicle towing at the owner's expense.", body_style))

    doc.build(story)
    return output_path

if __name__ == "__main__":
    p = Path("backend/data/samples/apex_handbook_2024.pdf")
    generate_sample_handbook_pdf(p)
    print(f"Sample PDF created at {p}")
