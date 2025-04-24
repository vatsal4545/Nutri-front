import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { fetchWithRetry } from "../config";

interface Product {
  id: number;
  barcode: string;
  product_name: string;
  brand: string;
  image_url: string | null;
  nutrition_data: {
    nutrients: any;
    grade: string;
    serving_size: string;
  };
  ingredients: string;
  prediction: string | null;
  scanned_at: string;
}

export const ProductHistory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      if (!user) return;

      const response = await fetchWithRetry(`/api/products/user/${user.uid}`);
      if (!response) throw new Error("Failed to fetch products");
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const renderNutritionInfo = (nutrition_data: Product["nutrition_data"]) => {
    if (!nutrition_data?.nutrients) return null;

    const nutrients = nutrition_data.nutrients;
    const keyNutrients = [
      { key: "energy-kcal", label: "Calories" },
      { key: "fat", label: "Fat" },
      { key: "saturated-fat", label: "Saturated Fat" },
      { key: "carbohydrates", label: "Carbohydrates" },
      { key: "sugars", label: "Sugars" },
      { key: "proteins", label: "Protein" },
      { key: "salt", label: "Salt" },
      { key: "fiber", label: "Fiber" },
    ];

    return (
      <View style={styles.nutritionContainer}>
        <Text style={styles.sectionTitle}>Nutrition Information</Text>
        {nutrition_data.serving_size && (
          <Text style={styles.servingSize}>
            Per {String(nutrition_data.serving_size)}
          </Text>
        )}
        {keyNutrients.map(
          ({ key, label }) =>
            nutrients[key] != null && (
              <View key={key} style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>{label}:</Text>
                <Text style={styles.nutrientValue}>
                  {String(nutrients[key])}
                  {key === "energy-kcal" ? " kcal" : "g"}
                </Text>
              </View>
            )
        )}
        {nutrition_data.grade && (
          <Text style={styles.nutritionGrade}>
            Nutrition Grade: {String(nutrition_data.grade).toUpperCase()}
          </Text>
        )}
      </View>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => setSelectedProduct(item)}
    >
      <View style={styles.productContent}>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {String(item.product_name || "Unknown Product")}
          </Text>
          {item.brand && <Text style={styles.brand}>{String(item.brand)}</Text>}
          <Text style={styles.barcode}>Barcode: {String(item.barcode)}</Text>
          {item.prediction && (
            <Text style={styles.prediction}>
              Classification: {String(item.prediction)}
            </Text>
          )}
          <Text style={styles.date}>
            Scanned: {new Date(item.scanned_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ProductDetailsModal = () => {
    if (!selectedProduct) return null;

    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {selectedProduct.image_url && (
                <Image
                  source={{ uri: selectedProduct.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>
                  {String(selectedProduct.product_name || "Unknown Product")}
                </Text>
                {selectedProduct.brand && (
                  <Text style={styles.modalBrand}>
                    {String(selectedProduct.brand)}
                  </Text>
                )}
                <Text style={styles.modalBarcode}>
                  Barcode: {String(selectedProduct.barcode)}
                </Text>
                {selectedProduct.prediction && (
                  <Text style={styles.modalPrediction}>
                    Classification: {String(selectedProduct.prediction)}
                  </Text>
                )}

                {selectedProduct.ingredients && (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    <View style={styles.ingredientsTextContainer}>
                      <Text style={styles.ingredients}>
                        {String(selectedProduct.ingredients)}
                      </Text>
                    </View>
                  </View>
                )}

                {selectedProduct.nutrition_data &&
                  renderNutritionInfo(selectedProduct.nutrition_data)}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedProduct(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No scanned products yet</Text>
          </View>
        }
      />
      <ProductDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productContent: {
    flexDirection: "row",
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  barcode: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "90%",
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalInfo: {
    paddingHorizontal: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalBrand: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  modalBarcode: {
    fontSize: 14,
    color: "#888",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "tomato",
  },
  ingredientsContainer: {
    marginBottom: 15,
  },
  ingredientsTextContainer: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  ingredients: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  nutritionContainer: {
    marginBottom: 15,
  },
  servingSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  nutrientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  nutrientValue: {
    fontSize: 14,
    color: "#444",
  },
  nutritionGrade: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "tomato",
  },
  closeButton: {
    backgroundColor: "tomato",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  prediction: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontStyle: "italic",
  },
  modalPrediction: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
});
