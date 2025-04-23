import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

interface SignInScreenProps {
  onToggleMode: () => void;
  initialEmail?: string;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onToggleMode,
  initialEmail = "",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { signIn, resendVerificationEmail, resetPassword } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialEmail) {
      // Small delay to ensure the email is set before focusing
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialEmail]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.message);
        if (result.message.includes("verify your email")) {
          setShowResendVerification(true);
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        Alert.alert("Success", result.message);
        setShowResendVerification(false);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert("Success", result.message);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        ref={passwordInputRef}
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {showResendVerification && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResendVerification}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            Resend Verification Email
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={onToggleMode}
        disabled={loading}
      >
        <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "tomato",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "tomato",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "tomato",
    fontSize: 14,
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: "tomato",
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  messageContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  successMessage: {
    color: "green",
    textAlign: "center",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
  },
});
