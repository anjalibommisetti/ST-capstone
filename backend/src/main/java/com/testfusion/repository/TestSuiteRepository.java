package com.testfusion.repository;

import com.testfusion.model.Project;
import com.testfusion.model.TestSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestSuiteRepository extends JpaRepository<TestSuite, Long> {
    List<TestSuite> findByProject(Project project);
}
