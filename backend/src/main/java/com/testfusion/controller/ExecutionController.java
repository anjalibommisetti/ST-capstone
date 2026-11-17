package com.testfusion.controller;

import com.testfusion.dto.ExecutionComparisonDto;
import com.testfusion.dto.ExecutionRequest;
import com.testfusion.dto.ExecutionSummaryDto;
import com.testfusion.model.*;
import com.testfusion.repository.*;
import com.testfusion.service.ExecutionEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/executions")
public class ExecutionController {

    private final ExecutionEngineService executionEngineService;
    private final TestExecutionRepository testExecutionRepository;
    private final TestResultRepository testResultRepository;
    private final CoverageReportRepository coverageReportRepository;
    private final UserRepository userRepository;

    public ExecutionController(ExecutionEngineService executionEngineService,
                               TestExecutionRepository testExecutionRepository,
                               TestResultRepository testResultRepository,
                               CoverageReportRepository coverageReportRepository,
                               UserRepository userRepository) {
        this.executionEngineService = executionEngineService;
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.coverageReportRepository = coverageReportRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @PostMapping("/projects/{projectId}/run")
    public ResponseEntity<ExecutionSummaryDto> runTests(@PathVariable Long projectId,
                                                        @RequestBody(required = false) ExecutionRequest request,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (request == null) {
            request = new ExecutionRequest();
        }
        return ResponseEntity.ok(executionEngineService.executeTests(projectId, request, user));
    }

    @GetMapping("/{executionId}")
    public ResponseEntity<ExecutionSummaryDto> getExecutionDetails(@PathVariable Long executionId) {
        TestExecution exec = testExecutionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found: " + executionId));

        List<TestResult> results = testResultRepository.findByTestExecution(exec);
        Optional<CoverageReport> crOpt = coverageReportRepository.findByTestExecution(exec);

        ExecutionSummaryDto dto = new ExecutionSummaryDto();
        dto.setExecutionId(exec.getId());
        dto.setExecutionNumber(exec.getExecutionNumber());
        dto.setProjectId(exec.getProject().getId());
        dto.setProjectName(exec.getProject().getName());
        dto.setTestType(exec.getTestType());
        dto.setTotalTests(exec.getTotalTests());
        dto.setPassedTests(exec.getPassedTests());
        dto.setFailedTests(exec.getFailedTests());
        dto.setErrorCount(exec.getErrorCount());
        dto.setDurationMs(exec.getDurationMs());
        dto.setStatementCoverage(exec.getStatementCoverage());
        dto.setBranchCoverage(exec.getBranchCoverage());
        dto.setCyclomaticComplexity(exec.getCyclomaticComplexity());
        dto.setExecutedAt(exec.getExecutedAt());

        List<ExecutionSummaryDto.IndividualResult> individualList = new ArrayList<>();
        for (TestResult r : results) {
            ExecutionSummaryDto.IndividualResult ir = new ExecutionSummaryDto.IndividualResult();
            ir.setTestCaseDbId(r.getTestCase().getId());
            ir.setTestCaseId(r.getTestCase().getTestCaseId());
            ir.setTestName(r.getTestCase().getName());
            ir.setTechnique(r.getTestCase().getTechnique());
            ir.setInputData(r.getTestCase().getInputData());
            ir.setExpectedResult(r.getTestCase().getExpectedResult());
            ir.setActualResult(r.getActualResult());
            ir.setStatus(r.getStatus());
            ir.setExecutionTimeMs(r.getExecutionTimeMs());
            ir.setErrorMessage(r.getErrorMessage());
            ir.setIntentionalFailure(Boolean.TRUE.equals(r.getTestCase().getIsIntentionalFailure()));
            individualList.add(ir);
        }
        dto.setResults(individualList);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/compare")
    public ResponseEntity<ExecutionComparisonDto> compareExecutions(@RequestParam Long runAId, @RequestParam Long runBId) {
        ExecutionSummaryDto a = getExecutionDetails(runAId).getBody();
        ExecutionSummaryDto b = getExecutionDetails(runBId).getBody();

        ExecutionComparisonDto comp = new ExecutionComparisonDto();
        comp.setRunA(a);
        comp.setRunB(b);

        if (a != null && b != null) {
            comp.setDeltaPassed(b.getPassedTests() - a.getPassedTests());
            comp.setDeltaFailed(b.getFailedTests() - a.getFailedTests());
            comp.setDeltaStatementCoverage(Math.round((b.getStatementCoverage() - a.getStatementCoverage()) * 10.0) / 10.0);
            comp.setDeltaBranchCoverage(Math.round((b.getBranchCoverage() - a.getBranchCoverage()) * 10.0) / 10.0);

            Map<String, String> statusMapA = new HashMap<>();
            a.getResults().forEach(r -> statusMapA.put(r.getTestCaseId(), r.getStatus()));

            List<ExecutionComparisonDto.StatusChange> changes = new ArrayList<>();
            for (ExecutionSummaryDto.IndividualResult rb : b.getResults()) {
                String prevStatus = statusMapA.get(rb.getTestCaseId());
                if (prevStatus != null && !prevStatus.equals(rb.getStatus())) {
                    changes.add(new ExecutionComparisonDto.StatusChange(
                            rb.getTestCaseId(),
                            rb.getTestName(),
                            prevStatus,
                            rb.getStatus()
                    ));
                }
            }
            comp.setStatusChanges(changes);
        }

        return ResponseEntity.ok(comp);
    }
}
