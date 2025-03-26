import React from "react";
import { ImageBackground,StyleSheet,View,Text, Image,TextInput,Linking,Alert,TouchableOpacity,KeyboardAvoidingView,Platform,ScrollView, ActivityIndicator} from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
// import { ArrowLeft } from "lucide-react-native";
import { getDeviceID } from "../components/deviceInfo";
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { XMLParser } from "fast-xml-parser";


export default function ForgotPassword()  {
  const [email, setEmail] = useState("");
  const [deviceID, setDeviceID] = useState<string | null>(null);
  const router = useRouter();
  // JCM 03/27/2025: Added a state variable for enabling/disabling Send Password button
  const [sendPasswordIsLoading, setSendPasswordIsLoading] = useState(false);

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
     //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set setSendPasswordIsLoading state variable to "true" to disable the Send Password button
    setSendPasswordIsLoading(true);
    //----------------------------------------------------------------------------------------------


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

      //----------------------------------------------------------------------------------------------
      //JCM 03/27/2025: Set setSendPasswordIsLoading state variable to "false" to enable the Send Password button
      setSendPasswordIsLoading(false);
      //----------------------------------------------------------------------------------------------

    } catch (error) {
      console.error("Error during password reset:", error);
      Alert.alert("Error", "An error occurred while processing the request.");
    }
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>


          {/* Form Container */}
          <View style={styles.container}>
                      {/* Back Button */}
                      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              {/* <ArrowLeft color="#375894" size={20} /> */}
           <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          <View style={styles.imageTextContainer}>
            <Image source={require("../assets/logo.png")} style={styles.imagestyle} />
            <Text style={styles.signintxt}>Forgot </Text>
            <Text style={styles.signintxt1}> Password? </Text>
          </View>

            <Text style={styles.first}>Enter your email to receive your password</Text>
            {/* <Text style={styles.second}>your password.</Text> */}
            <Text style={styles.third}>If a valid user email is provided your password will be reset</Text>
            {/* <Text style={styles.fourth}>your password will be reset.</Text> */}

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
            {/*----------------------------------------------------------------------------------------------*/}
            {/*JCM - 03/26/2025 Added an activity indicator for button feedback */}
              <TouchableOpacity
                  style={[
                    styles.getButton,
                    { backgroundColor: isEmailEntered && isEmailValid ? "#375894" : "#A3A3A3" },
                  ]}
                  onPress={handleSendPassword}
                  disabled={!isEmailEntered || !isEmailValid || sendPasswordIsLoading} // Disable if email is not entered or invalid
                >

                  { sendPasswordIsLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.GetText}>Send Password</Text>
                  )}
              </TouchableOpacity>
            {/*----------------------------------------------------------------------------------------------*/}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageTextContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  imagestyle: {
    width: 250,
    height: 50,

    marginBottom: -40,
  },
  first: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 5,
    marginTop: -10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: "90%",
  },
  second: {
    fontSize: 20,
    fontWeight: "400",
    marginTop: -5, 
  },
  third: {
    fontSize: 11,
    color: "#A3A3A3",
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: "70%",
  },
  fourth: {
    color: "#A3A3A3",
    fontSize: 11,
    marginTop: 1,
    marginBottom: 20,

  },
  GetText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  bcontainer: {
    paddingTop: 10,
    width: 250,
    marginBottom: -20,
  },
  getButton: {
    backgroundColor: "#375894",
    alignItems: "center",
    borderRadius: 31,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  emailcontainer: {
    marginTop: 15,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 310,
    height: 450,
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    marginTop: -20,
  },
  signintxt: {
    fontSize: 36,
    fontWeight: "600",
    marginTop: 40,
    fontFamily: "DarkerGrotesque_600SemiBold",

  },
  signintxt1: {
    fontSize: 36,
    fontWeight: "600",
    marginTop: -10,
    fontFamily: "DarkerGrotesque_600SemiBold",

  },
  inputemail: {
    height: 40,
    backgroundColor: "#F1F5FC",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: 262,
  },
  backButton: { 
    position: "absolute",
    top: 5,
    left: 5,
    padding: 10,
    borderRadius: 5,
    flexDirection: "row", // Aligns icon and text horizontally
    alignItems: "center", // Vertically centers icon and text
    gap: 5, // Optional: Space between icon and text
  },
  
  backText: {
    color: "#375894",
    fontSize: 16,
  },
  flexContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});