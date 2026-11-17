package com.testfusion.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_execution_id", nullable = false)
    private TestExecution testExecution;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Column(nullable = false, length = 50)
    private String status; // PASS, FAIL, ERROR

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(name = "actual_result", columnDefinition = "TEXT")
    private String actualResult;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    public TestResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TestExecution getTestExecution() { return testExecution; }
    public void setTestExecution(TestExecution testExecution) { this.testExecution = testExecution; }

    public TestCase getTestCase() { return testCase; }
    public void setTestCase(TestCase testCase) { this.testCase = testCase; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getActualResult() { return actualResult; }
    public void setActualResult(String actualResult) { this.actualResult = actualResult; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
}
