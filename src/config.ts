import { Platform, Alert } from "react-native";
import { getLocalIpAddress } from "./utils/networkUtils";

// Get the appropriate API URL based on the platform and environment
const getApiUrl = async () => {
  if (__DEV__) {
    const host = await getLocalIpAddress();
    if (!host) {
      Alert.alert(
        "Connection Error",
        "Could not connect to server. Please make sure the Flask server is running and accessible."
      );
      throw new Error("Server IP not found");
    }
    console.log("Using development configuration with IP:", host);
    return `http://${host}:5000`;
  }

  // Production configuration
  const productionUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!productionUrl) {
    console.warn(
      "Production API URL not configured. Please set EXPO_PUBLIC_API_URL environment variable."
    );
    throw new Error("Production API URL not configured");
  }
  console.log("Using production configuration:", productionUrl);
  return productionUrl;
};

// Initialize the API URL
let apiUrl = "";
getApiUrl().then((url) => {
  apiUrl = url;
  console.log("API URL configured as:", apiUrl);
});

export const getFullApiUrl = async () => {
  if (!apiUrl) {
    apiUrl = await getApiUrl();
  }
  return apiUrl;
};

// Add timeout and retry logic for API calls
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 5000
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
};

// Helper function for API calls with retry logic
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3
) => {
  const baseUrl = await getFullApiUrl();
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(fullUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait for 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
