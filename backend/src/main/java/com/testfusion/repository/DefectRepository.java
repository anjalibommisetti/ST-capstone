package com.testfusion.repository;

import com.testfusion.model.Defect;
import com.testfusion.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DefectRepository extends JpaRepository<Defect, Long> {
    List<Defect> findByProjectOrderByCreatedAtDesc(Project project);
    List<Defect> findAllByOrderByCreatedAtDesc();
    Optional<Defect> findByDefectCode(String defectCode);
    long countByProjectAndStatus(Project project, String status);
    long countByStatus(String status);
}
