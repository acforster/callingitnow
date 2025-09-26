'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Filter from 'bad-words';

// Define the shape of our settings
interface Settings {
  showProfanity: boolean;
}

// Define the shape of our context
interface SettingsContextType {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
  filterText: (text: string) => string;
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Create the provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>({
    showProfanity: false, // Default to hiding profanity
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage when the component mounts
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        setSettingsState(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
    }
    setIsInitialized(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('userSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
    }
  }, [settings, isInitialized]);

  // Function to update settings
  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Profanity filter instance
  const profanityFilter = new Filter();

  // Function to filter text based on settings
  const filterText = (text: string) => {
    if (settings.showProfanity || !text) {
      return text;
    }
    return profanityFilter.clean(text);
  };

  const value = {
    settings,
    setSettings,
    filterText,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}