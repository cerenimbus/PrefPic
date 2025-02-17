import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getDeviceID } from "../components/deviceInfo";


const CreateAccount = () => {
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    specialty: "",
  });
  
  const isFormValid = () => {
    return (
      form.title.trim() !== "" &&
      form.firstName.trim() !== "" &&
      form.lastName.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.email.trim() !== "" &&
      form.password.trim() !== "" &&
      form.role.trim() !== "" &&
      form.specialty.trim() !== "" &&
      isValidEmail(form.email) // Ensure valid email format
    );
  };
  

  const [deviceID, setDeviceID] = useState<{
    softwareVersion: string | number | boolean;
    id: string;
    type: string;
    model: string;
    version: string;
  } | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isContinueEnabled, setIsContinueEnabled] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
//   const [role, setRole] = useState<string>(""); // Ensure role is properly initialized
//   const [specialty, setSpecialty] = useState<string>(""); 

  useEffect(() => {
  
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
      fetchDeviceID();
    }, []);

  const specialties: Record<string, string[]> = {
    Physician: [
      "Anesthesiology/Pain Management",
      "Cardiothoracic Surgery",
      "Colorectal Surgery",
      "Dermatology",
      "Gastroenterology",
      "General Surgery",
      "Gynecologic Surgery/Reproductive Endocrinology",
      "Interventional Radiology",
      "Neurosurgery",
      "Ophthalmic Surgery",
      "Oral and Maxillofacial Surgery",
      "Orthopedic Surgery",
      "Otolaryngology (ENT Surgery)",
      "Pediatric Surgery",
      "Plastic and Reconstructive Surgery",
      "Podiatry",
      "Pulmonology",
      "Reproductive Endocrinology",
      "Urology",
      "Vascular Surgery",
    ],
    "Surgical Staff": ["Charge Nurse", "OR Nurse"],
  };
  
  // Fix the error when accessing specialties
//   const specialtyOptions = specialties[role] || []; // Ensure it returns an empty array if role is not valid
// const specialtyOptions = specialties[role as keyof typeof specialties] || [];
const specialtyOptions = specialties[form.role as keyof typeof specialties] || [];

