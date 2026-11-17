package com.testfusion.model;

import jakarta.persistence.*;

@Entity
@Table(name = "coverage_reports")
public class CoverageReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_execution_id", nullable = false, unique = true)
    private TestExecution testExecution;

    @Column(name = "total_statements")
    private Integer totalStatements = 0;

    @Column(name = "covered_statements")
    private Integer coveredStatements = 0;

    @Column(name = "statement_coverage_percent")
    private Double statementCoveragePercent = 0.0;

    @Column(name = "total_branches")
    private Integer totalBranches = 0;

    @Column(name = "covered_branches")
    private Integer coveredBranches = 0;

    @Column(name = "branch_coverage_percent")
    private Double branchCoveragePercent = 0.0;

    @Lob
    @Column(name = "uncovered_lines_json", columnDefinition = "TEXT")
    private String uncoveredLinesJson; // e.g. [14, 22, 23]

    @Lob
    @Column(name = "uncovered_branches_json", columnDefinition = "TEXT")
    private String uncoveredBranchesJson;

    public CoverageReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TestExecution getTestExecution() { return testExecution; }
    public void setTestExecution(TestExecution testExecution) { this.testExecution = testExecution; }

    public Integer getTotalStatements() { return totalStatements; }
    public void setTotalStatements(Integer totalStatements) { this.totalStatements = totalStatements; }

    public Integer getCoveredStatements() { return coveredStatements; }
    public void setCoveredStatements(Integer coveredStatements) { this.coveredStatements = coveredStatements; }

    public Double getStatementCoveragePercent() { return statementCoveragePercent; }
    public void setStatementCoveragePercent(Double statementCoveragePercent) { this.statementCoveragePercent = statementCoveragePercent; }

    public Integer getTotalBranches() { return totalBranches; }
    public void setTotalBranches(Integer totalBranches) { this.totalBranches = totalBranches; }

    public Integer getCoveredBranches() { return coveredBranches; }
    public void setCoveredBranches(Integer coveredBranches) { this.coveredBranches = coveredBranches; }

    public Double getBranchCoveragePercent() { return branchCoveragePercent; }
    public void setBranchCoveragePercent(Double branchCoveragePercent) { this.branchCoveragePercent = branchCoveragePercent; }

    public String getUncoveredLinesJson() { return uncoveredLinesJson; }
    public void setUncoveredLinesJson(String uncoveredLinesJson) { this.uncoveredLinesJson = uncoveredLinesJson; }

    public String getUncoveredBranchesJson() { return uncoveredBranchesJson; }
    public void setUncoveredBranchesJson(String uncoveredBranchesJson) { this.uncoveredBranchesJson = uncoveredBranchesJson; }
}
