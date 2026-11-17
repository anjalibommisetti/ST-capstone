package com.testfusion.controller;

import com.testfusion.model.Project;
import com.testfusion.model.TestExecution;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.TestExecutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class TestHistoryController {

    private final TestExecutionRepository testExecutionRepository;
    private final ProjectRepository projectRepository;

    public TestHistoryController(TestExecutionRepository testExecutionRepository,
                                 ProjectRepository projectRepository) {
        this.testExecutionRepository = testExecutionRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<TestExecution>> getProjectHistory(@PathVariable Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        return ResponseEntity.ok(testExecutionRepository.findByProjectOrderByExecutedAtDesc(project));
    }

    @GetMapping
    public ResponseEntity<List<TestExecution>> getAllHistory() {
        return ResponseEntity.ok(testExecutionRepository.findAllByOrderByExecutedAtDesc());
    }
}
