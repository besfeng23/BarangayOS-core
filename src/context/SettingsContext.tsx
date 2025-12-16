
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface BarangayIdentity {
  barangayName: string;
  municipality: string;
  province: string;
  punongBarangay: string;
  logoUrl?: string;
}

interface SettingsContextType {
  settings: BarangayIdentity | null;
  loading: boolean;
  updateSettings: (newSettings: Partial<BarangayIdentity>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Hardcoded barangayId for V1
const BARANGAY_ID = "TEST-BARANGAY-1"; 
const settingsDocRef = doc(db, `barangays/${BARANGAY_ID}/config/identity`);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<BarangayIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(settingsDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as BarangayIdentity);
        } else {
          // If no settings exist, create a default one
          const defaultSettings: BarangayIdentity = {
            barangayName: 'Barangay',
            municipality: 'Municipality',
            province: 'Province',
            punongBarangay: 'Punong Barangay',
            logoUrl: 'https://picsum.photos/seed/seal/100',
          };
          setDoc(settingsDocRef, defaultSettings);
          setSettings(defaultSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<BarangayIdentity>) => {
    if (!settings) throw new Error("Settings not loaded yet.");
    await setDoc(settingsDocRef, newSettings, { merge: true });
    // The onSnapshot listener will update the state automatically
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
