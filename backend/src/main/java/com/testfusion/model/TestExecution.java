package com.testfusion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_executions")
public class TestExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "execution_number", nullable = false, length = 100)
    private String executionNumber;

    @Column(name = "test_type", nullable = false, length = 50)
    private String testType; // WHITE_BOX, BLACK_BOX, INTEGRATED

    @Column(name = "total_tests")
    private Integer totalTests = 0;

    @Column(name = "passed_tests")
    private Integer passedTests = 0;

    @Column(name = "failed_tests")
    private Integer failedTests = 0;

    @Column(name = "error_count")
    private Integer errorCount = 0;

    @Column(name = "duration_ms")
    private Long durationMs = 0L;

    @Column(name = "statement_coverage")
    private Double statementCoverage = 0.0;

    @Column(name = "branch_coverage")
    private Double branchCoverage = 0.0;

    @Column(name = "cyclomatic_complexity")
    private Integer cyclomaticComplexity = 1;

    @Column(length = 50)
    private String status = "COMPLETED";

    @Column(name = "executed_at")
    private LocalDateTime executedAt = LocalDateTime.now();

    public TestExecution() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getExecutionNumber() { return executionNumber; }
    public void setExecutionNumber(String executionNumber) { this.executionNumber = executionNumber; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public Integer getTotalTests() { return totalTests; }
    public void setTotalTests(Integer totalTests) { this.totalTests = totalTests; }

    public Integer getPassedTests() { return passedTests; }
    public void setPassedTests(Integer passedTests) { this.passedTests = passedTests; }

    public Integer getFailedTests() { return failedTests; }
    public void setFailedTests(Integer failedTests) { this.failedTests = failedTests; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }

    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }

    public Double getStatementCoverage() { return statementCoverage; }
    public void setStatementCoverage(Double statementCoverage) { this.statementCoverage = statementCoverage; }

    public Double getBranchCoverage() { return branchCoverage; }
    public void setBranchCoverage(Double branchCoverage) { this.branchCoverage = branchCoverage; }

    public Integer getCyclomaticComplexity() { return cyclomaticComplexity; }
    public void setCyclomaticComplexity(Integer cyclomaticComplexity) { this.cyclomaticComplexity = cyclomaticComplexity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}
