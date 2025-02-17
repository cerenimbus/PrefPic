// Add_1.tsx page
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from "expo-device"; //
//import DeviceInfo from "react-native-device-info";//
import {getDeviceID} from "../components/deviceInfo";

const AddProcedure: React.FC = () => {
    // State variable to store the procedure name
  const [procedureName, setProcedureName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //const [isAuthorized, setIsAuthorized] = useState(false);
  const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
  //const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

  useEffect(() => {
    const checkStoredValues = async () => {
      try {
        const storedDeviceID = await AsyncStorage.getItem('deviceID');
        const storedAuthCode = await AsyncStorage.getItem('authorizationCode');
        
        console.log('Stored Device ID:', storedDeviceID);
        console.log('Stored Auth Code:', storedAuthCode);
      } catch (error) {
        console.error('Error checking stored values:', error);
      }
    };
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    }
    // const getDeviceID = async () => {
    //   try {
    //     const uniqueID = Device.osInternalBuildId || Device.modelId || "UnknownDevice";
    //     // Save deviceID as an object with id property
    //     await AsyncStorage.setItem('deviceID', uniqueID);
    //     console.log("Device ID saved:", uniqueID);
    //   } catch (error) {
    //     console.error("Error saving device ID:", error);
    //   }
    // };
    checkStoredValues();
    fetchDeviceID();
    //getDeviceID();
  }, []);

  const createProcedure = async () => {
    try {
      //const deviceID = await AsyncStorage.getItem('deviceID');
      const authorizationCode = await AsyncStorage.getItem('authorizationCode');
      
      if (!deviceID || !authorizationCode) {
        Alert.alert('Error', 'Device information or authorization code not found');
        return false;
      }
      
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();
      
      //Construct API URL
      const url = `https://PrefPic.com/dev/PPService/CreateProcedure.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1&Name=${encodeURIComponent(procedureName)}`;
      
      console.log('API Request URL:', url);
      
      //Call API
      const response = await fetch(url);
      const data = await response.text();
      console.log('API Response:', data);
      
      //Parse XML Response
      //const parser = new XMLParser();
      const parser = new XMLParser({
        ignoreAttributes: false, //
        parseAttributeValue: false, //
        parseTagValue: false, //
        trimValues: true, //
        textNodeName: "_text" //
      });
      const result = parser.parse(data);
      const resultInfo = result?.ResultInfo;
      
      if (resultInfo) {
        const resultCode = resultInfo.Result;
        const message = resultInfo.Message;
        const procedureSerial = resultInfo.ProcedureSerial;
        
        console.log('Result Code:', resultCode);
        console.log('Message:', message);
        console.log('Procedure Serial:', procedureSerial);
        
        if (resultCode === 'Success') {
          await AsyncStorage.setItem('currentProcedureSerial', procedureSerial);
          Alert.alert('Success', message || 'Procedure created successfully');
        return true;
      } else {
        Alert.alert('Error', message || 'Failed to create procedure');
        return false;
      }
      } else {
        Alert.alert('Error', 'Unexpected server response format');
        return false;
      }
    } catch (error) {
      console.error('Error creating procedure:', error);
      Alert.alert('Creation Failed', 'An error occurred while creating the procedure');
      return false;
    }
  };
  
  const handleNextPress = async () => {
    try {
      setIsLoading(true);
      const success = await createProcedure();
      if (success) {
        navigateToReviewImage();
      }
    } catch (error) {
      console.error('Error in handleNextPress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //Function to navigate to the "library" screen
// const navigatetoLibrary = () => {
//   router.push({
//     pathname: "library", // Navigating to the "library" route
//     params: {procedureName: procedureName},
//   });
//   };
  
  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { procedureName: procedureName },
    });
  };
    
  // RJP - > 2/7/2025
 // Function to navigate to the "camera" screen with procedureName as a parameter
// const navigateToReviewImage = () => {
//   router.push({
//     pathname: "camera", // Navigating to the "camera" route
//     params: { procedureName: procedureName }, // Passing procedureName as a parameter 
//   });
// };

  const navigateToReviewImage = () => {
    router.push({
      pathname: "camera",
      params: { procedureName: procedureName }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigateToLibrary}>
        <Text style={styles.backTextArrow}>← </Text>
        <Text style={styles.backText}>Cancel</Text>
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
      
      <TouchableOpacity
        style={[styles.nextButton, procedureName.trim() === "" && styles.disabledButton]}
        onPress={handleNextPress}
        disabled={procedureName.trim() === "" || isLoading}
      >
        <Text style={styles.nextButtonText}>{isLoading ? "Loading..." : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },
  backTextArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
  }, 
  backText: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
    width: 58,
    height: 27,
    marginLeft: 20,
    marginTop: -23.5,
  }, 
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  title: {
    color: "#000000",
    fontFamily: "Darker Grotesque", //
    fontSize: 40,
    fontWeight: "600",
    marginTop: 106,
    marginLeft: 60,
  },
  subtitle: {
    color: "#000000",
    fontFamily: "Darker Grotesque", //
    fontSize: 20,
    fontWeight: "400",
    marginTop: 30,
    marginLeft: 50,
  },
  subtitle1: {
    color: "#000000",
    fontFamily: "Darker Grotesque", //
    fontSize: 20,
    fontWeight: "400",
    marginTop: 0,
    marginLeft: 130,
  },
  input: {
    fontFamily: "Inter", //
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    marginBottom: 16,
    marginTop: 35,
  },
  nextButton: {
    backgroundColor: "#375894",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A0A0A0", // Greyed out when disabled
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter", //
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddProcedure;

