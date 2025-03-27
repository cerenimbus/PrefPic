import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/bottomNav";

export default function CompleteDemo() {
  const router = useRouter();

  // JCM 03/27/2025: Added a state variable 
  const [createAccountIsLoading, setCreateAccountIsLoading] = useState(false);

  useEffect(() => {
    // Set the status to true so the user won't go through the demo again
    const markDemoAsCompleted = async () => {
      try {
        await AsyncStorage.setItem("status", "Active");
        console.log("✅ Demo marked as complete");
      } catch (error) {
        console.error("Error saving demo status:", error);
      }
    };
    markDemoAsCompleted();
  }, []);


  const handleCreateAccount = async () => {
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set setIsLoading state variable to "true" to disable the Create Account button
    setCreateAccountIsLoading(true);
    //----------------------------------------------------------------------------------------------

    await AsyncStorage.setItem("isSurgicalStaff", "false");

    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Added a delay navigation until the state update completes.
    setTimeout(() => {
      router.push("/createAccount"); // Navigate to CreateAccount screen
    
      //JCM 03/27/2025: Set setIsLoading state variable to "false" to enable the Create Account button
      setCreateAccountIsLoading(false);
      //----------------------------------------------------------------------------------------------
    }, 1000);
    //----------------------------------------------------------------------------------------------
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <View style={styles.container}>
        {/* Placeholder for profile image */}
        <Image  source={require("../assets/logo.png")} style = {(styles.profileImage)} />
        <Text style={styles.title}>Demo Complete!</Text>

        <Text style={styles.description}>
          Use the <Text style={styles.boldText}>feedback button</Text> on the bottom right of the menu for questions, comments, or suggestions.
        </Text>

        <Text style={styles.description}>
          Tap below to create an account on the <Text style={styles.boldText}>live app</Text> (and lower your blood pressure).
        </Text>

        {/*----------------------------------------------------------------------------------------------*/}
        {/*JCM - 03/26/2025 Added an activity indicator for button feedback */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCreateAccount}
          disabled = {createAccountIsLoading}
        >
          {createAccountIsLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
        {/*----------------------------------------------------------------------------------------------*/}
      </View>
      <BottomNavigation />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: 320,
    elevation: 5, // For shadow effect on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 200,
    height: 50,

    marginBottom: 15,

  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#375894",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});