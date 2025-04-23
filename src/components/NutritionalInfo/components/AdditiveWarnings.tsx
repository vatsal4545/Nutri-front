import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AdditiveWarning } from "../types";

interface AdditiveWarningsProps {
  additives: {
    warnings: AdditiveWarning[];
    count: number;
  };
}

export const AdditiveWarnings: React.FC<AdditiveWarningsProps> = ({
  additives,
}) => (
  <View style={styles.additivesSection}>
    <View style={styles.additivesHeader}>
      <Text style={styles.additivesTitle}>⚠️ Additives Information</Text>
      <Text style={styles.additivesCount}>Total: {additives.count}</Text>
    </View>
    {additives.warnings.length > 0 ? (
      <View style={styles.warningsContainer}>
        {additives.warnings.map((warning, index) => (
          <View key={index} style={styles.warningItem}>
            <Text style={styles.warningCode}>{warning.code}</Text>
            <Text style={styles.warningText}>{warning.risk}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noWarningsText}>No concerning additives found</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  additivesSection: {
    marginTop: 15,
    backgroundColor: "#FFF4F4",
    borderRadius: 8,
    padding: 15,
  },
  additivesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  additivesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  additivesCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  warningsContainer: {
    gap: 10,
  },
  warningItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  warningCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noWarningsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
