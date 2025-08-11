/*
---> add_2.tsx Camera script
---> RJP -> 2/08/2025 [Started Coding from scratch]
---> RJP -> 2/10/2025 [Create PhotoUri to test Image transfering to the next page]
---> RJP -> 2/14/2025 [Added function to compress image maximum to 1mb image file size]
---> RJP -> 2/15/2025 [Debug errors in URI for image transfer to the next page]
---> RJP -> 3/2/2025 [Added Safeview to the styling]
---> RHCM -> 4/30/2025 [Added switch camera, flash toggle, pinch-to-zoom, and zoom slider]
*/
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
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
import Slider from "@react-native-community/slider";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { GestureHandlerRootView, PinchGestureHandler } from "react-native-gesture-handler";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMode>("off");
  const [zoom, setZoom] = useState(0); // Ranges from 0 to 1
  const cameraRef = useRef<CameraView | null>(null);
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

  const navigateToAddProcedure = () => {
    setPhoto(null);
    router.replace("addProcedure");
  };

  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      // const photoData = await cameraRef.current.takePictureAsync({ flash: flash });
      const photoData = await cameraRef.current.takePictureAsync();
      if (!photoData?.uri) throw new Error("Failed to capture photo");

      const compressedPhoto = await compressImage(photoData.uri);
      const newUri = FileSystem.documentDirectory + "tempImage.jpg";
      await FileSystem.copyAsync({ from: compressedPhoto.uri, to: newUri });

      setPhoto(newUri);

      router.push({
        pathname: "reviewImage",
        params: { photoUri: newUri, procedureName },
      });
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  }

  async function compressImage(uri: string, quality = 0.8): Promise<{ uri: string }> {
    let compressed = await ImageManipulator.manipulateAsync(uri, [], { compress: quality });
    const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
    if (fileInfo.exists && fileInfo.size && fileInfo.size > 1024 * 1024) {
      return compressImage(uri, quality - 0.1);
    }
    return compressed;
  }

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Add Image for: {procedureName}</Text>

        {/* Camera or Image Preview */}
        <View style={styles.cameraBorder}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.camera} />
          ) : (
            <PinchGestureHandler
              onGestureEvent={(event) => {
                const pinchZoom = Math.min(Math.max(event.nativeEvent.scale * zoom, 0), 1);
                setZoom(pinchZoom);
              }}
            >
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                zoom={zoom}
                flash={flash}
              >
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureInnerButton} />
                </TouchableOpacity>
              </CameraView>
            </PinchGestureHandler>
          )}
        </View>

        {/* Zoom Slider */}
        {!photo && (
          <Slider
            style={styles.zoomSlider}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={(value) => setZoom(value)}
          />
        )}

        {/* Switch Camera Button */}
        {!photo && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Text style={styles.toggleButtonText}>Switch Camera</Text>
          </TouchableOpacity>
        )}

        {/* Toggle Flash Button */}
        {!photo && (
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
          >
            <Text style={styles.toggleButtonText}>
              Flash: {flash === "off" ? "OFF" : "ON"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={navigateToAddProcedure}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
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
    height: 350,
    borderRadius: 15,
    overflow: "hidden",
    alignItems: "center",
  },
  cameraBorder: {
    width: 360,
    height: 350,
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
    top: 15,
    marginTop: 4,
    marginBottom: 22,
    borderWidth: 2,
    minWidth: 350,
    alignSelf: "center",
  },
  cancelButtonText: {
    color: "#375894",
    fontSize: 20,
    fontWeight: "800",
  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
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
    marginTop: 5,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  flashButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 5,
  },
  zoomSlider: {
    width: 300,
    alignSelf: "center",
    marginTop: 5,
  },
});
