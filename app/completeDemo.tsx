import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/bottomNav";

export default function CompleteDemo() {
  const router = useRouter();

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
    await AsyncStorage.setItem("isSurgicalStaff", "false");
    router.push("/createAccount"); // Navigate to CreateAccount screen
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <View style={styles.container}>
        {/* Placeholder for profile image */}
        <Image  style={styles.profileImage} />
        {/* source={require("../assets/profile_placeholder.png")} */}
        <Text style={styles.title}>Demo Complete!</Text>

        <Text style={styles.description}>
          Use the <Text style={styles.boldText}>feedback button</Text> on the bottom right of the menu for questions, comments, or suggestions.
        </Text>

        <Text style={styles.description}>
          Tap below to create an account on the <Text style={styles.boldText}>live app</Text> (and lower your blood pressure).
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: "#ccc",
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