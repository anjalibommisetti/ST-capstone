package com.testfusion.service;

import com.testfusion.model.Defect;
import com.testfusion.model.Project;
import com.testfusion.model.TestCase;
import com.testfusion.model.User;
import com.testfusion.repository.DefectRepository;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DefectService {

    private final DefectRepository defectRepository;
    private final ProjectRepository projectRepository;
    private final TestCaseRepository testCaseRepository;
    private final ActivityLogService activityLogService;

    public DefectService(DefectRepository defectRepository,
                         ProjectRepository projectRepository,
                         TestCaseRepository testCaseRepository,
                         ActivityLogService activityLogService) {
        this.defectRepository = defectRepository;
        this.projectRepository = projectRepository;
        this.testCaseRepository = testCaseRepository;
        this.activityLogService = activityLogService;
    }

    public List<Defect> getDefectsByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        return defectRepository.findByProjectOrderByCreatedAtDesc(project);
    }

    public List<Defect> getAllDefects() {
        return defectRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Defect createDefect(Long projectId, Defect defect, Long testCaseId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        defect.setProject(project);

        if (testCaseId != null) {
            TestCase tc = testCaseRepository.findById(testCaseId).orElse(null);
            defect.setTestCase(tc);
            if (tc != null) {
                if (defect.getStepsToReproduce() == null || defect.getStepsToReproduce().isBlank()) {
                    defect.setStepsToReproduce(tc.getSteps());
                }
                if (defect.getExpectedResult() == null || defect.getExpectedResult().isBlank()) {
                    defect.setExpectedResult(tc.getExpectedResult());
                }
                if (defect.getActualResult() == null || defect.getActualResult().isBlank()) {
                    defect.setActualResult(tc.getActualResult());
                }
            }
        }

        if (defect.getDefectCode() == null || defect.getDefectCode().isBlank()) {
            long count = defectRepository.count() + 1;
            defect.setDefectCode(String.format("DEF-%03d", count));
        }

        defect.setCreatedAt(LocalDateTime.now());
        defect.setUpdatedAt(LocalDateTime.now());
        Defect saved = defectRepository.save(defect);

        activityLogService.log(
                currentUser,
                "DEFECT_CREATED",
                "Defect",
                saved.getId(),
                "Logged defect " + saved.getDefectCode() + ": " + saved.getTitle() + " (Severity: " + saved.getSeverity() + ")"
        );

        return saved;
    }

    @Transactional
    public Defect updateDefect(Long defectId, Defect updated, User currentUser) {
        Defect existing = defectRepository.findById(defectId)
                .orElseThrow(() -> new IllegalArgumentException("Defect not found: " + defectId));

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setStepsToReproduce(updated.getStepsToReproduce());
        existing.setExpectedResult(updated.getExpectedResult());
        existing.setActualResult(updated.getActualResult());
        existing.setSeverity(updated.getSeverity());
        existing.setStatus(updated.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        Defect saved = defectRepository.save(existing);

        activityLogService.log(
                currentUser,
                "DEFECT_UPDATED",
                "Defect",
                saved.getId(),
                "Updated defect " + saved.getDefectCode() + " status to " + saved.getStatus()
        );

        return saved;
    }

    @Transactional
    public void deleteDefect(Long defectId, User currentUser) {
        Defect existing = defectRepository.findById(defectId)
                .orElseThrow(() -> new IllegalArgumentException("Defect not found: " + defectId));
        String code = existing.getDefectCode();
        defectRepository.delete(existing);

        activityLogService.log(currentUser, "DEFECT_DELETED", "Defect", defectId, "Deleted defect " + code);
    }
}
