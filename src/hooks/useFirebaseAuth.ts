import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signIn } from 'next-auth/react';

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sign in with Google using NextAuth directly (no Firebase)
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting Google sign-in with NextAuth...");
      
      // Use NextAuth's signIn function directly with redirect
      await signIn('google', { 
        callbackUrl: '/dashboard'  // Force redirect to dashboard
      });
      
      // The page will redirect to Google and then back to our app
      // NextAuth will handle the redirect to dashboard
      
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error as Error);
      setLoading(false);
      throw error;
    }
  };

  // Sign out from both Firebase and NextAuth
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // NextAuth sign out will be handled by the UI through next-auth/react
      await signIn('signout', { redirect: true, callbackUrl: '/' });
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };
} 