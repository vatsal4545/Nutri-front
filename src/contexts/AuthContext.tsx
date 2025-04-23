import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  signUp,
  signIn,
  logOut,
  resendVerificationEmail,
  resetPassword,
} from "../firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<any>;
  resendVerificationEmail: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const verificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(
        "Auth state changed - User:",
        user?.email,
        "Verified:",
        user?.emailVerified
      );

      if (user) {
        setUser(user);
        setIsVerified(user.emailVerified);

        // Only start verification check if not verified
        if (!user.emailVerified && !verificationIntervalRef.current) {
          console.log(
            "Starting verification check interval for user:",
            user.email
          );
          verificationIntervalRef.current = setInterval(async () => {
            try {
              await user.reload();
              const updatedUser = auth.currentUser;
              if (updatedUser?.emailVerified) {
                console.log("Email verified! Updating state...");
                setIsVerified(true);
                if (verificationIntervalRef.current) {
                  clearInterval(verificationIntervalRef.current);
                  verificationIntervalRef.current = null;
                }
              }
            } catch (error) {
              console.error("Error checking verification status:", error);
            }
          }, 5000); // Check every 5 seconds
        }
      } else {
        setUser(null);
        setIsVerified(false);
        if (verificationIntervalRef.current) {
          clearInterval(verificationIntervalRef.current);
          verificationIntervalRef.current = null;
        }
      }

      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
        verificationIntervalRef.current = null;
      }
    };
  }, []);

  const value = {
    user,
    loading,
    isVerified,
    signUp,
    signIn,
    logOut,
    resendVerificationEmail,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
