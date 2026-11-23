import os
import json
import sqlite3
from datetime import datetime
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for,
    flash, session, send_file, jsonify, abort
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from database.db import get_db_connection, init_db, DB_PATH
from test_engine.ast_analyzer import AstAnalyzer
from test_engine.safe_runner import SafeRunner
from test_engine.white_box import WhiteBoxEngine
from test_engine.black_box import BlackBoxEngine
from test_engine.report_generator import ReportGenerator

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "testfusion_secret_key_849302_white_black_box")

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
REPORT_FOLDER = os.path.join(os.path.dirname(__file__), 'reports')
ALLOWED_CODE_EXTENSIONS = {'.py'}
ALLOWED_TEST_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)

# Initialize database on startup
init_db()

# --- Helpers & Decorators ---

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to access the testing platform.", "warning")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def log_activity(user_id, action, details):
    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
            (user_id, action, details)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

def get_current_user():
    if 'user_id' not in session:
        return None
    conn = get_db_connection()
    user = conn.execute("SELECT id, username, email, full_name, role FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    conn.close()
    return user

def get_active_file(user_id):
    conn = get_db_connection()
    # Check session override
    active_file_id = session.get('active_file_id')
    if active_file_id:
        file_row = conn.execute("SELECT * FROM uploaded_files WHERE id = ? AND user_id = ?", (active_file_id, user_id)).fetchone()
        if file_row:
            conn.close()
            return file_row

    # Otherwise return latest uploaded file
    file_row = conn.execute("SELECT * FROM uploaded_files WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1", (user_id,)).fetchone()
    conn.close()
    if file_row:
        session['active_file_id'] = file_row['id']
    return file_row

def seed_sample_project_if_needed(user_id):
    """Seed sample AgeValidator if user has no files yet."""
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) FROM uploaded_files WHERE user_id = ?", (user_id,)).fetchone()[0]
    if count == 0:
        sample_path = os.path.join(os.path.dirname(__file__), 'sample_files', 'age_validator.py')
        if os.path.exists(sample_path):
            with open(sample_path, 'r', encoding='utf-8') as f:
                content = f.read()
            dest_filename = f"user_{user_id}_age_validator.py"
            dest_path = os.path.join(UPLOAD_FOLDER, dest_filename)
            with open(dest_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO uploaded_files (user_id, filename, filepath, file_content, file_size) VALUES (?, ?, ?, ?, ?)",
                (user_id, "age_validator.py", dest_path, content, len(content.encode('utf-8')))
            )
            file_id = cursor.lastrowid
            conn.commit()
            session['active_file_id'] = file_id
            log_activity(user_id, "FILE_UPLOADED", "Pre-loaded demonstration file: age_validator.py")
    conn.close()

# --- Context Processor ---
@app.context_processor
def inject_globals():
    return {
        'current_user': get_current_user(),
        'now': datetime.now()
    }

