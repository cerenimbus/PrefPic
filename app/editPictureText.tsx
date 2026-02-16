import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

export default function EditPictureText() {
  const router = useRouter();
  const [photoUriState, setPhotoUriState] = useState<string | null>(null);
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  const [imageCount, setImageCount] = useState(0); // RHCM 10/31/2025: Track number of images
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // JCM - 03/26/2025: Add state variable to be used for button feedbacks.
  const [takeMorePictureIsLoading, takeMorePictureSetIsLoading] = useState(false);
  const [retakePictureIsLoading, retakePictureSetIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  
  const handleImageClick = () => {
    setIsPreview(true);
  };

  const handleClosePreview = () => {
    setIsPreview(false);
  };

  const { photoUri, imageIndex, procedureName, updatedDescription, updatedNotes } =
    useLocalSearchParams<{
      photoUri: string;
      imageIndex: string;
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

  // Reload image count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkImageCount = async () => {
        // Add a small delay to ensure AsyncStorage writes are complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const storedImages = await AsyncStorage.getItem("capturedImages");
          const count = storedImages ? JSON.parse(storedImages).length : 0;
          setImageCount(count);
          console.log("🔹 Images reloaded on focus, count:", count);
        } catch (error) {
          console.error("Error checking image count:", error);
        }
      };
      checkImageCount();
    }, [])
  );

  //RHCM 10/31/2025: Added to check image count in AsyncStorage
  // Check image count on mount and when it changes
