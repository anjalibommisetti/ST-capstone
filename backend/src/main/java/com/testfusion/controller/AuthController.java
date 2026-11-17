package com.testfusion.controller;

import com.testfusion.config.JwtService;
import com.testfusion.dto.AuthRequest;
import com.testfusion.dto.AuthResponse;
import com.testfusion.dto.RegisterRequest;
import com.testfusion.model.User;
import com.testfusion.repository.UserRepository;
import com.testfusion.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ActivityLogService activityLogService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager,
                          ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.activityLogService = activityLogService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered."));
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ROLE_ADMIN"))
                ? "ROLE_ADMIN" : "ROLE_USER";

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                role
        );
        user = userRepository.save(user);

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole()))
                );

        String token = jwtService.generateToken(userDetails);
        activityLogService.log(user, "USER_REGISTERED", "User", user.getId(), "Registered new account: " + user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole()))
                );

        String token = jwtService.generateToken(userDetails);
        activityLogService.log(user, "USER_LOGIN", "User", user.getId(), "User logged in: " + user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("email", user.getEmail());
        resp.put("fullName", user.getFullName());
        resp.put("role", user.getRole());
        resp.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody Map<String, String> body) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (body.containsKey("fullName")) {
            user.setFullName(body.get("fullName"));
        }
        if (body.containsKey("email") && !body.get("email").equals(user.getEmail())) {
            if (userRepository.existsByEmail(body.get("email"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already taken."));
            }
            user.setEmail(body.get("email"));
        }
        if (body.containsKey("password") && !body.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(body.get("password")));
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully."));
    }
}
