package com.testfusion.controller;

import com.testfusion.dto.BlackBoxGenerateRequest;
import com.testfusion.model.Project;
import com.testfusion.model.TestCase;
import com.testfusion.model.TestSuite;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.TestCaseRepository;
import com.testfusion.repository.TestSuiteRepository;
import com.testfusion.service.BlackBoxGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/black-box")
public class BlackBoxTestingController {

    private final BlackBoxGeneratorService generatorService;
    private final ProjectRepository projectRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestSuiteRepository testSuiteRepository;

    public BlackBoxTestingController(BlackBoxGeneratorService generatorService,
                                     ProjectRepository projectRepository,
                                     TestCaseRepository testCaseRepository,
                                     TestSuiteRepository testSuiteRepository) {
        this.generatorService = generatorService;
        this.projectRepository = projectRepository;
        this.testCaseRepository = testCaseRepository;
        this.testSuiteRepository = testSuiteRepository;
    }

    @PostMapping("/projects/{projectId}/generate")
    public ResponseEntity<List<TestCase>> generateTests(@PathVariable Long projectId,
                                                        @RequestParam(defaultValue = "true") boolean save,
                                                        @RequestBody BlackBoxGenerateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        List<TestCase> generated = new ArrayList<>();
        String technique = request.getTechnique() != null ? request.getTechnique().toUpperCase() : "BOUNDARY_VALUE";

        switch (technique) {
            case "BOUNDARY_VALUE":
                if (request.getBoundaryRule() != null) {
                    generated = generatorService.generateBoundaryValueTests(project, request.getBoundaryRule());
                }
                break;
            case "EQUIVALENCE_PARTITIONING":
                if (request.getEquivalenceRule() != null) {
                    generated = generatorService.generateEquivalencePartitionTests(project, request.getEquivalenceRule());
                }
                break;
            case "DECISION_TABLE":
                if (request.getDecisionTable() != null) {
                    generated = generatorService.generateDecisionTableTests(project, request.getDecisionTable());
                }
                break;
            case "FUNCTIONAL":
            case "POSITIVE_NEGATIVE":
                if (request.getFunctionalInputs() != null) {
                    generated = generatorService.generatePositiveNegativeTests(project, request.getFunctionalInputs());
                }
                break;
            default:
                break;
        }

        if (save && !generated.isEmpty()) {
            // Find or create default Black Box TestSuite
            List<TestSuite> suites = testSuiteRepository.findByProject(project);
            TestSuite targetSuite = suites.stream()
                    .filter(s -> "BLACK_BOX".equalsIgnoreCase(s.getTestType()))
                    .findFirst()
                    .orElseGet(() -> testSuiteRepository.save(new TestSuite(project, "Black Box Suite", "Auto-generated test suite", "BLACK_BOX")));

            for (TestCase tc : generated) {
                tc.setTestSuite(targetSuite);
            }
            generated = testCaseRepository.saveAll(generated);
        }

        return ResponseEntity.ok(generated);
    }

    @GetMapping("/projects/{projectId}/tests")
    public ResponseEntity<List<TestCase>> getProjectTests(@PathVariable Long projectId,
                                                          @RequestParam(required = false) String testType) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (testType != null && !testType.isBlank()) {
            return ResponseEntity.ok(testCaseRepository.findByProjectAndTestTypeOrderByIdAsc(project, testType));
        }
        return ResponseEntity.ok(testCaseRepository.findByProjectOrderByIdAsc(project));
    }

    @PostMapping("/projects/{projectId}/tests")
    public ResponseEntity<TestCase> createTestCase(@PathVariable Long projectId,
                                                   @RequestBody TestCase tc) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        tc.setProject(project);
        if (tc.getTestCaseId() == null || tc.getTestCaseId().isBlank()) {
            long count = testCaseRepository.countByProject(project) + 1;
            tc.setTestCaseId(String.format("TC-MAN-%03d", count));
        }
        tc.setStatus("NOT_RUN");
        tc.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(testCaseRepository.save(tc));
    }

    @PutMapping("/tests/{testId}")
    public ResponseEntity<TestCase> updateTestCase(@PathVariable Long testId,
                                                   @RequestBody TestCase updated) {
        TestCase existing = testCaseRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test case not found: " + testId));

        existing.setName(updated.getName());
        existing.setTechnique(updated.getTechnique());
        existing.setPreconditions(updated.getPreconditions());
        existing.setInputData(updated.getInputData());
        existing.setSteps(updated.getSteps());
        existing.setExpectedResult(updated.getExpectedResult());
        existing.setTestType(updated.getTestType());
        existing.setIsIntentionalFailure(updated.getIsIntentionalFailure());

        return ResponseEntity.ok(testCaseRepository.save(existing));
    }

    @DeleteMapping("/tests/{testId}")
    public ResponseEntity<?> deleteTestCase(@PathVariable Long testId) {
        TestCase existing = testCaseRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test case not found: " + testId));
        testCaseRepository.delete(existing);
        return ResponseEntity.ok(Map.of("message", "Test case deleted successfully."));
    }

    @GetMapping("/projects/{projectId}/suites")
    public ResponseEntity<List<TestSuite>> getSuites(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        return ResponseEntity.ok(testSuiteRepository.findByProject(project));
    }
}
