package com.testfusion.controller;

import com.testfusion.model.Defect;
import com.testfusion.model.Project;
import com.testfusion.model.TestExecution;
import com.testfusion.repository.DefectRepository;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.TestExecutionRepository;
import com.testfusion.service.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportExportService reportExportService;
    private final ProjectRepository projectRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final DefectRepository defectRepository;

    public ReportController(ReportExportService reportExportService,
                            ProjectRepository projectRepository,
                            TestExecutionRepository testExecutionRepository,
                            DefectRepository defectRepository) {
        this.reportExportService = reportExportService;
        this.projectRepository = projectRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.defectRepository = defectRepository;
    }

    @GetMapping("/executions/{executionId}/csv")
    public ResponseEntity<byte[]> downloadExecutionCsv(@PathVariable Long executionId) {
        byte[] csvData = reportExportService.exportExecutionToCsv(executionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"testfusion_run_" + executionId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/projects/{projectId}/defects/csv")
    public ResponseEntity<byte[]> downloadDefectsCsv(@PathVariable Long projectId) {
        byte[] csvData = reportExportService.exportProjectDefectsToCsv(projectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"testfusion_defects_project_" + projectId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/projects/{projectId}/summary")
    public ResponseEntity<?> getProjectReportSummary(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        List<TestExecution> runs = testExecutionRepository.findByProjectOrderByExecutedAtDesc(project);
        List<Defect> defects = defectRepository.findByProjectOrderByCreatedAtDesc(project);

        Map<String, Object> summary = new HashMap<>();
        summary.put("projectId", project.getId());
        summary.put("projectName", project.getName());
        summary.put("description", project.getDescription());
        summary.put("language", project.getLanguage());
        summary.put("totalRuns", runs.size());
        summary.put("latestRun", runs.isEmpty() ? null : runs.get(0));
        summary.put("totalDefects", defects.size());
        summary.put("openDefects", defects.stream().filter(d -> !"CLOSED".equals(d.getStatus()) && !"RESOLVED".equals(d.getStatus())).count());
        summary.put("defects", defects);
        summary.put("recentRuns", runs.stream().limit(5).toList());

        return ResponseEntity.ok(summary);
    }
}
