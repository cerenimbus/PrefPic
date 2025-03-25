import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceID } from "../components/deviceInfo";
import CryptoJS from "crypto-js";
import {
  SafeAreaView,
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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

export default function EditPictureText() {
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

  //-----------------------------------------------------------------------------------------------------
  //RJP 03/4/2025<-- debug to show all async storage key value
  useEffect(() => {
    // Debugging: Log all AsyncStorage keys
    AsyncStorage.getAllKeys()
      .then(async (keys) => {
        console.log("🔹 AsyncStorage Keys:", keys);

        // Retrieve values for each key
        const keyValues = await AsyncStorage.multiGet(keys);
        keyValues.forEach(([key, value]) => {
          console.log(`🔹 ${key}: ${value}`);
        });
      })
      .catch((error) =>
        console.error("⚠️ Error fetching AsyncStorage keys:", error)
      );
  }, []);
  //end
  //---------------------------------------------------------------------------------------

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

      //----------------------------------------------------------------------------------------------
      //RJP <---- change to picture_serial 3/4/2025
      const picture_serial = await AsyncStorage.getItem("picture_serial");
      if (!picture_serial) {
        Alert.alert("Error", "Picture_serial not found. ");
        return;
      }
      console.log("🔹 Picture Serial:", picture_serial);
      //End RJP 3/4/2025
      //-------------------------------------------------------------------------------------------------

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
      formData.append("Picture", picture_serial); //RJP 3/4/2025 <------- change picture_serial from procedureserial
      formData.append("Name", descriptionText);
      formData.append("Note", notesText);

      console.log("🔹 Form Data:", {
        DeviceID: deviceID.id,
        Date: formattedDate,
        Key: key,
        AC: authorizationCode,
        PrefPicVersion: "1",
        Picture: picture_serial, //RJP 3/4/2025 <------- change picture_serial from procedureserial
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
          pathname: "addPearls",
          params: {
            updatedProcedureSerial: procedureSerial,
            procedureName: procedureName,
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

  const handleAddMorePictures = async () => {
    try {
      console.log("🔹 Starting API call before adding more pictures...");

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

      //-------------------------------------------------------------------------------
      //RJP 3/4/2025<-- change to picture serial
      const picture_serial = await AsyncStorage.getItem("picture_serial");
      if (!picture_serial) {
        Alert.alert("Error", "Picture not found.");
        return;
      }
      //End RJP 3/4/2025
      //--------------------------------------------------------------------------------

      if (!deviceID) {
        Alert.alert("Error", "Device ID not found.");
        return;
      }

      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Please log in again.");
        return;
      }

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
      const key = CryptoJS.SHA1(keyString).toString();

      const url = "https://prefpic.com/dev/PPService/UpdatePictureText.php";
      const formData = new FormData();
      formData.append("DeviceID", deviceID.id);
      formData.append("Date", formattedDate);
      formData.append("Key", key);
      formData.append("AC", authorizationCode);
      formData.append("PrefPicVersion", "1");
      formData.append("Picture", picture_serial); //RJP 3/4/2025 <------- change picture_serial from procedureserial
      formData.append("Name", descriptionText);
      formData.append("Note", notesText);

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
        console.log("🔹 API call successful. Navigating to camera...");
        router.push({
          pathname: "camera",
          params: { procedureName, notesText },
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={() => router.back()}
              >
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
                <TouchableOpacity
                  style={styles.delete}
                  onPress={handleAddMorePictures}
                >
                  <Text style={styles.deletebuttonText}>
                    Take more pictures
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.save}
                  onPress={navigateToEditPicture}
                >
                  <Text style={styles.buttonText}>
                    Done with this procedure
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  //=================================================================
  // ADDED: JM 03-21-2025
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "white", // Ensures the background matches your screen
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 15,
  },
  backButtonContainer: {
    position: "absolute",
    top: 10, // Adjust this value to lower the button
    left: 5,
    zIndex: 1,
  },
  backText: {
    fontSize: 18,
    color: "#007AFF",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 15,
    //fontWeight: "600",
  },

  buttonContainer: {
    flex: 1,
    justifyContent: "center", // MODIFIED: JM 03-21-2025
    alignItems: "flex-end",
    textAlign: "center",
    paddingBottom: 15,
    flexDirection: "row",
    width: "100%",
    gap: 10, // ADDED: JM 03-21=2025
  },

  save: {
    backgroundColor: "#375894",
    padding: 16,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center", // ADDED: JM 03-21-2025
    // marginLeft: 20,
    width: 170,
    height: 66, // ADDED: JM 03-21-2025
    // right: 11,
  },

  delete: {
    backgroundColor: "#FFFFFF",
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#375894",
    width: 170,
    height: 66, // ADDED: JM 03-21-2025
    justifyContent: "center", // ADDED: JM 03-21-2025
    borderWidth: 2,
    // right: 1,
  },

  deletebuttonText: {
    color: "#375894",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  centerBox: {
    marginTop: 10, // MODIFIED: JM 03-25-2025
    width: "100%",
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    position: "relative",
  },

  description: {
    fontSize: 18, // MODIFIED: JM 03-21-2025
    fontWeight: "600",
    color: "#000",
    marginBottom: 10, // MODIFIED: JM 03-21-2025
    alignSelf: "flex-start",
  },
  contentsInput: {
    fontSize: 16,
    color: "#000",
    width: "100%",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 5, // ADDED: JM 03-21-2025
  },

  notes: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 10,
    marginBottom: 5, // ADDED: JM 03-21-2025
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
    height: 300,
    borderRadius: 30,
    marginTop: 5,
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
    paddingVertical: 3, // MODIFIED: JM 03-21-2025
    paddingHorizontal: 40, // ADDED: JM 03-21=2025
  },
});