# --- Authentication Routes ---

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            flash("Username and password are required.", "danger")
            return render_template('login.html')

        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, username)).fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            session['role'] = user['role']
            log_activity(user['id'], "LOGIN", f"User {user['username']} logged in successfully")
            flash(f"Welcome back, {user['full_name']}!", "success")
            seed_sample_project_if_needed(user['id'])
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid username or password. Please try again.", "danger")

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        role = request.form.get('role', 'Tester')

        if not username or not email or not password:
            flash("All required fields must be completed.", "danger")
            return render_template('register.html')

        if len(password) < 6:
            flash("Password must be at least 6 characters.", "danger")
            return render_template('register.html')

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template('register.html')

        conn = get_db_connection()
        existing = conn.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email)).fetchone()
        if existing:
            conn.close()
            flash("Username or Email already registered. Please choose another.", "danger")
            return render_template('register.html')

        pwd_hash = generate_password_hash(password)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
            (username, email, pwd_hash, full_name or username, role)
        )
        new_user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        session['user_id'] = new_user_id
        session['username'] = username
        session['full_name'] = full_name or username
        session['role'] = role
        log_activity(new_user_id, "REGISTER", f"Account created for {username}")
        seed_sample_project_if_needed(new_user_id)

        flash("Registration successful! Welcome to TestFusion.", "success")
        return redirect(url_for('dashboard'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    uid = session.get('user_id')
    if uid:
        log_activity(uid, "LOGOUT", "User logged out")
    session.clear()
    flash("You have been signed out successfully.", "info")
    return redirect(url_for('login'))

# --- Dashboard ---

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    seed_sample_project_if_needed(user_id)
    active_file = get_active_file(user_id)

    conn = get_db_connection()
    # Executions count & pass/fail sums
    exec_stats = conn.execute("""
        SELECT 
            COUNT(*) as total_executions,
            COALESCE(SUM(total_tests), 0) as total_tests,
            COALESCE(SUM(passed_tests), 0) as total_passed,
            COALESCE(SUM(failed_tests), 0) as total_failed,
            COALESCE(AVG(statement_coverage), 0.0) as avg_stmt_cov,
            COALESCE(AVG(branch_coverage), 0.0) as avg_branch_cov
        FROM test_executions
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    # Recent activity logs
    activities = conn.execute("""
        SELECT action, details, timestamp
        FROM activity_logs
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 6
    """, (user_id,)).fetchall()

    # Recent executions
    recent_runs = conn.execute("""
        SELECT e.id, e.test_type, e.total_tests, e.passed_tests, e.failed_tests, 
               e.statement_coverage, e.branch_coverage, e.executed_at, f.filename
        FROM test_executions e
        LEFT JOIN uploaded_files f ON e.file_id = f.id
        WHERE e.user_id = ?
        ORDER BY e.executed_at DESC
        LIMIT 5
    """, (user_id,)).fetchall()

    # Chart data: pass/fail trends over recent 6 executions
    chart_runs = conn.execute("""
        SELECT id, test_type, passed_tests, failed_tests, statement_coverage, branch_coverage, executed_at
        FROM test_executions
        WHERE user_id = ?
        ORDER BY executed_at ASC
        LIMIT 8
    """, (user_id,)).fetchall()

    conn.close()

    chart_labels = [f"Run #{r['id']}" for r in chart_runs]
    chart_passed = [r['passed_tests'] for r in chart_runs]
    chart_failed = [r['failed_tests'] for r in chart_runs]
    chart_stmt_cov = [round(r['statement_coverage'], 1) for r in chart_runs]
    chart_branch_cov = [round(r['branch_coverage'], 1) for r in chart_runs]

    return render_template(
        'dashboard.html',
        stats=exec_stats,
        activities=activities,
        recent_runs=recent_runs,
        active_file=active_file,
        chart_data={
            "labels": chart_labels,
            "passed": chart_passed,
            "failed": chart_failed,
            "stmt_cov": chart_stmt_cov,
            "branch_cov": chart_branch_cov,
            "total_passed": exec_stats['total_passed'],
            "total_failed": exec_stats['total_failed']
        }
    )

# --- Upload Source Code ---

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    user_id = session['user_id']

    if request.method == 'POST':
        if 'source_file' not in request.files:
            flash("No file was selected for upload.", "danger")
            return redirect(request.url)

        file = request.files['source_file']
        if file.filename == '':
            flash("No file chosen.", "danger")
            return redirect(request.url)

        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_CODE_EXTENSIONS:
            flash("Invalid file extension! Only Python source code (.py) is supported.", "danger")
            return redirect(request.url)

        content = file.read().decode('utf-8', errors='replace')
        if len(content.encode('utf-8')) > MAX_FILE_SIZE_BYTES:
            flash("File exceeds maximum allowable size of 5 MB.", "danger")
            return redirect(request.url)

        safe_name = secure_filename(file.filename) or "uploaded_code.py"
        saved_filename = f"user_{user_id}_{int(datetime.now().timestamp())}_{safe_name}"
        saved_path = os.path.join(UPLOAD_FOLDER, saved_filename)

        with open(saved_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # Validate syntax with AST
        ast_res = AstAnalyzer.analyze_source(content)
        if not ast_res["is_valid"]:
            flash(f"Syntax Warning in file: Line {ast_res['syntax_error']['line']}: {ast_res['syntax_error']['message']}", "warning")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO uploaded_files (user_id, filename, filepath, file_content, file_size) VALUES (?, ?, ?, ?, ?)",
            (user_id, safe_name, saved_path, content, len(content.encode('utf-8')))
        )
        file_id = cursor.lastrowid
        conn.commit()
        conn.close()

        session['active_file_id'] = file_id
        log_activity(user_id, "FILE_UPLOADED", f"Uploaded Python source file: {safe_name}")
        flash(f"Successfully uploaded {safe_name}! AST analyzed {len(ast_res['functions'])} functions.", "success")
        return redirect(url_for('upload'))

    # GET: display active file & list of user's uploaded files
    active_file = get_active_file(user_id)
    conn = get_db_connection()
    files = conn.execute("SELECT * FROM uploaded_files WHERE user_id = ? ORDER BY uploaded_at DESC", (user_id,)).fetchall()
    conn.close()

    ast_info = None
    file_lines = []
    if active_file:
        ast_info = AstAnalyzer.analyze_source(active_file['file_content'])
        file_lines = active_file['file_content'].splitlines()

    return render_template(
        'upload.html',
        active_file=active_file,
        files=files,
        ast_info=ast_info,
        file_lines=file_lines
    )

@app.route('/upload/select/<int:file_id>')
@login_required
def select_file(file_id):
    user_id = session['user_id']
    conn = get_db_connection()
    f = conn.execute("SELECT id, filename FROM uploaded_files WHERE id = ? AND user_id = ?", (file_id, user_id)).fetchone()
    conn.close()
    if f:
        session['active_file_id'] = f['id']
        flash(f"Active testing file switched to: {f['filename']}", "info")
    return redirect(request.referrer or url_for('upload'))

# --- White Box Testing ---

@app.route('/whitebox')
@login_required
def whitebox():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        flash("Please upload a Python source code file first.", "warning")
        return redirect(url_for('upload'))

    # Fetch last white box execution for this file
    conn = get_db_connection()
    latest_wb = conn.execute("""
        SELECT * FROM test_executions 
        WHERE user_id = ? AND file_id = ? AND test_type = 'WHITE_BOX'
        ORDER BY executed_at DESC LIMIT 1
    """, (user_id, active_file['id'])).fetchone()
    conn.close()

    ast_info = AstAnalyzer.analyze_source(active_file['file_content'])
    file_lines = active_file['file_content'].splitlines()

    executed_lines = []
    missing_lines = []
    if latest_wb:
        try:
            executed_lines = json.loads(latest_wb['executed_lines'])
            missing_lines = json.loads(latest_wb['missing_lines'])
        except Exception:
            pass

    return render_template(
        'whitebox.html',
        active_file=active_file,
        ast_info=ast_info,
        file_lines=file_lines,
        latest_wb=latest_wb,
        executed_lines=executed_lines,
        missing_lines=missing_lines
    )

@app.route('/whitebox/run', methods=['POST'])
@login_required
def run_whitebox():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        flash("No active Python file found to test.", "danger")
        return redirect(url_for('upload'))

    test_mode = request.form.get('test_mode', 'basis_path')
    custom_test_code = request.form.get('custom_test_code')

    # Execute White Box Testing using real Pytest and Coverage.py
    wb_res = WhiteBoxEngine.run_white_box_analysis(active_file['filepath'], custom_test_code, test_mode=test_mode)

    if not wb_res["success"]:
        flash(f"White Box execution failed: {wb_res.get('error', 'Unknown error')}", "danger")
        return redirect(url_for('whitebox'))

    # Save to SQLite database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO test_executions (
            user_id, file_id, test_type, total_tests, passed_tests, failed_tests,
            statement_coverage, branch_coverage, total_statements, covered_statements,
            total_branches, covered_branches, duration_ms, executed_lines, missing_lines,
            uncovered_branches
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        active_file['id'],
        'WHITE_BOX',
        wb_res['total_tests'],
        wb_res['passed_tests'],
        wb_res['failed_tests'],
        wb_res['statement_coverage'],
        wb_res['branch_coverage'],
        wb_res['total_statements'],
        wb_res['covered_statements'],
        wb_res['total_branches'],
        wb_res['covered_branches'],
        wb_res['duration_ms'],
        json.dumps(wb_res['executed_lines']),
        json.dumps(wb_res['missing_lines']),
        json.dumps(wb_res.get('missing_branches', []))
    ))
    exec_id = cursor.lastrowid

    # Insert individual test results
    for td in wb_res.get('test_details', []):
        cursor.execute("""
            INSERT INTO test_results (
                execution_id, test_case_id, function_name, test_type,
                input_values, expected_output, actual_output, status, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exec_id,
            td['test_name'],
            'pytest_branch_suite',
            'WHITE_BOX',
            'Branch assertions',
            'Assertion passed',
            td['status'],
            td['status'],
            None if td['status'] == 'PASS' else td['message']
        ))

    # Generate PDF report automatically
    pdf_filename = f"report_run_{exec_id:04d}.pdf"
    pdf_path = os.path.join(REPORT_FOLDER, pdf_filename)
    exec_meta = {
        "id": exec_id,
        "filename": active_file['filename'],
        "test_type": "WHITE_BOX",
        "total_tests": wb_res['total_tests'],
        "passed_tests": wb_res['passed_tests'],
        "failed_tests": wb_res['failed_tests'],
        "executed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    ReportGenerator.generate_pdf_report(pdf_path, exec_meta, wb_res, wb_res.get('test_details', []))

    cursor.execute("UPDATE test_executions SET pdf_report_path = ? WHERE id = ?", (pdf_path, exec_id))
    conn.commit()
    conn.close()

    log_activity(user_id, "WHITE_BOX_EXECUTED", f"Executed white box suite on {active_file['filename']}: Stmt Cov {wb_res['statement_coverage']}%, Branch Cov {wb_res['branch_coverage']}%")
    flash(f"White Box testing finished ({test_mode.replace('_', ' ').title()} Strategy)! Statement Coverage: {wb_res['statement_coverage']}%, Branch Coverage: {wb_res['branch_coverage']}%.", "success")
    return redirect(url_for('whitebox'))

# --- Black Box Testing ---

@app.route('/blackbox')
@login_required
def blackbox():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        flash("Please upload a Python source code file first.", "warning")
        return redirect(url_for('upload'))

    ast_info = AstAnalyzer.analyze_source(active_file['file_content'])
    functions = ast_info["functions"]

    return render_template(
        'blackbox.html',
        active_file=active_file,
        functions=functions
    )

@app.route('/blackbox/upload-tests', methods=['POST'])
@login_required
def upload_blackbox_tests():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        flash("No active Python file found to test against.", "danger")
        return redirect(url_for('upload'))

    if 'test_file' not in request.files:
        flash("No test cases file provided.", "danger")
        return redirect(url_for('blackbox'))

    file = request.files['test_file']
    if file.filename == '':
        flash("No file selected.", "danger")
        return redirect(url_for('blackbox'))

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_TEST_EXTENSIONS:
        flash("Invalid test case format! Supported formats are CSV (.csv) and Excel (.xlsx, .xls).", "danger")
        return redirect(url_for('blackbox'))

    safe_name = secure_filename(file.filename) or "test_cases.csv"
    saved_test_path = os.path.join(UPLOAD_FOLDER, f"tc_{user_id}_{int(datetime.now().timestamp())}_{safe_name}")
    file.save(saved_test_path)

    # Execute tests using BlackBoxEngine
    try:
        results = BlackBoxEngine.execute_file_tests(active_file['filepath'], saved_test_path)
    except Exception as e:
        flash(f"Failed to parse or execute test cases: {str(e)}", "danger")
        return redirect(url_for('blackbox'))

    if not results:
        flash("No test cases found in uploaded file. Check headers: 'Test Case ID', 'Function Name', 'Input Values', 'Expected Output'.", "warning")
        return redirect(url_for('blackbox'))

    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    failed_tests = sum(1 for r in results if r['status'] == 'FAIL')

    # Save execution to DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO test_executions (
            user_id, file_id, test_type, total_tests, passed_tests, failed_tests,
            statement_coverage, branch_coverage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        active_file['id'],
        'BLACK_BOX_FILE',
        total_tests,
        passed_tests,
        failed_tests,
        0.0,
        0.0
    ))
    exec_id = cursor.lastrowid

    for r in results:
        cursor.execute("""
            INSERT INTO test_results (
                execution_id, test_case_id, function_name, test_type,
                input_values, expected_output, actual_output, status, error_message, execution_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exec_id,
            r['test_case_id'],
            r['function_name'],
            'BLACK_BOX_FILE',
            str(r['input']),
            str(r['expected']),
            str(r['actual']),
            r['status'],
            r['error_message'],
            r.get('duration_ms', 0.0)
        ))

    # Generate PDF Report
    pdf_filename = f"report_run_{exec_id:04d}.pdf"
    pdf_path = os.path.join(REPORT_FOLDER, pdf_filename)
    exec_meta = {
        "id": exec_id,
        "filename": active_file['filename'],
        "test_type": "BLACK_BOX_FILE",
        "total_tests": total_tests,
        "passed_tests": passed_tests,
        "failed_tests": failed_tests,
        "executed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    ReportGenerator.generate_pdf_report(pdf_path, exec_meta, None, results)
    cursor.execute("UPDATE test_executions SET pdf_report_path = ? WHERE id = ?", (pdf_path, exec_id))

    conn.commit()
    conn.close()

    log_activity(user_id, "BLACK_BOX_FILE_RUN", f"Executed {total_tests} test cases from {safe_name}: {passed_tests} PASS, {failed_tests} FAIL")
    flash(f"Black Box execution completed! {passed_tests} Passed, {failed_tests} Failed.", "success")
    return redirect(url_for('results', execution_id=exec_id))

@app.route('/blackbox/manual-test', methods=['POST'])
@login_required
def manual_test():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        return jsonify({"error": "No active Python file found."}), 400

    func_name = request.form.get('function_name', '').strip()
    input_str = request.form.get('input_values', '').strip()
    expected_str = request.form.get('expected_output', '').strip()

    if not func_name:
        return jsonify({"error": "Function Name is required."}), 400

    result = BlackBoxEngine.execute_manual_test(active_file['filepath'], func_name, input_str, expected_str)

    # Save to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO test_executions (
            user_id, file_id, test_type, total_tests, passed_tests, failed_tests
        ) VALUES (?, ?, ?, 1, ?, ?)
    """, (
        user_id,
        active_file['id'],
        'BLACK_BOX_MANUAL',
        1 if result['status'] == 'PASS' else 0,
        0 if result['status'] == 'PASS' else 1
    ))
    exec_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO test_results (
            execution_id, test_case_id, function_name, test_type,
            input_values, expected_output, actual_output, status, error_message, execution_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        exec_id,
        f"MANUAL-{exec_id}",
        func_name,
        'BLACK_BOX_MANUAL',
        input_str,
        expected_str,
        result['actual'],
        result['status'],
        result['error_message'],
        result['duration_ms']
    ))
    conn.commit()
    conn.close()

    log_activity(user_id, "MANUAL_TEST_EXECUTED", f"Manual test on {func_name}(): {result['status']}")

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
        return jsonify({
            "status": "success",
            "result": result,
            "execution_id": exec_id
        })

    flash(f"Manual Test completed: {result['status']}! Result: {result['actual']}", "success" if result['status'] == 'PASS' else "danger")
    return redirect(url_for('results', execution_id=exec_id))

