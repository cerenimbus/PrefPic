import { Router, useRouter,useLocalSearchParams} from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";



export default function ViewEditPicture() {
  const router = useRouter();
  const [photoUriState, setPhotoUriState]= useState<string | null>(null);
  
  const { photoUri, procedureName } = useLocalSearchParams<{
      photoUri: string;
      procedureName: string;
    }>();
   console.log(photoUri);

    // const params = useLocalSearchParams();

    // const procedureName = params.procedureName as string;

  useEffect(() => {
    if(photoUri){
      const cleanedUri = decodeURIComponent(photoUri);
      console.log("Cleaned URI:", cleanedUri);
      setPhotoUriState(cleanedUri);
    } else {
      setPhotoUriState(null);
  }}, [photoUri]);

  const bulletPointText = `
• Best to have x tool on the edge of table
• Do not rearrange
• xyz
`;


const navigateToCamera = () => {
  setPhotoUriState(null);
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
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Image for: {procedureName}</Text>

      {/* Image */}
      {/* <View style={styles.imageContainer}>
  <Image style={styles.image} source={{ uri: photoUri }} />
</View> */}

{photoUriState ? (
  <Image source={{ uri: photoUriState || undefined }} style={styles.image} />
) : (
  <Text style={{ textAlign: "center", marginVertical: 20 }}>No image available</Text>
)}


        {/* Retake picture */}
        <TouchableOpacity style={styles.retakePicture} onPress={navigateToCamera}>
          <Text style={styles.retakePictureText}>Retake pic</Text>
        </TouchableOpacity>

      {/* Center box */}
      <View style={styles.centerBox}>
        <Text style={styles.description}>Description</Text>
        <TouchableOpacity style={styles.edit} onPress={() => router.back()}>
        <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
        <Text style={styles.contents}>Back Table equipment</Text>
        <Text style={styles.notes}>Notes</Text>
        <Text style={styles.bulletText}>{bulletPointText}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.delete} onPress={() => router.back()}>
          <Text style={styles.deletebuttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.save} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
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
    marginLeft: 22,
    width: 150,
  },

  delete: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#375894",
    width: 150,
    borderWidth: 2,
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
    width: 320,
    height: 220,
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
    position: "absolute",
    top: 10,
    left: 10,
  },
  edit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#375894",
    position: "absolute",
    top: 10,
    right: 10,
    textDecorationLine: "underline",
  },

  contents: {
    fontSize: 16,
    color: "#000",
    position: "absolute",
    top: 40,
    left: 10,
  },
  notes: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    position: "absolute",
    top: 90,
    left: 10,
  },
  bulletText: {
    fontSize: 14,
    color: "#000",
    position: "absolute",
    top: 85, 
    left: 15,
    padding: 5,
    margin: 10,
  },
  image: {
    height: 250,  
    borderRadius: 30,
    marginTop: 10,  
    alignSelf: "center",  
  },
  imageContainer:{
    width: "100%",
  alignItems: "center",
  position: "relative", 
  },

  retakePicture:{
    position: "absolute",  
    bottom: 470,  
    left: "50%",  
    transform: [{ translateX: -75 }], 
    padding: 14,
    borderRadius: 31,
    alignItems: "center",
    borderColor: "#FFFF",
    width: 170,
    backgroundColor: "#375894",
    borderWidth: 2,
  },
  retakePictureText:{
    color: "#FFFF",
    fontSize: 16,
    fontWeight: "600",
    
  },

});
