package com.testfusion.controller;

import com.testfusion.model.*;
import com.testfusion.repository.*;
import com.testfusion.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final DefectRepository defectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public DashboardController(ProjectRepository projectRepository,
                               TestCaseRepository testCaseRepository,
                               TestExecutionRepository testExecutionRepository,
                               DefectRepository defectRepository,
                               UserRepository userRepository,
                               ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.testCaseRepository = testCaseRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.defectRepository = defectRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = null;
        if (userDetails != null) {
            user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        }

        List<Project> projects = (user != null && "ROLE_ADMIN".equals(user.getRole()))
                ? projectRepository.findAllByOrderByCreatedAtDesc()
                : (user != null ? projectRepository.findByUserOrderByCreatedAtDesc(user) : projectRepository.findAll());

        List<TestExecution> allExecutions = testExecutionRepository.findAllByOrderByExecutedAtDesc();
        List<TestCase> allTestCases = testCaseRepository.findAll();
        List<Defect> allDefects = defectRepository.findAllByOrderByCreatedAtDesc();

        int totalPassedTests = 0;
        int totalFailedTests = 0;
        for (TestExecution ex : allExecutions) {
            totalPassedTests += ex.getPassedTests();
            totalFailedTests += ex.getFailedTests();
        }

        // White box coverage average
        double avgStatementCoverage = allExecutions.stream()
                .mapToDouble(TestExecution::getStatementCoverage)
                .average()
                .orElse(0.0);
        double avgBranchCoverage = allExecutions.stream()
                .mapToDouble(TestExecution::getBranchCoverage)
                .average()
                .orElse(0.0);

        // Black box technique breakdown
        Map<String, Long> blackBoxDistribution = new HashMap<>();
        for (TestCase tc : allTestCases) {
            String tech = tc.getTechnique() != null ? tc.getTechnique() : "GENERAL";
            blackBoxDistribution.put(tech, blackBoxDistribution.getOrDefault(tech, 0L) + 1);
        }

        long openDefects = allDefects.stream()
                .filter(d -> !"CLOSED".equalsIgnoreCase(d.getStatus()) && !"RESOLVED".equalsIgnoreCase(d.getStatus()))
                .count();

        // Project-wise testing stats
        List<Map<String, Object>> projectStats = new ArrayList<>();
        for (Project p : projects) {
            long pTests = testCaseRepository.countByProject(p);
            long pRuns = testExecutionRepository.countByProject(p);
            long pDefects = defectRepository.findByProjectOrderByCreatedAtDesc(p).size();
            List<TestExecution> pExecs = testExecutionRepository.findByProjectOrderByExecutedAtDesc(p);
            double lastCoverage = pExecs.isEmpty() ? 0.0 : pExecs.get(0).getStatementCoverage();

            Map<String, Object> ps = new HashMap<>();
            ps.put("id", p.getId());
            ps.put("name", p.getName());
            ps.put("language", p.getLanguage());
            ps.put("testCount", pTests);
            ps.put("runCount", pRuns);
            ps.put("defectCount", pDefects);
            ps.put("statementCoverage", lastCoverage);
            projectStats.add(ps);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProjects", projects.size());
        stats.put("totalTestRuns", allExecutions.size());
        stats.put("totalTestCases", allTestCases.size());
        stats.put("totalPassedTests", totalPassedTests);
        stats.put("totalFailedTests", totalFailedTests);
        stats.put("passRate", (totalPassedTests + totalFailedTests > 0)
                ? Math.round(((double) totalPassedTests / (totalPassedTests + totalFailedTests)) * 1000.0) / 10.0
                : 100.0);
        stats.put("avgStatementCoverage", Math.round(avgStatementCoverage * 10.0) / 10.0);
        stats.put("avgBranchCoverage", Math.round(avgBranchCoverage * 10.0) / 10.0);
        stats.put("openDefects", openDefects);
        stats.put("totalDefects", allDefects.size());
        stats.put("latestExecutions", allExecutions.stream().limit(6).toList());
        stats.put("blackBoxDistribution", blackBoxDistribution);
        stats.put("projectStats", projectStats);
        stats.put("recentActivity", activityLogService.getRecentLogs());

        return ResponseEntity.ok(stats);
    }
}
