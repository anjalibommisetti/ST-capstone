package com.testfusion.repository;

import com.testfusion.model.CoverageReport;
import com.testfusion.model.TestExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoverageReportRepository extends JpaRepository<CoverageReport, Long> {
    Optional<CoverageReport> findByTestExecution(TestExecution testExecution);
}
