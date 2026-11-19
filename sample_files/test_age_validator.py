try:
    import pytest
except ImportError:
    pytest = None
from sample_files.age_validator import check_eligibility, calculate_discount

def test_negative_age():
    res = check_eligibility(-1)
    assert "Invalid Input" in res

def test_zero_age():
    res = check_eligibility(0)
    assert res == "Not Eligible"

def test_cutoff_17():
    res = check_eligibility(17)
    assert res == "Not Eligible"

def test_threshold_18():
    res = check_eligibility(18)
    assert res == "Eligible"

def test_adult_45():
    res = check_eligibility(45)
    assert res == "Eligible"

def test_max_age_120():
    res = check_eligibility(120)
    assert res == "Eligible"

def test_exceeds_max_121():
    res = check_eligibility(121)
    assert "Invalid Input" in res

def test_discount_child():
    assert calculate_discount(4) == 0.0

def test_discount_youth():
    assert calculate_discount(15) == 50.0

def test_discount_senior():
    assert calculate_discount(65) == 70.0

def test_discount_adult():
    assert calculate_discount(30) == 100.0
