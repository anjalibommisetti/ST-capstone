package com.testfusion.service;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseProblemException;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.stmt.*;
import com.testfusion.dto.WhiteBoxAnalysisResult;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WhiteBoxAnalyzerService {

    public WhiteBoxAnalysisResult analyzeSource(String javaSource) {
        WhiteBoxAnalysisResult result = new WhiteBoxAnalysisResult();

        if (javaSource == null || javaSource.trim().isEmpty()) {
            result.setSyntaxValid(false);
            result.getCompilationErrors().add("Source code is empty.");
            return result;
        }

        try {
            CompilationUnit cu = StaticJavaParser.parse(javaSource);
            result.setSyntaxValid(true);

            String[] lines = javaSource.split("\r\n|\r|\n");
            result.setTotalLines(lines.length);

            List<MethodDeclaration> methodDeclarations = cu.findAll(MethodDeclaration.class);
            int totalStatements = 0;
            int totalDecisions = 0;

            for (MethodDeclaration md : methodDeclarations) {
                WhiteBoxAnalysisResult.MethodAnalysis ma = new WhiteBoxAnalysisResult.MethodAnalysis();
                ma.setName(md.getNameAsString());
                ma.setReturnType(md.getTypeAsString());
                md.getParameters().forEach(p -> ma.getParameters().add(p.getTypeAsString() + " " + p.getNameAsString()));

                if (md.getRange().isPresent()) {
                    ma.setStartLine(md.getRange().get().begin.line);
                    ma.setEndLine(md.getRange().get().end.line);
                }

                // Count statements and decisions inside method
                List<Statement> stmts = md.findAll(Statement.class);
                ma.setDecisionPoints(md.findAll(IfStmt.class).size() + md.findAll(SwitchEntry.class).size());
                ma.setLoopPoints(md.findAll(WhileStmt.class).size() + md.findAll(ForStmt.class).size() + md.findAll(DoStmt.class).size());

                int methodComplexity = 1 + ma.getDecisionPoints() + ma.getLoopPoints();
                ma.setCyclomaticComplexity(methodComplexity);

                totalStatements += stmts.size();
                totalDecisions += (ma.getDecisionPoints() + ma.getLoopPoints());

                result.getMethods().add(ma);
            }

            result.setTotalStatements(totalStatements);
            result.setTotalDecisions(totalDecisions);

            // If there's at least one method, build CFG for the primary/first method (e.g. validateAge or main logic)
            if (!methodDeclarations.isEmpty()) {
                MethodDeclaration primaryMethod = methodDeclarations.stream()
                        .filter(m -> !m.getNameAsString().equals("main"))
                        .findFirst()
                        .orElse(methodDeclarations.get(0));

                buildControlFlowGraph(primaryMethod, result);
            }

        } catch (ParseProblemException ppe) {
            result.setSyntaxValid(false);
            ppe.getProblems().forEach(prob -> result.getCompilationErrors().add(prob.getMessage()));
        } catch (Exception e) {
            result.setSyntaxValid(false);
            result.getCompilationErrors().add("Parsing error: " + e.getMessage());
        }

        return result;
    }

    private void buildControlFlowGraph(MethodDeclaration method, WhiteBoxAnalysisResult result) {
        List<WhiteBoxAnalysisResult.CfgNode> nodes = new ArrayList<>();
        List<WhiteBoxAnalysisResult.CfgEdge> edges = new ArrayList<>();
        List<WhiteBoxAnalysisResult.IndependentPath> paths = new ArrayList<>();
        java.util.concurrent.atomic.AtomicInteger nodeCounter = new java.util.concurrent.atomic.AtomicInteger(1);

        // Entry node
        String entryId = "N" + nodeCounter.getAndIncrement();
        int methodStart = method.getRange().map(r -> r.begin.line).orElse(1);
        nodes.add(new WhiteBoxAnalysisResult.CfgNode(entryId, "Entry: " + method.getNameAsString() + "()", "ENTRY", methodStart, method.getDeclarationAsString(false, false, false)));

        // Exit node
        String exitId = "N_EXIT";

        String currentFrom = entryId;

        if (method.getBody().isPresent()) {
            BlockStmt body = method.getBody().get();
            currentFrom = processStatements(body.getStatements(), currentFrom, exitId, nodes, edges, nodeCounter);
        }

        // Add Exit node
        int methodEnd = method.getRange().map(r -> r.end.line).orElse(nodes.size() + 1);
        nodes.add(new WhiteBoxAnalysisResult.CfgNode(exitId, "Exit: " + method.getNameAsString() + "()", "EXIT", methodEnd, "end method"));

        // If currentFrom is not already connected to exit or returned, connect it
        if (currentFrom != null && !currentFrom.equals(exitId)) {
            final String targetFrom = currentFrom;
            boolean alreadyExits = edges.stream().anyMatch(e -> e.getFromNodeId().equals(targetFrom) && e.getToNodeId().equals(exitId));
            if (!alreadyExits) {
                edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), currentFrom, exitId, "fallthrough"));
            }
        }

        result.setCfgNodes(nodes);
        result.setCfgEdges(edges);

        // 3. Calculate Cyclomatic Complexity via M = E - N + 2P
        int E = edges.size();
        int N = nodes.size();
        int P = 1; // 1 connected method component
        int M = E - N + 2 * P;
        if (M < 1) M = 1;

        WhiteBoxAnalysisResult.CyclomaticMetric metric = new WhiteBoxAnalysisResult.CyclomaticMetric();
        metric.setEdges(E);
        metric.setNodes(N);
        metric.setConnectedComponents(P);
        metric.setComplexity(M);
        metric.setFormula("M = E (" + E + ") - N (" + N + ") + 2P (2*" + P + ") = " + M);

        if (M <= 10) {
            metric.setInterpretation("Low Complexity: Code has simple logic, high maintainability, and straightforward testability.");
            metric.setRiskRating("LOW");
        } else if (M <= 20) {
            metric.setInterpretation("Moderate Complexity: Code has moderate branching. Requires thorough unit test suites.");
            metric.setRiskRating("MODERATE");
        } else if (M <= 50) {
            metric.setInterpretation("High Complexity: High number of decision branches. Difficult to test; refactoring into smaller methods is recommended.");
            metric.setRiskRating("HIGH");
        } else {
            metric.setInterpretation("Very High Risk: Extremely complex logic. High defect probability and untestable without modularization.");
            metric.setRiskRating("VERY_HIGH");
        }
        result.setCyclomaticMetric(metric);

        // 4. Generate Basis Independent Paths (McCabe's basis paths via graph search)
        generateGraphPaths(entryId, exitId, nodes, edges, paths, Math.max(M, 4));
        result.setIndependentPaths(paths);
        result.setTotalBranches(edges.stream().filter(e -> "true".equalsIgnoreCase(e.getLabel()) || "false".equalsIgnoreCase(e.getLabel())).mapToInt(e -> 1).sum());
    }

    private String processStatements(List<Statement> statements, String fromNodeId, String exitId,
                                     List<WhiteBoxAnalysisResult.CfgNode> nodes,
                                     List<WhiteBoxAnalysisResult.CfgEdge> edges,
                                     java.util.concurrent.atomic.AtomicInteger counter) {
        String current = fromNodeId;
        for (Statement stmt : statements) {
            if (current == null) {
                // dead code after return
                break;
            }
            current = processSingleStatement(stmt, current, exitId, nodes, edges, counter);
        }
        return current;
    }

    private String processSingleStatement(Statement stmt, String fromNodeId, String exitId,
                                         List<WhiteBoxAnalysisResult.CfgNode> nodes,
                                         List<WhiteBoxAnalysisResult.CfgEdge> edges,
                                         java.util.concurrent.atomic.AtomicInteger counter) {
        int line = stmt.getRange().map(r -> r.begin.line).orElse(0);

        if (stmt instanceof IfStmt ifStmt) {
            return processIfStmt(ifStmt, fromNodeId, "next", exitId, nodes, edges, counter);
        } else if (stmt instanceof WhileStmt whileStmt) {
            String loopId = "N" + counter.getAndIncrement();
            String cond = whileStmt.getCondition().toString();
            nodes.add(new WhiteBoxAnalysisResult.CfgNode(loopId, "while (" + cond + ")", "LOOP", line, cond));
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), fromNodeId, loopId, "next"));

            String bodyEnd = processSingleStatement(whileStmt.getBody(), loopId, exitId, nodes, edges, counter);
            if (bodyEnd != null) {
                edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), bodyEnd, loopId, "loop-back"));
            }
            return loopId;
        } else if (stmt instanceof ForStmt forStmt) {
            String loopId = "N" + counter.getAndIncrement();
            String cond = forStmt.getCompare().map(Object::toString).orElse("true");
            nodes.add(new WhiteBoxAnalysisResult.CfgNode(loopId, "for (" + cond + ")", "LOOP", line, cond));
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), fromNodeId, loopId, "next"));

            String bodyEnd = processSingleStatement(forStmt.getBody(), loopId, exitId, nodes, edges, counter);
            if (bodyEnd != null) {
                edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), bodyEnd, loopId, "loop-back"));
            }
            return loopId;
        } else if (stmt instanceof BlockStmt blockStmt) {
            return processStatements(blockStmt.getStatements(), fromNodeId, exitId, nodes, edges, counter);
        } else if (stmt instanceof ReturnStmt) {
            String returnId = "N" + counter.getAndIncrement();
            String returnCode = stmt.toString().trim();
            nodes.add(new WhiteBoxAnalysisResult.CfgNode(returnId, truncateSnippet(returnCode, 30), "STATEMENT", line, returnCode));
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), fromNodeId, returnId, "next"));
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), returnId, exitId, "return"));
            return null; // control transferred to exit
        } else {
            String stmtId = "N" + counter.getAndIncrement();
            String code = stmt.toString().trim();
            nodes.add(new WhiteBoxAnalysisResult.CfgNode(stmtId, truncateSnippet(code, 35), "STATEMENT", line, code));
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), fromNodeId, stmtId, "next"));
            return stmtId;
        }
    }

    private String processIfStmt(IfStmt ifStmt, String fromNodeId, String incomingLabel, String exitId,
                                List<WhiteBoxAnalysisResult.CfgNode> nodes,
                                List<WhiteBoxAnalysisResult.CfgEdge> edges,
                                java.util.concurrent.atomic.AtomicInteger counter) {
        int line = ifStmt.getRange().map(r -> r.begin.line).orElse(0);
        String decisionId = "N" + counter.getAndIncrement();
        String conditionStr = ifStmt.getCondition().toString();

        nodes.add(new WhiteBoxAnalysisResult.CfgNode(decisionId, "if (" + conditionStr + ")", "DECISION", line, conditionStr));
        edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), fromNodeId, decisionId, incomingLabel));

        // Then branch
        Statement thenStmt = ifStmt.getThenStmt();
        String thenId = "N" + counter.getAndIncrement();
        int thenLine = thenStmt.getRange().map(r -> r.begin.line).orElse(line);
        String thenCode = thenStmt.toString().trim();
        nodes.add(new WhiteBoxAnalysisResult.CfgNode(thenId, truncateSnippet(thenCode, 35), "STATEMENT", thenLine, thenCode));
        edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), decisionId, thenId, "true"));

        if (thenStmt instanceof ReturnStmt || thenCode.startsWith("return") || (thenStmt instanceof BlockStmt b && b.toString().contains("return"))) {
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), thenId, exitId, "return"));
        }

        // Else branch
        if (ifStmt.getElseStmt().isPresent()) {
            Statement elseStmt = ifStmt.getElseStmt().get();
            if (elseStmt instanceof IfStmt elseIf) {
                // Cascading else if
                return processIfStmt(elseIf, decisionId, "false", exitId, nodes, edges, counter);
            } else {
                // Final else
                String elseId = "N" + counter.getAndIncrement();
                int elseLine = elseStmt.getRange().map(r -> r.begin.line).orElse(line);
                String elseCode = elseStmt.toString().trim();
                nodes.add(new WhiteBoxAnalysisResult.CfgNode(elseId, truncateSnippet(elseCode, 35), "STATEMENT", elseLine, elseCode));
                edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), decisionId, elseId, "false"));

                if (elseStmt instanceof ReturnStmt || elseCode.startsWith("return") || (elseStmt instanceof BlockStmt b && b.toString().contains("return"))) {
                    edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), elseId, exitId, "return"));
                    return null;
                }
                return elseId;
            }
        } else {
            edges.add(new WhiteBoxAnalysisResult.CfgEdge("E" + edges.size(), decisionId, exitId, "false"));
            return decisionId;
        }
    }

    private void generateGraphPaths(String startNodeId, String endNodeId,
                                   List<WhiteBoxAnalysisResult.CfgNode> nodes,
                                   List<WhiteBoxAnalysisResult.CfgEdge> edges,
                                   List<WhiteBoxAnalysisResult.IndependentPath> paths,
                                   int maxPaths) {
        Map<String, List<WhiteBoxAnalysisResult.CfgEdge>> adj = new HashMap<>();
        for (WhiteBoxAnalysisResult.CfgEdge e : edges) {
            adj.computeIfAbsent(e.getFromNodeId(), k -> new ArrayList<>()).add(e);
        }

        List<List<String>> allNodePaths = new ArrayList<>();
        List<List<String>> allConditions = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        List<String> currentPath = new ArrayList<>();
        List<String> currentConds = new ArrayList<>();

        dfsPaths(startNodeId, endNodeId, adj, visited, currentPath, currentConds, allNodePaths, allConditions, maxPaths);

        if (allNodePaths.isEmpty()) {
            List<String> nodeIds = new ArrayList<>();
            nodes.forEach(n -> nodeIds.add(n.getId()));
            paths.add(new WhiteBoxAnalysisResult.IndependentPath(1, "Sequential straight-line path from Entry to Exit", nodeIds, Collections.singletonList("Sequential execution")));
            return;
        }

        for (int i = 0; i < allNodePaths.size(); i++) {
            List<String> nPath = allNodePaths.get(i);
            List<String> cPath = allConditions.get(i);
            String desc = "Basis Path " + (i + 1) + ": " + (cPath.isEmpty() ? "Sequential flow" : String.join(" -> ", cPath));
            paths.add(new WhiteBoxAnalysisResult.IndependentPath(i + 1, desc, nPath, cPath.isEmpty() ? Collections.singletonList("Sequential execution") : cPath));
        }
    }

    private void dfsPaths(String current, String target,
                          Map<String, List<WhiteBoxAnalysisResult.CfgEdge>> adj,
                          Set<String> visited,
                          List<String> path,
                          List<String> conditions,
                          List<List<String>> allPaths,
                          List<List<String>> allConditions,
                          int limit) {
        if (allPaths.size() >= limit) return;

        path.add(current);
        visited.add(current);

        if (current.equals(target)) {
            allPaths.add(new ArrayList<>(path));
            allConditions.add(new ArrayList<>(conditions));
        } else {
            List<WhiteBoxAnalysisResult.CfgEdge> nextEdges = adj.getOrDefault(current, Collections.emptyList());
            for (WhiteBoxAnalysisResult.CfgEdge edge : nextEdges) {
                String next = edge.getToNodeId();
                if (!visited.contains(next)) {
                    if ("true".equalsIgnoreCase(edge.getLabel()) || "false".equalsIgnoreCase(edge.getLabel())) {
                        conditions.add(current + " (" + edge.getLabel().toUpperCase() + ")");
                    }
                    dfsPaths(next, target, adj, visited, path, conditions, allPaths, allConditions, limit);
                    if ("true".equalsIgnoreCase(edge.getLabel()) || "false".equalsIgnoreCase(edge.getLabel())) {
                        conditions.remove(conditions.size() - 1);
                    }
                }
            }
        }

        path.remove(path.size() - 1);
        visited.remove(current);
    }

    private String truncateSnippet(String code, int maxLen) {
        if (code == null) return "";
        code = code.replace("\n", " ").replace("\r", " ").trim();
        if (code.length() <= maxLen) return code;
        return code.substring(0, maxLen - 3) + "...";
    }
}