useEffect(() => {
  const checkImageCount = async () => {
    try {
      const storedImages = await AsyncStorage.getItem("capturedImages");
      const count = storedImages ? JSON.parse(storedImages).length : 0;
      setImageCount(count);
      console.log("🔹 Current image count:", count);
    } catch (error) {
      console.error("Error checking image count:", error);
    }
  };
  checkImageCount();
}, [photoUriState]);

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

      // Retrieve picture_serial from AsyncStorage
      const storedSerial = await AsyncStorage.getItem('selectedPictureSerial');
      if (!storedSerial) {
        Alert.alert("Error", "Picture_serial not found.");
        return;
      }
      formData.append("Picture", storedSerial);

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

        // Remove the image from AsyncStorage by index
        const storedImages = await AsyncStorage.getItem("capturedImages");
        if (storedImages) {
          const images = JSON.parse(storedImages);
          const indexToRemove = parseInt(imageIndex || "0", 10);
          console.log("🔹 Image index to remove:", indexToRemove);
          console.log("🔹 Original image count:", images.length);
          console.log("🔹 Image to delete:", images[indexToRemove]);
          
          const updatedImages = images.filter(
            (_: string, i: number) => i !== indexToRemove
          );
          console.log("🔹 Updated image count:", updatedImages.length);
          await AsyncStorage.setItem(
            "capturedImages",
            JSON.stringify(updatedImages)
          );
          
          // Add a small delay to ensure AsyncStorage write completes
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setPhotoUriState(null); // Clear the photo URI state
        
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


  const navigateToCamera = () => {
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set setIsLoading state variable to "true" to disable the Retake pic button
    retakePictureSetIsLoading(true);
    //----------------------------------------------------------------------------------------------
    deletePicture();
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Added a delay navigation until the state update completes.
    setTimeout(() => {
      setPhotoUriState(null);
      router.push({
        pathname: "camera",
        params: { procedureName, notesText },
      });
    //----------------------------------------------------------------------------------------------

      //JCM 03/27/2025: Set setIsLoading state variable to "false" to enable the Retake pic button
      retakePictureSetIsLoading(false);
      //----------------------------------------------------------------------------------------------
    }, 3000); 
};


  const navigateToEditPicture = async () => {
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set setIsLoading state variable to "true" to disable the Done with this procedure button
    setIsLoading(true);
    //----------------------------------------------------------------------------------------------
    try {
      console.log("🔹 Starting API call...");

      //RHCM 10/31/2025: Added to limit the number of pictures to 5 per procedure
      // Check image count before proceeding
      const storedImages = await AsyncStorage.getItem("capturedImages");
      const currentImageCount = storedImages ? JSON.parse(storedImages).length : 0;
      
      if (currentImageCount > 5) {
        Alert.alert(
          "Too Many Pictures", 
          "You can only have up to 5 pictures per procedure. Please remove some pictures before continuing."
        );
        setIsLoading(false);
        return;
      }

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
      //RHCM 09/18/2024 commented out as this is useless now
      // const picture_serial = await AsyncStorage.getItem("picture_serial");
      // if (!picture_serial) {
      //   Alert.alert("Error", "Picture_serial not found. ");
      //   return;
      // }
      // console.log("🔹 Picture Serial:", picture_serial);
      //End RJP 3/4/2025
      //-------------------------------------------------------------------------------------------------

      // Retrieve picture_serial from AsyncStorage
      // This is the correct way to get the picture_serial for the current picture being edited
      //----------------------------------------------------------------------------------------------
      //RHCM 09/18/2024 modified to get selectedPictureSerial instead of picture_serial

      //RHCM 10/31/2025: Commented out original code
      
      // const storedSerial = await AsyncStorage.getItem('selectedPictureSerial');
      // if (!storedSerial) {
      //   Alert.alert("Error", "Picture_serial not found.");
      //   return;
      // }
      //----------------------------------------------------------------------------------------------
      //RHCM 10/31/2025: Modified to check both selectedPictureSerial and picture_serial
      // Check both locations: selectedPictureSerial (from review) or picture_serial (from new picture)
      let storedSerial = await AsyncStorage.getItem('selectedPictureSerial');
      if (!storedSerial) {
        storedSerial = await AsyncStorage.getItem('picture_serial');
      }

      if (!storedSerial) {
        Alert.alert("Error", "Picture_serial not found.");
        setIsLoading(false);
        return;
      }
      console.log("🔹 Selected Picture Serial from AsyncStorage:", storedSerial)
      //-------------------------------------------------------------------------------------------------;
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
      formData.append("Picture", storedSerial); //RJP 3/4/2025 <------- change picture_serial from procedureserial
      formData.append("Name", descriptionText);
      formData.append("Note", notesText);

      console.log("🔹 Form Data:", {
        DeviceID: deviceID.id,
        Date: formattedDate,
        Key: key,
        AC: authorizationCode,
        PrefPicVersion: "1",
        Picture: storedSerial, //RJP 3/4/2025 <------- change picture_serial from procedureserial
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
        // Alert.alert("Success!", "Picture text updated successfully.");
        router.push({
          pathname: "addPearls",
          params: {
            updatedProcedureSerial: procedureSerial,
            procedureName: procedureName,
          },
        });
        //----------------------------------------------------------------------------------------------
        //JCM 03/27/2025: Set setIsLoading state variable to "false" to enable the Done with this procedure button
        setIsLoading(false);
        //----------------------------------------------------------------------------------------------
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
    //----------------------------------------------------------------------------------------------
    //JCM 03/27/2025: Set takeMorePictureSetIsLoading state variable to "true" to disable the Take more pictures button
    takeMorePictureSetIsLoading(true);
    //----------------------------------------------------------------------------------------------

    try {
      console.log("🔹 Starting API call before adding more pictures...");

      //RHCM 10/31/2025: Added to limit the number of pictures to 5 per procedure
      // Check image count first
      const storedImages = await AsyncStorage.getItem("capturedImages");
      const imageCount = storedImages ? JSON.parse(storedImages).length : 0;
      
      if (imageCount >= 5) {
        Alert.alert("Picture Limit Reached", "You can only add up to 5 pictures per procedure.");
        takeMorePictureSetIsLoading(false);
        return;
      }


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

        //----------------------------------------------------------------------------------------------
        //JCM 03/27/2025: Set takeMorePictureSetIsLoading state variable to "false" to enable the Take more pictures button
        takeMorePictureSetIsLoading(false);
        //----------------------------------------------------------------------------------------------
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

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={{ flex: 1 }}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.container}>
//               <TouchableOpacity
//                 style={styles.backButtonContainer}
//                 onPress={() => router.back()}
//               >
//                 <Text style={styles.backText}>← Back</Text>
//               </TouchableOpacity>
//               <Text style={styles.header}>Image for: {procedureName}</Text>


//               {photoUriState ? (
//                 <Image source={{ uri: photoUriState }} style={styles.image} />
//               ) : (
//                 <Text style={{ textAlign: "center", marginVertical: 20 }}>
//                   No image available
//                 </Text>
//               )}
              
//               {/* JCM - 03/26/2025 Added an activity indicator for button feedback */}
//               <TouchableOpacity
//                 style={styles.retakePicture}
//                 onPress={navigateToCamera}
//                 disabled = {retakePictureIsLoading}
//               >

//                 {retakePictureIsLoading ? (
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                  ) : (
//                   <Text style={styles.retakePictureText}>Retake pic</Text>
//                  )}
                
//               </TouchableOpacity>

//               <View style={styles.centerBox}>
//                 <Text style={styles.description}>Photo title</Text>
//                 <TextInput
//                   style={styles.contentsInput}
//                   value={descriptionText}
//                   onChangeText={setDescriptionText}
//                   placeholder="Enter description"
//                   multiline
//                 />

//                 <Text style={styles.notes}>Notes</Text>
//                 <TextInput
//                   style={styles.bulletTextInput}
//                   value={notesText}
//                   onChangeText={setNotesText}
//                   placeholder="Enter notes"
//                   multiline
//                 />
//               </View>

//               {/* JCM - 03/26/2025 Added an activity indicator for button feedback */}
//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity
//                   style={styles.delete}
//                   onPress={handleAddMorePictures}
//                   disabled= {takeMorePictureIsLoading}
//                 >
//                   {takeMorePictureIsLoading ? (
//                     <ActivityIndicator size="small" color="#375894" />
//                   ) : (
//                     <Text style={styles.deletebuttonText}>
//                     Take more pictures
//                   </Text>
//                   )}
//                 </TouchableOpacity>


//                 {/* JCM - 03/26/2025 Added an activity indicator for button feedback */}
//                 {/*<TouchableOpacity
//                   style={styles.save}
//                   onPress={navigateToEditPicture}
//                   disabled= {isLoading}
//                 >
//                   {isLoading ? (
//                     <ActivityIndicator size="small" color="#FFFFFF" />
//                   ) : (
//                     <View style={styles.buttonTextWrapper}>
//                     <Text style={styles.buttonText}>
//                       Done with this procedure
//                     </Text>
//                     </View>
//                   )}
//                 </TouchableOpacity>*/}
//                 <TouchableOpacity
//   style={styles.save}
//   onPress={navigateToEditPicture}
//   disabled={isLoading}
// >
//   {isLoading ? (
//     <ActivityIndicator size="small" color="#FFFFFF" />
//   ) : (
//     <View style={styles.buttonTextWrapper}>
//       <Text
//         style={styles.buttonText}
//         numberOfLines={2}
//       >
//         Done with this procedure
//       </Text>
//     </View>
//   )}
// </TouchableOpacity>

//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </TouchableWithoutFeedback>
//   );
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

            {/* RHCM 5/09/2025- Image preview with zoom support */}
            {photoUriState ? (
              <TouchableOpacity onPress={handleImageClick}>
                <Image source={{ uri: photoUriState }} style={styles.image} />
              </TouchableOpacity>
            ) : (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                No image available
              </Text>
            )}

            {/* RHCM 5/09/2025- Full screen modal with pinch zoom support */}
            {/* {isPreview && (
              <Modal visible={isPreview} transparent={true} animationType="fade">
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.85)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={handleClosePreview}
                    style={{ position: "absolute", top: 40, right: 20, zIndex: 1 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 18 }}>Close ✕</Text>
                  </TouchableOpacity>
                  <ImageViewer
                    // imageUrls={[{ url: photoUriState }]}
                    // imageUrls={[{ url: photoUriState || "" }]}
                    imageUrls={photoUriState ? [{ url: photoUriState }] : []}
                    enableSwipeDown={true}
                    onSwipeDown={handleClosePreview}
                    enableImageZoom={true}
                    renderIndicator={() => <></>} // This removes the 1/1 indicator
                  />
                </View>
              </Modal>
            )} */}
            {isPreview && (
                    <Modal visible={isPreview} transparent={true} animationType="fade">
                      <View style={{ flex: 1, backgroundColor: "rgba(41, 41, 41, 0.8)", justifyContent: "center", alignItems: "center" }}>
                        <TouchableOpacity onPress={handleClosePreview} style={styles.closeButton}>
                          <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <ImageViewer
              imageUrls={photoUriState ? [{ url: photoUriState }] : []}
              enableSwipeDown={true}
              onSwipeDown={handleClosePreview}
              enableImageZoom={true}
              style={styles.fullImage}
              renderIndicator={() => <></>} // This removes the 1/1 indicator
            />
                      </View>
                    </Modal>
            )}

            {/* JCM - 03/26/2025 Added an activity indicator for button feedback */}
            <TouchableOpacity
              style={styles.retakePicture}
              onPress={navigateToCamera}
              disabled={retakePictureIsLoading}
            >
              {retakePictureIsLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.retakePictureText}>Retake pic</Text>
              )}
            </TouchableOpacity>

            <View style={styles.centerBox}>
              <Text style={styles.description}>Photo title</Text>
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

            {/* JCM - 03/26/2025 Added an activity indicator for button feedback */}
            <View style={styles.buttonContainer}>
  {/* RHCM 10/31/2025: Disable Take more pictures button when image count is 5 or more */}
  {/* Commented out original code */}
  
  {/* <TouchableOpacity
    style={styles.delete}
    onPress={handleAddMorePictures}
    disabled={takeMorePictureIsLoading}
  > */}
      <TouchableOpacity
      style={[
        styles.delete,
        imageCount >= 5 && styles.disabledButton
      ]}
      onPress={handleAddMorePictures}
      disabled={takeMorePictureIsLoading || imageCount >= 5}
    >


    {takeMorePictureIsLoading ? (
      <ActivityIndicator size="small" color="#375894" />
    ) : (
      <Text style={styles.deletebuttonText}>
        Take more pictures
      </Text>
    )}
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.delete} // same style as the outlined button
    onPress={navigateToEditPicture}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color="#375894" />
    ) : (
      <Text style={styles.deletebuttonText}>
        Done with this procedure
      </Text>
    )}
  </TouchableOpacity>
