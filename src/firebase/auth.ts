import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./config";
import { fetchWithRetry } from "../config";

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Store user in PostgreSQL database
    await fetchWithRetry("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
      }),
    });

    return {
      success: true,
      message:
        "Successfully signed up! Please check your email for verification.",
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to sign up",
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        message: "Please verify your email before signing in.",
      };
    }

    return {
      success: true,
      message: "Successfully signed in!",
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to sign in",
    };
  }
};

export const logOut = async (): Promise<AuthResponse> => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: "Successfully logged out",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to log out",
    };
  }
};
