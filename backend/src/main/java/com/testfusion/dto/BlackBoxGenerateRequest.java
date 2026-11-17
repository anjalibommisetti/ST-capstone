package com.testfusion.dto;

import java.util.List;

public class BlackBoxGenerateRequest {
    private String technique; // EQUIVALENCE_PARTITIONING, BOUNDARY_VALUE, DECISION_TABLE, FUNCTIONAL, POSITIVE_NEGATIVE
    private BoundaryValueRule boundaryRule;
    private EquivalenceClassRule equivalenceRule;
    private DecisionTableDefinition decisionTable;
    private List<FunctionalTestInput> functionalInputs;

    public static class FunctionalTestInput {
        private String testName;
        private String inputData;
        private String expectedOutput;
        private String description;
        private boolean isPositive = true;

        public FunctionalTestInput() {}

        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getInputData() { return inputData; }
        public void setInputData(String inputData) { this.inputData = inputData; }
        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isPositive() { return isPositive; }
        public void setPositive(boolean positive) { isPositive = positive; }
    }

    public BlackBoxGenerateRequest() {}

    public String getTechnique() { return technique; }
    public void setTechnique(String technique) { this.technique = technique; }

    public BoundaryValueRule getBoundaryRule() { return boundaryRule; }
    public void setBoundaryRule(BoundaryValueRule boundaryRule) { this.boundaryRule = boundaryRule; }

    public EquivalenceClassRule getEquivalenceRule() { return equivalenceRule; }
    public void setEquivalenceRule(EquivalenceClassRule equivalenceRule) { this.equivalenceRule = equivalenceRule; }

    public DecisionTableDefinition getDecisionTable() { return decisionTable; }
    public void setDecisionTable(DecisionTableDefinition decisionTable) { this.decisionTable = decisionTable; }

    public List<FunctionalTestInput> getFunctionalInputs() { return functionalInputs; }
    public void setFunctionalInputs(List<FunctionalTestInput> functionalInputs) { this.functionalInputs = functionalInputs; }
}
