import { useRouter } from "expo-router";
import React, { useState, useEffect, useContext } from "react";
import CheckBox from "expo-checkbox";
import { Image, ImageBackground, View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Dimensions, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CryptoJS from "crypto-js"; // SHA-1 hashing
import { AuthContext } from "./AuthContext"; // Import AuthContext
import { XMLParser } from "fast-xml-parser";
import { getDeviceID } from "../components/deviceInfo"; // Import getDeviceID function
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleGetStarted = async () => {
    try {
      if (!deviceID) {
        Alert.alert("Device ID Error", "Unable to retrieve device ID.");
        return;
      }

      // Generate formatted date (MM/DD/YYYY-HH:mm)
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

      const demoStatus = (await AsyncStorage.getItem("Demo")) || "Active";
      const userType = (await AsyncStorage.getItem("UserType")) || "Staff";

      // Generate Key using SHA1 (DeviceID + Date)
      const keyString = `${deviceID.id}${formattedDate}`;
      const key = CryptoJS.SHA1(keyString).toString();

      // Construct API URL
      const url = `https://PrefPic.com/dev/PPService/AuthorizeDevice.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&PrefPicVersion=1`;

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

  const { width, height } = Dimensions.get('window'); // Get screen dimensions

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background} >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={[styles.container, { width: width * 0.85, minHeight: height * 0.5 }]}> {/* Adjust container size based on screen dimensions */}
            <View style= {[styles.imagestyle1]}>
              <Image source={require("../assets/logo.png")} style={styles.imagestyle}/>
            </View>

            <View style={styles.mainDescription}>
              <Text style={styles.pref}>PrefPic Demo</Text>
              <Text style={styles.description}>There is no sign-in required for this demo version. The live version is password protected. </Text>
            </View>
            {/* Checkbox */}
            <View style={styles.checkboxContainer1}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={isChecked}
                  onValueChange={(newValue) => {
                    setChecked(newValue);
                  }}
                />
                <Text style = {styles.iaccept}>I accept</Text>
                <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/terms.html")}>
                  Terms
                </Text>
                <Text style = {styles.and}> and </Text>
                <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/privacypolicy.html")}>
                  Privacy Policy
                </Text>
              </View>
              <View style={styles.checkboxContainer2}>
                <CheckBox value={isChecked1} onValueChange={setChecked1} />
                <Text style={styles.ptext}>I will not enter any patient’s Personally Identifiable Information or pictures</Text>
              </View>
            </View>

            {/* Button */}
            <View style={styles.bcontainer}>
              <TouchableOpacity
                style={[styles.getButton, { opacity: isChecked && isChecked1 ? 1 : 0.5 }]}
                onPress={navigateToIndex}
                disabled={!isChecked || !isChecked1} // Prevents clicking when unchecked
              >
                <Text style={styles.GetText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Text style={styles.footerText}>© 2025 Symphatic LLC, All Rights Reserved</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainDescription:{
    paddingTop: 5,
  },
  checkboxContainer1: {
    paddingTop: 40,
  },
  GetText: {
    color: "white",
    fontSize: 15,
    alignItems: "center",
  },
  getButton: {
    backgroundColor: "#375894",
    alignItems: "center",
    borderRadius: 31,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    width: 250,
    marginBottom: 20,
  },
  pref: {
    fontSize: 35,
    paddingTop: 20,
    lineHeight: 33,
    fontWeight: "600",
    textAlign: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
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
    paddingTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imagestyle: {
    width: 240,
    height: 70,
  },
  imagestyle1: {
    paddingTop: 15,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
  checkboxContainer2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingLeft: 28,
  },
  ptext: {
    paddingTop: 5,
    paddingRight: 5,
    color: "#7C7C7C",
  },
  iaccept:{
    color: "#7C7C7C",
  },
  and:{ 
    color: "#7C7C7C",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});