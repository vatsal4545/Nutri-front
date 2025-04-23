import React from "react";
import { View, StyleSheet } from "react-native";
import { NutritionalInfoData } from "./types";
import { ProductHeader } from "./components/ProductHeader";
import { ScoreSection } from "./components/ScoreSection";
import { NutritionGrid } from "./components/NutritionGrid";
import { AdditiveWarnings } from "./components/AdditiveWarnings";
import { EnvironmentalImpact } from "./components/EnvironmentalImpact";

interface NutritionalInfoProps {
  nutritionData: NutritionalInfoData;
}

export const NutritionalInfo: React.FC<NutritionalInfoProps> = ({
  nutritionData,
}) => (
  <View style={styles.nutritionContainer}>
    <ProductHeader
      name={nutritionData.product_name}
      brand={nutritionData.brand_name}
    />
    <ScoreSection
      nutriScore={nutritionData.nutri_grade}
      ecoScore={nutritionData.eco_score}
    />
    <NutritionGrid data={nutritionData} />
    {nutritionData.additives && (
      <AdditiveWarnings additives={nutritionData.additives} />
    )}
    {nutritionData.co2_emission && (
      <EnvironmentalImpact co2={nutritionData.co2_emission} />
    )}
  </View>
);

const styles = StyleSheet.create({
  nutritionContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginTop: 15,
  },
});