</View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </TouchableWithoutFeedback>
);

}

const  {width, height} = Dimensions.get("window");
const styles = StyleSheet.create({
  //=================================================================
  // ADDED: JM 03-21-2025
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // buttonTextWrapper: {
  //   flexShrink: 1,
  //   flexWrap: "wrap",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   width: "100%",
  // },
  buttonTextWrapper: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  fullImage: {
    width: width * 1.1, // takes account the screen width
    height: height * 1, // takes account the screen height
    objectFit: "contain",
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    alignSelf: "flex-end",/// this will put the x button above the image 
    //position: "absolute", this will put the x button inside the image
    top: 140,
    right: 20,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 30,
    padding: 8,
    zIndex: 1001,
    justifyContent: "center",
    alignItems: "center",
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

  // save: {
  //   backgroundColor: "#375894",
  //   padding: 16,
  //   borderRadius: 31,
  //   alignItems: "center",
  //   justifyContent: "center", // ADDED: JM 03-21-2025
  //   // marginLeft: 20,
  //   width: "48%",
  //   height: 66, // ADDED: JM 03-21-2025
  //   // right: 11,
  // },
  save: {
    backgroundColor: '#007AFF',
    height: 50,           // Fixed height
    width: 250,           // Fixed width
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  // buttonText: {
  //   color: "#FFFFFF",
  //   fontSize: 14,
  //   fontWeight: "600",
  //   textAlign: "center",
  //   flexShrink: 1,
  //   flexWrap: "wrap",
  // },
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

  disabledButton: {
    borderRadius: 31,
    // backgroundColor: "#375894",
    backgroundColor: "#D3D3D3",
    borderColor: "#A0A0A0",
    opacity: 0.6,
  },

  retakePictureText: {
    color: "#FFFF",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 3, // MODIFIED: JM 03-21-2025
    paddingHorizontal: 40, // ADDED: JM 03-21=2025
  },
});
