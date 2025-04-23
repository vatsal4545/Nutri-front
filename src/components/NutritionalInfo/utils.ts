export const getHealthDescription = (prediction: string): string => {
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

export const getHealthColor = (prediction: string): string => {
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

export const getEcoScoreColor = (score: string): string => {
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
