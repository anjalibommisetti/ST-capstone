package com.testfusion.repository;

import com.testfusion.model.Project;
import com.testfusion.model.SourceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SourceFileRepository extends JpaRepository<SourceFile, Long> {
    List<SourceFile> findByProject(Project project);
    Optional<SourceFile> findByProjectAndFileName(Project project, String fileName);
}
