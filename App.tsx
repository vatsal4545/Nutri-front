import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppContent from "./src/App";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
