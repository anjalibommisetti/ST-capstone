-- TestFusion Database Schema for MySQL 8.0+
CREATE DATABASE IF NOT EXISTS testfusion_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE testfusion_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    language VARCHAR(50) NOT NULL DEFAULT 'Java',
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Source Files Table
CREATE TABLE IF NOT EXISTS source_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) DEFAULT '',
    content LONGTEXT NOT NULL,
    package_path VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Test Suites Table
CREATE TABLE IF NOT EXISTS test_suites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    test_type VARCHAR(50) NOT NULL DEFAULT 'INTEGRATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    test_suite_id BIGINT,
    test_case_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    technique VARCHAR(100) NOT NULL, -- EQUIVALENCE_PARTITIONING, BOUNDARY_VALUE, DECISION_TABLE, FUNCTIONAL, WHITE_BOX_BRANCH
    preconditions TEXT,
    input_data TEXT NOT NULL,
    steps TEXT,
    expected_result TEXT NOT NULL,
    actual_result TEXT,
    status VARCHAR(50) DEFAULT 'NOT_RUN', -- PASS, FAIL, RUNNING, ERROR, NOT_RUN
    execution_time_ms BIGINT DEFAULT 0,
    test_type VARCHAR(50) DEFAULT 'BLACK_BOX', -- WHITE_BOX, BLACK_BOX, INTEGRATED
    is_intentional_failure BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE SET NULL
);

-- 6. Test Executions Table
CREATE TABLE IF NOT EXISTS test_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    execution_number VARCHAR(100) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    error_count INT DEFAULT 0,
    duration_ms BIGINT DEFAULT 0,
    statement_coverage DOUBLE DEFAULT 0.0,
    branch_coverage DOUBLE DEFAULT 0.0,
    cyclomatic_complexity INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 7. Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_execution_id BIGINT NOT NULL,
    test_case_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    execution_time_ms BIGINT DEFAULT 0,
    actual_result TEXT,
    error_message TEXT,
    stack_trace TEXT,
    FOREIGN KEY (test_execution_id) REFERENCES test_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

-- 8. Coverage Reports Table
CREATE TABLE IF NOT EXISTS coverage_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_execution_id BIGINT NOT NULL UNIQUE,
    total_statements INT DEFAULT 0,
    covered_statements INT DEFAULT 0,
    statement_coverage_percent DOUBLE DEFAULT 0.0,
    total_branches INT DEFAULT 0,
    covered_branches INT DEFAULT 0,
    branch_coverage_percent DOUBLE DEFAULT 0.0,
    uncovered_lines_json TEXT,
    uncovered_branches_json TEXT,
    FOREIGN KEY (test_execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
);

-- 9. Defects Table
CREATE TABLE IF NOT EXISTS defects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    test_case_id BIGINT,
    defect_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    steps_to_reproduce TEXT,
    expected_result TEXT,
    actual_result TEXT,
    severity VARCHAR(50) DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    status VARCHAR(50) DEFAULT 'OPEN',     -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE SET NULL
);

-- 10. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
