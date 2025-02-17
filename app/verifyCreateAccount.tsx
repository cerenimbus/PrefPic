import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const VerifyCreateAccount = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    email: "",
    acceptTerms: false,
    physician: false,
    surgicalStaff: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Placeholder for API integration
    console.log("Form submitted", form);
  };

  return (
    <View style={styles.container}>
        <View style={styles.subContainer}>
      <View style={styles.avatar} />
      <Text style={styles.header}>Create Account</Text>
      <TextInput style={styles.input} placeholder="First Name" onChangeText={(text) => handleInputChange("firstName", text)} />
      <TextInput style={styles.input} placeholder="Last Name" onChangeText={(text) => handleInputChange("lastName", text)} />
      <TextInput style={styles.input} placeholder="Title" onChangeText={(text) => handleInputChange("title", text)} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" onChangeText={(text) => handleInputChange("phone", text)} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" onChangeText={(text) => handleInputChange("email", text)} />
      
      <View style={styles.checkboxContainer}>
        <Switch value={form.acceptTerms} onValueChange={(value) => handleInputChange("acceptTerms", value)} />
        <Text>Accept Terms and Privacy Policy</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch value={form.physician} onValueChange={(value) => handleInputChange("physician", value)} />
        <Text>Physician</Text>
        <Switch value={form.surgicalStaff} onValueChange={(value) => handleInputChange("surgicalStaff", value)} />
        <Text>Surgical Staff</Text>
      </View>

      <View style={styles.checkboxContainer}>
       
      </View>

      <Text style={styles.note}>
        You will receive a link in your email and a verification code will be texted to your phone. Carrier rates may apply.
      </Text>
        <View style = {styles.bottomButton}>
            <Text style={styles.bottomButtonText}>Proceed to verify</Text>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
               
                <Feather name="arrow-right" size={20} color="black" />
            </TouchableOpacity>
        </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, flex: 1 },
  subContainer: { alignItems: "center", padding: 20, backgroundColor: "#E3F6FC", flex: 1, },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#ccc", marginBottom: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: 375, padding: 10, backgroundColor: "#fff",shadowColor: 'black', borderRadius: 25, marginBottom: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginBottom: 10 },
  note: { textAlign: "center", fontSize: 12, color: "gray", marginBottom: 20 },
  button: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffff", padding: 15, borderRadius: 15 },
  buttonText: { color: "black", fontWeight: "bold", marginRight: 10 },
  bottomButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#E3F6FC", padding: 15, borderRadius: 5 },
  bottomButtonText: { color: "#636060", marginRight: 10, fontSize: 24  },
});

export default VerifyCreateAccount;