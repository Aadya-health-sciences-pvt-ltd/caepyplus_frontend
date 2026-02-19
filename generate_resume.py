from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

# Title
pdf.set_font("Arial", size=16, style='B')
pdf.cell(200, 10, txt="Dr. Sanya Sharma", ln=True, align='C')

# Contact Info
pdf.set_font("Arial", size=10)
pdf.cell(200, 5, txt="Email: sanya.sharma@example.com | Phone: +91 9876543210", ln=True, align='C')
pdf.cell(200, 5, txt="Address: 123, Health Avenue, Lajpat Nagar, New Delhi - 110024", ln=True, align='C')
pdf.ln(10)

# Professional Summary
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Professional Summary", ln=True)
pdf.set_font("Arial", size=11)
pdf.multi_cell(0, 5, txt="Experienced Dermatologist with 5+ years of practice in clinical and aesthetic dermatology. Specialized in treating acne, psoriasis, and performing laser therapies. Committed to providing patient-centric care.")
pdf.ln(5)

# Education
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Education", ln=True)
pdf.set_font("Arial", size=11)
pdf.cell(10, 5, txt="-", ln=False)
pdf.multi_cell(0, 5, txt="MD Dermatology, Venereology & Leprosy\nPGIMER, Chandigarh (2018)")
pdf.ln(2)
pdf.cell(10, 5, txt="-", ln=False)
pdf.multi_cell(0, 5, txt="MBBS\nAll India Institute of Medical Sciences (AIIMS), New Delhi (2015)")
pdf.ln(5)

# Experience
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Experience", ln=True)
pdf.set_font("Arial", size=11)
pdf.cell(200, 5, txt="Consultant Dermatologist", ln=True)
pdf.set_font("Arial", size=10, style='I')
pdf.cell(200, 5, txt="Apollo Hospitals, New Delhi | June 2018 - Present", ln=True)
pdf.set_font("Arial", size=11)
pdf.cell(10, 5, txt="-", ln=False)
pdf.multi_cell(0, 5, txt="Diagnosing and treating various skin conditions.")
pdf.cell(10, 5, txt="-", ln=False)
pdf.multi_cell(0, 5, txt="Performing cosmetic procedures like chemical peels, lasers, and botox.")
pdf.ln(5)

# Registration
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Registration", ln=True)
pdf.set_font("Arial", size=11)
pdf.cell(200, 5, txt="Delhi Medical Council", ln=True)
pdf.cell(200, 5, txt="Reg. No: 54321 (2015)", ln=True)
pdf.ln(5)

# Skills
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Skills", ln=True)
pdf.set_font("Arial", size=11)
pdf.multi_cell(0, 5, txt="Clinical Dermatology, Laser Therapy, Chemical Peels, Botox & Fillers, Patient Counseling, Dermatosurgery")
pdf.ln(5)

# Awards
pdf.set_font("Arial", size=12, style='B')
pdf.cell(200, 10, txt="Awards", ln=True)
pdf.set_font("Arial", size=11)
pdf.multi_cell(0, 5, txt="- Gold Medalist in MD Dermatology\n- Best Paper Presentation at IADVL 2019")

# Save
output_path = os.path.join(os.getcwd(), "dummy_resume.pdf")
pdf.output(output_path)
print(f"PDF generated at: {output_path}")
