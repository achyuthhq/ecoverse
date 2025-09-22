"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { FirebaseProvider } from "@/context/FirebaseContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <SessionProvider>
      <FirebaseProvider>
        {children}
      </FirebaseProvider>
    </SessionProvider>
  );
};

export default AuthProvider; 