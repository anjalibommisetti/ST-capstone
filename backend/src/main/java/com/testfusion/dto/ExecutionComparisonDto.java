package com.testfusion.dto;

import java.util.ArrayList;
import java.util.List;

public class ExecutionComparisonDto {
    private ExecutionSummaryDto runA;
    private ExecutionSummaryDto runB;
    private int deltaPassed;
    private int deltaFailed;
    private double deltaStatementCoverage;
    private double deltaBranchCoverage;
    private List<StatusChange> statusChanges = new ArrayList<>();

    public static class StatusChange {
        private String testCaseId;
        private String testName;
        private String previousStatus;
        private String newStatus;

        public StatusChange() {}
        public StatusChange(String testCaseId, String testName, String previousStatus, String newStatus) {
            this.testCaseId = testCaseId;
            this.testName = testName;
            this.previousStatus = previousStatus;
            this.newStatus = newStatus;
        }

        public String getTestCaseId() { return testCaseId; }
        public void setTestCaseId(String testCaseId) { this.testCaseId = testCaseId; }
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getPreviousStatus() { return previousStatus; }
        public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }
        public String getNewStatus() { return newStatus; }
        public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    }

    public ExecutionComparisonDto() {}

    public ExecutionSummaryDto getRunA() { return runA; }
    public void setRunA(ExecutionSummaryDto runA) { this.runA = runA; }
    public ExecutionSummaryDto getRunB() { return runB; }
    public void setRunB(ExecutionSummaryDto runB) { this.runB = runB; }
    public int getDeltaPassed() { return deltaPassed; }
    public void setDeltaPassed(int deltaPassed) { this.deltaPassed = deltaPassed; }
    public int getDeltaFailed() { return deltaFailed; }
    public void setDeltaFailed(int deltaFailed) { this.deltaFailed = deltaFailed; }
    public double getDeltaStatementCoverage() { return deltaStatementCoverage; }
    public void setDeltaStatementCoverage(double deltaStatementCoverage) { this.deltaStatementCoverage = deltaStatementCoverage; }
    public double getDeltaBranchCoverage() { return deltaBranchCoverage; }
    public void setDeltaBranchCoverage(double deltaBranchCoverage) { this.deltaBranchCoverage = deltaBranchCoverage; }
    public List<StatusChange> getStatusChanges() { return statusChanges; }
    public void setStatusChanges(List<StatusChange> statusChanges) { this.statusChanges = statusChanges; }
}
