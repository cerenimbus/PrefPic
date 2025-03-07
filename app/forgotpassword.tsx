import React from "react";
import { ImageBackground,StyleSheet,View,Text, Image,TextInput,Linking,Alert,TouchableOpacity,KeyboardAvoidingView,Platform,ScrollView} from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
// import { ArrowLeft } from "lucide-react-native";
import { getDeviceID } from "../components/deviceInfo";
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { XMLParser } from "fast-xml-parser";
import { Feather } from "@expo/vector-icons";
import {SafeAreaView} from "react-native";

export default function ForgotPassword()  {
  const [email, setEmail] = useState("");
  const [deviceID, setDeviceID] = useState<string | null>(null);
  const router = useRouter();

  // Email Validation Function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Check if email is entered and valid
  const isEmailEntered = email.trim() !== "";
  const isEmailValid = validateEmail(email);

  const handleBack = () => {
    router.back(); // Goes back to the previous screen
  };

  useEffect(() => {
    // Get device ID when the component mounts
    const fetchDeviceID = async () => {
      const { id } = await getDeviceID(); // Destructure to get 'id' directly
      setDeviceID(id); // Set 'id' which is a string
    };
    fetchDeviceID();
  }, []);
  

  const handleSendPassword = async () => {
    if (!isEmailValid) {
      Alert.alert("Invalid Email", "Must enter a validly formatted email.");
      return;
    }

    if (!deviceID) {
      Alert.alert("Device Error", "Unable to retrieve device information.");
      return;
    }

    try {
      // Get Authorization Code from AsyncStorage
      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Authorization code not found. Please sign in again.");
        return;
      }

      // Generate formatted date (MM/DD/YYYY-HH:mm)
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

      // Generate Key using SHA1 (DeviceID + Date + AuthorizationCode)
      const keyString = `${deviceID}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      // Construct API URL
      const url = `https://PrefPic.com/dev/PPService/ForgotPassword.php?DeviceID=${encodeURIComponent(
        deviceID
      )}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&Email=${encodeURIComponent(
        email
      )}&PrefPicVersion=1`;

      // Call the API
      const response = await fetch(url);
      const data = await response.text();
      console.log("🔹 API Response:", data);
  
      // Parse XML response
      const parser = new XMLParser();
      const result = parser.parse(data);
      const resultInfo = result?.ResultInfo;

      if (resultInfo) {
        const resultCode = resultInfo.Result;
        const message = resultInfo.Message;

        if (resultCode === "Success") {
          Alert.alert("Success", message || "A password reset link has been sent to your email.");
        } else {
          Alert.alert("Failed", message || "An unknown error occurred.");
        }
      } else {
        Alert.alert("Error", "The server response was not in the expected format.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      Alert.alert("Error", "An error occurred while processing the request.");
    }
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      {/* Added: JM 2025/03/07 */}
      <SafeAreaView style={{ flex: 1 }}>
        {/* Edited: JM 2025/03/07 */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={24} color="#375894" />
            <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          
          {/* Form Container */}
          <View style={styles.container}>
                      {/* Back Button */}
           
          <View style={styles.imageTextContainer}>
            <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} />
            <Text style={styles.forgottxt}>Forgot {"\n"} Password?</Text>
          </View>

           {/* Edited: JM 2025/03/07 */}
            <Text style={styles.first}>Enter your email to receive {"\n"} your password.</Text>
            {/* Edited: JM 2025/03/07 */}
            <Text style={styles.third}>If a valid user email is provided, {"\n"} your password will be reset.</Text>

            {/* Email Input */}
            <View style={styles.emailcontainer}>
              <TextInput
                style={styles.inputemail}
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Send Password Button */}
            <View style={styles.bcontainer}>
            <TouchableOpacity
                style={[
                  styles.sendpass,
                  { backgroundColor: isEmailEntered && isEmailValid ? "#375894" : "#A3A3A3" },
                ]}
                onPress={handleSendPassword}
                disabled={!isEmailEntered || !isEmailValid} // Disable if email is not entered or invalid
              >
                <Text style={styles.sendtext}>Send Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageTextContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: -20,
  },
  imagestyle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: -40,
  },
  // Edited: JM 2025/03/07
  first: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
  },
  // Edited: JM 2025/03/07
  third: {
    fontSize: 16,
    color: "#A3A3A3",
    marginTop: 10,
    textAlign: "center",
  },
  bcontainer: {
    paddingTop: 10,
    width: 250,
    marginBottom: -20,
  },
  // Edited: JM 2025/03/07
  sendpass: {
    backgroundColor: "#375894",
    alignItems: "center",
    borderRadius: 31,
    padding: 15,
  },
  // Edited: JM 2025/03/07
  sendtext: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  // Edited: JM 2025/03/07
  emailcontainer: {
    marginTop: 15,
    width: "100%",
  },
  // Edited: JM 2025/03/07
  inputemail: {
    height: 40,
    backgroundColor: "#F1F5FC",
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Edited: JM 2025/03/07
  container: {
    width: 294,
    height: 420,
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    // marginTop: -20,
  },
  // Edited: JM 2025/03/07
  forgottxt: {
    fontSize: 36,
    fontWeight: "600",
    marginTop: 50,
    fontFamily: "DarkerGrotesque_600SemiBold",
    textAlign: "center",
  },
  // Edited: JM 2025/03/07
  backButton: { 
    top: 20,
    zIndex: 50,
    flexDirection: "row", 
    left: -30,
  },
  // Edited: JM 2025/03/07
  backText: {
    color: "#375894",
    fontSize: 25,
  },
  flexContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});