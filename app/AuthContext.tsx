  import React, { createContext, useState, useEffect } from "react";
  import AsyncStorage from "@react-native-async-storage/async-storage";

  // Define the type for AuthContext
  interface AuthContextType {
    authCode: string | null;
    saveAuthCode: (code: string) => Promise<void>;
  }

  // Create the Auth Context
  export const AuthContext = createContext<AuthContextType | undefined>(undefined);

  // AuthProvider component
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authCode, setAuthCode] = useState<string | null>(null);

    // Load stored auth code on app start
    useEffect(() => {
      const loadAuthCode = async () => {
        try {
          const storedCode = await AsyncStorage.getItem("AUTH_CODE");
          if (storedCode) {
            setAuthCode(storedCode);
          }
        } catch (error) {
          console.error("Error loading auth code:", error);
        }
      };
      loadAuthCode();
    }, []);

    // Save auth code to AsyncStorage and state
    const saveAuthCode = async (code: string) => {
      try {
        await AsyncStorage.setItem("AUTH_CODE", code);
        setAuthCode(code);
      } catch (error) {
        console.error("Error saving auth code:", error);
      }
    };

    return (
      <AuthContext.Provider value={{ authCode, saveAuthCode }}>
        {children}
      </AuthContext.Provider>
    );
  };
