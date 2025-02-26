import React, { useState, useEffect, useContext } from "react";
import { ImageBackground, StyleSheet, View, Text, Image, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Linking, Dimensions } from "react-native";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import constants from "expo-constants";
import { getDeviceID } from "../components/deviceInfo";
import { XMLParser } from "fast-xml-parser";
import * as Device from "expo-device";  // Import expo-device to get device info
// import * as SplashScreen from "expo-splash-screen";
// import { useFonts, DarkerGrotesque_600SemiBold } from "@expo-google-fonts/darker-grotesque";


export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedDemo, setHasCheckedDemo] = useState(false);



  // Use context and handle undefined fallback
  const { authCode, saveAuthCode } = useContext(AuthContext) || { authCode: null, saveAuthCode: () => {} };

  useEffect(() => {
    console.log("is Checked updated:", isChecked);
  }, [isChecked]);


    // useEffect(() => {
    //   const checkDemoStatus = async () => {
    //     if (hasCheckedDemo) return; // Avoid re-running
    
    //     const demoStatus = await AsyncStorage.getItem("status");
    //     if (demoStatus === "Demo" || demoStatus === "Active") {
    //       router.replace("/sign-in");
    //     }
    //     setHasCheckedDemo(true); // Mark as checked
    //   };
    
    //   checkDemoStatus();
    // }, [hasCheckedDemo]);
  
    useEffect(() => {
      const checkUserType = async () => {
        const userType = await AsyncStorage.getItem("UserType");
    
        if (!userType) {
          await AsyncStorage.setItem("UserType", "Staff"); // Default to "Staff" if not set
        }
      };
    
      checkUserType();
    }, []);
  
  

  const navigateToIndex = () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Must enter a validly formatted email.");
      return;
    }

    if (!isChecked) {
      Alert.alert("Terms & Privacy", "You must accept the Terms and Privacy Policy to proceed.");
      return;
    }

    // Proceed to the next step (e.g., sending email)
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = () => {
    router.push("/forgotpassword");
  };

  const navigateToCreateAccount = () => { 
    router.push("/createAccount"); // Adjust the path if your CreateAccount screen is in another folder
  };
  
  const navigateToTeamAccount = () => { 
    router.push("/teamMember"); // Adjust the path if your CreateAccount screen is in another folder
  };
  const navigateToMainAccountPage = () => {
    router.push("/mainAccountPage");
  };
  // Determine if the "Sign In" button should be enabled or disabled
  const isFormValid = email && password && isChecked && validateEmail(email);

  const handleSignIn = async () => {

    
    if (!email || !password) {
      Alert.alert("Validation Error", "Email and Password are required.");
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Password validation (adjust this validation as needed)
    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }

    // Check if Terms & Privacy is accepted
    if (!isChecked) {
      Alert.alert("Terms & Privacy", "You must accept the Terms and Privacy Policy to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      // Get basic device info using Platform and Constants
      const deviceType = Platform.OS; // 'ios' or 'android'
      const deviceVersion = Platform.Version; // OS version
      const screenHeight = Dimensions.get('window').height;
      const screenWidth = Dimensions.get('window').width;
      
      // Get device model from expo-device
      const deviceModel = Device.modelId; // Device model like "iPhone" or "Pixel"

      // Get device ID
      const { id: deviceID } = await getDeviceID();


      // Generate formatted date (MM/DD/YYYY-HH:mm)
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      const demoStatus = (await AsyncStorage.getItem("Demo")) || "Active";
      const userType = (await AsyncStorage.getItem("UserType")) || "Staff";
      // Generate Key using SHA1 (DeviceID + Date)
      const keyString = `${deviceID}${formattedDate}`;
      const key = CryptoJS.SHA1(keyString).toString();

      // Construct API URL
      const url = `https://prefpic.com/dev/PPService/AuthorizeUser.php?DeviceID=${encodeURIComponent(deviceID)}&DeviceType=${encodeURIComponent(deviceType)}&DeviceModel=${encodeURIComponent(deviceModel)}&DeviceVersion=${encodeURIComponent(deviceVersion)}&SoftwareVersion=1.0&Date=${formattedDate}&Key=${key}&Email=${encodeURIComponent(email)}&Password=${encodeURIComponent(password)}&PrefPicVersion=10&TestFlag=0&AuthCode=${encodeURIComponent(authCode || "")}`;
      console.log("Request URL:", url);

      // Call API
      const response = await fetch(url);
      const data = await response.text();
      console.log("🔹 API Response:", data);

      // Parse XML response
      const parser = new XMLParser();
      const result = parser.parse(data);
      const resultInfo = result?.ResultInfo;

      if (resultInfo?.Result === 'Success') {
        const authorizationCode = resultInfo?.Auth;
        await AsyncStorage.setItem("AUTH_CODE", authorizationCode || "");
        saveAuthCode(authorizationCode || "");

        const userDetails = await AsyncStorage.getItem('userDetails');
        const parsedUserDetails = userDetails ? JSON.parse(userDetails): null;

        router.push({
        pathname: "/mainAccountPage",
        params: {
          title: parsedUserDetails?.title,
          firstName: parsedUserDetails?.firstName,
          lastName: parsedUserDetails?.lastName,
          email: parsedUserDetails?.email,
          },
        });
      } else {
        Alert.alert("Authorization Failed", resultInfo?.Message || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Error during authorization:", error);
      Alert.alert("Authorization Failed", "An error occurred during authorization.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {/* Form Container */}
          <View style={styles.container}>
                      {/* Centered Image and Text */}

          <View style={styles.imageTextContainer}>
            <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} />
            <Text style={styles.signintxt}>Sign in</Text>
          </View>

            {/* Email and Password Inputs */}
            <TextInput
              style={styles.inputemail}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.inputpass}
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Terms and Privacy Policy */}
            <View style={styles.checkboxContainer}>
              <CheckBox value={isChecked} onValueChange={setChecked} />
              <Text>I accept</Text>
              <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/terms.html")}>
                 Terms
              </Text>
              <Text> and </Text>
              <Text style={styles.link} onPress={() => Linking.openURL("https://prefpic.com/privacypolicy.html")}>
                Privacy Policy
              </Text>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.getButton, { backgroundColor: isFormValid ? "#375894" : "#A3A3A3" }]} 
              onPress={handleSignIn}
              disabled={!isFormValid}
            >
              <Text style={styles.GetText}>Sign in</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.fpassword}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity onPress={navigateToCreateAccount}>
              <Text style={styles.caccount}>Create an account</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={navigateToTeamAccount}>
              <Text style={styles.caccount}>Team</Text>
            </TouchableOpacity> */}

          </View>
          


        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70
  },
  imageTextContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  imagestyle: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  signintxt: {
    fontSize: 36,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 15,
    fontFamily: "DarkerGrotesque_600SemiBold",



  },
  GetText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  fpassword: {
    color: "#888888",
    textDecorationLine: "underline",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  caccount: {
    color: "#888888",
    textDecorationLine: "underline",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10
  },
  getButton: {
    backgroundColor: "#A3A3A3", // Initially disabled color
    borderRadius: 31,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    justifyContent: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: 294,
    height: 470,
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40
  },
  inputemail: {
    height: 40,
    backgroundColor: "#F1F5FC",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  inputpass: {
    height: 37,
    backgroundColor: "#F1F5FC",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 10,
  },
});
