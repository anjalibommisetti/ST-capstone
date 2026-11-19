"""
Age Eligibility Verification Module
Demonstrates White Box (Statement/Branch Coverage) and Black Box Testing.
"""

def check_eligibility(age: int) -> str:
    """
    Validates voting / registration eligibility based on age.
    Logic:
      - age < 0: Invalid Input (Negative age)
      - 0 <= age <= 17: Not Eligible (Underage)
      - 18 <= age <= 120: Eligible (Adult voter)
      - age > 120: Invalid Input (Exceeds human lifespan)
    """
    if age < 0:
        return "Invalid Input: Age cannot be negative"
    elif age <= 17:
        return "Not Eligible"
    elif age <= 120:
        return "Eligible"
    else:
        return "Invalid Input: Age exceeds maximum human lifespan"

def calculate_discount(age: int, base_ticket_price: float = 100.0) -> float:
    """
    Calculates ticket pricing discount:
      - Children (<= 5): Free (0.0)
      - Youth (6-17): 50% discount
      - Seniors (>= 60): 30% discount
      - Standard Adult: Full price
    """
    if age <= 5:
        return 0.0
    elif age <= 17:
        return base_ticket_price * 0.5
    elif age >= 60:
        return base_ticket_price * 0.7
    else:
        return base_ticket_price

if __name__ == "__main__":
    print("Testing AgeValidator check_eligibility:")
    print("Age 18 ->", check_eligibility(18))
