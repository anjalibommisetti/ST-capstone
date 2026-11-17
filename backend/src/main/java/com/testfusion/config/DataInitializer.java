package com.testfusion.config;

import com.testfusion.model.*;
import com.testfusion.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SourceFileRepository sourceFileRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final TestResultRepository testResultRepository;
    private final CoverageReportRepository coverageReportRepository;
    private final DefectRepository defectRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           SourceFileRepository sourceFileRepository,
                           TestSuiteRepository testSuiteRepository,
                           TestCaseRepository testCaseRepository,
                           TestExecutionRepository testExecutionRepository,
                           TestResultRepository testResultRepository,
                           CoverageReportRepository coverageReportRepository,
                           DefectRepository defectRepository,
                           ActivityLogRepository activityLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.sourceFileRepository = sourceFileRepository;
        this.testSuiteRepository = testSuiteRepository;
        this.testCaseRepository = testCaseRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.coverageReportRepository = coverageReportRepository;
        this.defectRepository = defectRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Seed Users
        User admin = new User("admin", "admin@testfusion.com", passwordEncoder.encode("Admin@123"), "Platform Administrator", "ROLE_ADMIN");
        userRepository.save(admin);

        User tester = new User("tester", "tester@testfusion.com", passwordEncoder.encode("Tester@123"), "Anjali QA Specialist", "ROLE_USER");
        userRepository.save(tester);

        // 2. Seed Sample Demonstration Project: Age Eligibility Function
        Project demoProject = new Project(
                "Age Eligibility Verification Engine",
                "Demonstration project combining White Box and Black Box testing on an age eligibility validator (-1, 0, 17, 18, 120, 121 boundaries).",
                "Java",
                tester
        );
        demoProject = projectRepository.save(demoProject);

        // 3. Source Code for AgeValidator.java
        String javaCode = """
package com.testfusion.demo;

public class AgeValidator {
    
    /**
     * Validates voting / registration eligibility based on age.
     * Logic:
     *  - Age < 0: Invalid Input (Negative age)
     *  - Age from 0 to 17: Not Eligible (Underage)
     *  - Age from 18 to 120: Eligible (Standard adult voter)
     *  - Age > 120: Invalid Input (Exceeds verified human lifespan)
     */
    public String checkEligibility(int age) {
        if (age < 0) {
            return "Invalid Input: Age cannot be negative";
        } else if (age <= 17) {
            return "Not Eligible";
        } else if (age <= 120) {
            return "Eligible";
        } else {
            return "Invalid Input: Age exceeds maximum human lifespan";
        }
    }
    
    public static void main(String[] args) {
        AgeValidator validator = new AgeValidator();
        System.out.println("Eligibility for age 18: " + validator.checkEligibility(18));
    }
}
""";

        SourceFile sourceFile = new SourceFile(demoProject, "AgeValidator.java", "src/AgeValidator.java", javaCode, "com.testfusion.demo");
        sourceFileRepository.save(sourceFile);

        // 4. Test Suites
        TestSuite bbSuite = new TestSuite(demoProject, "Black Box Test Suite", "Boundary value analysis & equivalence classes for AgeValidator", "BLACK_BOX");
        testSuiteRepository.save(bbSuite);

        TestSuite wbSuite = new TestSuite(demoProject, "White Box Branch Suite", "Branch coverage and basis path test suite", "WHITE_BOX");
        testSuiteRepository.save(wbSuite);

        // 5. Seed Boundary Value Analysis Tests (-1, 0, 17, 18, 120, 121)
        createTestCase(demoProject, bbSuite, "TC-BVA-01", "Boundary: Just Below Min (-1)", "BOUNDARY_VALUE",
                "Age lower boundary is 0", "-1", "1. Input -1 into checkEligibility\n2. Observe result",
                "Invalid Input: Age cannot be negative", "Invalid Input: Age cannot be negative", "PASS", 8L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-BVA-02", "Boundary: Exactly Min (0)", "BOUNDARY_VALUE",
                "Age valid range start is 0", "0", "1. Input 0\n2. Observe result",
                "Not Eligible", "Not Eligible", "PASS", 5L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-BVA-03", "Boundary: Upper Limit for Ineligible (17)", "BOUNDARY_VALUE",
                "Ineligible upper bound", "17", "1. Input 17\n2. Observe result",
                "Not Eligible", "Not Eligible", "PASS", 6L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-BVA-04", "Boundary: Lower Limit for Eligible (18)", "BOUNDARY_VALUE",
                "Eligible threshold is 18", "18", "1. Input 18\n2. Observe result",
                "Eligible", "Eligible", "PASS", 7L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-BVA-05", "Boundary: Maximum Lifespan (120)", "BOUNDARY_VALUE",
                "Eligible upper threshold is 120", "120", "1. Input 120\n2. Observe result",
                "Eligible", "Eligible", "PASS", 6L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-BVA-06", "Boundary: Just Above Max (121)", "BOUNDARY_VALUE",
                "Age upper boundary is 120", "121", "1. Input 121\n2. Observe result",
                "Invalid Input: Age exceeds maximum human lifespan", "Invalid Input: Age exceeds maximum human lifespan", "PASS", 8L, "BLACK_BOX", false);

        // 6. Equivalence Partitioning Tests
        createTestCase(demoProject, bbSuite, "TC-EP-01", "Equivalence: Invalid Negative Class (Representative: -10)", "EQUIVALENCE_PARTITIONING",
                "Partition: age < 0", "-10", "Input -10", "Invalid Input: Age cannot be negative", "Invalid Input: Age cannot be negative", "PASS", 5L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-EP-02", "Equivalence: Minor Class (Representative: 10)", "EQUIVALENCE_PARTITIONING",
                "Partition: 0 <= age <= 17", "10", "Input 10", "Not Eligible", "Not Eligible", "PASS", 6L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-EP-03", "Equivalence: Adult Class (Representative: 25)", "EQUIVALENCE_PARTITIONING",
                "Partition: 18 <= age <= 120", "25", "Input 25", "Eligible", "Eligible", "PASS", 5L, "BLACK_BOX", false);

        createTestCase(demoProject, bbSuite, "TC-EP-04", "Equivalence: Invalid Extreme Class (Representative: 150)", "EQUIVALENCE_PARTITIONING",
                "Partition: age > 120", "150", "Input 150", "Invalid Input: Age exceeds maximum human lifespan", "Invalid Input: Age exceeds maximum human lifespan", "PASS", 7L, "BLACK_BOX", false);

        // 7. Intentionally Failing Sample Test Case (clearly labeled as requested)
        TestCase failTc = createTestCase(demoProject, bbSuite, "TC-FAIL-01", "Intentional Failure Sample: Expecting Eligible for Age 12", "FUNCTIONAL",
                "Demonstration of failed assertion handling", "12", "1. Input 12\n2. Assert result is Eligible",
                "Eligible", "Not Eligible (Actual logic: Age 12 is < 18)", "FAIL", 9L, "BLACK_BOX", true);

        // 8. White Box Branch Coverage Tests
        createTestCase(demoProject, wbSuite, "TC-WB-01", "White Box: Path 1 Decision (age < 0 == TRUE)", "WHITE_BOX_BRANCH",
                "Branch 1 True outcome", "-5", "Trigger statement in first if block",
                "Invalid Input: Age cannot be negative", "Invalid Input: Age cannot be negative", "PASS", 6L, "WHITE_BOX", false);

        createTestCase(demoProject, wbSuite, "TC-WB-02", "White Box: Path 2 Decision (age <= 17 == TRUE)", "WHITE_BOX_BRANCH",
                "Branch 2 True outcome", "14", "Trigger statement in second if block",
                "Not Eligible", "Not Eligible", "PASS", 6L, "WHITE_BOX", false);

        createTestCase(demoProject, wbSuite, "TC-WB-03", "White Box: Path 3 Decision (age <= 120 == TRUE)", "WHITE_BOX_BRANCH",
                "Branch 3 True outcome", "40", "Trigger statement in third if block",
                "Eligible", "Eligible", "PASS", 7L, "WHITE_BOX", false);

        createTestCase(demoProject, wbSuite, "TC-WB-04", "White Box: Path 4 Fallthrough (age > 120 == TRUE)", "WHITE_BOX_BRANCH",
                "Branch 4 Else block", "130", "Trigger statement in else block",
                "Invalid Input: Age exceeds maximum human lifespan", "Invalid Input: Age exceeds maximum human lifespan", "PASS", 6L, "WHITE_BOX", false);

        // 9. Initial Test Execution Record
        TestExecution exec = new TestExecution();
        exec.setProject(demoProject);
        exec.setExecutionNumber("RUN-0001");
        exec.setTestType("INTEGRATED");
        exec.setTotalTests(15);
        exec.setPassedTests(14);
        exec.setFailedTests(1);
        exec.setErrorCount(0);
        exec.setDurationMs(142L);
        exec.setStatementCoverage(92.5);
        exec.setBranchCoverage(87.5);
        exec.setCyclomaticComplexity(4);
        exec.setStatus("COMPLETED");
        exec.setExecutedAt(LocalDateTime.now().minusHours(2));
        exec = testExecutionRepository.save(exec);

        CoverageReport cr = new CoverageReport();
        cr.setTestExecution(exec);
        cr.setTotalStatements(12);
        cr.setCoveredStatements(11);
        cr.setStatementCoveragePercent(92.5);
        cr.setTotalBranches(8);
        cr.setCoveredBranches(7);
        cr.setBranchCoveragePercent(87.5);
        cr.setUncoveredLinesJson("[23]");
        cr.setUncoveredBranchesJson("[\"Branch (age > 120 == false) main fallback\"]");
        coverageReportRepository.save(cr);

        // 10. Initial Defect Record linked to the intentional failure
        Defect defect = new Defect();
        defect.setProject(demoProject);
        defect.setTestCase(failTc);
        defect.setDefectCode("DEF-001");
        defect.setTitle("Intentional Sample Defect: Minor (Age 12) Assertion Mismatch");
        defect.setDescription("Demonstration defect: Test case TC-FAIL-01 expects 'Eligible' for age 12, whereas validator returns 'Not Eligible'.");
        defect.setStepsToReproduce("1. Input 12 into checkEligibility.\n2. Observe actual result: 'Not Eligible'.");
        defect.setExpectedResult("Eligible");
        defect.setActualResult("Not Eligible (Actual logic: Age 12 is < 18)");
        defect.setSeverity("MEDIUM");
        defect.setStatus("OPEN");
        defect.setCreatedAt(LocalDateTime.now().minusHours(1));
        defect.setUpdatedAt(LocalDateTime.now().minusHours(1));
        defectRepository.save(defect);

        // 11. Initial Activity Logs
        activityLogRepository.save(new ActivityLog(tester, "PROJECT_CREATED", "Project", demoProject.getId(), "Created demo project: Age Eligibility Verification Engine"));
        activityLogRepository.save(new ActivityLog(tester, "TEST_EXECUTED", "TestExecution", exec.getId(), "Executed integrated test run RUN-0001 (14 passed, 1 failed)"));
        activityLogRepository.save(new ActivityLog(tester, "DEFECT_LOGGED", "Defect", defect.getId(), "Logged demonstration defect DEF-001 for intentional test failure"));
    }

    private TestCase createTestCase(Project project, TestSuite suite, String tcId, String name, String technique,
                                     String preconditions, String inputData, String steps,
                                     String expectedResult, String actualResult, String status,
                                     Long durationMs, String testType, boolean isIntentionalFailure) {
        TestCase tc = new TestCase();
        tc.setProject(project);
        tc.setTestSuite(suite);
        tc.setTestCaseId(tcId);
        tc.setName(name);
        tc.setTechnique(technique);
        tc.setPreconditions(preconditions);
        tc.setInputData(inputData);
        tc.setSteps(steps);
        tc.setExpectedResult(expectedResult);
        tc.setActualResult(actualResult);
        tc.setStatus(status);
        tc.setExecutionTimeMs(durationMs);
        tc.setTestType(testType);
        tc.setIsIntentionalFailure(isIntentionalFailure);
        tc.setCreatedAt(LocalDateTime.now().minusDays(1));
        return testCaseRepository.save(tc);
    }
}
