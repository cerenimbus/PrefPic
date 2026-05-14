import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import LoadingAnimation from "../components/LoadingAnimation"; // Updated path to match repo


export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, []);

  return (
    <ImageBackground  source={require("../assets/splash-icon.png")} style={styles.background}>
      <View style={styles.overlay}>
        <LoadingAnimation message="Loading..." size="large" color="#fff" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light gray background color
  },
  background: {
    flex: 1, // Make the background image cover the entire screen
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  overlay: {
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent dark background
    padding: 20, // Add padding around the overlay content
    borderRadius: 10, // Rounded corners
  },
});
