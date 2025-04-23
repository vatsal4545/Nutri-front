import React from "react";
import { AuthContainer } from "./components/AuthContainer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainApp from "./MainApp";

// Inner component that uses the auth context
const AppContent: React.FC = () => {
  const { user, isVerified } = useAuth();

  // Show auth screens if no user or email not verified
  if (!user || !isVerified) {
    // Log state for debugging
    console.log(
      `AppContent: Rendering AuthContainer (User: ${
        user ? user.uid : "null"
      }, Verified: ${isVerified})`
    );
    return <AuthContainer />;
  }

  // Show main app content only for verified users
  console.log(
    `AppContent: Rendering MainApp (User: ${user.uid}, Verified: ${isVerified})`
  );
  return <MainApp />;
};

// Main App component wraps everything with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
