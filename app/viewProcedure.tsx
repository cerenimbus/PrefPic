import { router, useRouter, useLocalSearchParams, useFocusEffect, } from "expo-router";
import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProcedureReviewSummary() {
  const {procedureName, alwaysDo: alwaysDoParam, watchFor: watchForParam, neverDo: neverDoParam}= useLocalSearchParams();
  const router =  useRouter();

  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  }
  const params = useLocalSearchParams();
    const [descriptionText, setDescriptionText] = useState<string>(""); // Added state for description
    const [notesText, setNotesText] = useState<string>(""); // Added state for notes
   const [images, setImages] = useState<string[]>([]);
  const [alwaysDo, setAlwaysDo] = useState(alwaysDoParam || "");
  const [watchFor, setWatchFor] = useState(watchForParam || "");
  const [neverDo, setNeverDo] = useState(neverDoParam || "");
  const navigatetoaddpearls = () => {
    router.push({
      pathname: "viewEditPicture",   
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  }
  // MG 02/28/2025
  // get the saved pearl with a unique key 
  useEffect(() => {
    const fetchProcedurePearls = async () => {
      try {
        const pearls = await AsyncStorage.getItem(`procedurePearls_${procedureName}`);
        if (pearls) {
          const pearlsArray = JSON.parse(pearls);
          setAlwaysDo(pearlsArray[0] || ""); // Set the first item
          setWatchFor(pearlsArray[1] || ""); // Set the second item
          setNeverDo(pearlsArray[2] || ""); // Set the third item
        }
      } catch (error) {
        console.error('Error fetching procedure pearls:', error);
      }
    };

    fetchProcedurePearls();
  }, [procedureName]);

  const navigateToRetakePicture = (index: number) => {
    router.push({
      pathname: "camera",
      params: { imageIndex: index, procedureName },
    });
  };


  const handleImagePress = (index: number) => {
    console.log("🔹 handleImagePress - procedureName:", procedureName); // Log procedureName to debug
    if (images[index]) {
      router.push({
        pathname: "retakePicture",
        params: { 
          photoUri: images[index], 
          imageIndex: index, 
          procedureName,
          updatedDescription: descriptionText, // Pass description
          updatedNotes: notesText // Pass notes
        },
      });
    } else {
      navigateToRetakePicture(index);
    }
  };

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
    if (params.photoUri) {
      setImages((prevImages) => {
        const updatedImages = [...prevImages, params.photoUri as string];
        AsyncStorage.setItem("capturedImages", JSON.stringify(updatedImages.slice(0, 5))); // Save to AsyncStorage
        return updatedImages.slice(0, 5); // Limit to 5 images
      });
    }
  }, [params.photoUri]);

    

  // const navigateToLoading = () => {
  //   router.push("loading");
  // }
  return (
    <View style={styles.container}>
     
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←  Back</Text>
        </TouchableOpacity>

      
      <View style={styles.titleSection}>
      <Text style={styles.procedureNameText}>{procedureName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 
        //RHCM 
        //Images Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Images</Text>
          </View>
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
        </View>

        {/* 
        //RHCM 
        //Procedure Pearls Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Procedure Pearls</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
          <View>
            <Text style={[styles.label, { color: "green" }]}>● Always Do</Text>
            <Text style={styles.description}>
              {alwaysDo}
            </Text>

            <Text style={[styles.label, { color: "orange" }]}>● Watch For</Text>
            <Text style={styles.description}>
              {watchFor}
            </Text>

            <Text style={[styles.label, { color: "red" }]}>● Never Do</Text>
            <Text style={styles.description}>
              {neverDo}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={navigatetoaddpearls}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={navigateToLibrary}>
        <Text style={styles.FinishButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6fc",
    padding: 20,
  },
  procedureNameText: {
    fontSize: 45,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto',
},
  deleteButton:{
    backgroundColor: "#FFFFF",
    paddingVertical: 14,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
    borderColor: "375894",
    borderWidth: 1,
  },
  FinishButtonText: {
    color: "#375894"  ,
    fontSize: 16, // Adjusted font size
    fontWeight: "bold",
},
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 10,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  procedureName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
  },
  editText: {
    fontSize: 14,
    color: "#3b82f6",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imagePlaceholder: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#375894",
    paddingVertical: 15,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
