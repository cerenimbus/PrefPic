import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceID } from "../components/deviceInfo";
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

export default function RetakePicture() {
  const router = useRouter();
  const [photoUriState, setPhotoUriState] = useState<string | null>(null);
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);

  const { photoUri, procedureName, updatedDescription, updatedNotes } =
    useLocalSearchParams<{
      photoUri: string;
      procedureName: string;
      updatedDescription: string;
      updatedNotes: string;
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
  }, [photoUri, procedureName]);

  useEffect(() => {
    if (updatedDescription) {
      setDescriptionText(updatedDescription as string);
    }
    if (updatedNotes) {
      setNotesText(updatedNotes as string);
    }
  }, [updatedDescription, updatedNotes]);

  const navigateToCamera = () => {
    setPhotoUriState(null);
    router.replace({
      pathname: "camera",
      params: { procedureName, notesText },
    });
  };

  const navigateToEditPicture = async () => {
    try {
      console.log("🔹 Starting API call...");

      const procedureSerial = await AsyncStorage.getItem(
        "currentProcedureSerial"
      );
      if (!procedureSerial) {
        Alert.alert(
          "Error",
          "Procedure not found. Please create a procedure first."
        );
        return;
      }
      console.log("🔹 Procedure Serial:", procedureSerial);

      if (!deviceID) {
        Alert.alert("Error", "Device ID not found.");
        return;
      }
      console.log("🔹 Device ID:", deviceID);

      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Please log in again.");
        return;
      }
      console.log("🔹 Authorization Code:", authorizationCode);

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

      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      console.log("🔹 Key String:", keyString);
      const key = CryptoJS.SHA1(keyString).toString();
      console.log("🔹 Generated Key:", key);

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

      console.log("🔹 Form Data:", {
        DeviceID: deviceID.id,
        Date: formattedDate,
        Key: key,
        AC: authorizationCode,
        PrefPicVersion: "1",
        Picture: procedureSerial,
        Name: descriptionText,
        Note: notesText,
      });

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.text();
      console.log("🔹 API Response Body:", data);
      console.log("🔹 API Response Status:", response.status);

      if (response.ok) {
        Alert.alert("Success!", "Picture text updated successfully.");
        router.push({
          pathname: "viewEditPicture",
          params: {
            updatedDescription: descriptionText,
            updatedNotes: notesText,
          },
        });
      } else {
        const errorMessage =
          data.match(/<Message>(.*?)<\/Message>/)?.[1] || "Update failed.";
        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error) {
      console.error("🔹 Error during API call:", error);
      Alert.alert("Update Failed", "An error occurred during the update.");
    }
  };

  const deletePicture = async () => {
    try {
      console.log("🔹 Starting Delete API call...");

      const procedureSerial = await AsyncStorage.getItem(
        "currentProcedureSerial"
      );
      if (!procedureSerial) {
        Alert.alert(
          "Error",
          "Procedure not found. Please create a procedure first."
        );
        return;
      }
      console.log("🔹 Procedure Serial:", procedureSerial);

      if (!deviceID) {
        Alert.alert("Error", "Device ID not found.");
        return;
      }
      console.log("🔹 Device ID:", deviceID);

      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Please log in again.");
        return;
      }
      console.log("🔹 Authorization Code:", authorizationCode);

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

      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      console.log("🔹 Key String:", keyString);
      const key = CryptoJS.SHA1(keyString).toString();
      console.log("🔹 Generated Key:", key);

      const url = "https://prefpic.com/dev/PPService/DeletePicture.php";
      const formData = new FormData();
      formData.append("DeviceID", deviceID.id);
      formData.append("Date", formattedDate);
      formData.append("Key", key);
      formData.append("AC", authorizationCode);
      formData.append("PrefPicVersion", "1");
      formData.append("Picture", procedureSerial);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.text();
      console.log("🔹 API Response Body:", data);
      console.log("🔹 API Response Status:", response.status);

      if (response.ok) {
        Alert.alert("Success!", "Picture deleted successfully.");

        // Remove the image from AsyncStorage
        const storedImages = await AsyncStorage.getItem("capturedImages");
        if (storedImages) {
          const images = JSON.parse(storedImages);
          const updatedImages = images.filter(
            (img: string) => img !== photoUriState
          );
          await AsyncStorage.setItem(
            "capturedImages",
            JSON.stringify(updatedImages)
          );
        }

        setPhotoUriState(null); // Clear the photo URI state
        router.push("viewEditPicture"); // Navigate back to the previous screen
      } else {
        const errorMessage =
          data.match(/<Message>(.*?)<\/Message>/)?.[1] || "Delete failed.";
        Alert.alert("Delete Failed", errorMessage);
      }
    } catch (error) {
      console.error("🔹 Error during Delete API call:", error);
      Alert.alert("Delete Failed", "An error occurred during the delete.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Image for: {procedureName}</Text>

          {photoUriState ? (
            <Image source={{ uri: photoUriState }} style={styles.image} />
          ) : (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              No image available
            </Text>
          )}

          <TouchableOpacity
            style={styles.retakePicture}
            onPress={navigateToCamera}
          >
            <Text style={styles.retakePictureText}>Retake pic</Text>
          </TouchableOpacity>

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

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.delete} onPress={deletePicture}>
              <Text style={styles.deletebuttonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.save}
              onPress={navigateToEditPicture}
            >
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
    right: 10,
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
