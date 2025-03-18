import { useRouter } from "expo-router";
import React, { useState, useEffect, useContext } from "react";
import CheckBox from "expo-checkbox";
import { Image, ImageBackground, View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CryptoJS from "crypto-js"; // SHA-1 hashing
import { AuthContext } from "./AuthContext"; // Import AuthContext
import { XMLParser } from "fast-xml-parser";
import { getDeviceID } from "../components/deviceInfo"; // Import getDeviceID function
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function StartScreen() {
  const [isChecked, setChecked] = useState(false);
  const [isChecked1, setChecked1] = useState(false);
  const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
  const router = useRouter();
  const { saveAuthCode } = useContext(AuthContext) ?? {};
  const [hasCheckedDemo, setHasCheckedDemo] = useState(false);

  // Fetch the unique device ID dynamically
  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  // Check if user already completed the demo
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const checkDemoStatus = async () => {
  //       if (hasCheckedDemo) return; // Avoid redundant checks

  //       const demoStatus = await AsyncStorage.getItem("status");
  //       if (demoStatus === "Demo" || demoStatus === "Active") {
  //         router.replace("/sign-in"); // Redirect if demo is done
  //       }
  //       setHasCheckedDemo(true); // Mark as checked
  //     };

  //     checkDemoStatus();
  //   }, [hasCheckedDemo])
  // );

  const handleGetStarted = async () => {
    try {
      if (!deviceID) {
        Alert.alert("Device ID Error", "Unable to retrieve device ID.");
        return;
      }

      // Generate formatted date (MM/DD/YYYY-HH:mm)
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(
        currentDate.getDate()
      ).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(
        currentDate.getMinutes()
      ).padStart(2, '0')}`;

      const demoStatus = (await AsyncStorage.getItem("Demo")) || "Active";
      const userType = (await AsyncStorage.getItem("UserType")) || "Staff";

      // Generate Key using SHA1 (DeviceID + Date)
      const keyString = `${deviceID.id}${formattedDate}`;
      const key = CryptoJS.SHA1(keyString).toString();

      // Construct API URL
      const url = `https://PrefPic.com/dev/PPService/AuthorizeDevice.php?DeviceID=${encodeURIComponent(
        deviceID.id  
      )}&Date=${formattedDate}&Key=${key}&PrefPicVersion=1`;

      console.log("API Request URL:", url);

      // Call API
      const response = await fetch(url);
      const data = await response.text();
      console.log("🔹 API Response:", data);

      // Parse XML Response
      const parser = new XMLParser();
      const result = parser.parse(data);
      const resultInfo = result?.ResultInfo;

      if (resultInfo) {
        const resultCode = resultInfo.Result;
        const message = resultInfo.Message;

        if (resultCode === "Success") {
          const authorizationCode = resultInfo.Auth;

          // Store Authorization Code in AsyncStorage
          await AsyncStorage.setItem("authorizationCode", authorizationCode);

          console.log("Authorization Code Stored:", authorizationCode);

          // Navigate to Library.tsx
          router.push("/library");
        } else {
          Alert.alert("Authorization Failed", message || "An unknown error occurred");
        }
      } else {
        Alert.alert("Authorization Failed", "The server response was not in the expected format.");
      }
    } catch (error) {
      console.error("Error during authorization:", error);
      Alert.alert("Authorization Failed", "An error occurred during authorization.");
    }
  };

  useEffect(() => {
    console.log("is Checked updated:", isChecked);
    console.log("is Checked1 updated:", isChecked1);
  }, [isChecked,isChecked1]);

  const navigateToIndex = () => {
    if (!isChecked) {
      AsyncStorage.setItem("isSurgicalStaff", "true");
      Alert.alert("Terms & Privacy", "You must accept the Terms and Privacy Policy to proceed.");
      return;
    }
    if (!isChecked1) {
      Alert.alert("PII Agreement", "You must agree not to enter any patient’s Personally Identifiable Information or pictures to proceed.");
      return;
    }
    handleGetStarted(); // Call API when "Get Started" is clicked
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background} >
      <SafeAreaView style={{ flex: .7 }}>
      <View style={styles.container}>
        <View style= {styles.imagestyle1}>
        <Image source={require("../assets/logo.png")} style={styles.imagestyle}/>
        </View>

      <View style={styles.mainDescription}>
        <Text style={styles.pref}>PrefPic Demo</Text>
        <Text style={styles.description}>There is no sign-in required for this demo version. The live version is password protected. </Text>
        </View>

        <View style={styles.checkboxContainer1}>
            <View style={styles.checkboxContainer}>
                <CheckBox
                  value={isChecked}
                  onValueChange={(newValue) => {
                    setChecked(newValue);
                  }}
                />
                <Text style = {styles.text}>I accept</Text>
                <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/terms.html")}>
                  Terms
                </Text>
                <Text style = {styles.and}> and </Text>
                <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/privacypolicy.html")}>
                  Privacy Policy
                </Text>
            </View>
            <View style={styles.checkboxContainer}>
                  <CheckBox value={isChecked1} onValueChange={setChecked1} />
                  <Text style={styles.text}>I will not enter any patient’s Personally Identifiable Information or pictures</Text>
                </View>
        </View>

        {/* Button */}
        <View style={styles.bcontainer}>
          <TouchableOpacity
            style={[styles.getButton, { opacity: isChecked && isChecked1 ? 1 : 0.5 }]}
            onPress={navigateToIndex}
            disabled={!isChecked || !isChecked1}
          >
            <Text style={styles.GetText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      <Text style={styles.footerText}>© 2025 Symphatic LLC, All Rights Reserved</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp(85),
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: wp(5),
    alignItems: "center",
    minHeight: hp(52), // Ensure space for the button
    justifyContent: "space-between", // Prevent overflow
  },
  getButton: {
    backgroundColor: "#375894",
    alignItems: "center",
    borderRadius: 31,
    paddingVertical: 10,
    width: "100%", // Ensure it stays within the container
    maxWidth: 250,
    marginBottom: 20,
  },
  mainDescription:{
    paddingTop: 5,
  },
  checkboxContainer1: {
    marginVertical: 40,
    marginHorizontal: 40,
    gap: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    left: 5,
    color: "#7C7C7C",
  },
  link: {
    paddingHorizontal: 5,
    color: "blue",
    textDecorationLine: "underline",
  },
  GetText: {
    color: "white",
    fontSize: 18,
    alignItems: "center",
    paddingVertical: 5,
  },
  pref: {
    fontSize: 35,
    paddingTop: 20,
    lineHeight: 33,
    fontWeight: "600",
    textAlign: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
    paddingTop: 20,
    paddingLeft: 44,
    paddingRight: 44,
  },
  bcontainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Ensures proper button placement
  },
  imagestyle: {
    width: 240,
    height: 70,
  },
  imagestyle1: {
    paddingTop: 15,
  },
  and:{ 
    color: "#7C7C7C",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: -130
  },
});
