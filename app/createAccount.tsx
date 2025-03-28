import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  SafeAreaView,
  ActivityIndicator
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
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(
    null
  );
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isContinueEnabled, setIsContinueEnabled] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const firstNameRef = useRef<TextInput | null>(null);
  const lastNameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const roleRef = useRef<TextInput | null>(null);
  const specialtyRef = useRef<TextInput | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  //   const [activeField, setActiveField] = useState<React.RefObject<TextInput> | null>(null);
  const [activeField, setActiveField] = useState<React.RefObject<
    TextInput | View
  > | null>(null);

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
    "Surgical Staff": [
      "Anesthesia",
      "OR Nurse/Circulator",
      "Surgical “Scrub” Tech",
      "Sterile Processing Tech",
      "Pre-Op Nurse",
      "PACU Nurse",
      "Front Desk Receptionist",
      "Administration",
      "Equipment/Implant Rep",
      "Imaging Technician",
      "Perfusionist",
      "Neurophysiology/ EP Tech",
    ],
  };

  useEffect(() => {
    const fetchAuthorizationCode = async () => {
      try {
        console.log("Fetching authorization code from AsyncStorage...");
        const code = await AsyncStorage.getItem("authorizationCode");
        if (code) {
          console.log("Fetched authorization code:", code); // Debugging statement
          setAuthorizationCode(code);
        } else {
          console.log("No authorization code found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching authorization code:", error);
      }
    };
    fetchAuthorizationCode();
  }, []);

  // Fix the error when accessing specialties
  //   const specialtyOptions = specialties[role] || []; // Ensure it returns an empty array if role is not valid
  // const specialtyOptions = specialties[role as keyof typeof specialties] || [];
  const specialtyOptions =
    specialties[form.role as keyof typeof specialties] || [];

  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, "");

    // Limit input to 10 digits
    if (numericText.length <= 10) {
      handleInputChange("phone", numericText); // Update the form state

      // Validate length
      if (numericText.length === 10) {
        setPhoneError(""); // Clear error when valid
      } else {
        setPhoneError("Phone number must be exactly 10 digits");
      }
    }
  };

  const handleRoleSelection = (
    selectedRole: "Physician" | "Surgical Staff"
  ) => {
    Keyboard.dismiss();
    setForm((prev) => ({
      ...prev,
      role: selectedRole,
      specialty: "",
    }));
    handleFocus(roleRef);
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
    return /^[\w-.]+@[\w-]+\.[a-z]{1,}$/.test(email);
  };

  // const handleFocus = (inputRef: React.RefObject<TextInput | View>) => {
  //   setActiveField(inputRef);
  //   setTimeout(() => {
  //     scrollViewRef.current?.scrollTo({ y: 100, animated: true });
  //   }, 300);
  // };

  const handleFocus = (inputRef: React.RefObject<TextInput | View>) => {
    setActiveField(inputRef);
    setTimeout(() => {
      inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
      });
    }, 300);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    handleBlur();
  };

  const handleCreateAccount = async () => {
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set setIsContinueEnabled state variable to "true" to disable the Continue button
    setIsContinueEnabled(true);
    //----------------------------------------------------------------------------------------------

    if (!isValidEmail(form.email)) {
      Alert.alert("Invalid Email", "Must enter a validly formatted email.");
      return;
    }
    if (!deviceID) {
      Alert.alert("Device ID Error", "Unable to retrieve device ID.");
      return;
    }

    // JMF 03-10-2025
    // If the user selected "Surgical Staff", redirect to enterTeamMember page
    // if (form.role === "Surgical Staff") {
    //   // Save user details before redirecting
    //   await AsyncStorage.setItem('userDetails', JSON.stringify({
    //     title: form.title,
    //     firstName: form.firstName,
    //     lastName: form.lastName,
    //     email: form.email,
    //   }));
    //   router.push("enterTeamMember");
    //   return; // Stop execution here to prevent the account creation API call
    // }

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(currentDate.getDate()).padStart(
      2,
      "0"
    )}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(
      2,
      "0"
    )}:${String(currentDate.getMinutes()).padStart(2, "0")}`;

    const newdevice = "";
    const newdate = "";
    const keyString = `${deviceID.id}${formattedDate}`;
    const key = CryptoJS.SHA1(keyString).toString();

    const url = `https://PrefPic.com/dev/PPService/CreateAccount.php?DeviceID=${encodeURIComponent(
      deviceID.id
    )}&DeviceType=${encodeURIComponent(
      deviceID.type
    )}&DeviceModel=${encodeURIComponent(
      deviceID.model
    )}&DeviceVersion=${encodeURIComponent(
      deviceID.version
    )}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&First=${encodeURIComponent(
      form.firstName
    )}&Last=${encodeURIComponent(form.lastName)}&Title=${encodeURIComponent(
      form.title
    )}&Email=${encodeURIComponent(form.email)}&Phone=${encodeURIComponent(
      form.phone
    )}&Password=${encodeURIComponent(form.password)}&Type=${
      form.role
    }&Specialty=${encodeURIComponent(
      form.specialty
    )}&PrefPicVersion=1&TestFlag=1`;

    console.log("Requesting account creation:", url);

    try {
      const response = await fetch(url);
      const data = await response.text();
      console.log("API Response:", data);

      if (data.includes("<Result>Success</Result>")) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify({
            title: form.title, //MG 02/26/2025
            firstName: form.firstName, //save to async storage for display in main account screen
            lastName: form.lastName,
            email: form.email,
            role: form.role, // ✅ ADDED: JM 03-25-2025
          })
        );

        //=======================================================================================================
        // ✅ ADDED: JM 03-25-2025
        // Store the correct role
        await AsyncStorage.setItem("UserType", form.role);

        Alert.alert("Success", "A confirmation email has been sent to you.", [
          {
            text: "OK",
            onPress: async () => {
              // JMF 03-10-2025 -- // RHCM 03/18/2025 modified
              if (form.role === "Surgical Staff") {
                // Save user details before redirecting
                await AsyncStorage.setItem(
                  "userDetails",
                  JSON.stringify({
                    title: form.title,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    role: form.role, // ✅ ADDED: JM 03-25-2025
                  })
                );
                router.push("enterTeamMember");
              } else {
                router.push("sign-in");
              }

            //----------------------------------------------------------------------------------------------
            //JCM 03/27/2025: Set setIsContinueEnabled state variable to "false" to disable the Continue button
              setIsContinueEnabled(false);
            //----------------------------------------------------------------------------------------------
            },
          },
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
    //  jm_branch
    // edited: JM 2025/03/07*
    <ImageBackground
      source={require("../assets/Start.jpg")}
      style={styles.background}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/*edited: JM 2025/03/07*/}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {/*-------------*/}
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollcontainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                <Text style={styles.header}>Create Account</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={form.title}
                  onChangeText={(text) => handleInputChange("title", text)}
                />

                <TextInput
                  ref={firstNameRef}
                  style={[
                    styles.input,
                    activeField === firstNameRef ? styles.activeInput : {},
                  ]}
                  multiline
                  placeholder="First Name"
                  value={form.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                  onFocus={() => handleFocus(firstNameRef)}
                  onBlur={handleBlur}
                  returnKeyType="done"
                />
                <TextInput
                  ref={lastNameRef}
                  style={[
                    styles.input,
                    activeField === lastNameRef ? styles.activeInput : {},
                  ]}
                  multiline
                  placeholder="Last Name"
                  value={form.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                  onFocus={() => handleFocus(lastNameRef)}
                  onBlur={handleBlur}
                  returnKeyType="done"
                />

                {phoneError ? (
                  <Text style={{ color: "red", marginBottom: 5 }}>
                    {phoneError}
                  </Text>
                ) : null}

                <TextInput
                  ref={phoneRef}
                  style={[
                    styles.input,
                    activeField === phoneRef ? styles.activeInput : {},
                    phoneError ? { borderColor: "red", borderWidth: 1 } : {},
                  ]}
                  multiline
                  placeholder="Phone Number"
                  value={form.phone}
                  keyboardType="phone-pad"
                  onChangeText={handlePhoneChange}
                  onFocus={() => handleFocus(phoneRef)}
                  onBlur={handleBlur}
                  returnKeyType="done"
                />

                <TextInput
                  ref={emailRef}
                  style={[
                    styles.input,
                    activeField === emailRef ? styles.activeInput : {},
                  ]}
                  multiline
                  placeholder="Email"
                  value={form.email}
                  keyboardType="email-address"
                  onChangeText={(text) => handleInputChange("email", text)}
                  onFocus={() => handleFocus(emailRef)}
                  onBlur={handleBlur}
                  returnKeyType="done"
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordRef}
                    style={[
                      styles.input,
                      activeField === passwordRef ? styles.activeInput : {},
                    ]}
                    placeholder="Password"
                    secureTextEntry={!showPassword} // This will now work
                    value={form.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    onFocus={() => handleFocus(passwordRef)}
                    onBlur={handleBlur}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>

                {/* <View style={styles.checkboxContainer}>

    <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        
            <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollcontainer}>
            <View style={styles.formContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color="#375894" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                    <Text style={styles.header}>Create Account</Text>
                    
                        <TextInput style={styles.input} placeholder="Title" value={form.title}    onChangeText={(text) => handleInputChange("title", text)} />
                        
                        <TextInput
                            ref={firstNameRef}
                            style={[styles.input, activeField === firstNameRef ? styles.activeInput : {}]}
                            multiline
                            placeholder="First Name"
                            value={form.firstName}
                            onChangeText={(text) => handleInputChange("firstName", text)}
                            onFocus={() => handleFocus(firstNameRef)}
                            onBlur={handleBlur}
                            returnKeyType="done"
                            />
                        <TextInput
                            ref={lastNameRef}
                            style={[styles.input, activeField === lastNameRef ? styles.activeInput : {}]}
                            multiline
                            placeholder="Last Name"
                            value={form.lastName}
                            onChangeText={(text) => handleInputChange("lastName", text)}
                            onFocus={() => handleFocus(lastNameRef)}
                            onBlur={handleBlur}
                            returnKeyType="done"
                            />
                        
                              {phoneError ? <Text style={{ color: "red", marginBottom: 5 }}>{phoneError}</Text> : null}

                              <TextInput
                                  ref={phoneRef}
                                  style={[
                                      styles.input, 
                                      activeField === phoneRef ? styles.activeInput : {},
                                      phoneError ? { borderColor: "red", borderWidth: 1 } : {}
                                  ]}
                                  multiline
                                  placeholder="Phone Number"
                                  value={form.phone}
                                  keyboardType="phone-pad"
                                  onChangeText={handlePhoneChange}
                                  onFocus={() => handleFocus(phoneRef)}
                                  onBlur={handleBlur}
                                  returnKeyType="done"
                              />
                          
                        <TextInput
                            ref={emailRef}
                            style={[styles.input, activeField === emailRef ? styles.activeInput : {}]}
                            multiline
                            placeholder="Email"
                            value={form.email}
                            keyboardType="email-address"
                            onChangeText={(text) => handleInputChange("email", text)}
                            onFocus={() => handleFocus(emailRef)}
                            onBlur={handleBlur}
                            returnKeyType="done"
                            />
                <View style={styles.passwordContainer}>
                    <TextInput
                        ref={passwordRef}
                        style={[styles.input, activeField === passwordRef ? styles.activeInput : {}]}
                        placeholder="Password"
                        secureTextEntry={!showPassword} // This will now work
                        value={form.password}
                        onChangeText={(text) => handleInputChange("password", text)}
                        onFocus={() => handleFocus(passwordRef)}
                        onBlur={handleBlur}
                        returnKeyType="done"
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

                    <View style={styles.checkboxOption2}>
                        <Checkbox
                        status={form.role === "Surgical Staff" ? "checked" : "unchecked"}
                        onPress={() => handleRoleSelection("Surgical Staff")}
                        />
                        <Text>Staff</Text>
                    </View>
// jm_branch
                </View> */}

                {/*edited: JM 2025/03/07*/}
                {/* Role Selection */}
                <View style={styles.checkboxContainer}>
                  <Text style={styles.label}>Select Role:</Text>
                  <View style={styles.checkboxOptions}>
                    <View style={styles.checkboxOption}>
                      <View style={styles.checkboxWrapper}>
                        <Checkbox
                          status={
                            form.role === "Physician" ? "checked" : "unchecked"
                          }
                          onPress={() => handleInputChange("role", "Physician")}
                        />
                      </View>
                      <Text style={styles.checkboxText}>Physician</Text>
                    </View>

                    <View style={styles.checkboxOption}>
                      <View style={styles.checkboxWrapper}>
                        <Checkbox
                          status={
                            form.role === "Surgical Staff"
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() =>
                            handleInputChange("role", "Surgical Staff")
                          }
                        />
                      </View>
                      <Text style={styles.checkboxText}>Staff</Text>
                    </View>
                  </View>
                </View>

                {/* {form.role && (
                <Picker selectedValue={form.specialty} onValueChange={(value) => handleInputChange("specialty", value)} style={styles.picker}>
                    {specialties[form.role].map((spec) => (
                    <Picker.Item key={spec} label={spec} value={spec} />
                    ))}
                </Picker>
                )} */}
                {/* <!-- jm_branch --> */}
                {/* <View ref={specialtyRef} style={styles.picker}>


                    <Picker
                        selectedValue={form.specialty}
                        onValueChange={(itemValue) => {
                        handleInputChange("specialty", itemValue);
                        handleFocus(specialtyRef);
                        }}
                    >
                        <Picker.Item label="Select Specialty" value="" />
                        {specialtyOptions.map((spec, index) => (
                        <Picker.Item key={index} label={spec} value={spec} />
                        ))}
                    </Picker>
//  jm_branch
                </View> */}

                {/*edited: JM 2025/03/07*/}
                <View ref={specialtyRef} style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.specialty}
                    onValueChange={(itemValue) => {
                      handleInputChange("specialty", itemValue);
                      handleFocus(specialtyRef);
                    }}
                    style={styles.picker} // Applying the new picker styles
                    itemStyle={styles.pickerItem} // Applying item styles inside Picker (iOS only)
                  >
                    <Picker.Item label="Select Specialty" value="" />
                    {specialtyOptions.map((spec, index) => (
                      <Picker.Item key={index} label={spec} value={spec} />
                    ))}
                  </Picker>
                </View>

                {/*----------------------------------------------------------------------------------------------*/}
                {/*JCM - 03/26/2025 Added an activity indicator and updated the code for button feedback.*/}
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    form.specialty.trim() === "" && styles.disabledButton,
                  ]}
                  // , !isContinueEnabled && styles.disabledButton
                  onPress={handleCreateAccount}
                  disabled={form.specialty.trim() === "" || isContinueEnabled} // Uses `isContinueEnabled` instead of calling `isFormValid()`
                >

                  { isContinueEnabled ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.continueText}> Continue </Text>
                  )}
                  {/* <Text style={styles.continueText}>Continue</Text> */}
                </TouchableOpacity>
                {/*----------------------------------------------------------------------------------------------*/}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>

    // <!--             </ImageBackground>
    //       </TouchableWithoutFeedback>
    //     </KeyboardAvoidingView>
    //     </SafeAreaView> -->
  );
};

const styles = StyleSheet.create({
  background: {
    //  jm_branch
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneContainer: {
    marginBottom: 16,
    position: "relative",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // Gray color for disabled button
  },
  activeInput: {
    borderColor: "#007AFF",
    backgroundColor: "#e6f0ff",
  },
  // backButton: {
  //   flexDirection: "row",
  //   alignSelf: "flex-start",
  //   // marginBottom: 10
  // },

  // edited: JM 2025/03/07
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    // left: 10,
    zIndex: 50,
  },
  // edited: JM 2025/03/07
  backText: {
    paddingLeft: 8,
    color: "#375894",
    fontSize: 16,
  },

  // edited: JM 2025/03/07
  scrollcontainer: {
    // flexGrow: 1,
    // padding: 20,
    // marginTop: 100,
    // backgroundColor: "#fff",
    // container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E3F6FC", padding: 20 },
    // backButton: { flexDirection: "row", alignSelf: "flex-start", marginBottom: 10 },
    // backText: { marginLeft: 5, fontSize: 16, color: '#375894' },
    // formContainer: { width: "90%", backgroundColor: "white", borderRadius: 25, alignItems: "center"},
    // header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    // input: { width: "100%", padding: 12, backgroundColor: "#F5F5F5", borderRadius: 10, marginBottom: 10 },
    // checkboxContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 10 },
    // checkboxOption: { flexDirection: "row", alignItems: "center", marginRight: 5},
    // checkboxOption2: { flexDirection: "row", alignItems: "center", marginRight: 50 },
    // selectText: { fontWeight: "bold", marginRight: 10, fontSize: 12, },
    // note: { textAlign: "center", fontSize: 12, color: "gray", marginBottom: 20 },
    // continueButton: { backgroundColor: "#375894", padding: 10, borderRadius: 25, width: "100%", alignItems: "center" },
    // continueText: { color: "white", fontSize: 18, fontWeight: "bold" },
    // passwordContainer: {
    // flexDirection: "row",
    // alignItems: "center",
    // width: "100%",
    // paddingHorizontal: 10,
    // paddingVertical: 12,
    // backgroundColor: "#F5F5F5",
    // borderRadius: 10,
    // marginBottom: 10,
    // justifyContent: "space-between",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  // added: JM 2025/03/07
  formContainer: {
    width: "95%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  // added: JM 2025/03/07
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderColor: "#000",
    marginBottom: 10,
  },
  // edited: JM 2025/03/07
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 10,
    // paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  // edited: JM 2025/03/07
  eyeIcon: {
    position: "absolute",
    right: 5,
    top: -2,
    padding: 10,
  },
  // added: JM 2025/03/07
  label: {
    marginRight: 10,
  },
  // added: JM 2025/03/07
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center", // Center align items vertically
    marginBottom: 10,
  },
  // edited: JM 2025/03/07
  checkboxOptions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  // added: JM 2025/03/07
  checkboxWrapper: {
    borderColor: "#808080",
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  // added: JM 2025/03/07
  checkboxText: {
    marginLeft: 5,
  },
  // edited: JM 2025/03/07
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  continueButton: {
    backgroundColor: "#375894",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // added: JM 2025/03/07
  pickerContainer: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    overflow: "hidden", // Optional: To ensure corners are rounded
  },
  // edited: JM 2025/03/07
  picker: {
    // width: "100%",
    // backgroundColor: "#F5F5F5",
    // borderRadius: 10,
    // padding: 12,
    // marginBottom: 10,
    height: 150,
  },
  // added: JM 2025/03/07
  pickerItem: {
    height: 150, // Set height for items in the picker (only applies to iOS)
    fontSize: 16,
    color: "#333",
  },
  // <!--
  //         flex: 1,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //       },
  //       phoneContainer: {
  //         marginBottom: 16, // Space between fields
  //         position: "relative", // For precise placement of error text
  //     },
  //       disabledButton: {
  //         backgroundColor: "#A9A9A9", // Gray color for disabled button
  //       },
  //       activeInput: {
  //         borderColor: "#007AFF",
  //         backgroundColor: "#e6f0ff",
  //       },
  //       scrollcontainer: {  flexGrow: 1,
  //         padding: 20,
  //         marginTop: 100,
  //         backgroundColor: "#fff", },
  //   container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E3F6FC", padding: 20 },
  //   backButton: { flexDirection: "row", alignSelf: "flex-start", marginBottom: 10 },
  //   backText: { marginLeft: 5, fontSize: 16, color: '#375894' },
  //   formContainer: { width: "90%", backgroundColor: "white", borderRadius: 25, alignItems: "center"},
  //   header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  //   input: { width: "100%", padding: 12, backgroundColor: "#F5F5F5", borderRadius: 10, marginBottom: 10 },
  //   checkboxContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 10 },
  //   checkboxOption: { flexDirection: "row", alignItems: "center", marginRight: 5},
  //   checkboxOption2: { flexDirection: "row", alignItems: "center", marginRight: 50 },
  //   selectText: { fontWeight: "bold", marginRight: 10, fontSize: 12, },
  //   note: { textAlign: "center", fontSize: 12, color: "gray", marginBottom: 20 },
  //   continueButton: { backgroundColor: "#375894", padding: 10, borderRadius: 25, width: "100%", alignItems: "center" },
  //   continueText: { color: "white", fontSize: 18, fontWeight: "bold" },
  //   passwordContainer: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     width: "100%",
  //     paddingHorizontal: 10,
  //     paddingVertical: 12,
  //     backgroundColor: "#F5F5F5",
  //     borderRadius: 10,
  //     marginBottom: 10,
  //     justifyContent: "space-between",
  //   },
  //   eyeIcon: {
  //     position: "absolute",
  //     right: 15,
  //     padding: 10,
  //   },
  //   picker: {
  //     width: "100%",
  //     backgroundColor: "#F5F5F5",
  //     borderRadius: 10,
  //     padding: 12,
  //     marginBottom: 10,
  //   },
  //  master -->
});

export default CreateAccount;
