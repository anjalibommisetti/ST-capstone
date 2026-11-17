package com.testfusion.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ExecutionSummaryDto {
    private Long executionId;
    private String executionNumber;
    private String projectName;
    private Long projectId;
    private String testType;
    private int totalTests;
    private int passedTests;
    private int failedTests;
    private int errorCount;
    private long durationMs;
    private double statementCoverage;
    private double branchCoverage;
    private int cyclomaticComplexity;
    private LocalDateTime executedAt;
    private List<IndividualResult> results = new ArrayList<>();
    private List<Integer> uncoveredLines = new ArrayList<>();
    private List<String> uncoveredBranches = new ArrayList<>();
    private List<String> recommendations = new ArrayList<>();

    public static class IndividualResult {
        private Long testCaseDbId;
        private String testCaseId;
        private String testName;
        private String technique;
        private String inputData;
        private String expectedResult;
        private String actualResult;
        private String status;
        private long executionTimeMs;
        private String errorMessage;
        private boolean isIntentionalFailure;

        public IndividualResult() {}

        public Long getTestCaseDbId() { return testCaseDbId; }
        public void setTestCaseDbId(Long testCaseDbId) { this.testCaseDbId = testCaseDbId; }
        public String getTestCaseId() { return testCaseId; }
        public void setTestCaseId(String testCaseId) { this.testCaseId = testCaseId; }
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getTechnique() { return technique; }
        public void setTechnique(String technique) { this.technique = technique; }
        public String getInputData() { return inputData; }
        public void setInputData(String inputData) { this.inputData = inputData; }
        public String getExpectedResult() { return expectedResult; }
        public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }
        public String getActualResult() { return actualResult; }
        public void setActualResult(String actualResult) { this.actualResult = actualResult; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public boolean isIntentionalFailure() { return isIntentionalFailure; }
        public void setIntentionalFailure(boolean intentionalFailure) { isIntentionalFailure = intentionalFailure; }
    }

    public ExecutionSummaryDto() {}

    public Long getExecutionId() { return executionId; }
    public void setExecutionId(Long executionId) { this.executionId = executionId; }
    public String getExecutionNumber() { return executionNumber; }
    public void setExecutionNumber(String executionNumber) { this.executionNumber = executionNumber; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
    public int getTotalTests() { return totalTests; }
    public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
    public int getPassedTests() { return passedTests; }
    public void setPassedTests(int passedTests) { this.passedTests = passedTests; }
    public int getFailedTests() { return failedTests; }
    public void setFailedTests(int failedTests) { this.failedTests = failedTests; }
    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }
    public long getDurationMs() { return durationMs; }
    public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
    public double getStatementCoverage() { return statementCoverage; }
    public void setStatementCoverage(double statementCoverage) { this.statementCoverage = statementCoverage; }
    public double getBranchCoverage() { return branchCoverage; }
    public void setBranchCoverage(double branchCoverage) { this.branchCoverage = branchCoverage; }
    public int getCyclomaticComplexity() { return cyclomaticComplexity; }
    public void setCyclomaticComplexity(int cyclomaticComplexity) { this.cyclomaticComplexity = cyclomaticComplexity; }
    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
    public List<IndividualResult> getResults() { return results; }
    public void setResults(List<IndividualResult> results) { this.results = results; }
    public List<Integer> getUncoveredLines() { return uncoveredLines; }
    public void setUncoveredLines(List<Integer> uncoveredLines) { this.uncoveredLines = uncoveredLines; }
    public List<String> getUncoveredBranches() { return uncoveredBranches; }
    public void setUncoveredBranches(List<String> uncoveredBranches) { this.uncoveredBranches = uncoveredBranches; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
