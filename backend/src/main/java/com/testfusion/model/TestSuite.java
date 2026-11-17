package com.testfusion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_suites")
public class TestSuite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "test_type", nullable = false, length = 50)
    private String testType = "INTEGRATED"; // WHITE_BOX, BLACK_BOX, INTEGRATED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public TestSuite() {}

    public TestSuite(Project project, String name, String description, String testType) {
        this.project = project;
        this.name = name;
        this.description = description;
        this.testType = testType != null ? testType : "INTEGRATED";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
