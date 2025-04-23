import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CameraView, CameraType } from "expo-camera";

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
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing={facing}
        enableTorch={false}
        onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
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
