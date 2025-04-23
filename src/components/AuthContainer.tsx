import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";

export const AuthContainer: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [redirectEmail, setRedirectEmail] = useState("");

  const handleSignUpSuccess = (email: string) => {
    setRedirectEmail(email);
    setIsSignIn(true);
  };

  const handleToggleMode = () => {
    setIsSignIn(!isSignIn);
    setRedirectEmail(""); // Clear redirect email when switching modes
  };

  return (
    <View style={styles.container}>
      {isSignIn ? (
        <SignInScreen
          onToggleMode={handleToggleMode}
          initialEmail={redirectEmail}
        />
      ) : (
        <SignUpScreen
          onSignUpSuccess={handleSignUpSuccess}
          onToggleMode={handleToggleMode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
});
