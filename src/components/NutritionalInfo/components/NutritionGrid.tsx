import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NutritionalInfoData } from "../types";

interface NutritionGridProps {
  data: NutritionalInfoData;
}

export const NutritionGrid: React.FC<NutritionGridProps> = ({ data }) => {
  const formatValue = (value: number): string => value.toFixed(1);

  const nutritionItems = [
    { label: "Energy", value: data.energy_kcal_100g, unit: "kcal" },
    { label: "Proteins", value: data.proteins_100g, unit: "g" },
    { label: "Carbohydrates", value: data.carbohydrates_100g, unit: "g" },
    { label: "Sugars", value: data.sugars_100g, unit: "g" },
    { label: "Fat", value: data.fat_100g, unit: "g" },
    { label: "Saturated Fat", value: data["saturated-fat_100g"], unit: "g" },
    { label: "Fiber", value: data.fiber_100g, unit: "g" },
    { label: "Salt", value: data.salt_100g, unit: "g" },
  ];

  return (
    <>
      <Text style={styles.per100gText}>Values per 100g</Text>
      <View style={styles.nutritionGrid}>
        {nutritionItems.map((item, index) => (
          <View key={index} style={styles.nutritionItem}>
            <Text style={styles.nutrientLabel}>{item.label}</Text>
            <Text style={styles.nutrientValue}>
              {formatValue(item.value)} {item.unit}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  per100gText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  nutrientLabel: {
    fontSize: 14,
    color: "#666",
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    color: "#2C3E50",
  },
});
