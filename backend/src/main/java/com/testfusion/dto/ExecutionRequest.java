package com.testfusion.dto;

import java.util.List;

public class ExecutionRequest {
    private String testType = "INTEGRATED"; // WHITE_BOX, BLACK_BOX, INTEGRATED
    private List<Long> testCaseIds;
    private String customSourceCode;

    public ExecutionRequest() {}

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public List<Long> getTestCaseIds() { return testCaseIds; }
    public void setTestCaseIds(List<Long> testCaseIds) { this.testCaseIds = testCaseIds; }

    public String getCustomSourceCode() { return customSourceCode; }
    public void setCustomSourceCode(String customSourceCode) { this.customSourceCode = customSourceCode; }
}
