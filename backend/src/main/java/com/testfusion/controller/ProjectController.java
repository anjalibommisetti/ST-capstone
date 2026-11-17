package com.testfusion.controller;

import com.testfusion.model.Project;
import com.testfusion.model.SourceFile;
import com.testfusion.model.User;
import com.testfusion.repository.UserRepository;
import com.testfusion.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectController(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody Project project) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(projectService.createProject(project, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long id,
                                                 @RequestBody Project project) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(projectService.updateProject(id, project, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long id) {
        User user = getAuthenticatedUser(userDetails);
        projectService.deleteProject(id, user);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<List<SourceFile>> getSourceFiles(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getSourceFiles(id));
    }

    @PostMapping("/{id}/files")
    public ResponseEntity<SourceFile> addSourceFile(@PathVariable Long id, @RequestBody SourceFile file) {
        return ResponseEntity.ok(projectService.saveSourceFile(id, file));
    }

    @PutMapping("/{id}/files/{fileId}")
    public ResponseEntity<SourceFile> updateSourceFile(@PathVariable Long id,
                                                       @PathVariable Long fileId,
                                                       @RequestBody Map<String, String> body) {
        String content = body.getOrDefault("content", "");
        return ResponseEntity.ok(projectService.updateSourceFileContent(id, fileId, content));
    }
}