# --- Sample File Triggers (1-Click Evaluation) ---

@app.route('/sample/run-bva-csv')
@login_required
def sample_run_csv():
    user_id = session['user_id']
    active_file = get_active_file(user_id)
    if not active_file:
        seed_sample_project_if_needed(user_id)
        active_file = get_active_file(user_id)

    sample_csv = os.path.join(os.path.dirname(__file__), 'sample_files', 'test_cases.csv')
    results = BlackBoxEngine.execute_file_tests(active_file['filepath'], sample_csv)

    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    failed_tests = sum(1 for r in results if r['status'] == 'FAIL')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO test_executions (
            user_id, file_id, test_type, total_tests, passed_tests, failed_tests
        ) VALUES (?, ?, 'BLACK_BOX_FILE', ?, ?, ?)
    """, (user_id, active_file['id'], total_tests, passed_tests, failed_tests))
    exec_id = cursor.lastrowid

    for r in results:
        cursor.execute("""
            INSERT INTO test_results (
                execution_id, test_case_id, function_name, test_type,
                input_values, expected_output, actual_output, status, error_message, execution_time_ms
            ) VALUES (?, ?, ?, 'BLACK_BOX_FILE', ?, ?, ?, ?, ?, ?)
        """, (
            exec_id, r['test_case_id'], r['function_name'], str(r['input']),
            str(r['expected']), str(r['actual']), r['status'], r['error_message'], r.get('duration_ms', 0)
        ))

    pdf_filename = f"report_run_{exec_id:04d}.pdf"
    pdf_path = os.path.join(REPORT_FOLDER, pdf_filename)
    ReportGenerator.generate_pdf_report(pdf_path, {
        "id": exec_id, "filename": active_file['filename'], "test_type": "BLACK_BOX_FILE",
        "total_tests": total_tests, "passed_tests": passed_tests, "failed_tests": failed_tests
    }, None, results)
    cursor.execute("UPDATE test_executions SET pdf_report_path = ? WHERE id = ?", (pdf_path, exec_id))

    conn.commit()
    conn.close()

    flash(f"Loaded and executed Sample CSV Suite: {passed_tests} Passed, {failed_tests} Failed (includes intentional failure demo).", "success")
    return redirect(url_for('results', execution_id=exec_id))

# --- Testing Results ---

@app.route('/results')
@app.route('/results/<int:execution_id>')
@login_required
def results(execution_id=None):
    user_id = session['user_id']
    conn = get_db_connection()

    if execution_id:
        execution = conn.execute("""
            SELECT e.*, f.filename
            FROM test_executions e
            LEFT JOIN uploaded_files f ON e.file_id = f.id
            WHERE e.id = ? AND e.user_id = ?
        """, (execution_id, user_id)).fetchone()
    else:
        execution = conn.execute("""
            SELECT e.*, f.filename
            FROM test_executions e
            LEFT JOIN uploaded_files f ON e.file_id = f.id
            WHERE e.user_id = ?
            ORDER BY e.executed_at DESC LIMIT 1
        """, (user_id,)).fetchone()

    test_rows = []
    if execution:
        test_rows = conn.execute("""
            SELECT * FROM test_results
            WHERE execution_id = ?
            ORDER BY id ASC
        """, (execution['id'],)).fetchall()

    conn.close()

    return render_template(
        'results.html',
        execution=execution,
        results=test_rows
    )

# --- Testing History ---

@app.route('/history')
@login_required
def history():
    user_id = session['user_id']
    conn = get_db_connection()
    runs = conn.execute("""
        SELECT e.*, f.filename
        FROM test_executions e
        LEFT JOIN uploaded_files f ON e.file_id = f.id
        WHERE e.user_id = ?
        ORDER BY e.executed_at DESC
    """, (user_id,)).fetchall()
    conn.close()

    return render_template('history.html', runs=runs)

@app.route('/history/delete/<int:execution_id>', methods=['POST'])
@login_required
def delete_execution(execution_id):
    user_id = session['user_id']
    conn = get_db_connection()
    conn.execute("DELETE FROM test_executions WHERE id = ? AND user_id = ?", (execution_id, user_id))
    conn.commit()
    conn.close()
    flash(f"Execution record #{execution_id} removed.", "info")
    return redirect(url_for('history'))

# --- Reports ---

@app.route('/reports')
@login_required
def reports():
    user_id = session['user_id']
    conn = get_db_connection()
    report_list = conn.execute("""
        SELECT e.*, f.filename
        FROM test_executions e
        LEFT JOIN uploaded_files f ON e.file_id = f.id
        WHERE e.user_id = ? AND e.pdf_report_path IS NOT NULL
        ORDER BY e.executed_at DESC
    """, (user_id,)).fetchall()
    conn.close()

    return render_template('reports.html', reports=report_list)

@app.route('/reports/download/<int:execution_id>')
@login_required
def download_report(execution_id):
    user_id = session['user_id']
    conn = get_db_connection()
    run = conn.execute("""
        SELECT e.*, f.filename FROM test_executions e
        LEFT JOIN uploaded_files f ON e.file_id = f.id
        WHERE e.id = ? AND e.user_id = ?
    """, (execution_id, user_id)).fetchone()
    conn.close()

    if not run or not run['pdf_report_path'] or not os.path.exists(run['pdf_report_path']):
        flash("PDF report file not found on server.", "danger")
        return redirect(url_for('reports'))

    return send_file(
        run['pdf_report_path'],
        as_attachment=True,
        download_name=f"testfusion_audit_run_{execution_id:04d}.pdf",
        mimetype="application/pdf"
    )

if __name__ == '__main__':
    print("=" * 60)
    print("  TestFusion Flask Platform is starting on http://localhost:5000")
    print("  Default Tester: tester / Tester@123")
    print("  Default Admin:  admin / Admin@123")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
