import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProductHeaderProps {
  name: string;
  brand: string;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  name,
  brand,
}) => (
  <View style={styles.productHeader}>
    <Text style={styles.productName}>{name || "Unknown Product"}</Text>
    <Text style={styles.brandName}>{brand || "Unknown Brand"}</Text>
  </View>
);

const styles = StyleSheet.create({
  productHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
