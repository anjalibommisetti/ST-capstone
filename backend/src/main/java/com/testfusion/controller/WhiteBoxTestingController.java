package com.testfusion.controller;

import com.testfusion.dto.WhiteBoxAnalysisResult;
import com.testfusion.model.CoverageReport;
import com.testfusion.model.Project;
import com.testfusion.model.SourceFile;
import com.testfusion.model.TestExecution;
import com.testfusion.repository.CoverageReportRepository;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.SourceFileRepository;
import com.testfusion.repository.TestExecutionRepository;
import com.testfusion.service.WhiteBoxAnalyzerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/white-box")
public class WhiteBoxTestingController {

    private final WhiteBoxAnalyzerService whiteBoxAnalyzerService;
    private final ProjectRepository projectRepository;
    private final SourceFileRepository sourceFileRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final CoverageReportRepository coverageReportRepository;

    public WhiteBoxTestingController(WhiteBoxAnalyzerService whiteBoxAnalyzerService,
                                     ProjectRepository projectRepository,
                                     SourceFileRepository sourceFileRepository,
                                     TestExecutionRepository testExecutionRepository,
                                     CoverageReportRepository coverageReportRepository) {
        this.whiteBoxAnalyzerService = whiteBoxAnalyzerService;
        this.projectRepository = projectRepository;
        this.sourceFileRepository = sourceFileRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.coverageReportRepository = coverageReportRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<WhiteBoxAnalysisResult> analyzeSource(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "");
        return ResponseEntity.ok(whiteBoxAnalyzerService.analyzeSource(code));
    }

    @GetMapping("/projects/{projectId}/analysis")
    public ResponseEntity<WhiteBoxAnalysisResult> analyzeProject(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        List<SourceFile> files = sourceFileRepository.findByProject(project);
        if (files.isEmpty()) {
            WhiteBoxAnalysisResult empty = new WhiteBoxAnalysisResult();
            empty.setSyntaxValid(false);
            empty.getCompilationErrors().add("No source files found in this project.");
            return ResponseEntity.ok(empty);
        }

        String code = files.get(0).getContent();
        return ResponseEntity.ok(whiteBoxAnalyzerService.analyzeSource(code));
    }

    @GetMapping("/projects/{projectId}/coverage")
    public ResponseEntity<?> getProjectCoverage(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        List<TestExecution> executions = testExecutionRepository.findByProjectOrderByExecutedAtDesc(project);
        if (executions.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "hasRuns", false,
                    "statementCoverage", 0.0,
                    "branchCoverage", 0.0,
                    "cyclomaticComplexity", 1
            ));
        }

        TestExecution latest = executions.get(0);
        Optional<CoverageReport> crOpt = coverageReportRepository.findByTestExecution(latest);

        Map<String, Object> resp = new HashMap<>();
        resp.put("hasRuns", true);
        resp.put("executionNumber", latest.getExecutionNumber());
        resp.put("statementCoverage", latest.getStatementCoverage());
        resp.put("branchCoverage", latest.getBranchCoverage());
        resp.put("cyclomaticComplexity", latest.getCyclomaticComplexity());
        resp.put("executedAt", latest.getExecutedAt());
        crOpt.ifPresent(cr -> {
            resp.put("totalStatements", cr.getTotalStatements());
            resp.put("coveredStatements", cr.getCoveredStatements());
            resp.put("totalBranches", cr.getTotalBranches());
            resp.put("coveredBranches", cr.getCoveredBranches());
            resp.put("uncoveredLinesJson", cr.getUncoveredLinesJson());
            resp.put("uncoveredBranchesJson", cr.getUncoveredBranchesJson());
        });

        return ResponseEntity.ok(resp);
    }
}
