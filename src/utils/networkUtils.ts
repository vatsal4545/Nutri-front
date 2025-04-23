import { Platform } from "react-native";
import NetInfo, { NetInfoStateType } from "@react-native-community/netinfo";

export const getLocalIpAddress = async (): Promise<string | null> => {
  try {
    const networkInfo = await NetInfo.fetch();

    if (__DEV__) {
      // For Android Emulator
      if (
        Platform.OS === "android" &&
        networkInfo.type === NetInfoStateType.other
      ) {
        return "10.0.2.2";
      }

      // For iOS Simulator
      if (
        Platform.OS === "ios" &&
        networkInfo.type === NetInfoStateType.other
      ) {
        return "localhost";
      }

      // For physical devices, get the actual IP address
      if (networkInfo.details && "ipAddress" in networkInfo.details) {
        // Get the first three parts of the IP address
        const ipBase = (networkInfo.details as any).ipAddress
          .split(".")
          .slice(0, 3)
          .join(".");
        console.log("Device IP base:", ipBase);

        // Try to find the server by checking common development ports
        for (let i = 1; i < 255; i++) {
          try {
            const potentialIP = `${ipBase}.${i}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 100);

            try {
              const response = await fetch(
                `http://${potentialIP}:5000/health`,
                {
                  method: "GET",
                  signal: controller.signal,
                }
              );
              if (response.ok) {
                console.log("Found server at:", potentialIP);
                return potentialIP;
              }
            } finally {
              clearTimeout(timeoutId);
            }
          } catch (e) {
            // Ignore errors and continue searching
          }
        }

        console.warn(
          "Could not automatically detect server IP in network:",
          ipBase
        );
      }

      // If automatic detection fails, try environment variable
      const serverIp = process.env.EXPO_PUBLIC_SERVER_IP;
      if (serverIp) {
        console.log("Using server IP from environment variable:", serverIp);
        return serverIp;
      }

      // If all methods fail, throw an error with helpful message
      throw new Error(
        "Could not determine server IP. Please set EXPO_PUBLIC_SERVER_IP environment variable " +
          "with your computer's IP address where the Flask server is running."
      );
    }

    // Production URL
    return "your-production-domain.com";
  } catch (error) {
    console.error("Error getting IP address:", error);
    // Return null to indicate failure, letting the app handle the error appropriately
    return null;
  }
};
