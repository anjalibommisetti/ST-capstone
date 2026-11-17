package com.testfusion.dto;

import java.util.List;

public class DecisionTableDefinition {
    private String name;
    private List<String> conditions; // e.g. ["Age >= 18", "Has Valid ID", "Passes Health Check"]
    private List<String> actions;    // e.g. ["Grant Approval", "Require Parental Consent", "Reject"]
    private List<RuleColumn> rules;

    public static class RuleColumn {
        private String ruleId; // R1, R2, ...
        private List<Boolean> conditionValues; // true / false for each condition
        private List<Boolean> actionOutcomes;  // true / false for each action

        public RuleColumn() {}
        public RuleColumn(String ruleId, List<Boolean> conditionValues, List<Boolean> actionOutcomes) {
            this.ruleId = ruleId;
            this.conditionValues = conditionValues;
            this.actionOutcomes = actionOutcomes;
        }

        public String getRuleId() { return ruleId; }
        public void setRuleId(String ruleId) { this.ruleId = ruleId; }

        public List<Boolean> getConditionValues() { return conditionValues; }
        public void setConditionValues(List<Boolean> conditionValues) { this.conditionValues = conditionValues; }

        public List<Boolean> getActionOutcomes() { return actionOutcomes; }
        public void setActionOutcomes(List<Boolean> actionOutcomes) { this.actionOutcomes = actionOutcomes; }
    }

    public DecisionTableDefinition() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getConditions() { return conditions; }
    public void setConditions(List<String> conditions) { this.conditions = conditions; }

    public List<String> getActions() { return actions; }
    public void setActions(List<String> actions) { this.actions = actions; }

    public List<RuleColumn> getRules() { return rules; }
    public void setRules(List<RuleColumn> rules) { this.rules = rules; }
}
