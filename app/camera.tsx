import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator'; // Import image manipulator

export default function Camera() {
  const [facing] = useState<CameraType>('back'); // Use back camera
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null); // Camera reference
  const { procedureName } = useLocalSearchParams<{ procedureName: string }>();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const navigateToAddProcedure = () => {
    setPhoto(null);
    router.replace("addProcedure");
  };

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
    let compressed = await ImageManipulator.manipulateAsync(uri, [], { compress: quality });
  
    // Check if file exists before accessing size
    const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
    if (fileInfo.exists && fileInfo.size && fileInfo.size > 1024 * 1024) {
      return compressImage(uri, quality - 0.1); // Recursively compress more
    }
    
    return compressed;
  }
  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigateToAddProcedure}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Add Image for: {procedureName}</Text>

      <View style={styles.cameraBorder}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.camera} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInnerButton} />
            </TouchableOpacity>
          </CameraView>
        )}
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={navigateToAddProcedure}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    width: 350,
    height: 490,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cameraBorder: {
    width: 360,
    height: 500,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#d1d1d1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureInnerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
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
    marginTop: 9,
    marginBottom: 22,
    borderWidth: 2,
  },
  cancelButtonText: {
    color: "#375894",
    fontSize: 16,
    fontWeight: "800",
  },
  backText: {
    marginTop: 5,
    fontSize: 16,
    color: '#007AFF',
  },
});

