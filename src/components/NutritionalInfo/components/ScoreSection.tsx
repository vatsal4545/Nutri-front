import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getHealthColor, getEcoScoreColor } from "../utils";

interface ScoreSectionProps {
  nutriScore: string;
  ecoScore: string;
}

export const ScoreSection: React.FC<ScoreSectionProps> = ({
  nutriScore,
  ecoScore,
}) => (
  <View style={styles.scoreSection}>
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>Nutri-Score</Text>
      <View
        style={[
          styles.scoreBadge,
          { backgroundColor: getHealthColor(nutriScore) },
        ]}
      >
        <Text style={styles.scoreValue}>{nutriScore.toUpperCase()}</Text>
      </View>
    </View>
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>Eco-Score</Text>
      <View
        style={[
          styles.scoreBadge,
          { backgroundColor: getEcoScoreColor(ecoScore) },
        ]}
      >
        <Text style={styles.scoreValue}>{ecoScore.toUpperCase()}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scoreSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
