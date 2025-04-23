import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EnvironmentalImpactProps {
  co2: number;
}

export const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({
  co2,
}) => (
  <View style={styles.environmentalSection}>
    <Text style={styles.environmentalTitle}>Environmental Impact</Text>
    <View style={styles.co2Container}>
      <Text style={styles.co2Label}>CO₂ Emission</Text>
      <Text style={styles.co2Value}>{co2.toFixed(2)} kg CO₂ eq/kg</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  environmentalSection: {
    marginTop: 15,
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
    padding: 15,
  },
  environmentalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  co2Container: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  co2Label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  co2Value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
});
