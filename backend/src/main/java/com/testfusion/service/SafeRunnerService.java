package com.testfusion.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class SafeRunnerService {

    @Value("${testrunner.timeout.seconds:6}")
    private int timeoutSeconds = 6;

    @Value("${testrunner.memory.mb:128}")
    private int memoryMb = 128;

    @Value("${testrunner.sandbox.dir:./sandbox_workspaces}")
    private String sandboxDir = "./sandbox_workspaces";

    public static class RunResult {
        private boolean success;
        private String output;
        private String error;
        private long durationMs;
        private boolean timedOut;
        private int exitCode;

        public RunResult() {}

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getOutput() { return output; }
        public void setOutput(String output) { this.output = output; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public long getDurationMs() { return durationMs; }
        public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
        public boolean isTimedOut() { return timedOut; }
        public void setTimedOut(boolean timedOut) { this.timedOut = timedOut; }
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
    }

    /**
     * Safely compiles and executes a Java class inside an isolated workspace.
     */
    public RunResult executeIsolated(String className, String sourceCode, String testRunnerSourceCode) {
        RunResult result = new RunResult();
        long startTime = System.currentTimeMillis();
        Path workspace = null;

        try {
            // 1. Basic security validation on code
            validateCodeSafety(sourceCode);
            if (testRunnerSourceCode != null) {
                validateCodeSafety(testRunnerSourceCode);
            }

            String execId = "run_" + UUID.randomUUID().toString().substring(0, 8);
            workspace = Paths.get(sandboxDir != null ? sandboxDir : "./sandbox_workspaces", execId);
            Files.createDirectories(workspace);

            // 2. Write source files
            Path sourceFilePath = workspace.resolve(className + ".java");
            Files.writeString(sourceFilePath, sourceCode);

            String runnerClassName = "TestRunner_" + execId.replace("-", "_");
            if (testRunnerSourceCode != null) {
                Path runnerPath = workspace.resolve(runnerClassName + ".java");
                Files.writeString(runnerPath, testRunnerSourceCode.replace("__RUNNER_CLASS__", runnerClassName));
            }

            // 3. Compile source files using JavaCompiler or javac
            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            List<String> filesToCompile = new ArrayList<>();
            filesToCompile.add(sourceFilePath.toAbsolutePath().toString());
            if (testRunnerSourceCode != null) {
                filesToCompile.add(workspace.resolve(runnerClassName + ".java").toAbsolutePath().toString());
            }

            int compileExit = -1;
            ByteArrayOutputStream compileErrStream = new ByteArrayOutputStream();

            if (compiler != null) {
                compileExit = compiler.run(null, null, compileErrStream, filesToCompile.toArray(new String[0]));
            } else {
                // Fallback to javac command
                List<String> javacCmd = new ArrayList<>();
                javacCmd.add(getJavaCommand("javac"));
                javacCmd.addAll(filesToCompile);
                ProcessBuilder pb = new ProcessBuilder(javacCmd);
                pb.directory(workspace.toFile());
                Process proc = pb.start();
                proc.waitFor(10, TimeUnit.SECONDS);
                compileExit = proc.exitValue();
                compileErrStream.write(proc.getErrorStream().readAllBytes());
            }

            if (compileExit != 0) {
                result.setSuccess(false);
                result.setError("Compilation Failed: " + compileErrStream.toString());
                result.setDurationMs(System.currentTimeMillis() - startTime);
                return result;
            }

            // 4. Execute compiled test runner in isolated JVM subprocess
            String classToRun = (testRunnerSourceCode != null) ? runnerClassName : className;
            List<String> javaCmd = new ArrayList<>();
            javaCmd.add(getJavaCommand("java"));
            javaCmd.add("-Xmx" + memoryMb + "m");
            javaCmd.add("-cp");
            javaCmd.add(workspace.toAbsolutePath().toString());
            javaCmd.add(classToRun);

            ProcessBuilder runPb = new ProcessBuilder(javaCmd);
            runPb.directory(workspace.toFile());
            // Restrict environment
            runPb.environment().clear();
            runPb.environment().put("PATH", System.getenv("PATH") != null ? System.getenv("PATH") : "");

            Process runProcess = runPb.start();

            boolean finished = runProcess.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            long duration = System.currentTimeMillis() - startTime;
            result.setDurationMs(duration);

            if (!finished) {
                runProcess.destroyForcibly();
                result.setTimedOut(true);
                result.setSuccess(false);
                result.setError("Execution timed out after " + timeoutSeconds + " seconds (limit reached).");
                return result;
            }

            String stdout = new String(runProcess.getInputStream().readAllBytes());
            String stderr = new String(runProcess.getErrorStream().readAllBytes());

            result.setExitCode(runProcess.exitValue());
            result.setOutput(stdout);
            result.setError(stderr);
            result.setSuccess(runProcess.exitValue() == 0);

        } catch (SecurityException se) {
            result.setSuccess(false);
            result.setError("Security Policy Violation: " + se.getMessage());
            result.setDurationMs(System.currentTimeMillis() - startTime);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setError("Execution Error: " + e.getMessage());
            result.setDurationMs(System.currentTimeMillis() - startTime);
        } finally {
            // 5. Cleanup temporary sandbox workspace
            cleanupDirectory(workspace);
        }

        return result;
    }

    private void validateCodeSafety(String code) {
        if (code == null) return;
        // Block obvious malicious calls
        String[] forbidden = {
                "Runtime.getRuntime()",
                "ProcessBuilder",
                "System.exit",
                "java.lang.reflect",
                "sun.misc.Unsafe"
        };
        for (String f : forbidden) {
            if (code.contains(f)) {
                throw new SecurityException("Code contains disallowed call for safe execution: " + f);
            }
        }
    }

    private String getJavaCommand(String binary) {
        String javaHome = System.getenv("JAVA_HOME");
        if (javaHome != null && !javaHome.isBlank()) {
            Path p = Paths.get(javaHome, "bin", binary + (System.getProperty("os.name").toLowerCase().contains("win") ? ".exe" : ""));
            if (Files.exists(p)) {
                return p.toString();
            }
        }
        return binary;
    }

    private void cleanupDirectory(Path path) {
        if (path == null || !Files.exists(path)) return;
        try {
            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception ignored) {}
    }
}
