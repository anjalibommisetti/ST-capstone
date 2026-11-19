# Integrated Software Testing Platform Using White Box and Black Box Testing
> **TestFusion – Unified QA Web Application**

A professional, fully functional web-based software testing platform that integrates **White Box Testing** (using **Pytest** and **Coverage.py**) and **Black Box Testing** (via **CSV/Excel Upload** and **Interactive Manual Testing**) in a single unified interface.

Built strictly according to user specifications with **Python Flask**, **SQLite**, **Chart.js**, and **ReportLab**.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) | Modern White & Light Blue UI theme with custom responsive sidebar |
| **Backend** | Python Flask | Lightweight, robust REST architecture & Jinja2 server-rendered views |
| **Testing Engine** | Pytest | Industry-standard Python unit testing framework |
| **Code Coverage** | Coverage.py (`--branch`) | Precise Statement & Branch coverage metrics derived from actual execution |
| **Database** | SQLite 3 | Relational persistence for users, uploaded code, test executions, & audit logs |
| **Visual Charts** | Chart.js | Dynamic Donut ratio chart & Bar performance trends |
| **PDF Reports** | ReportLab | Audit-grade downloadable PDF testing reports with status badges and metrics |

---

## ⚡ How to Run the Application

### Option 1: One-Click Windows Batch File (Easiest)
Simply double-click:
```bat
run.bat
```
*(or `start-all.bat`)*

This script installs any missing requirements, starts the Flask server on port 5000, and automatically opens your web browser.

---

### Option 2: Running via Terminal / PowerShell

1. Open PowerShell or Command Prompt in the project directory (`C:\Users\ANJI\ST-capstone`):
```powershell
# 1. Install dependencies (Flask, Pytest, Coverage, ReportLab, OpenPyXL)
pip install -r requirements.txt

# 2. Run the application
python app.py
```

2. Open your web browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 Default Login Credentials

The SQLite database is initialized with demo accounts. On the login page, you can also click the **Instant Demo Credentials** buttons:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Software Tester** | `tester` | `Tester@123` | Standard QA Engineer account pre-loaded with demonstration project |
| **Administrator** | `admin` | `Admin@123` | Administrator account with full system access |

*You can also register a brand new account using the "Create Account" link.*

---

## 📚 Platform Modules & Workflow

### 1. 📊 Dashboard (`/dashboard`)
- **Key Metric Cards**: Total Executions, Passed Tests, Failed Tests, Statement Coverage %, and Branch Coverage %.
- **Visual Charts**:
  - Test Verdict Ratio (Doughnut Chart: Passed vs Failed).
  - Recent Execution Performance & Coverage (Bar Chart).
- **Recent Executions Table**: Instant access to past runs and PDF reports.
- **Activity Log**: Real-time audit trail of user actions.

### 2. 📂 Upload Source Code (`/upload`)
- Browse and upload Python (`.py`) source files (up to 5 MB).
- **AST Static Analysis**: Automatically discovers all functions, parameters, line ranges, decision points, and loops.
- **Cyclomatic Complexity Calculation**: Computes McCabe complexity \( M = 1 + \text{decisions} + \text{loops} \) for every function.
- **Code Viewer**: Formatted view with line numbers.
- **1-Click Execution Buttons**: Run White Box or Black Box tests immediately on the uploaded file.

### 3. 🔍 White Box Testing (`/whitebox`)
- **Real Execution**: Runs the target Python program under `coverage.py` and `pytest` in an isolated subprocess.
- **Coverage Gauges**:
  - **Statement Coverage %**: Real percentage of executable lines exercised.
  - **Branch Coverage %**: Real percentage of boolean branch decisions evaluated.
- **Executed vs. Unexecuted Line Highlighter**:
  - **Green lines**: Statements exercised by the test suite.
  - **Red lines**: Statements not reached (dead code or missing test branches).
- **Custom Test Runner**: Run automated branch exploration or submit custom Pytest test code.

### 4. 📦 Black Box Testing (`/blackbox`)
- **Method 1: Upload Test Cases (CSV / Excel)**:
  - Upload `.csv` or `.xlsx` files with columns: `Test Case ID`, `Function Name`, `Input Values`, `Expected Output`.
  - Batch executes all test cases, evaluates actual vs. expected outputs, and records PASS/FAIL with failure reasons.
  - **1-Click Demo Button**: "Run Sample 15-Test BVA Suite (CSV)" pre-loaded with Boundary Value Analysis and Equivalence Partitioning cases.
- **Method 2: Interactive Manual Testing Form**:
  - Select any discovered function from a dropdown.
  - Enter test inputs (e.g. `18` or `25, 'STUDENT'`).
  - Enter expected output (e.g. `Eligible`).
  - Click "Run Manual Test Case" for instant comparison and execution status.

### 5. 📋 Test Results (`/results`)
- Detailed breakdown of the latest or selected execution.
- Color-coded badges: Green for **PASS**, Red for **FAIL**.
- Detailed error messages and assertion failure reasons.
- Status filters: View All, Pass Only, or Fail Only.
- Direct download button for certified audit PDF reports.

### 6. 🕒 Testing History (`/history`)
- Historical log of all past executions stored in SQLite.
- Searchable and sortable execution metadata.
- Links to review individual results, download PDFs, or delete old run records.

### 7. 📄 Reports Center (`/reports`)
- Central hub for all downloadable testing reports.
- Generates publication-ready PDFs via ReportLab including:
  - Project Title & Filename
  - Test Execution Timestamp
  - White Box Coverage Breakdown (Statement & Branch)
  - Color-coded Test Case Execution Tables
  - Final Audit Verdict

### 8. 🚪 Logout (`/logout`)
- Secure session invalidation and audit logging.

---

## 🧪 Sample Demonstration Files Included

Inside the `sample_files/` directory:
- `age_validator.py`: Target Python program with `check_eligibility(age)` and `calculate_discount(age)`.
- `test_cases.csv`: 15 Black Box test cases covering BVA (-1, 0, 17, 18, 120, 121), EP, discounts, and 1 intentional failure demo (`TC-FAIL-01`).
- `test_cases.xlsx`: Excel format test cases for spreadsheet upload testing.
- `test_age_validator.py`: Pytest unit test suite demonstrating high statement and branch coverage.
