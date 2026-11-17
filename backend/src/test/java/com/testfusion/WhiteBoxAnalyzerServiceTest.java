package com.testfusion;

import com.testfusion.dto.WhiteBoxAnalysisResult;
import com.testfusion.service.WhiteBoxAnalyzerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WhiteBoxAnalyzerServiceTest {

    private WhiteBoxAnalyzerService analyzerService;

    @BeforeEach
    void setUp() {
        analyzerService = new WhiteBoxAnalyzerService();
    }

    @Test
    @DisplayName("Should successfully parse Java code and extract methods")
    void testAnalyzeSourceMethods() {
        String code = """
            public class SampleClass {
                public int add(int a, int b) {
                    return a + b;
                }
            }
        """;

        WhiteBoxAnalysisResult result = analyzerService.analyzeSource(code);
        assertTrue(result.isSyntaxValid());
        assertEquals(1, result.getMethods().size());
        assertEquals("add", result.getMethods().get(0).getName());
        assertEquals("int", result.getMethods().get(0).getReturnType());
    }

    @Test
    @DisplayName("Should build Control Flow Graph and compute Cyclomatic Complexity M = E - N + 2P for AgeValidator")
    void testCyclomaticComplexityAndCfg() {
        String code = """
            public class AgeValidator {
                public String checkEligibility(int age) {
                    if (age < 0) {
                        return "Invalid Input";
                    } else if (age <= 17) {
                        return "Not Eligible";
                    } else if (age <= 120) {
                        return "Eligible";
                    } else {
                        return "Invalid Input";
                    }
                }
            }
        """;

        WhiteBoxAnalysisResult result = analyzerService.analyzeSource(code);
        assertTrue(result.isSyntaxValid());
        assertNotNull(result.getCfgNodes());
        assertFalse(result.getCfgNodes().isEmpty());
        assertNotNull(result.getCfgEdges());
        assertFalse(result.getCfgEdges().isEmpty());

        WhiteBoxAnalysisResult.CyclomaticMetric metric = result.getCyclomaticMetric();
        assertNotNull(metric);
        assertTrue(metric.getComplexity() >= 4, "AgeValidator with 3 if conditions should have cyclomatic complexity >= 4");
        assertEquals(1, metric.getConnectedComponents());
        assertTrue(metric.getFormula().contains("M = E"));

        // Verify entry and exit nodes exist
        assertTrue(result.getCfgNodes().stream().anyMatch(n -> "ENTRY".equals(n.getType())));
        assertTrue(result.getCfgNodes().stream().anyMatch(n -> "EXIT".equals(n.getType())));
        assertTrue(result.getCfgNodes().stream().anyMatch(n -> "DECISION".equals(n.getType())));

        // Verify independent paths
        assertNotNull(result.getIndependentPaths());
        assertFalse(result.getIndependentPaths().isEmpty());
    }

    @Test
    @DisplayName("Should report syntax errors gracefully on invalid Java code")
    void testInvalidJavaCode() {
        String invalidCode = "public class Malformed { int a = ; }";
        WhiteBoxAnalysisResult result = analyzerService.analyzeSource(invalidCode);
        assertFalse(result.isSyntaxValid());
        assertFalse(result.getCompilationErrors().isEmpty());
    }
}
