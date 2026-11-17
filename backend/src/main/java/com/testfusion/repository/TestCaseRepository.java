package com.testfusion.repository;

import com.testfusion.model.Project;
import com.testfusion.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProjectOrderByIdAsc(Project project);
    List<TestCase> findByProjectAndTestTypeOrderByIdAsc(Project project, String testType);
    Optional<TestCase> findByProjectAndTestCaseId(Project project, String testCaseId);
    long countByProject(Project project);
}
