import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceID } from '../components/deviceInfo';
import CryptoJS from "crypto-js";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";

export default function ViewEditPicture() {
  const router = useRouter();
  const [photoUriState, setPhotoUriState] = useState<string | null>(null);
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);

  const { photoUri, procedureName } = useLocalSearchParams<{
    photoUri: string;
    procedureName: string;
  }>();

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  useEffect(() => {
    if (photoUri) {
      const cleanedUri = decodeURIComponent(photoUri);
      setPhotoUriState(cleanedUri);
    } else {
      setPhotoUriState(null);
    }

    if (procedureName) {
      setDescriptionText(procedureName);
    }
  }, [photoUri, procedureName]);

  const navigateToCamera = () => {
    setPhotoUriState(null);
    router.replace({
      pathname: "camera",
      params: { procedureName , notesText },
    });
  };

  ///Alberto 2/24/2025 made the API call
  const navigateToEditPicture = async () => {
    try {
      console.log("🔹 Starting API call...");

      // Retrieve procedureSerial from AsyncStorage
      const procedureSerial = await AsyncStorage.getItem("currentProcedureSerial");
      if (!procedureSerial) {
        Alert.alert("Error", "Procedure not found. Please create a procedure first.");
        return;
      }
      console.log("🔹 Procedure Serial:", procedureSerial);

      // Retrieve deviceID from state
      if (!deviceID) {
        Alert.alert("Error", "Device ID not found.");
        return;
      }
      console.log("🔹 Device ID:", deviceID);

      // Retrieve authorizationCode from AsyncStorage
      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Please log in again.");
        return;
      }
      console.log("🔹 Authorization Code:", authorizationCode);

      // Generate formatted date and key
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(
        currentDate.getDate()
      ).padStart(2, "0")}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
      ).padStart(2, "0")}`;

      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      console.log("🔹 Key String:", keyString);
      const key = CryptoJS.SHA1(keyString).toString();
      console.log("🔹 Generated Key:", key);

      // Construct the API URL and form data
      const url = "https://prefpic.com/dev/PPService/UpdatePictureText.php";
      const formData = new FormData();
      formData.append("DeviceID", deviceID.id);
      formData.append("Date", formattedDate);
      formData.append("Key", key);
      formData.append("AC", authorizationCode);
      formData.append("PrefPicVersion", "1"); 
      formData.append("Picture", procedureSerial); 
      formData.append("Name", descriptionText); 
      formData.append("Note", notesText); 
      // Make the API call
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle response
      const data = await response.text();
      console.log("🔹 API Response Body:", data);
      console.log("🔹 API Response Status:", response.status);

      if (response.ok) {
        Alert.alert("Success!", "Picture text updated successfully.");
        router.push("addPearls");
      } else {
        const errorMessage = data.match(/<Message>(.*?)<\/Message>/)?.[1] || "Update failed.";
        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error) {
      console.error("🔹 Error during API call:", error);
      Alert.alert("Update Failed", "An error occurred during the update.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()}>
          {/* <TouchableOpacity onPress={() => navigateToEditPicture()}> */}
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Image for: {procedureName}</Text>

          {/* Image */}
          {photoUriState ? (
            <Image source={{ uri: photoUriState }} style={styles.image} />
          ) : (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              No image available
            </Text>
          )}

          {/* Retake Picture */}
          <TouchableOpacity style={styles.retakePicture} onPress={navigateToCamera}>
            <Text style={styles.retakePictureText}>Retake pic</Text>
          </TouchableOpacity>

          {/* Editable Text Box */}
          <View style={styles.centerBox}>
            <Text style={styles.description}>Description</Text>
            <TextInput
              style={styles.contentsInput}
              value={descriptionText}
              onChangeText={setDescriptionText}
              placeholder="Enter description"
              multiline
            />

            <Text style={styles.notes}>Notes</Text>
            <TextInput
              style={styles.bulletTextInput}
              value={notesText}
              onChangeText={setNotesText}
              placeholder="Enter notes"
              multiline
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.delete} onPress={() => router.back()}>
              <Text style={styles.deletebuttonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.save} onPress={navigateToEditPicture}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },

  backText: {
    fontSize: 16,
    color: "#007AFF",
  },

  header: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 30,
    fontWeight: "600",
  },

  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 20,
    flexDirection: "row",
    width: "100%",
  },

  save: {
    backgroundColor: "#375894",
    padding: 16,
    borderRadius: 31,
    alignItems: "center",
    marginLeft: 20,
    width: 170,
    right:10,
  },

  delete: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#375894",
    width: 170,
    borderWidth: 2,
    right: 10,
  },

  deletebuttonText: {
    color: "#375894",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  centerBox: {
    marginTop: 30,
    width: "100%",
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    position: "relative",
  },

  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
    alignSelf: "flex-start",
  },

  contentsInput: {
    fontSize: 16,
    color: "#000",
    width: "100%",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  notes: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 10,
    alignSelf: "flex-start",
  },

  bulletTextInput: {
    fontSize: 14,
    color: "#000",
    width: "100%",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  image: {
    height: 250,
    borderRadius: 30,
    marginTop: 10,
    alignSelf: "center",
    width: "100%",
  },

  retakePicture: {
    alignSelf: "center",
    marginVertical: 10,
    padding: 14,
    borderRadius: 31,
    backgroundColor: "#375894",
  },

  retakePictureText: {
    color: "#FFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});