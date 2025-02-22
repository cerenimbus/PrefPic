import { router, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePreview: { width: 80, height: 80, borderRadius: 10 },
  
});

export default function ViewEditPicture() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await AsyncStorage.getItem("capturedImages");
        if (storedImages) {
          setImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error("🔹 Error loading images:", error);
      }
    };
  
    loadImages();
  }, []);

  useEffect(() => {
    if (params.photoUri) {
      setImages(prevImages => {
        const updatedImages = [...prevImages, params.photoUri as string];
        return updatedImages.slice(0, 5); // Limit to 5 images
      });
    }
  }, [params.photoUri]);

  const navigateToRetakePicture = (index: number) => {
    router.push({
      pathname: "camera",
      params: { imageIndex: index },
    });
  };

  const navigateToAddPearls = () => {
    router.push("addPearls");
  };

  const handleImagePress = (index: number) => {
    if (images[index]) {
      router.push({
        pathname: "retakePicture",
        params: { photoUri: images[index], imageIndex: index },
      });
    } else {
      navigateToRetakePicture(index);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>View / Edit Picture(s)</Text>
      <Text style={styles.procedure}>[procedureName]</Text>
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
        <TouchableOpacity
          style={styles.addPicture}
          onPress={() => {
            if (images.length < 5) {
              navigateToRetakePicture(images.length);
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