from fpdf import FPDF

class ResumePDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Curriculum Vitae', 0, 1, 'C')
        self.ln(5)

    def section_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 8, title, 0, 1, 'L', 1)
        self.ln(2)

    def info_row(self, label, value):
        self.set_font('Arial', 'B', 10)
        self.cell(60, 6, f"{label}:", 0, 0)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 6, str(value))
        # self.ln(1)

def generate_resume():
    pdf = ResumePDF()
    pdf.add_page()
    
    # Block 1: Professional Identity
    pdf.section_title("1. Professional Identity")
    pdf.info_row("Full Name", "Dr. Arjun Mehta")
    pdf.info_row("Email", "arjun.mehta@caepy.com")
    pdf.info_row("Phone", "+91 9876543210")
    pdf.info_row("Specialty", "Cardiology")
    pdf.info_row("Primary Location", "Apollo Hospital, Sector 32, Gurugram")
    pdf.info_row("Clinical Experience", "12 Years")
    pdf.info_row("Post-Specialisation Exp", "6 Years")
    pdf.info_row("Registration Number", "HMC-123456")
    pdf.info_row("Registration Year", "2015")
    pdf.info_row("Registration Authority", "Haryana Medical Council")
    pdf.ln(5)

    # Block 2: Credentials & Trust Markers
    pdf.section_title("2. Credentials & Trust Markers")
    pdf.info_row("Qualifications", "MBBS (2010), MD General Medicine (2015), DM Cardiology (2018)")
    pdf.info_row("MBBS Year", "2010")
    pdf.info_row("Specialisation Year", "2018")
    pdf.info_row("Fellowships", "Fellow of American College of Cardiology (FACC), FSCAI")
    pdf.info_row("Memberships", "Cardiological Society of India (CSI), Indian Medical Association (IMA)")
    pdf.info_row("Awards", "Best Resident Doctor 2015, Young Investigator Award 2020")
    pdf.ln(5)

    # Block 3: Clinical Focus & Expertise
    pdf.section_title("3. Clinical Focus & Expertise")
    pdf.info_row("Areas of Interest", "Interventional Cardiology, Structural Heart Disease, Preventive Cardiology")
    pdf.info_row("Practice Segments", "Adult Cardiology, Heart Failure Management")
    pdf.info_row("Common Conditions", "Hypertension, Coronary Artery Disease, Myocardial Infarction, Arrhythmia")
    pdf.info_row("Known For", "Complex Angioplasty, TAVI procedures, Transradial interventions")
    pdf.info_row("Wants to Treat More", "Congenital heart defects in adults, rare cardiomyopathies")
    pdf.info_row("Practice Locations", "FMRI Gurugram (Tue/Thu), Heart Center Gurugram (Daily evening)")
    pdf.ln(5)

    # Block 4: The Human Side
    pdf.section_title("4. The Human Side")
    pdf.info_row("Motivation", "Providing accessible cardiac care and advancing medical education")
    pdf.info_row("Unwinding", "Long distance running, playing the violin, gardening")
    pdf.info_row("Recognition", "Known for calm demeanor and clear patient communication")
    pdf.info_row("Quality Time", "Weekends with family, volunteering at community health camps")
    pdf.info_row("Professional Achievement", "Lead the implementation of a 24/7 STEMI bypass protocol at my center")
    pdf.info_row("Personal Achievement", "Completed the Mumbai Marathon in under 4 hours")
    pdf.info_row("Professional Aspiration", "Establish a world-class preventative cardiac clinic")
    pdf.info_row("Personal Aspiration", "Write a book on heart health for the general public")
    pdf.ln(5)

    # Block 5: Patient Value & Choice Factors
    pdf.section_title("5. Patient Value & Choice Factors")
    pdf.info_row("Patient Value", "I value transparency and involve patients in every step of their treatment plan.")
    pdf.info_row("Care Approach", "Holistic care focusing on both physical health and psychological well-being.")
    pdf.info_row("Practice Philosophy", "Healing with heart, fueled by science.")
    pdf.info_row("Languages Spoken", "English, Hindi, Punjabi, Marathi")
    pdf.info_row("Consultation Fee", "INR 1000")
    
    pdf.output("sample_doctor_resume.pdf")
    print("PDF generated: sample_doctor_resume.pdf")

if __name__ == "__main__":
    generate_resume()
