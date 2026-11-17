package com.testfusion.service;

import com.testfusion.dto.*;
import com.testfusion.model.Project;
import com.testfusion.model.TestCase;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BlackBoxGeneratorService {

    /**
     * Generates Boundary Value Analysis test cases: min-1, min, min+1, nominal, max-1, max, max+1.
     */
    public List<TestCase> generateBoundaryValueTests(Project project, BoundaryValueRule rule) {
        List<TestCase> tests = new ArrayList<>();
        double min = rule.getMinValue();
        double max = rule.getMaxValue();
        String param = rule.getParameterName() != null ? rule.getParameterName() : "input";
        boolean isInt = "INTEGER".equalsIgnoreCase(rule.getDataType());

        double step = isInt ? 1.0 : 0.01;
        double nominal = isInt ? Math.round((min + max) / 2.0) : (min + max) / 2.0;

        // 1. Just below min (Invalid / Boundary Negative)
        double justBelowMin = min - step;
        tests.add(createTestCase(
                project,
                "TC-BVA-01",
                "Boundary Value - Just Below Minimum for " + param,
                "BOUNDARY_VALUE",
                param + " lower limit is " + formatVal(min, isInt),
                formatVal(justBelowMin, isInt),
                "1. Provide input " + formatVal(justBelowMin, isInt) + " below minimum allowable value\n2. Invoke validator",
                "Reject input / Invalid Value (< " + formatVal(min, isInt) + ")",
                false
        ));

        // 2. Exactly min (Valid / Lower Boundary)
        tests.add(createTestCase(
                project,
                "TC-BVA-02",
                "Boundary Value - Exactly Minimum for " + param,
                "BOUNDARY_VALUE",
                param + " lower limit is " + formatVal(min, isInt),
                formatVal(min, isInt),
                "1. Provide boundary input " + formatVal(min, isInt) + "\n2. Invoke validator",
                "Accept input / Valid boundary",
                false
        ));

        // 3. Just above min (Valid / Interior Boundary)
        double justAboveMin = min + step;
        tests.add(createTestCase(
                project,
                "TC-BVA-03",
                "Boundary Value - Just Above Minimum for " + param,
                "BOUNDARY_VALUE",
                param + " range is [" + formatVal(min, isInt) + " - " + formatVal(max, isInt) + "]",
                formatVal(justAboveMin, isInt),
                "1. Provide input " + formatVal(justAboveMin, isInt) + "\n2. Invoke validator",
                "Accept input / Valid within range",
                false
        ));

        // 4. Nominal Value (Valid Center)
        tests.add(createTestCase(
                project,
                "TC-BVA-04",
                "Boundary Value - Nominal Center Value for " + param,
                "BOUNDARY_VALUE",
                param + " range is [" + formatVal(min, isInt) + " - " + formatVal(max, isInt) + "]",
                formatVal(nominal, isInt),
                "1. Provide typical valid value " + formatVal(nominal, isInt) + "\n2. Invoke validator",
                "Accept input / Typical valid case",
                false
        ));

        // 5. Just below max (Valid / Interior Boundary)
        double justBelowMax = max - step;
        tests.add(createTestCase(
                project,
                "TC-BVA-05",
                "Boundary Value - Just Below Maximum for " + param,
                "BOUNDARY_VALUE",
                param + " upper limit is " + formatVal(max, isInt),
                formatVal(justBelowMax, isInt),
                "1. Provide input " + formatVal(justBelowMax, isInt) + "\n2. Invoke validator",
                "Accept input / Valid within range",
                false
        ));

        // 6. Exactly max (Valid / Upper Boundary)
        tests.add(createTestCase(
                project,
                "TC-BVA-06",
                "Boundary Value - Exactly Maximum for " + param,
                "BOUNDARY_VALUE",
                param + " upper limit is " + formatVal(max, isInt),
                formatVal(max, isInt),
                "1. Provide boundary input " + formatVal(max, isInt) + "\n2. Invoke validator",
                "Accept input / Valid boundary",
                false
        ));

        // 7. Just above max (Invalid / Upper Boundary Overflow)
        double justAboveMax = max + step;
        tests.add(createTestCase(
                project,
                "TC-BVA-07",
                "Boundary Value - Just Above Maximum for " + param,
                "BOUNDARY_VALUE",
                param + " upper limit is " + formatVal(max, isInt),
                formatVal(justAboveMax, isInt),
                "1. Provide input " + formatVal(justAboveMax, isInt) + " above maximum allowable value\n2. Invoke validator",
                "Reject input / Invalid Value (> " + formatVal(max, isInt) + ")",
                false
        ));

        return tests;
    }

    /**
     * Generates Equivalence Partitioning test cases for valid and invalid classes.
     */
    public List<TestCase> generateEquivalencePartitionTests(Project project, EquivalenceClassRule rule) {
        List<TestCase> tests = new ArrayList<>();
        int counter = 1;

        if (rule.getValidPartitions() != null) {
            for (EquivalenceClassRule.Partition p : rule.getValidPartitions()) {
                String tcId = String.format("TC-EP-V%02d", counter++);
                tests.add(createTestCase(
                        project,
                        tcId,
                        "Equivalence Class [VALID]: " + p.getName(),
                        "EQUIVALENCE_PARTITIONING",
                        "Input within valid partition range",
                        p.getRepresentativeValue() != null ? p.getRepresentativeValue() : "Valid Value",
                        "1. Feed representative partition value " + p.getRepresentativeValue() + "\n2. Verify system accepts partition",
                        p.getExpectedBehavior() != null ? p.getExpectedBehavior() : "Accepted / Success",
                        false
                ));
            }
        }

        int invCounter = 1;
        if (rule.getInvalidPartitions() != null) {
            for (EquivalenceClassRule.Partition p : rule.getInvalidPartitions()) {
                String tcId = String.format("TC-EP-INV%02d", invCounter++);
                tests.add(createTestCase(
                        project,
                        tcId,
                        "Equivalence Class [INVALID]: " + p.getName(),
                        "EQUIVALENCE_PARTITIONING",
                        "Input outside valid domain range",
                        p.getRepresentativeValue() != null ? p.getRepresentativeValue() : "Invalid Value",
                        "1. Feed representative invalid partition value " + p.getRepresentativeValue() + "\n2. Verify error handling",
                        p.getExpectedBehavior() != null ? p.getExpectedBehavior() : "Rejected / Error Raised",
                        false
                ));
            }
        }

        return tests;
    }

    /**
     * Generates Decision Table test cases from combinations of conditions and actions.
     */
    public List<TestCase> generateDecisionTableTests(Project project, DecisionTableDefinition def) {
        List<TestCase> tests = new ArrayList<>();
        int ruleIndex = 1;

        if (def.getRules() != null && !def.getRules().isEmpty()) {
            for (DecisionTableDefinition.RuleColumn rule : def.getRules()) {
                StringBuilder condSb = new StringBuilder();
                if (rule.getConditionValues() != null && def.getConditions() != null) {
                    for (int i = 0; i < Math.min(rule.getConditionValues().size(), def.getConditions().size()); i++) {
                        if (i > 0) condSb.append(", ");
                        condSb.append(def.getConditions().get(i)).append("=").append(rule.getConditionValues().get(i) ? "Y" : "N");
                    }
                }

                StringBuilder actionSb = new StringBuilder();
                if (rule.getActionOutcomes() != null && def.getActions() != null) {
                    for (int i = 0; i < Math.min(rule.getActionOutcomes().size(), def.getActions().size()); i++) {
                        if (rule.getActionOutcomes().get(i)) {
                            if (actionSb.length() > 0) actionSb.append("; ");
                            actionSb.append(def.getActions().get(i));
                        }
                    }
                }
                if (actionSb.length() == 0) actionSb.append("No action taken");

                tests.add(createTestCase(
                        project,
                        "TC-DT-" + String.format("%02d", ruleIndex),
                        "Decision Table Rule " + (rule.getRuleId() != null ? rule.getRuleId() : ("R" + ruleIndex)),
                        "DECISION_TABLE",
                        "System state: " + condSb.toString(),
                        condSb.toString(),
                        "1. Set preconditions corresponding to rule " + ruleIndex + "\n2. Trigger business logic evaluation",
                        actionSb.toString(),
                        false
                ));
                ruleIndex++;
            }
        }

        return tests;
    }

    /**
     * Generates Positive and Negative test cases.
     */
    public List<TestCase> generatePositiveNegativeTests(Project project, List<BlackBoxGenerateRequest.FunctionalTestInput> inputs) {
        List<TestCase> tests = new ArrayList<>();
        int posIndex = 1;
        int negIndex = 1;

        if (inputs != null) {
            for (BlackBoxGenerateRequest.FunctionalTestInput input : inputs) {
                String tcId;
                String technique;
                if (input.isPositive()) {
                    tcId = String.format("TC-POS-%02d", posIndex++);
                    technique = "POSITIVE_TESTING";
                } else {
                    tcId = String.format("TC-NEG-%02d", negIndex++);
                    technique = "NEGATIVE_TESTING";
                }

                tests.add(createTestCase(
                        project,
                        tcId,
                        input.getTestName() != null ? input.getTestName() : (technique + " Case"),
                        technique,
                        input.getDescription() != null ? input.getDescription() : "Standard functional flow",
                        input.getInputData() != null ? input.getInputData() : "",
                        "1. Execute target method with specified input\n2. Validate output assertions",
                        input.getExpectedOutput() != null ? input.getExpectedOutput() : "Success",
                        false
                ));
            }
        }

        return tests;
    }

    private TestCase createTestCase(Project project, String tcId, String name, String technique,
                                     String preconditions, String inputData, String steps,
                                     String expectedResult, boolean isIntentionalFailure) {
        TestCase tc = new TestCase();
        tc.setProject(project);
        tc.setTestCaseId(tcId);
        tc.setName(name);
        tc.setTechnique(technique);
        tc.setPreconditions(preconditions);
        tc.setInputData(inputData);
        tc.setSteps(steps);
        tc.setExpectedResult(expectedResult);
        tc.setStatus("NOT_RUN");
        tc.setTestType("BLACK_BOX");
        tc.setExecutionTimeMs(0L);
        tc.setIsIntentionalFailure(isIntentionalFailure);
        tc.setCreatedAt(LocalDateTime.now());
        return tc;
    }

    private String formatVal(double val, boolean isInt) {
        if (isInt) {
            return String.valueOf((long) val);
        } else {
            return String.format("%.2f", val);
        }
    }
}
