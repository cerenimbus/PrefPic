/*
---> add_2.tsx Camera script
---> RJP -> 2/08/2025 [Started Coding from scratch]
---> RJP -> 2/10/2025 [Create PhotoUri to test Image transfering to the next page]
---> RJP -> 2/14/2025 [Added function to compress image maximum to 1mb image file size]
---> RJP -> 2/15/2025 [Debug errors in URI for image transfer to the next page]
---> RJP -> 3/2/2025 [Added Safeview to the styling]
*/
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator"; // Import image manipulator

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back"); // Default back camera
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null); // Correct camera reference type
  const { procedureName } = useLocalSearchParams<{ procedureName: string }>();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Navigate back to AddProcedure screen
  const navigateToAddProcedure = () => {
    setPhoto(null);
    router.replace("addProcedure");
  };

  /*
  Takes a picture using takePictureAsync().
  Compresses the image with expo-image-manipulator to ensure it's under 1MB.
  If still above 1MB, recursively compresses it by reducing quality.
  Saves the compressed image to a new location using expo-file-system.
  Navigates to the reviewImage page with the compressed image.
   */

  // Function to take and compress the picture
  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      const photoData = await cameraRef.current.takePictureAsync();
      if (!photoData?.uri) throw new Error("Failed to capture photo");

      console.log("Captured photo URI: ", photoData.uri);

      // Compress image to ensure it's under 1MB
      const compressedPhoto = await compressImage(photoData.uri);

      // Copy to a new location to prevent image loss on app/cache reset
      const newUri = FileSystem.documentDirectory + "tempImage.jpg";
      await FileSystem.copyAsync({ from: compressedPhoto.uri, to: newUri });

      setPhoto(newUri);

      // Navigate to ReviewImage page with photo URI
      router.push({
        pathname: "reviewImage",
        params: { photoUri: newUri, procedureName },
      });
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  }

  // Function to compress the image and ensure it's under 1MB
  async function compressImage(uri: string, quality = 0.8): Promise<{ uri: string }> {
    let compressed = await ImageManipulator.manipulateAsync(uri, [], {
      compress: quality,
    });

    // Check if file exists before accessing size
    const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
    if (fileInfo.exists && fileInfo.size && fileInfo.size > 1024 * 1024) {
      return compressImage(uri, quality - 0.1); // Recursively compress more
    }

    return compressed;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={navigateToAddProcedure}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.header}>Add Image for: {procedureName}</Text>

        {/* Camera View or Photo Preview */}
        <View style={styles.cameraBorder}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.camera} />
          ) : (
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
              {/* Capture Button */}
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInnerButton} />
              </TouchableOpacity>
            </CameraView>
          )}
        </View>

        

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={navigateToAddProcedure}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white", // Ensures the background matches your screen
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    width: 355,
    height: 500,
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
  },
  cameraBorder: {
    width: 360,
    height: 500,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 18,
    justifyContent: "center",
    alignSelf: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#d1d1d1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureInnerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 15,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    borderColor: "#375894",
    top:15,
    marginTop: 9,
    marginBottom: 22,
    borderWidth: 2,
    minWidth: 350, // Minimum width but allows flexibility
    alignSelf: "center", // Centering if inside a flex parent
  },
  cancelButtonText: {
    color: "#375894",
    fontSize: 20,
    fontWeight: "800",
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 5,
    zIndex: 1,
  },
  backText: {
    fontSize: 18,
    color: "#007AFF",
  },
  toggleButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
