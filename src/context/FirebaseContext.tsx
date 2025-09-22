'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { User as FirebaseUser } from 'firebase/auth';

interface FirebaseContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  
  return (
    <FirebaseContext.Provider value={auth}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  
  return context;
} 