const handleRoleSelection = (selectedRole: "Physician" | "Surgical Staff") => {
    setForm((prev) => ({
      ...prev,
      role: selectedRole,
      specialty: "", // Reset specialty when role changes
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateForm();
  };

  const validateForm = () => {
    
    console.log("form not valid");
    setIsContinueEnabled(isFormValid());
  };

  const isValidEmail = (email: string) => {
    return /^[\w-.]+@[\w-]+\.[a-z]{2,}$/.test(email);
  };

  const handleCreateAccount = async () => {
    if (!isValidEmail(form.email)) {
      Alert.alert("Invalid Email", "Must enter a validly formatted email.");
      return;
    }
    if (!deviceID)
    {
        Alert.alert("Device ID Error", "Unable to retrieve device ID.");
        return;
    }

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(
      currentDate.getDate()
    ).padStart(2, "0")}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}`;

    const keyString = `${deviceID}${formattedDate}`;
    const key = CryptoJS.SHA1(keyString).toString();

    const url = `https://PrefPic.com/dev/PPService/CreateAccount.php?DeviceID=${encodeURIComponent(
      deviceID.id
    )}&DeviceType=${deviceID.type}&DeviceModel=${deviceID.model}&DeviceVersion=${deviceID.version}&Date=${formattedDate}&Key=${key}&First=${encodeURIComponent(
      form.firstName
    )}&Last=${encodeURIComponent(form.lastName)}&Title=${encodeURIComponent(
      form.title
    )}&Email=${encodeURIComponent(form.email)}&Phone=${encodeURIComponent(
      form.phone
    )}&Password=${encodeURIComponent(form.password)}&Type=${form.role}&Specialty=${encodeURIComponent(
      form.specialty
    )}&PrefPicVersion=1&TestFlag=1`;

    console.log("URL: ", url)
    try {
      const response = await fetch(url);
      const data = await response.text();
      console.log("API Response:", data);

      if (data.includes("<Result>Success</Result>")) {
        Alert.alert("Success", "A confirmation email has been sent to you.", [
          { text: "OK", onPress: () => router.push("/signin") },
        ]);
      } else {
        Alert.alert("Error", "Failed to create account.");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "An error occurred during account creation.");
    }
  };

  

  return (
    <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#375894" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Create Account</Text>

        <TextInput style={styles.input} placeholder="Title" value={form.title}    onChangeText={(text) => handleInputChange("title", text)} />
        <TextInput style={styles.input} placeholder="First Name" value={form.firstName}  onChangeText={(text) => handleInputChange("firstName", text)} />
        <TextInput style={styles.input} placeholder="Last Name" value={form.lastName} onChangeText={(text) => handleInputChange("lastName", text)} />
        <TextInput style={styles.input} placeholder="Phone Number" value={form.phone} keyboardType="phone-pad" onChangeText={(text) => handleInputChange("phone", text)} />
        <TextInput style={styles.input} placeholder="Email" value={form.email} keyboardType="email-address" onChangeText={(text) => handleInputChange("email", text)} />

        <View style={styles.passwordContainer}>
        <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            onChangeText={(text) => handleInputChange("password", text)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="gray" />
        </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
            <Text style={styles.selectText}>Select Role:</Text>

            <View style={styles.checkboxOption}>
                <Checkbox
                status={form.role === "Physician" ? "checked" : "unchecked"}
                onPress={() => handleRoleSelection("Physician")}
                />
                <Text>Physician</Text>
            </View>

            <View style={styles.checkboxOption}>
                <Checkbox
                status={form.role === "Surgical Staff" ? "checked" : "unchecked"}
                onPress={() => handleRoleSelection("Surgical Staff")}
                />
                <Text>Surgical Staff</Text>
            </View>
        </View>

        {/* {form.role && (
          <Picker selectedValue={form.specialty} onValueChange={(value) => handleInputChange("specialty", value)} style={styles.picker}>
            {specialties[form.role].map((spec) => (
              <Picker.Item key={spec} label={spec} value={spec} />
            ))}
          </Picker>
        )} */}
        <View style={styles.picker}>
            <Picker
                selectedValue={form.specialty}
                onValueChange={(itemValue) => handleInputChange("specialty", itemValue)}
            >
                <Picker.Item label="Select Specialty" value="" />
                    {specialtyOptions.map((spec, index) => (
                <Picker.Item key={index} label={spec} value={spec} />
                ))}
            </Picker>
        </View>

        <TouchableOpacity
            style={[styles.continueButton, !isContinueEnabled && styles.disabledButton]}
            onPress={handleCreateAccount}
            disabled={!isContinueEnabled} // Uses `isContinueEnabled` instead of calling `isFormValid()`
            >
            <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    background: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
      },
      disabledButton: {
        backgroundColor: "#A9A9A9", // Gray color for disabled button
      },
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E3F6FC", padding: 20 },
  backButton: { flexDirection: "row", alignSelf: "flex-start", marginBottom: 10 },
  backText: { marginLeft: 5, fontSize: 16, color: '#375894' },
  formContainer: { width: "90%", backgroundColor: "white", padding: 20, borderRadius: 25, alignItems: "center", marginTop: -150 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 12, backgroundColor: "#F5F5F5", borderRadius: 10, marginBottom: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 10, },
  checkboxOption: { flexDirection: "row", alignItems: "center", },
  selectText: { fontWeight: "bold", marginRight: 10 },
  note: { textAlign: "center", fontSize: 12, color: "gray", marginBottom: 20 },
  continueButton: { backgroundColor: "#375894", padding: 10, borderRadius: 25, width: "100%", alignItems: "center" },
  continueText: { color: "white", fontSize: 18, fontWeight: "bold" },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
  },
  picker: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
});

export default CreateAccount;
