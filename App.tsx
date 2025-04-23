import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import React from "react";
import { fetchWithRetry } from "./src/config";
import { AuthProvider } from "./src/contexts/AuthContext";
import { AuthScreen } from "./src/screens/AuthScreen";
import { useAuth } from "./src/contexts/AuthContext";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";

interface AdditiveWarning {
  code: string;
  risk: string;
}

interface NutritionalInfoProps {
  nutritionData: {
    product_name: string;
    brand_name: string;
    energy_kcal_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    sugars_100g: number;
    fat_100g: number;
    "saturated-fat_100g": number;
    fiber_100g: number;
    salt_100g: number;
    sodium_100g: number;
    calcium_100g: number;
    iron_100g: number;
    "vitamin-c_100g": number;
    nutri_grade: string;
    eco_score: string;
    co2_emission: number;
    ingredients: string;
    allergens: string[];
    additives: {
      tags: string[];
      warnings: AdditiveWarning[];
      count: number;
    };
  };
}

const getHealthDescription = (prediction: string): string => {
  switch (prediction.toLowerCase()) {
    case "nutritious":
      return "Rich in essential nutrients, minimally processed";
    case "healthy":
      return "Balanced nutritional profile with moderate processing";
    case "less healthy":
      return "Contains some nutrients but is moderately processed";
    case "unhealthy":
      return "Highly processed, calorie-dense, low in nutrients";
    default:
      return "";
  }
};

const getHealthColor = (prediction: string): string => {
  switch (prediction.toLowerCase()) {
    case "nutritious":
      return "#006400";
    case "healthy":
      return "#228B22";
    case "less healthy":
      return "#FFA500";
    case "unhealthy":
      return "#FF0000";
    default:
      return "#000000";
  }
};

const getEcoScoreColor = (score: string): string => {
  switch (score.toLowerCase()) {
    case "a":
      return "#1E8F4E";
    case "b":
      return "#2ECC71";
    case "c":
      return "#F1C40F";
    case "d":
      return "#E67E22";
    case "e":
      return "#E74C3C";
    default:
      return "#666";
  }
};

const ProductHeader: React.FC<{ name: string; brand: string }> = ({
  name,
  brand,
}) => (
  <View style={styles.productHeader}>
    <Text style={styles.productName}>{name || "Unknown Product"}</Text>
    <Text style={styles.brandName}>{brand || "Unknown Brand"}</Text>
  </View>
);

const ScoreSection: React.FC<{
  nutriScore: string;
  ecoScore: string;
}> = ({ nutriScore, ecoScore }) => (
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

const NutritionGrid: React.FC<{ data: any }> = ({ data }) => {
  const formatValue = (value: number): string => value.toFixed(1);

  return (
    <>
      <Text style={styles.per100gText}>Values per 100g</Text>
      <View style={styles.nutritionGrid}>
        {[
          { label: "Energy", value: data.energy_kcal_100g, unit: "kcal" },
          { label: "Proteins", value: data.proteins_100g, unit: "g" },
          { label: "Carbohydrates", value: data.carbohydrates_100g, unit: "g" },
          { label: "Sugars", value: data.sugars_100g, unit: "g" },
          { label: "Fat", value: data.fat_100g, unit: "g" },
          {
            label: "Saturated Fat",
            value: data["saturated-fat_100g"],
            unit: "g",
          },
          { label: "Fiber", value: data.fiber_100g, unit: "g" },
          { label: "Salt", value: data.salt_100g, unit: "g" },
        ].map((item, index) => (
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

const AdditiveWarnings: React.FC<{
  additives: { warnings: AdditiveWarning[]; count: number };
}> = ({ additives }) => (
  <View style={styles.additivesSection}>
    <View style={styles.additivesHeader}>
      <Text style={styles.additivesTitle}>⚠️ Additives Information</Text>
      <Text style={styles.additivesCount}>Total: {additives.count}</Text>
    </View>
    {additives.warnings.length > 0 ? (
      <View style={styles.warningsContainer}>
        {additives.warnings.map((warning, index) => (
          <View key={index} style={styles.warningItem}>
            <Text style={styles.warningCode}>{warning.code}</Text>
            <Text style={styles.warningText}>{warning.risk}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noWarningsText}>No concerning additives found</Text>
    )}
  </View>
);

const EnvironmentalImpact: React.FC<{ co2: number }> = ({ co2 }) => (
  <View style={styles.environmentalSection}>
    <Text style={styles.environmentalTitle}>Environmental Impact</Text>
    <View style={styles.co2Container}>
      <Text style={styles.co2Label}>CO₂ Emission</Text>
      <Text style={styles.co2Value}>{co2.toFixed(2)} kg CO₂ eq/kg</Text>
    </View>
  </View>
);

const NutritionalInfo: React.FC<NutritionalInfoProps> = ({ nutritionData }) => (
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

const MainApp = () => {
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

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.logoText}>NutriScan</Text>

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
                <Text style={styles.scanText}>
                  Position barcode within frame
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.buttonText}>Flip Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>

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
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  per100gText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
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
  nutritionContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginTop: 15,
  },
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
  additivesSection: {
    marginTop: 15,
    backgroundColor: "#FFF4F4",
    borderRadius: 8,
    padding: 15,
  },
  additivesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  additivesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  additivesCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  warningsContainer: {
    gap: 10,
  },
  warningItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  warningCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noWarningsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
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
