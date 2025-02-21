import { Router, router, useRouter,useLocalSearchParams} from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

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
    fontWeight: 600,
  },
  
  procedure: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 3,
    paddingTop: 3,
  },
  tapOnPic:{
    fontSize: 18,
    textAlign: "center",
    marginVertical: 3,
    paddingTop: 20,
    fontWeight: 400,
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
  } ,
  plusSign:{
    fontSize: 40,
    color: "#375894", 
    fontWeight: "bold",
  },

  
});



export default function viewEditPicture() {
  const router = useRouter();
  const [photoUriState, setPhotoUriState] = useState<string | null>(null);
  const { photoUri, procedureName } = useLocalSearchParams<{
    photoUri: string;
    procedureName: string;
  }>();
 console.log(photoUri);

useEffect(() => {
    if(photoUri){
      setPhotoUriState(decodeURIComponent(photoUri)+`?t=${Date.now()}`);
    } else {
      setPhotoUriState(null);
  }}, [photoUri]);



  const navigateToretakePicture = () => {
    router.push({
      pathname: "retakePicture",
      params: { procedureName, photoUri: photoUriState },
    });
  };
  const navigateToAddPearls = () => {
    router.push("addPearls");
  }

  const navigateToCamera = () => {
    router.replace({
      pathname: "camera",
      // Pass the procedureName as a query parameter so it doesn't get lost
      params: { procedureName },
    });
  }
  
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>←  Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>View / Edit Picture(s)</Text>
      <Text style={styles.procedure}>{procedureName}</Text>
      <Text style={styles.tapOnPic}>Tap on picture to view/edit</Text>


        {/* Center box */}
        <View style={styles.centerBox}>
  <View style={styles.boxContainer}>
    {[...Array(5)].map((_, index) => (
      <TouchableOpacity key={index} style={styles.smallBox} onPress={navigateToretakePicture}>
        {photoUri ? (
          <Image 
            source={{ uri: photoUri }} 
            style={{ width: 80, height: 150, borderRadius: 5 }} 
          />
        ) : (
          <Text style={styles.plusSign}>+</Text>
        )}
      </TouchableOpacity>
    ))}
  </View>
</View>

        {/* Buttons */}
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.addPicture} onPress={navigateToCamera}>
          <Text style={styles.addPicturebuttonText}>Add more pictures</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.nextbutton} onPress={navigateToAddPearls}>
          <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
        </View>
    </View>

  );
}
