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
  


  
//  // Check if user already completed the demo
//  useFocusEffect(
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

useEffect(() => {
  const checkUserType = async () => {
    const userType = await AsyncStorage.getItem("UserType");

    if (!userType) {
      await AsyncStorage.setItem("UserType", "Staff"); // Default to "Staff" if not set
    }
  };

  checkUserType();
}, []);


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
  }, [isChecked]);

  const navigateToIndex = () => {
    if (!isChecked) {
      AsyncStorage.setItem("isSurgicalStaff", "true");
      Alert.alert("Terms & Privacy", "You must accept the Terms and Privacy Policy to proceed.");
      return;
    }
    handleGetStarted(); // Call API when "Get Started" is clicked
  };


//   const navigateToCreateAccount = () => {
//     router.push('createAccount');
// };

  return (
    
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background} >
      <SafeAreaView style={{ flex: .7 }}>
      <View style={[styles.container]}>
        <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} resizeMode="contain"/>

        <Text style={styles.pref}>PrefPic Demo</Text>
        <Text style={styles.description}>There is no sign-in required for </Text>
        <Text style= {styles.description1}> this demo version. The live </Text>
        <Text style = {styles.description2}>version is password protected. </Text>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isChecked}
            onValueChange={(newValue) => {
              setChecked(newValue);
            }}
          />
          <Text>I accept</Text>
          <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/terms.html")}>
            Terms
          </Text>
          <Text> and </Text>
          <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/privacypolicy.html")}>
            Privacy Policy
          </Text>
        </View>

        {/* Button */}
        <View style={styles.bcontainer}>
          <TouchableOpacity
            style={[styles.getButton, { opacity: isChecked ? 1 : 0.5 }]}
            onPress={navigateToIndex}
            disabled={!isChecked} // Prevents clicking when unchecked
          >
            <Text style={styles.GetText}>Get Started</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.getButton, { opacity: isChecked ? 1 : 0.5 }]}
            onPress={navigateToCreateAccount}
            disabled={!isChecked} // Prevents clicking when unchecked
          >
            <Text style={styles.GetText}>Create Account</Text>
          </TouchableOpacity> */}
      
        </View>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
  },
  pref: {
    fontSize: 30,
    paddingTop: 30,
    lineHeight: 33,
    fontWeight: "600",
    paddingLeft: 45,
    paddingRight: 45,
  },
  container: {
    width: wp(85),
    backgroundColor: "#E7EFFF",
    borderRadius: 10,
    padding: wp(5),
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
    paddingTop: 60,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
    paddingTop: 20,
    paddingLeft: 44,
    paddingRight: 44,
  },
  description1: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
    paddingTop: 5,
    paddingLeft: 44,
    paddingRight: 44,
  },
  description2: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
    paddingTop: 5,
    paddingLeft: 44,
    paddingRight: 44,
  },
  bcontainer: {
    width: 250,
    paddingTop: 50,
  },
  imagestyle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    paddingTop: 61,
    overflow: "hidden"
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
