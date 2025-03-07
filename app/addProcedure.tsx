// Add_1.tsx page
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

const AddProcedure: React.FC = () => {
  // State variable to store the procedure name
const [procedureName, setProcedureName] = useState('');
const router =  useRouter();

  // RJP - > 2/7/2025
 // Function to navigate to the "camera" screen with procedureName as a parameter
const navigateToReviewImage = () => {
  router.push({
    pathname: "camera", // Navigating to the "camera" route
    params: { procedureName }, // Passing procedureName as a parameter 
  });
  
};



  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add Procedure</Text>
      <Text style={styles.subtitle}>Enter the name of the procedure</Text>
      <Text style={styles.subtitle1}>to be added</Text>

      <TextInput
        placeholder="Procedure Name"
        style={styles.input}
        value={procedureName}
        onChangeText={setProcedureName}
      />
      <TouchableOpacity style={styles.nextButton} onPress={navigateToReviewImage}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddProcedure;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
    width: 58,
    height: 27,
    marginLeft: 20,
    marginTop: -23.5,
    marginRight: 25, //added MLI 02/28/2025 for ui purposes
  }, 
  backButton: {
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', //added MLI 02/28/2025 for ui purposes
  },
  title: {
    color: "#000000",
    fontSize: 40,
    fontWeight: "600",
    marginTop: 106,
    marginLeft: 60,
    maxHeight: 42,
    maxWidth: 248,
  },
  subtitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "400",
    marginTop: 30,
    marginLeft: 50,
    maxHeight: 42,
    maxWidth: 320,
  },
  subtitle1: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "400",
    marginTop: 0,
    marginLeft: 130,
    maxHeight: 42,
    maxWidth: 320,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    marginTop: 35,
  },
  nextButton: {
    backgroundColor: "#375894",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
