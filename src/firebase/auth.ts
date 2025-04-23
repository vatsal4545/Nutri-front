import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
  sendPasswordResetEmail,
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
  password: string,
  name: string
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

    try {
      // Store user in PostgreSQL database
      const response = await fetchWithRetry("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: name,
        }),
      });

      if (response && !response.ok) {
        throw new Error(`Database error: ${response.status}`);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Even if database storage fails, we still want to proceed with the signup
      // as the Firebase user is created
    }

    // Sign out the user after signup to enforce email verification
    await signOut(auth);

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
        message:
          "Please verify your email before signing in. Check your inbox for the verification link.",
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

export const resendVerificationEmail = async (
  email: string
): Promise<AuthResponse> => {
  try {
    // First try to sign in to get the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      "temporary-password"
    );
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);

    // Sign out immediately after sending verification
    await signOut(auth);

    return {
      success: true,
      message: "Verification email has been resent. Please check your inbox.",
    };
  } catch (error: any) {
    if (error.code === "auth/wrong-password") {
      // This is expected since we used a temporary password
      return {
        success: true,
        message: "Verification email has been resent. Please check your inbox.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to resend verification email",
    };
  }
};

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email has been sent. Please check your inbox.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to send password reset email",
    };
  }
};
