package com.testfusion;

import com.testfusion.service.SafeRunnerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SafeRunnerServiceTest {

    private SafeRunnerService runnerService;

    @BeforeEach
    void setUp() {
        runnerService = new SafeRunnerService();
    }

    @Test
    @DisplayName("Should detect disallowed calls such as Runtime.getRuntime() for security isolation")
    void testDisallowedCallsBlocked() {
        String unsafeCode = """
            public class ExploitAttempt {
                public void run() {
                    Runtime.getRuntime().exec("calc");
                }
            }
        """;

        SafeRunnerService.RunResult result = runnerService.executeIsolated("ExploitAttempt", unsafeCode, null);
        assertFalse(result.isSuccess());
        assertTrue(result.getError().contains("Security Policy Violation") || result.getError().contains("disallowed"));
    }
}
