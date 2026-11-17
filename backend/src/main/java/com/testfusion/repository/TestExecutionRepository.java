package com.testfusion.repository;

import com.testfusion.model.Project;
import com.testfusion.model.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestExecutionRepository extends JpaRepository<TestExecution, Long> {
    List<TestExecution> findByProjectOrderByExecutedAtDesc(Project project);
    List<TestExecution> findAllByOrderByExecutedAtDesc();
    long countByProject(Project project);
}
