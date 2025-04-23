import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { CameraType, useCameraPermissions } from "expo-camera";
import { useAuth } from "./contexts/AuthContext";
import { fetchWithRetry } from "./config";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { NutritionalInfo } from "./components/NutritionalInfo";
import {
  getHealthColor,
  getHealthDescription,
} from "./components/NutritionalInfo/utils";

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [nutritionalInfo, setNutritionalInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;

    setScanned(true);
    setScannedData(data);
    setIsLoading(true);
    setStatusMessage("Analyzing product...");

    try {
      const [predictionResponse, nutritionResponse] = await Promise.all([
        fetchWithRetry("/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ barcode: data }),
        }),
        fetchWithRetry("/product_info?barcode=" + data, {
          headers: {
            Accept: "application/json",
          },
        }),
      ]);

      if (!predictionResponse || !nutritionResponse) {
        throw new Error("Failed to fetch data");
      }

      const [predictionData, nutritionData] = await Promise.all([
        predictionResponse.json(),
        nutritionResponse.json(),
      ]);

      if (predictionData.error || nutritionData.error) {
        throw new Error(predictionData.error || nutritionData.error);
      }

      setPrediction(predictionData.prediction);
      setNutritionalInfo(nutritionData);
      setStatusMessage("");
    } catch (error) {
      console.error("Scanning error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setStatusMessage(`Error: ${errorMessage}. Please try again.`);
      setPrediction(null);
      setNutritionalInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanning = () => {
    setScanned(false);
    setScannedData(null);
    setPrediction(null);
    setNutritionalInfo(null);
    setStatusMessage("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>NutriScan</Text>

      <BarcodeScanner
        facing={facing}
        scanned={scanned}
        onBarCodeScanned={handleBarCodeScanned}
        onFlipCamera={toggleCameraFacing}
      />

      <ScrollView style={styles.resultScrollContainer}>
        <View style={styles.resultContainer}>
          {scannedData && (
            <View style={styles.resultBox}>
              <Text style={styles.mainText}>Barcode: {scannedData}</Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="tomato" />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : (
            <>
              {prediction && (
                <View style={styles.resultBox}>
                  <Text
                    style={[
                      styles.mainText,
                      { color: getHealthColor(prediction) },
                    ]}
                  >
                    Classification: {prediction}
                  </Text>
                  <Text style={styles.healthDescription}>
                    {getHealthDescription(prediction)}
                  </Text>
                </View>
              )}

              {nutritionalInfo && (
                <NutritionalInfo nutritionData={nutritionalInfo} />
              )}
            </>
          )}

          {statusMessage && !isLoading && (
            <Text style={styles.errorText}>{statusMessage}</Text>
          )}

          {scanned && (
            <TouchableOpacity
              style={[styles.button, styles.scanAgainButton]}
              onPress={resetScanning}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "tomato",
    textAlign: "center",
    marginBottom: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
  },
  resultScrollContainer: {
    flex: 1,
  },
  resultContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  resultBox: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  mainText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  healthDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "tomato",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scanAgainButton: {
    backgroundColor: "tomato",
  },
});

export default MainApp;
