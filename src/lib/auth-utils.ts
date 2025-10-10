"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  subscriptionType: string;
  subscriptionExpires?: string;
}

export function useCodeAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user session
    const userSession = localStorage.getItem("userSession");
    if (!userSession) {
      router.push("/auth/code-login");
      return;
    }

    try {
      const userData = JSON.parse(userSession);
      
      // Check if subscription is still valid
      if (userData.subscriptionType === "monthly" && userData.subscriptionExpires) {
        const expirationDate = new Date(userData.subscriptionExpires);
        if (new Date() > expirationDate) {
          // Subscription expired, clear session and redirect to login
          localStorage.removeItem("userSession");
          router.push("/auth/code-login");
          return;
        }
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user session:", error);
      localStorage.removeItem("userSession");
      router.push("/auth/code-login");
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("userSession");
    router.push("/auth/code-login");
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("userSession", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return { user, isLoading, logout, updateUser };
}
