import React from "react";
import { ImageBackground,StyleSheet,View,Text, Image,TextInput,Linking,Alert,TouchableOpacity,KeyboardAvoidingView,Platform,ScrollView} from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import CheckBox from "expo-checkbox";
import { useRouter } from "expo-router";

export default function Signin()  {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Email Validation Function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Check if email is entered and valid
  const isEmailEntered = email.trim() !== "";
  const isEmailValid = validateEmail(email);

  const handleBack = () => {
    router.back(); // Goes back to the previous screen
  };

  const handleSendPassword = () => {
    if (!isEmailValid) {
      Alert.alert("Invalid Email", "Must enter a validly formatted email.");
      return;
    }
    Alert.alert("Success", "If the email is registered, a reset link will be sent.");
    // Add the logic to handle password reset
  };

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          

          {/* Forgot Password Text */}
          <View style={styles.imageTextContainer}>
            <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} />
            <Text style={styles.signintxt}>Forgot Password </Text>
          </View>
          
          {/* Form Container */}
          <View style={styles.container}>
            {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
            <Text style={styles.first}>Enter your email to receive</Text>
            <Text style={styles.second}>your password.</Text>
            <Text style={styles.third}>If a valid user email is provided,</Text>
            <Text style={styles.fourth}>your password will be reset.</Text>

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
                  styles.getButton,
                  { backgroundColor: isEmailEntered && isEmailValid ? "#375894" : "#A3A3A3" },
                ]}
                onPress={handleSendPassword}
                disabled={!isEmailEntered || !isEmailValid} // Disable if email is not entered or invalid
              >
                <Text style={styles.GetText}>Send Password</Text>
              </TouchableOpacity>
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
    marginTop: -200,
  },
  imagestyle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: -20,
  },
  first: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 5,
    marginTop: -10,
  },
  second: {
    fontSize: 20,
    fontWeight: "400",
    marginTop: -15, 
  },
  third: {
    fontSize: 11,
    color: "#A3A3A3",
    marginTop: 10,
  },
  fourth: {
    color: "#A3A3A3",
    fontSize: 11,
    marginTop: -5,
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
    marginTop: -10,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 294,
    height: 250,
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
    marginTop: 30,
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
    top:-5,
    left: 10,
    padding: 10,
    borderRadius: 5,
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