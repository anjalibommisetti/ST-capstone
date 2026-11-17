package com.testfusion.controller;

import com.testfusion.model.Defect;
import com.testfusion.model.User;
import com.testfusion.repository.UserRepository;
import com.testfusion.service.DefectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/defects")
public class DefectController {

    private final DefectService defectService;
    private final UserRepository userRepository;

    public DefectController(DefectService defectService, UserRepository userRepository) {
        this.defectService = defectService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<Defect>> getProjectDefects(@PathVariable Long projectId) {
        return ResponseEntity.ok(defectService.getDefectsByProject(projectId));
    }

    @GetMapping
    public ResponseEntity<List<Defect>> getAllDefects() {
        return ResponseEntity.ok(defectService.getAllDefects());
    }

    @PostMapping("/projects/{projectId}")
    public ResponseEntity<Defect> createDefect(@PathVariable Long projectId,
                                               @RequestParam(required = false) Long testCaseId,
                                               @RequestBody Defect defect,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(defectService.createDefect(projectId, defect, testCaseId, user));
    }

    @PutMapping("/{defectId}")
    public ResponseEntity<Defect> updateDefect(@PathVariable Long defectId,
                                               @RequestBody Defect defect,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(defectService.updateDefect(defectId, defect, user));
    }

    @DeleteMapping("/{defectId}")
    public ResponseEntity<?> deleteDefect(@PathVariable Long defectId,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        defectService.deleteDefect(defectId, user);
        return ResponseEntity.ok(Map.of("message", "Defect deleted successfully."));
    }
}
