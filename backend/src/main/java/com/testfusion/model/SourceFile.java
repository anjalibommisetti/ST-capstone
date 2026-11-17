package com.testfusion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "source_files")
public class SourceFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path")
    private String filePath = "";

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "package_path")
    private String packagePath = "";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SourceFile() {}

    public SourceFile(Project project, String fileName, String filePath, String content, String packagePath) {
        this.project = project;
        this.fileName = fileName;
        this.filePath = filePath != null ? filePath : "";
        this.content = content != null ? content : "";
        this.packagePath = packagePath != null ? packagePath : "";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getPackagePath() { return packagePath; }
    public void setPackagePath(String packagePath) { this.packagePath = packagePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
