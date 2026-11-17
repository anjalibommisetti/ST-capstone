package com.testfusion;

import com.testfusion.dto.BoundaryValueRule;
import com.testfusion.dto.DecisionTableDefinition;
import com.testfusion.dto.EquivalenceClassRule;
import com.testfusion.model.Project;
import com.testfusion.model.TestCase;
import com.testfusion.service.BlackBoxGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BlackBoxGeneratorServiceTest {

    private BlackBoxGeneratorService generatorService;
    private Project sampleProject;

    @BeforeEach
    void setUp() {
        generatorService = new BlackBoxGeneratorService();
        sampleProject = new Project("Test Project", "Description", "Java", null);
        sampleProject.setId(100L);
    }

    @Test
    @DisplayName("Should generate 7 boundary value test cases: min-1, min, min+1, nominal, max-1, max, max+1")
    void testBoundaryValueGeneration() {
        BoundaryValueRule rule = new BoundaryValueRule("age", 18.0, 65.0, "INTEGER");

        List<TestCase> tests = generatorService.generateBoundaryValueTests(sampleProject, rule);
        assertEquals(7, tests.size(), "BVA should generate exactly 7 boundary tests");

        // Verify min-1 (17)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("17")));
        // Verify min (18)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("18")));
        // Verify min+1 (19)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("19")));
        // Verify max-1 (64)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("64")));
        // Verify max (65)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("65")));
        // Verify max+1 (66)
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("66")));

        for (TestCase tc : tests) {
            assertEquals("BOUNDARY_VALUE", tc.getTechnique());
            assertEquals("NOT_RUN", tc.getStatus());
            assertNotNull(tc.getExpectedResult());
        }
    }

    @Test
    @DisplayName("Should generate Equivalence Partitioning test cases for valid and invalid partitions")
    void testEquivalencePartitionGeneration() {
        EquivalenceClassRule rule = new EquivalenceClassRule();
        rule.setParameterName("age");
        rule.setValidPartitions(List.of(
                new EquivalenceClassRule.Partition("Adult Voter", 18.0, 120.0, "25", "Eligible")
        ));
        rule.setInvalidPartitions(List.of(
                new EquivalenceClassRule.Partition("Negative Age", null, -1.0, "-5", "Invalid Input"),
                new EquivalenceClassRule.Partition("Extreme Age", 121.0, null, "150", "Invalid Input")
        ));

        List<TestCase> tests = generatorService.generateEquivalencePartitionTests(sampleProject, rule);
        assertEquals(3, tests.size());

        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("25")));
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("-5")));
        assertTrue(tests.stream().anyMatch(t -> t.getInputData().equals("150")));

        for (TestCase tc : tests) {
            assertEquals("EQUIVALENCE_PARTITIONING", tc.getTechnique());
        }
    }

    @Test
    @DisplayName("Should generate Decision Table test cases from conditions, actions, and rule combinations")
    void testDecisionTableGeneration() {
        DecisionTableDefinition def = new DecisionTableDefinition();
        def.setName("Access Authorization Table");
        def.setConditions(List.of("Age >= 18", "Has Active Subscription"));
        def.setActions(List.of("Grant Full Access", "Prompt Upgrade", "Reject"));

        DecisionTableDefinition.RuleColumn r1 = new DecisionTableDefinition.RuleColumn("R1", List.of(true, true), List.of(true, false, false));
        DecisionTableDefinition.RuleColumn r2 = new DecisionTableDefinition.RuleColumn("R2", List.of(true, false), List.of(false, true, false));
        DecisionTableDefinition.RuleColumn r3 = new DecisionTableDefinition.RuleColumn("R3", List.of(false, false), List.of(false, false, true));

        def.setRules(List.of(r1, r2, r3));

        List<TestCase> tests = generatorService.generateDecisionTableTests(sampleProject, def);
        assertEquals(3, tests.size());
        assertEquals("DECISION_TABLE", tests.get(0).getTechnique());
        assertTrue(tests.get(0).getExpectedResult().contains("Grant Full Access"));
        assertTrue(tests.get(1).getExpectedResult().contains("Prompt Upgrade"));
        assertTrue(tests.get(2).getExpectedResult().contains("Reject"));
    }
}
