import React, { useState, useCallback } from "react";
import { SignInScreen } from "./SignInScreen";
import { SignUpScreen } from "./SignUpScreen";

export const AuthContainer: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [redirectEmail, setRedirectEmail] = useState("");

  const handleSignUpSuccess = useCallback((email: string) => {
    setRedirectEmail(email);
    setIsSignIn(true);
  }, []);

  const handleToggleMode = useCallback(() => {
    setIsSignIn((prevIsSignIn) => !prevIsSignIn);
    setRedirectEmail("");
  }, []);

  if (isSignIn) {
    return (
      <SignInScreen
        onToggleMode={handleToggleMode}
        initialEmail={redirectEmail}
      />
    );
  }

  return (
    <SignUpScreen
      onSignUpSuccess={handleSignUpSuccess}
      onToggleMode={handleToggleMode}
    />
  );
};
