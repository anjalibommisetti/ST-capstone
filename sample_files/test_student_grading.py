try:
    import pytest
except ImportError:
    pytest = None

from sample_files.student_grading_system import calculate_grade, check_scholarship

# calculate_grade tests
def test_invalid_marks_negative():
    assert calculate_grade(-1, 80) == "Invalid Marks"

def test_invalid_marks_above_100():
    assert calculate_grade(105, 80) == "Invalid Marks"

def test_invalid_attendance_negative():
    assert calculate_grade(85, -5) == "Invalid Attendance"

def test_invalid_attendance_above_100():
    assert calculate_grade(85, 105) == "Invalid Attendance"

def test_attendance_cutoff_failed():
    assert calculate_grade(95, 74) == "Failed due to Low Attendance"

def test_grade_a():
    assert calculate_grade(95, 75) == "Grade A"
    assert calculate_grade(90, 80) == "Grade A"

def test_grade_b():
    assert calculate_grade(85, 80) == "Grade B"
    assert calculate_grade(80, 85) == "Grade B"

def test_grade_c():
    assert calculate_grade(75, 80) == "Grade C"
    assert calculate_grade(70, 90) == "Grade C"

def test_grade_d():
    assert calculate_grade(65, 80) == "Grade D"
    assert calculate_grade(50, 75) == "Grade D"

def test_grade_f():
    assert calculate_grade(45, 80) == "Grade F"
    assert calculate_grade(0, 80) == "Grade F"

# check_scholarship tests
def test_invalid_gpa():
    assert check_scholarship(-0.1, 100000) == "Invalid GPA"
    assert check_scholarship(4.1, 100000) == "Invalid GPA"

def test_invalid_income():
    assert check_scholarship(3.5, -500) == "Invalid Income"

def test_full_scholarship():
    assert check_scholarship(3.9, 200000) == "Full Scholarship"

def test_half_scholarship():
    assert check_scholarship(3.6, 400000) == "Half Scholarship"

def test_need_based_bursary():
    assert check_scholarship(3.2, 250000) == "Need-based Bursary"

def test_no_scholarship():
    assert check_scholarship(2.5, 600000) == "No Scholarship"
