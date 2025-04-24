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
import { ProductHistory } from "./components/ProductHistory";
import {
  getHealthColor,
  getHealthDescription,
} from "./components/NutritionalInfo/utils";

const ScanScreen: React.FC<{
  onLogout: () => Promise<void>;
}> = ({ onLogout }) => {
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
      <View style={styles.headerContainer}>
        <Text style={styles.logoText}>NutriScan</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

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

const MainApp: React.FC = () => {
  const { logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        {activeTab === "scan" ? (
          <ScanScreen onLogout={handleLogout} />
        ) : (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.logoText}>Product History</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <ProductHistory />
          </View>
        )}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "scan" && styles.activeTab]}
          onPress={() => setActiveTab("scan")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "scan" && styles.activeTabText,
            ]}
          >
            Scan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "tomato",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  logoutButtonText: {
    color: "tomato",
    fontSize: 14,
    fontWeight: "bold",
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
    marginBottom: 15,
  },
  mainText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  healthDescription: {
    fontSize: 14,
    color: "#666",
  },
  statusText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "tomato",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  scanAgainButton: {
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: "tomato",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "tomato",
    fontWeight: "bold",
  },
});

export default MainApp;
