package com.testfusion.service;

import com.testfusion.model.Project;
import com.testfusion.model.SourceFile;
import com.testfusion.model.User;
import com.testfusion.repository.ProjectRepository;
import com.testfusion.repository.SourceFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SourceFileRepository sourceFileRepository;
    private final ActivityLogService activityLogService;

    public ProjectService(ProjectRepository projectRepository,
                          SourceFileRepository sourceFileRepository,
                          ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.sourceFileRepository = sourceFileRepository;
        this.activityLogService = activityLogService;
    }

    public List<Project> getProjectsForUser(User user) {
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return projectRepository.findAllByOrderByCreatedAtDesc();
        }
        return projectRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    @Transactional
    public Project createProject(Project project, User user) {
        project.setUser(user);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);

        activityLogService.log(user, "PROJECT_CREATED", "Project", saved.getId(), "Created project: " + saved.getName());
        return saved;
    }

    @Transactional
    public Project updateProject(Long id, Project updated, User user) {
        Project existing = getProjectById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setLanguage(updated.getLanguage());
        existing.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(existing);

        activityLogService.log(user, "PROJECT_UPDATED", "Project", saved.getId(), "Updated project: " + saved.getName());
        return saved;
    }

    @Transactional
    public void deleteProject(Long id, User user) {
        Project existing = getProjectById(id);
        String name = existing.getName();
        projectRepository.delete(existing);
        activityLogService.log(user, "PROJECT_DELETED", "Project", id, "Deleted project: " + name);
    }

    public List<SourceFile> getSourceFiles(Long projectId) {
        Project project = getProjectById(projectId);
        return sourceFileRepository.findByProject(project);
    }

    @Transactional
    public SourceFile saveSourceFile(Long projectId, SourceFile file) {
        Project project = getProjectById(projectId);
        file.setProject(project);
        file.setCreatedAt(LocalDateTime.now());
        file.setUpdatedAt(LocalDateTime.now());
        return sourceFileRepository.save(file);
    }

    @Transactional
    public SourceFile updateSourceFileContent(Long projectId, Long fileId, String content) {
        SourceFile sf = sourceFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Source file not found: " + fileId));
        sf.setContent(content);
        sf.setUpdatedAt(LocalDateTime.now());
        return sourceFileRepository.save(sf);
    }
}
