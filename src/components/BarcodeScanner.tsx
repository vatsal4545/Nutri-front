import React, { useState, useRef, useEffect } from "react";
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
  const lastErrorTimestamp = useRef<number>(0);
  const errorDebounceMs = 5000; // Only show error alerts every 5 seconds
  const processedBarcodes = useRef<Set<string>>(new Set());

  // Clear the processed barcodes cache after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      processedBarcodes.current.clear();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBarCodeScanned = async (data: { type: string; data: string }) => {
    // Prevent multiple scans of the same barcode
    if (isProcessing || lastScannedBarcode.current === data.data) {
      return;
    }

    // Skip if we've already processed this barcode recently
    if (processedBarcodes.current.has(data.data)) {
      return;
    }

    try {
      setIsProcessing(true);
      lastScannedBarcode.current = data.data;

      // Add to processed set to avoid repeated processing
      processedBarcodes.current.add(data.data);

      // First call the original handler
      onBarCodeScanned(data);

      if (!user) {
        showErrorWithDebounce("Please log in to save scanned products");
        return;
      }

      // Fetch product data from Open Food Facts API and get prediction
      const productResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data.data}.json`
      );

      // Handle 404 responses silently
      if (productResponse.status === 404) {
        showErrorWithDebounce(
          `Barcode ${data.data} is not in our database. Please try another product.`
        );
        return;
      }

      if (!productResponse.ok) {
        throw new Error(`HTTP error! status: ${productResponse.status}`);
      }

      const productData = await productResponse.json();

      // Try to get prediction, but don't throw error if it fails
      let predictionData = { prediction: null };
      try {
        const predictionResponse = await fetchWithRetry("/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ barcode: data.data }),
        });

        if (predictionResponse) {
          predictionData = await predictionResponse.json();
        }
      } catch (predictionError) {
        // Silently continue if prediction fails
        console.log("Prediction unavailable for this product");
      }

      if (productData.status === 1) {
        const product = productData.product;

        try {
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
        } catch (saveError) {
          // Only log backend save errors, don't show to user
          console.log("Error saving to backend:", saveError);
        }
      } else {
        // Product not found in database
        showErrorWithDebounce(
          `Barcode ${data.data} is not in our database. Please try another product.`
        );
      }
    } catch (error) {
      // Only log detailed errors in console, not to UI
      console.log("Error processing barcode:", error);

      // Only show one error message to user every few seconds
      const now = Date.now();
      if (now - lastErrorTimestamp.current > errorDebounceMs) {
        if (error instanceof TypeError && error.message.includes("network")) {
          showErrorWithDebounce(
            "Unable to connect to the server. Please check your internet connection."
          );
        } else {
          // Generic error handling - but debounced
          showErrorWithDebounce(
            "There was a problem processing this product. Please try again."
          );
        }
      }
    } finally {
      setIsProcessing(false);
      // Clear the last scanned barcode after a short delay
      setTimeout(() => {
        lastScannedBarcode.current = null;
      }, 1500);
    }
  };

  const showErrorWithDebounce = (message: string) => {
    const now = Date.now();
    if (now - lastErrorTimestamp.current > errorDebounceMs) {
      lastErrorTimestamp.current = now;
      Alert.alert("Notice", message);
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
    paddingBottom: 60,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
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
    marginBottom: 10,
  },
  flipButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
