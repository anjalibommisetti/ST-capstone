package com.testfusion.dto;

import java.util.List;

public class EquivalenceClassRule {
    private String parameterName;
    private List<Partition> validPartitions;
    private List<Partition> invalidPartitions;

    public static class Partition {
        private String name;
        private Double min;
        private Double max;
        private String representativeValue;
        private String expectedBehavior;

        public Partition() {}
        public Partition(String name, Double min, Double max, String representativeValue, String expectedBehavior) {
            this.name = name;
            this.min = min;
            this.max = max;
            this.representativeValue = representativeValue;
            this.expectedBehavior = expectedBehavior;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Double getMin() { return min; }
        public void setMin(Double min) { this.min = min; }
        public Double getMax() { return max; }
        public void setMax(Double max) { this.max = max; }
        public String getRepresentativeValue() { return representativeValue; }
        public void setRepresentativeValue(String representativeValue) { this.representativeValue = representativeValue; }
        public String getExpectedBehavior() { return expectedBehavior; }
        public void setExpectedBehavior(String expectedBehavior) { this.expectedBehavior = expectedBehavior; }
    }

    public EquivalenceClassRule() {}

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public List<Partition> getValidPartitions() { return validPartitions; }
    public void setValidPartitions(List<Partition> validPartitions) { this.validPartitions = validPartitions; }

    public List<Partition> getInvalidPartitions() { return invalidPartitions; }
    public void setInvalidPartitions(List<Partition> invalidPartitions) { this.invalidPartitions = invalidPartitions; }
}
