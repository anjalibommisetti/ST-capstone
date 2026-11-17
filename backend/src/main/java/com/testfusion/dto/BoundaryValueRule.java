package com.testfusion.dto;

public class BoundaryValueRule {
    private String parameterName;
    private double minValue;
    private double maxValue;
    private String dataType = "INTEGER"; // INTEGER, DOUBLE

    public BoundaryValueRule() {}

    public BoundaryValueRule(String parameterName, double minValue, double maxValue, String dataType) {
        this.parameterName = parameterName;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.dataType = dataType;
    }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public double getMinValue() { return minValue; }
    public void setMinValue(double minValue) { this.minValue = minValue; }

    public double getMaxValue() { return maxValue; }
    public void setMaxValue(double maxValue) { this.maxValue = maxValue; }

    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
}
