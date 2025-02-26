import { router, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceID } from '../components/deviceInfo';
import CryptoJS from "crypto-js";

const styles = StyleSheet.create({
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
    fontSize: 30,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 30,
    fontWeight: "600",
  },
  procedure: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 3,
    paddingTop: 3,
  },
  tapOnPic: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 3,
    paddingTop: 20,
    fontWeight: "400",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 20,
    flexDirection: "row",
    width: "100%",
  },
  nextbutton: {
    backgroundColor: "#375894",
    padding: 16,
    borderRadius: 31,
    alignItems: "center",
    marginLeft: 10,
    width: 120,
    flex: 1,
  },
  addPicture: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#375894",
    width: 180,
    borderWidth: 2,
  },
  addPicturebuttonText: {
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
    marginTop: 20,
    width: 280,
    height: 350,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
    width: "100%",
  },
  smallBox: {
    width: 80,
    height: 150,
    backgroundColor: "#D9D9D9",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  plusSign: {
    fontSize: 40,
    color: "#375894",
    fontWeight: "bold",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePreview: { width: 80, height: 80, borderRadius: 10 },
});

export default function ViewEditPicture() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);

  const procedureName = params.procedureName as string;

  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await AsyncStorage.getItem("capturedImages");
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  useEffect(() => {
    if (params.photoUri) {
      setImages((prevImages) => {
        const updatedImages = [...prevImages, params.photoUri as string];
        return updatedImages.slice(0, 5); // Limit to 5 images
      });
    }
  }, [params.photoUri]);

  const navigateToRetakePicture = (index: number) => {
    router.push({
      pathname: "camera",
      params: { imageIndex: index, procedureName},
    });
  };


  const navigateToCamera = () => {
    router.push({
      pathname: "camera",
      params: {  procedureName},
    });
  };


  //Alberto 2/24/2025 added api call for the addPearls
  const navigateToAddPearls = async () => {
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

   
      const url = "https://prefpic.com/dev/PPService/UpdatePictureText.php";
      const formData = new FormData();
      formData.append("DeviceID", deviceID.id);
      formData.append("Date", formattedDate);
      formData.append("Key", key);
      formData.append("AC", authorizationCode);
      formData.append("PrefPicVersion", "1"); 
      formData.append("Picture", procedureSerial); 
      formData.append("Name", procedureName); 
      formData.append("Note", "Updated picture text"); 

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
        router.push("library");
      } else {
        const errorMessage = data.match(/<Message>(.*?)<\/Message>/)?.[1] || "Update failed.";
        Alert.alert("Update Failed", errorMessage);
      }
    } catch (error) {
      console.error("🔹 Error during API call:", error);
      Alert.alert("Update Failed", "An error occurred during the update.");
    }
  };

  const handleImagePress = (index: number) => {
    if (images[index]) {
      router.push({
        pathname: "retakePicture",
        params: { photoUri: images[index], imageIndex: index, procedureName },
      });
    } else {
      navigateToRetakePicture(index);
    }
  };

  const handleAddMorePictures = async () => {
    try {
      console.log("🔹 Starting API call before adding more pictures...");
  
      // Retrieve procedureSerial
      const procedureSerial = await AsyncStorage.getItem("currentProcedureSerial");
      if (!procedureSerial) {
        Alert.alert("Error", "Procedure not found. Please create a procedure first.");
        return;
      }
  
      // Retrieve deviceID
      if (!deviceID) {
        Alert.alert("Error", "Device ID not found.");
        return;
      }
  
      // Retrieve authorizationCode
      const authorizationCode = await AsyncStorage.getItem("authorizationCode");
      if (!authorizationCode) {
        Alert.alert("Authorization Error", "Please log in again.");
        return;
      }
  
      // Generate formatted date and key
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(
        currentDate.getDate()
      ).padStart(2, "0")}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, "0")}:${String(
        currentDate.getMinutes()
      ).padStart(2, "0")}`;
  
      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();
  
      // API URL & Payload
      const url = "https://prefpic.com/dev/PPService/UpdatePictureText.php";
      const formData = new FormData();
      formData.append("DeviceID", deviceID.id);
      formData.append("Date", formattedDate);
      formData.append("Key", key);
      formData.append("AC", authorizationCode);
      formData.append("PrefPicVersion", "1");
      formData.append("Picture", procedureSerial);
      formData.append("Name", procedureName);
      formData.append("Note", "Updated picture text");
  
      // Make the API call
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
          params: { procedureName },
        });
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
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateToCamera()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>View / Edit Picture(s)</Text>
      <Text style={styles.procedure}>{procedureName}</Text>
      <Text style={styles.tapOnPic}>Tap on picture to view/edit</Text>

      <View style={styles.centerBox}>
        <View style={styles.boxContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <TouchableOpacity key={index} style={styles.smallBox} onPress={() => handleImagePress(index)}>
              {images[index] ? (
                <Image source={{ uri: images[index] }} style={styles.image} />
              ) : (
                <Text style={styles.plusSign}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity
          style={styles.addPicture}
          onPress={() => {
            if (images.length < 5) {
              navigateToRetakePicture(images.length);
            }
          }}
        >
          <Text style={styles.addPicturebuttonText}>Add more pictures</Text>
        </TouchableOpacity> */}

      {/* Alberto - > 2/24/2025 */}
         <TouchableOpacity
          style={styles.addPicture}
          onPress={async () => {
            if (images.length < 5) {
              await handleAddMorePictures(); // Call the API before navigating
              navigateToRetakePicture(images.length);
            } else {
              Alert.alert("Limit Reached", "You can only add up to 5 pictures.");
            }
          }}
        >
          <Text style={styles.addPicturebuttonText}>Add more pictures</Text>
        </TouchableOpacity> 


        <TouchableOpacity style={styles.nextbutton} onPress={navigateToAddPearls}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}