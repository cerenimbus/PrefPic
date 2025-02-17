// Add_2.tsx page
//RJP -> 2/08/2025
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef,useState } from 'react';
import { router,useLocalSearchParams } from "expo-router";
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';
//Alberto -> 2/011/2025
import * as FileSystem from 'expo-file-system';



export default function Camera() {
  const [facing] = useState<CameraType>('back'); //use back camera
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null); // Camera reference
  const { procedureName } = useLocalSearchParams<{ procedureName: string }>();
  

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const navigateToaddprocedure = () => {
    setPhoto(null); 
    router.replace("addProcedure");
  }

  // Function to take a picture
  async function takePicture() {
    if (cameraRef.current) {
      try {
      const photoData = await cameraRef.current.takePictureAsync();
    
   
      // Debugging: Log the captured photo URI
      console.log("Captured photo URI: ", photoData?.uri);
     
       //RJP -> 2/011/2025
    // Check if photoData is defined before setting the URI
    if (photoData?.uri) {
        //Alberto -> 2/011/2025
      //copy the file to a new location to prevent image lost when app or cache reset
     const newUri= FileSystem.documentDirectory + "tempImage.jpg";
     await FileSystem.copyAsync({
      from: photoData.uri, to: newUri,
     });

     setPhoto(newUri); // Save the image URI
     

      // Navigate to Add_3.tsx with the photo URI and procedureName
      router.push({
        pathname: "reviewImage",
        params: { photoUri: newUri, procedureName: procedureName },
      });
    } else {
      console.error("Failed to capture photo: photoData or photoData.uri is undefined");
    }
  } catch (error) {
    console.error("Error capturing photo: ", error);
  }
}
}
  return (
    <View style={styles.container}>

    <TouchableOpacity
      onPress={navigateToaddprocedure}
    >
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>

    <Text style={styles.header}>Add Image for: {procedureName}</Text>

    <View style={styles.cameraBorder}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.camera} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            
            {/* Take Picture Button */}
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInnerButton} />
            </TouchableOpacity>    
          </CameraView>
        )}
      </View>

    <TouchableOpacity style={styles.cancelButton} onPress={navigateToaddprocedure}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center', // Center content
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: 350, // Slightly smaller than the border
    height: 490, // Maintain square shape
    borderRadius: 15, // Match the border rounding
    overflow: 'hidden',
    //flex: 1,
  },
  cameraBorder: {
    width: 360, // Square size
    height: 500, // Square size
    borderWidth: 2, // Border thickness
    borderColor: 'transparent', // Border color
    borderRadius: 18, //  rounded edges
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureButton: {
    position: 'absolute',
    bottom: 20, // Keeps button near the bottom
    alignSelf: 'center',
    width: 60, // iPhone-style button size
    height: 60,
    borderRadius: 30, // Makes it circular
    backgroundColor: 'white', // White outer ring
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#d1d1d1', // Light gray border like iPhone
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },

  captureInnerButton: {
    width: 40, // Smaller inner circle
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff', // White inner button
  },

  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
