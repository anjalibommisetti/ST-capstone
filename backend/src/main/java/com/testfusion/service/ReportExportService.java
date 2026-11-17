package com.testfusion.service;

import com.testfusion.model.Defect;
import com.testfusion.model.Project;
import com.testfusion.model.TestExecution;
import com.testfusion.model.TestResult;
import com.testfusion.repository.DefectRepository;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.TestExecutionRepository;
import com.testfusion.repository.TestResultRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    private final ProjectRepository projectRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final TestResultRepository testResultRepository;
    private final DefectRepository defectRepository;

    public ReportExportService(ProjectRepository projectRepository,
                               TestExecutionRepository testExecutionRepository,
                               TestResultRepository testResultRepository,
                               DefectRepository defectRepository) {
        this.projectRepository = projectRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.defectRepository = defectRepository;
    }

    public byte[] exportExecutionToCsv(Long executionId) {
        TestExecution exec = testExecutionRepository.findById(executionId)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found: " + executionId));
        Project project = exec.getProject();
        List<TestResult> results = testResultRepository.findByTestExecution(exec);

        StringBuilder sb = new StringBuilder();
        sb.append("TestFusion Integrated Software Testing Platform - Test Run Report\n");
        sb.append("Project Name,").append(escapeCsv(project.getName())).append("\n");
        sb.append("Execution Number,").append(exec.getExecutionNumber()).append("\n");
        sb.append("Execution Date,").append(exec.getExecutedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        sb.append("Test Type,").append(exec.getTestType()).append("\n");
        sb.append("Total Tests,").append(exec.getTotalTests()).append("\n");
        sb.append("Passed Tests,").append(exec.getPassedTests()).append("\n");
        sb.append("Failed Tests,").append(exec.getFailedTests()).append("\n");
        sb.append("Statement Coverage,").append(exec.getStatementCoverage()).append("%\n");
        sb.append("Branch Coverage,").append(exec.getBranchCoverage()).append("%\n");
        sb.append("Cyclomatic Complexity,").append(exec.getCyclomaticComplexity()).append("\n");
        sb.append("Duration (ms),").append(exec.getDurationMs()).append("\n\n");

        // Table Header
        sb.append("Test Case ID,Test Name,Technique,Input Data,Expected Result,Actual Result,Status,Duration (ms),Error Message\n");
        for (TestResult r : results) {
            sb.append(escapeCsv(r.getTestCase().getTestCaseId())).append(",");
            sb.append(escapeCsv(r.getTestCase().getName())).append(",");
            sb.append(escapeCsv(r.getTestCase().getTechnique())).append(",");
            sb.append(escapeCsv(r.getTestCase().getInputData())).append(",");
            sb.append(escapeCsv(r.getTestCase().getExpectedResult())).append(",");
            sb.append(escapeCsv(r.getActualResult())).append(",");
            sb.append(escapeCsv(r.getStatus())).append(",");
            sb.append(r.getExecutionTimeMs()).append(",");
            sb.append(escapeCsv(r.getErrorMessage() != null ? r.getErrorMessage() : "")).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportProjectDefectsToCsv(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        List<Defect> defects = defectRepository.findByProjectOrderByCreatedAtDesc(project);

        StringBuilder sb = new StringBuilder();
        sb.append("TestFusion Defect Tracking Export\n");
        sb.append("Project Name,").append(escapeCsv(project.getName())).append("\n\n");
        sb.append("Defect Code,Title,Severity,Status,Associated Test Case,Steps To Reproduce,Expected Result,Actual Result,Created At\n");

        for (Defect d : defects) {
            sb.append(escapeCsv(d.getDefectCode())).append(",");
            sb.append(escapeCsv(d.getTitle())).append(",");
            sb.append(escapeCsv(d.getSeverity())).append(",");
            sb.append(escapeCsv(d.getStatus())).append(",");
            sb.append(escapeCsv(d.getTestCase() != null ? d.getTestCase().getTestCaseId() : "N/A")).append(",");
            sb.append(escapeCsv(d.getStepsToReproduce())).append(",");
            sb.append(escapeCsv(d.getExpectedResult())).append(",");
            sb.append(escapeCsv(d.getActualResult())).append(",");
            sb.append(d.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ") + "\"";
    }
}
