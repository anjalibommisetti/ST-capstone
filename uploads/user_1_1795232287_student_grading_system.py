"""
Student Academic Grading & Scholarship Evaluation System
Designed for White Box Testing (Statement & Branch Coverage) and Black Box Testing.
"""

def calculate_grade(score: int, attendance: int) -> str:
    """
    Determines final student grade based on exam marks (0-100) and attendance percentage (0-100).
    Rules:
      - score < 0 or score > 100: 'Invalid Marks'
      - attendance < 0 or attendance > 100: 'Invalid Attendance'
      - attendance < 75: 'Failed due to Low Attendance' (Regardless of score)
      - score >= 90: 'Grade A'
      - score >= 80: 'Grade B'
      - score >= 70: 'Grade C'
      - score >= 50: 'Grade D'
      - score < 50: 'Grade F'
    """
    if score < 0 or score > 100:
        return "Invalid Marks"
    
    if attendance < 0 or attendance > 100:
        return "Invalid Attendance"
        
    if attendance < 75:
        return "Failed due to Low Attendance"
        
    if score >= 90:
        return "Grade A"
    elif score >= 80:
        return "Grade B"
    elif score >= 70:
        return "Grade C"
    elif score >= 50:
        return "Grade D"
    else:
        return "Grade F"


def check_scholarship(gpa: float, family_income: int) -> str:
    """
    Evaluates scholarship eligibility based on GPA (0.0 - 4.0) and annual family income in INR.
    Rules:
      - gpa < 0.0 or gpa > 4.0: 'Invalid GPA'
      - family_income < 0: 'Invalid Income'
      - gpa >= 3.8 and family_income <= 250000: 'Full Scholarship'
      - gpa >= 3.5 and family_income <= 500000: 'Half Scholarship'
      - gpa >= 3.0 and family_income <= 300000: 'Need-based Bursary'
      - Otherwise: 'No Scholarship'
    """
    if gpa < 0.0 or gpa > 4.0:
        return "Invalid GPA"
        
    if family_income < 0:
        return "Invalid Income"
        
    if gpa >= 3.8 and family_income <= 250000:
        return "Full Scholarship"
    elif gpa >= 3.5 and family_income <= 500000:
        return "Half Scholarship"
    elif gpa >= 3.0 and family_income <= 300000:
        return "Need-based Bursary"
    else:
        return "No Scholarship"


if __name__ == "__main__":
    print("Grade (95, 85):", calculate_grade(95, 85))
    print("Scholarship (3.9, 200000):", check_scholarship(3.9, 200000))
