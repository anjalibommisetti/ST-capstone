package com.testfusion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_suite_id")
    private TestSuite testSuite;

    @Column(name = "test_case_id", nullable = false, length = 50)
    private String testCaseId; // e.g. TC-BVA-01, TC-EP-02, TC-WB-01

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String technique; // EQUIVALENCE_PARTITIONING, BOUNDARY_VALUE, DECISION_TABLE, FUNCTIONAL, WHITE_BOX_BRANCH

    @Column(columnDefinition = "TEXT")
    private String preconditions;

    @Column(name = "input_data", nullable = false, columnDefinition = "TEXT")
    private String inputData;

    @Column(columnDefinition = "TEXT")
    private String steps;

    @Column(name = "expected_result", nullable = false, columnDefinition = "TEXT")
    private String expectedResult;

    @Column(name = "actual_result", columnDefinition = "TEXT")
    private String actualResult;

    @Column(length = 50)
    private String status = "NOT_RUN"; // PASS, FAIL, RUNNING, ERROR, NOT_RUN

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(name = "test_type", length = 50)
    private String testType = "BLACK_BOX"; // WHITE_BOX, BLACK_BOX, INTEGRATED

    @Column(name = "is_intentional_failure")
    private Boolean isIntentionalFailure = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public TestCase() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public TestSuite getTestSuite() { return testSuite; }
    public void setTestSuite(TestSuite testSuite) { this.testSuite = testSuite; }

    public String getTestCaseId() { return testCaseId; }
    public void setTestCaseId(String testCaseId) { this.testCaseId = testCaseId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTechnique() { return technique; }
    public void setTechnique(String technique) { this.technique = technique; }

    public String getPreconditions() { return preconditions; }
    public void setPreconditions(String preconditions) { this.preconditions = preconditions; }

    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }

    public String getSteps() { return steps; }
    public void setSteps(String steps) { this.steps = steps; }

    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }

    public String getActualResult() { return actualResult; }
    public void setActualResult(String actualResult) { this.actualResult = actualResult; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public Boolean getIsIntentionalFailure() { return isIntentionalFailure; }
    public void setIsIntentionalFailure(Boolean isIntentionalFailure) { this.isIntentionalFailure = isIntentionalFailure; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
