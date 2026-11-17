package com.testfusion.controller;

import com.testfusion.model.User;
import com.testfusion.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final DefectRepository defectRepository;

    public AdminController(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           TestExecutionRepository testExecutionRepository,
                           DefectRepository defectRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.defectRepository = defectRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        String newRole = body.getOrDefault("role", "ROLE_USER");
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User role updated to " + newRole));
    }

    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "HEALTHY");
        health.put("activeEngine", "JavaParser 3.26 + JVM Isolated TestRunner");
        health.put("totalUsers", userRepository.count());
        health.put("totalProjects", projectRepository.count());
        health.put("totalExecutions", testExecutionRepository.count());
        health.put("totalDefects", defectRepository.count());
        health.put("jvmAvailableProcessors", Runtime.getRuntime().availableProcessors());
        health.put("jvmFreeMemoryMb", Runtime.getRuntime().freeMemory() / (1024 * 1024));
        health.put("jvmTotalMemoryMb", Runtime.getRuntime().totalMemory() / (1024 * 1024));
        return ResponseEntity.ok(health);
    }
}
