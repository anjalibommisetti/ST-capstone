package com.testfusion.dto;

import java.util.ArrayList;
import java.util.List;

public class WhiteBoxAnalysisResult {
    private boolean syntaxValid = true;
    private List<String> compilationErrors = new ArrayList<>();
    private int totalLines;
    private int totalStatements;
    private int totalBranches;
    private int totalDecisions;
    private List<MethodAnalysis> methods = new ArrayList<>();
    private List<CfgNode> cfgNodes = new ArrayList<>();
    private List<CfgEdge> cfgEdges = new ArrayList<>();
    private CyclomaticMetric cyclomaticMetric = new CyclomaticMetric();
    private List<IndependentPath> independentPaths = new ArrayList<>();

    public static class MethodAnalysis {
        private String name;
        private String returnType;
        private List<String> parameters = new ArrayList<>();
        private int startLine;
        private int endLine;
        private int cyclomaticComplexity;
        private int decisionPoints;
        private int loopPoints;

        public MethodAnalysis() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getReturnType() { return returnType; }
        public void setReturnType(String returnType) { this.returnType = returnType; }
        public List<String> getParameters() { return parameters; }
        public void setParameters(List<String> parameters) { this.parameters = parameters; }
        public int getStartLine() { return startLine; }
        public void setStartLine(int startLine) { this.startLine = startLine; }
        public int getEndLine() { return endLine; }
        public void setEndLine(int endLine) { this.endLine = endLine; }
        public int getCyclomaticComplexity() { return cyclomaticComplexity; }
        public void setCyclomaticComplexity(int cyclomaticComplexity) { this.cyclomaticComplexity = cyclomaticComplexity; }
        public int getDecisionPoints() { return decisionPoints; }
        public void setDecisionPoints(int decisionPoints) { this.decisionPoints = decisionPoints; }
        public int getLoopPoints() { return loopPoints; }
        public void setLoopPoints(int loopPoints) { this.loopPoints = loopPoints; }
    }

    public static class CfgNode {
        private String id;
        private String label;
        private String type; // ENTRY, EXIT, DECISION, STATEMENT, MERGE, LOOP
        private int lineNumber;
        private String codeSnippet;

        public CfgNode() {}
        public CfgNode(String id, String label, String type, int lineNumber, String codeSnippet) {
            this.id = id;
            this.label = label;
            this.type = type;
            this.lineNumber = lineNumber;
            this.codeSnippet = codeSnippet;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getLineNumber() { return lineNumber; }
        public void setLineNumber(int lineNumber) { this.lineNumber = lineNumber; }
        public String getCodeSnippet() { return codeSnippet; }
        public void setCodeSnippet(String codeSnippet) { this.codeSnippet = codeSnippet; }
    }

    public static class CfgEdge {
        private String id;
        private String fromNodeId;
        private String toNodeId;
        private String label; // true, false, loop, next, return
        private String style; // solid, dashed

        public CfgEdge() {}
        public CfgEdge(String id, String fromNodeId, String toNodeId, String label) {
            this.id = id;
            this.fromNodeId = fromNodeId;
            this.toNodeId = toNodeId;
            this.label = label != null ? label : "";
            this.style = "solid";
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFromNodeId() { return fromNodeId; }
        public void setFromNodeId(String fromNodeId) { this.fromNodeId = fromNodeId; }
        public String getToNodeId() { return toNodeId; }
        public void setToNodeId(String toNodeId) { this.toNodeId = toNodeId; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getStyle() { return style; }
        public void setStyle(String style) { this.style = style; }
    }

    public static class CyclomaticMetric {
        private int edges;
        private int nodes;
        private int connectedComponents = 1;
        private int complexity; // M = E - N + 2P
        private String formula;
        private String interpretation;
        private String riskRating; // Low, Moderate, High, Very High

        public CyclomaticMetric() {}

        public int getEdges() { return edges; }
        public void setEdges(int edges) { this.edges = edges; }
        public int getNodes() { return nodes; }
        public void setNodes(int nodes) { this.nodes = nodes; }
        public int getConnectedComponents() { return connectedComponents; }
        public void setConnectedComponents(int connectedComponents) { this.connectedComponents = connectedComponents; }
        public int getComplexity() { return complexity; }
        public void setComplexity(int complexity) { this.complexity = complexity; }
        public String getFormula() { return formula; }
        public void setFormula(String formula) { this.formula = formula; }
        public String getInterpretation() { return interpretation; }
        public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
        public String getRiskRating() { return riskRating; }
        public void setRiskRating(String riskRating) { this.riskRating = riskRating; }
    }

    public static class IndependentPath {
        private int pathNumber;
        private String description;
        private List<String> nodeIds = new ArrayList<>();
        private List<String> conditionsExercised = new ArrayList<>();

        public IndependentPath() {}
        public IndependentPath(int pathNumber, String description, List<String> nodeIds, List<String> conditionsExercised) {
            this.pathNumber = pathNumber;
            this.description = description;
            this.nodeIds = nodeIds;
            this.conditionsExercised = conditionsExercised;
        }

        public int getPathNumber() { return pathNumber; }
        public void setPathNumber(int pathNumber) { this.pathNumber = pathNumber; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getNodeIds() { return nodeIds; }
        public void setNodeIds(List<String> nodeIds) { this.nodeIds = nodeIds; }
        public List<String> getConditionsExercised() { return conditionsExercised; }
        public void setConditionsExercised(List<String> conditionsExercised) { this.conditionsExercised = conditionsExercised; }
    }

    public WhiteBoxAnalysisResult() {}

    public boolean isSyntaxValid() { return syntaxValid; }
    public void setSyntaxValid(boolean syntaxValid) { this.syntaxValid = syntaxValid; }
    public List<String> getCompilationErrors() { return compilationErrors; }
    public void setCompilationErrors(List<String> compilationErrors) { this.compilationErrors = compilationErrors; }
    public int getTotalLines() { return totalLines; }
    public void setTotalLines(int totalLines) { this.totalLines = totalLines; }
    public int getTotalStatements() { return totalStatements; }
    public void setTotalStatements(int totalStatements) { this.totalStatements = totalStatements; }
    public int getTotalBranches() { return totalBranches; }
    public void setTotalBranches(int totalBranches) { this.totalBranches = totalBranches; }
    public int getTotalDecisions() { return totalDecisions; }
    public void setTotalDecisions(int totalDecisions) { this.totalDecisions = totalDecisions; }
    public List<MethodAnalysis> getMethods() { return methods; }
    public void setMethods(List<MethodAnalysis> methods) { this.methods = methods; }
    public List<CfgNode> getCfgNodes() { return cfgNodes; }
    public void setCfgNodes(List<CfgNode> cfgNodes) { this.cfgNodes = cfgNodes; }
    public List<CfgEdge> getCfgEdges() { return cfgEdges; }
    public void setCfgEdges(List<CfgEdge> cfgEdges) { this.cfgEdges = cfgEdges; }
    public CyclomaticMetric getCyclomaticMetric() { return cyclomaticMetric; }
    public void setCyclomaticMetric(CyclomaticMetric cyclomaticMetric) { this.cyclomaticMetric = cyclomaticMetric; }
    public List<IndependentPath> getIndependentPaths() { return independentPaths; }
    public void setIndependentPaths(List<IndependentPath> independentPaths) { this.independentPaths = independentPaths; }
}
