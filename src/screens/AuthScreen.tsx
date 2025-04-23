import React, { useState } from "react";
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

interface FirebaseError {
  message: string;
}

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp(email, password, name);
        if (result.success) {
          Alert.alert(
            "Success",
            "Account created successfully! Please check your email for verification.",
            [
              {
                text: "OK",
                onPress: () => {
                  setIsSignUp(false);
                  setEmail("");
                  setPassword("");
                  setName("");
                },
              },
            ]
          );
        } else {
          Alert.alert("Error", result.message);
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          // The AuthProvider will automatically handle showing App.tsx
          // when the user state changes after successful sign in
          return;
        } else {
          Alert.alert("Error", result.message);
        }
      }
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      Alert.alert("Error", firebaseError.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to NutriScan</Text>
      <Text style={styles.subtitle}>
        {isSignUp ? "Create an account" : "Sign in to your account"}
      </Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => {
          setIsSignUp(!isSignUp);
          setEmail("");
          setPassword("");
          setName("");
        }}
      >
        <Text style={styles.switchText}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
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
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
});
