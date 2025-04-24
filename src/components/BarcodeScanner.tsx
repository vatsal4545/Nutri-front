import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { CameraView, CameraType } from "expo-camera";
import { useAuth } from "../contexts/AuthContext";
import { fetchWithRetry } from "../config";

interface BarcodeScannerProps {
  facing: CameraType;
  scanned: boolean;
  onBarCodeScanned: (data: { type: string; data: string }) => void;
  onFlipCamera: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  facing,
  scanned,
  onBarCodeScanned,
  onFlipCamera,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScannedBarcode = useRef<string | null>(null);

  const handleBarCodeScanned = async (data: { type: string; data: string }) => {
    // Prevent multiple scans of the same barcode
    if (isProcessing || lastScannedBarcode.current === data.data) {
      return;
    }

    try {
      setIsProcessing(true);
      lastScannedBarcode.current = data.data;

      // First call the original handler
      onBarCodeScanned(data);

      if (!user) {
        Alert.alert("Error", "Please log in to save scanned products");
        return;
      }

      // Fetch product data from Open Food Facts API and get prediction
      const productResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data.data}.json`
      );
      const predictionResponse = await fetchWithRetry("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode: data.data }),
      });

      const productData = await productResponse.json();
      const predictionData = predictionResponse
        ? await predictionResponse.json()
        : { prediction: null };

      if (productData.status === 1) {
        const product = productData.product;

        // Save product to our backend
        const saveResponse = await fetchWithRetry("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            barcode: data.data,
            product_name: product.product_name,
            brand: product.brands,
            image_url: product.image_url,
            nutrition_data: {
              nutrients: product.nutriments,
              grade: product.nutrition_grade_fr,
              serving_size: product.serving_size,
            },
            ingredients: product.ingredients_text,
            prediction: predictionData.prediction,
          }),
        });

        if (!saveResponse) {
          throw new Error("Failed to save product: No response from server");
        }

        const saveResult = await saveResponse.json();
        if (!saveResult || !saveResult.success) {
          throw new Error(saveResult?.message || "Failed to save product");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert(
        "Error",
        "Failed to save product information. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing={facing}
        enableTorch={false}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "qr",
            "pdf417",
            "upc_e",
            "upc_a",
            "aztec",
            "code128",
            "code39",
            "code93",
            "datamatrix",
            "itf14",
          ],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <View style={styles.scanArea} />
            <Text style={styles.scanText}>Position barcode within frame</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={onFlipCamera}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    height: Dimensions.get("window").height * 0.4,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
  },
  scanText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  flipButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    minWidth: 100,
    alignItems: "center",
    marginBottom: -15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
