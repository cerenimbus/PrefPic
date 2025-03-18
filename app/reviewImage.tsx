import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView,View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions,ActivityIndicator} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import { getDeviceID } from '../components/deviceInfo';
import { Modal } from "react-native";

///Aj 3/14/2025 
//import for zoom in and zoom out 
import ImageViewer from 'react-native-image-zoom-viewer';
//Add SafeAreaView RJP <--3/5/2025

export default function ReviewImage() {
  const router = useRouter();

  const [photoUriState, setPhotoUriState] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts

   //RJP -> 2/7/2025
  // (import) image and procedure name from add_2.tsx 
  
  const { photoUri, procedureName } = useLocalSearchParams<{
    photoUri: string;
    procedureName: string;
  }>();


  //RJP -> 2/7/2025
  // Decode the photo URI
  //const decodedPhotoUri = photoUri ? decodeURIComponent(photoUri) : null;
  // Store photoUri in a state variable
  

    //RJP 2/11/2025
  //force React Native to reload the image.
  useEffect(() => {
    if (photoUri) {
        // Append a cache-busting query parameter to force image reload
      setPhotoUriState(decodeURIComponent(photoUri) + `?t=${Date.now()}`);
    } else {
      setPhotoUriState(null);
    }
  }, [photoUri]);

     useEffect(() => {
        
        const fetchDeviceID = async () => {
          const id = await getDeviceID();
          setDeviceID(id);
        };
          fetchDeviceID();
        }, []);
  

  
//Alberto -> 2/11/2025
//API CALL  -> 2/13/2025
const navigateToCamera = () => {
  // Reset photoUriState before navigating back
  setPhotoUriState(null);
  //Alberto -> 2/17/2025
  // Navigate back to the camera screen with the procedureName
  router.replace({
    pathname: "camera",
    // Pass the procedureName as a query parameter so it doesn't get lost
    params: { procedureName },
  });
};
  //open bleed view
  const handleImageClick = () => {
    setIsPreview(true);
  };

  //close bleed view
  const handleClosePreview = () => {
    setIsPreview(false);
  };
  //ALBERTO -> 2/11/2025
  ///API CALL 


  const navigateToReviewSummary = async (fileUri: string, fileType: string) => {
    try {
        console.log("🔹 Starting API call...");

        // Retrieve procedureSerial from AsyncStorage
        const procedureSerial = await AsyncStorage.getItem("currentProcedureSerial");
        if (!procedureSerial) {
            Alert.alert("Error", "Procedure not found. Please create a procedure first.");
            setIsLoading(false); // Reset loading state on error
            return;
        }
        console.log("🔹 Procedure Serial:", procedureSerial);

        // Retrieve deviceID from AsyncStorage
        if (!deviceID) {
            Alert.alert("Error", "Device ID not found.");
            setIsLoading(false); // Reset loading state on error
            return;
        }
        console.log("🔹 Device ID:", deviceID);

        // Retrieve authorizationCode from AsyncStorage
        const authorizationCode = await AsyncStorage.getItem("authorizationCode");
        if (!authorizationCode) {
            Alert.alert("Authorization Error", "Please log in again.");
            setIsLoading(false); // Reset loading state on error
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

        // Create FormData
        const formData = new FormData();
        formData.append("DeviceID", encodeURIComponent(deviceID.id));
        formData.append("Date", formattedDate);
        formData.append("Key", key);
        formData.append("AC", authorizationCode);
        formData.append("PrefPicVersion", "1");
        formData.append("Procedure", procedureSerial);
        formData.append("Type", fileType);
        formData.append("Media", {
            uri: fileUri,
            type: fileType,
            name: `upload.${fileType.split("/")[1] || "jpg"}`,
        } as any);

        // Make the API call
        const url = "https://prefpic.com/dev/PPService/CreatePicture.php";
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        // Handle response
        const data = await response.text();
        console.log("🔹 API Response Body:", data);
        console.log("🔹 API Response Status:", response.status);
        
        if (response.ok) {
            //Alert.alert("Success!", "Image uploaded successfully.");

            //--------------------------------------------------------------------------------------
            //RJP <---store picture_serial to the async storage
            //  Extract PictureSerial from the API response
            const pictureSerialMatch = data.match(/<PictureSerial>(.*?)<\/PictureSerial>/);
        if (pictureSerialMatch) {
            const pictureSerial = pictureSerialMatch[1];

        //  Store PictureSerial in AsyncStorage
            await AsyncStorage.setItem("picture_serial", pictureSerial);
            console.log(" Picture Serial Stored:", pictureSerial);
        } else {
            console.log(" No Picture Serial found in API response.");
        }
        //END RJP 3/4/2025
        //--------------------------------------------------------------------------------------------------

            // RHCM 2/22/2025 Store the image in AsyncStorage
            const storedImages = await AsyncStorage.getItem("capturedImages");
            const imageList = storedImages ? JSON.parse(storedImages) : [];

            // RHCM 2/22/2025 Append the new image
            imageList.push(fileUri);

            // RHCM 2/22/2025 Store updated list (limit to 5 images)
            await AsyncStorage.setItem("capturedImages", JSON.stringify(imageList.slice(0, 5)));

            console.log(" Updated Images List:", imageList);

            // Navigate to viewEditPicture WITH passing photoUri in params
            router.push({
                pathname: "editPictureText",
                params: { procedureName, photoUri: fileUri },
            });
            setIsLoading(false); // Reset loading state on error

        } else {
            const errorMessage = data.match(/<Message>(.*?)<\/Message>/)?.[1] || "Upload failed.";
            Alert.alert("Upload Failed", errorMessage);
            setIsLoading(false); // Reset loading state on error
        }
    } catch (error) {
      console.error("API call error:", error);

    // Check if the error is a network error
    if (error instanceof TypeError && error.message === "Network request failed") {
      Alert.alert("Internet Connection Lost", "Reconnecting... This may take a moment.");
    } else {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
     
      // Retry the API call up to 3 times
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        setTimeout(() => navigateToReviewSummary(fileUri, fileType), 1000); // Retry after 1 second
      } else {
        Alert.alert("Error", "Failed to upload image after multiple attempts. Please check your network and try again.");
        setIsLoading(false); // Reset loading state after all retries fail
      }
    }
};

useEffect(() => {
  if (isLoading) {
    navigateToReviewSummary(photoUriState || "", "image/jpeg");
  }
}, [isLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style ={styles.backButtonContainer} onPress={navigateToCamera}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Image for: {procedureName}</Text>

    {/* RJP -> 2/8/2025
          change image source to retrieve image taken from camera
        */}


        {/*Alberto -> 2/11/2025 
        use photoUri instead of decodedPhotoUri
        */}
        {/* Change photoUri to photoUriState lookup for the function -> RJP 2/11/2025 */}
        {photoUriState ? (
          <TouchableOpacity onPress={handleImageClick}>
            <Image style={styles.image} source={{ uri: photoUriState }} />
          </TouchableOpacity>
        ) : (
          <Text>No image available</Text>// Show this if the URI is invalid or missing
        )}


          {/* Full Image Overlay */}
        {/* fix photoUri to show only one image on display or full image -> RJP 02/11/2025*/}
                {/* AJ 3/14/2025  */}
                    {/* added a zoom in/ zoom out functionality  */}

                    {/* <Modal visible={isPreview} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(41, 41, 41, 0.8)", justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity onPress={handleClosePreview} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Image style={styles.fullImage} source={photoUriState ? { uri: photoUriState } : undefined} />
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



        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakebutton} onPress={navigateToCamera}>
            <Text style={styles.retakebuttonText}>Retake</Text>
          </TouchableOpacity>

  

{/*=======================================================================================*/}
{/*RJP <-3/5/2025 add feedback button*/}

<TouchableOpacity
            style={[styles.nextbutton, isLoading && styles.disabledButton]}
            onPress={() => setIsLoading(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={27} color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
{/*=======================================================================================*/}

        </View>
      </View>
    </SafeAreaView>  
  );
}
//Alberto -> 2/19/2025
const  {width, height} = Dimensions.get("window");

const styles = StyleSheet.create({
  //RJP add safe Area 3/5/2025
  safeArea: {
    flex: 1,
    backgroundColor: "white", // Ensures the background matches your screen
  },

  //RJP 3/5/2025 <-- add style to the button when disabled
  disabledButton: {
    backgroundColor: "#808080", // Gray color when disabled
    flex: 1,
  },
  
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
    paddingTop: 30,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10, // Adjust this value to lower the button
    left: 5,
    zIndex: 1,
  },
  backText: {
    fontSize: 18,
    color: '#007AFF',
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 15,
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
  retakebutton: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#375894",
    width: 180,
    borderWidth: 2,
  },
  retakebuttonText: {
    color: "#375894",
    fontSize: 20,
    fontWeight: "600",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  image: {
    width: width * 0.9, // 90% of screen width
    height: height * 0.60, // 50% of screen height
    marginTop: 1,
    borderRadius: 20,
    alignSelf: "center",
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(41, 41, 41, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  //Alberto -> 2/19/2025
  //change the width and height of the full image to take account the screen width and height and not use postion absolute
  fullImage: {
    width: width * 1.1, // takes account the screen width
    height: height * 1, // takes account the screen height
    objectFit: "contain",
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
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});