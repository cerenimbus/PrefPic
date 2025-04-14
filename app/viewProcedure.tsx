// import { router, useRouter, useLocalSearchParams, useFocusEffect, } from "expo-router";
// import React, {useState, useEffect} from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ProcedureReviewSummary() {
//   const {procedureName, alwaysDo: alwaysDoParam, watchFor: watchForParam, neverDo: neverDoParam}= useLocalSearchParams();
//   // const [alwaysDo, setAlwaysDo] = useState(alwaysDoParam || "");
//   // const [watchFor, setWatchFor] = useState(watchForParam || "");
//   // const [neverDo, setNeverDo] = useState(neverDoParam || "");
//   const router =  useRouter();

//   const navigateToLibrary = () => {
//     router.push({
//       pathname: "library",
//       params: { procedureName, alwaysDo, watchFor, neverDo },
//     });
//   }

//   const params = useLocalSearchParams();
//     const [descriptionText, setDescriptionText] = useState<string>(""); // Added state for description
//     const [notesText, setNotesText] = useState<string>(""); // Added state for notes
//    const [images, setImages] = useState<string[]>([]);
//   const [alwaysDo, setAlwaysDo] = useState(alwaysDoParam || "");
//   const [watchFor, setWatchFor] = useState(watchForParam || "");
//   const [neverDo, setNeverDo] = useState(neverDoParam || "");

//   const navigatetoaddpearls = () => {
//     router.push({
//       pathname: "viewEditPicture",
//       params: { procedureName, alwaysDo, watchFor, neverDo },
//     });
//   }
//   // MG 02/28/2025
//   // get the saved pearl with a unique key
//   useEffect(() => {
//     const fetchProcedurePearls = async () => {
//       try {
//         const pearls = await AsyncStorage.getItem(`procedurePearls_${procedureName}`);
//         if (pearls) {
//           const pearlsArray = JSON.parse(pearls);
//           setAlwaysDo(pearlsArray[0] || ""); // Set the first item
//           setWatchFor(pearlsArray[1] || ""); // Set the second item
//           setNeverDo(pearlsArray[2] || ""); // Set the third item
//         }
//       } catch (error) {
//         console.error('Error fetching procedure pearls:', error);
//       }
//     };

//     fetchProcedurePearls();
//   }, [procedureName]);

//   const navigateToRetakePicture = (index: number) => {
//     router.push({
//       pathname: "camera",
//       params: { imageIndex: index, procedureName },
//     });
//   };

//   const handleImagePress = (index: number) => {
//     console.log("🔹 handleImagePress - procedureName:", procedureName); // Log procedureName to debug
//     if (images[index]) {
//       router.push({
//         pathname: "retakePicture",
//         params: {
//           photoUri: images[index],
//           imageIndex: index,
//           procedureName,
//           updatedDescription: descriptionText, // Pass description
//           updatedNotes: notesText // Pass notes
//         },
//       });
//     } else {
//       navigateToRetakePicture(index);
//     }
//   };

//   useEffect(() => {
//     const loadImages = async () => {
//       try {
//         const storedImages = await AsyncStorage.getItem("capturedImages");
//         if (storedImages) {
//           setImages(JSON.parse(storedImages));
//         }
//       } catch (error) {
//         console.error("Error loading images:", error);
//       }
//     };
//     loadImages();
//   }, []);

//   useEffect(() => {
//     if (params.photoUri) {
//       setImages((prevImages) => {
//         const updatedImages = [...prevImages, params.photoUri as string];
//         AsyncStorage.setItem("capturedImages", JSON.stringify(updatedImages.slice(0, 5))); // Save to AsyncStorage
//         return updatedImages.slice(0, 5); // Limit to 5 images
//       });
//     }
//   }, [params.photoUri]);

//   // const navigateToLoading = () => {
//   //   router.push("loading");
//   // }
//   return (
//     <View style={styles.container}>

//         <TouchableOpacity onPress={() => router.back()}>
//             <Text style={styles.backText}>←  Back</Text>
//         </TouchableOpacity>

//       <View style={styles.titleSection}>
//       <Text style={styles.procedureNameText}>{procedureName}</Text>
//       </View>

//       <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
//         {/*
//         //RHCM
//         //Images Section */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>Images</Text>
//           </View>
//          <View style={styles.centerBox}>
//                 <View style={styles.boxContainer}>
//                   {Array.from({ length: 5 }).map((_, index) => (
//                     <TouchableOpacity key={index} style={styles.smallBox} onPress={() => handleImagePress(index)}>
//                       {images[index] ? (
//                         <Image source={{ uri: images[index] }} style={styles.image} />
//                       ) : (
//                         <Text style={styles.plusSign}>+</Text>
//                       )}
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//         </View>

//         {/*
//         //RHCM
//         //Procedure Pearls Section */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>Procedure Pearls</Text>
//             <Text style={styles.editText}>Edit</Text>
//           </View>
//           <View>
//             <Text style={[styles.label, { color: "green" }]}>● Always Do</Text>
//             <Text style={styles.description}>
//               {alwaysDo}
//             </Text>

//             <Text style={[styles.label, { color: "orange" }]}>● Watch For</Text>
//             <Text style={styles.description}>
//               {watchFor}
//             </Text>

//             <Text style={[styles.label, { color: "red" }]}>● Never Do</Text>
//             <Text style={styles.description}>
//               {neverDo}
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       <TouchableOpacity style={styles.button} onPress={navigatetoaddpearls}>
//         <Text style={styles.buttonText}>Edit</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.deleteButton} onPress={navigateToLibrary}>
//         <Text style={styles.FinishButtonText}>Delete</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f2f6fc",
//     padding: 20,
//   },
//   procedureNameText: {
//     fontSize: 45,
//     marginBottom: 10,
//     textAlign: "center",
//     fontFamily: "Roboto",
//   },
//   deleteButton: {
//     backgroundColor: "#FFFFF",
//     paddingVertical: 14,
//     borderRadius: 31,
//     alignItems: "center",
//     marginTop: 10,
//     borderColor: "375894",
//     borderWidth: 1,
//   },
//   FinishButtonText: {
//     color: "#375894",
//     fontSize: 16, // Adjusted font size
//     fontWeight: "bold",
//   },
//   backText: {
//     fontSize: 16,
//     color: "#3b82f6",
//     marginBottom: 10,
//   },
//   titleSection: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   procedureName: {
//     fontSize: 20,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     alignItems: "center",
//   },
//   editText: {
//     fontSize: 14,
//     color: "#3b82f6",
//   },
//   imagesContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   imagePlaceholder: {
//     width: "30%",
//     aspectRatio: 1,
//     backgroundColor: "#e5e7eb",
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   description: {
//     fontSize: 14,
//     color: "#4b5563",
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: "#375894",
//     paddingVertical: 15,
//     borderRadius: 31,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   centerBox: {
//     marginTop: 20,
//     width: 280,
//     height: 350,
//     backgroundColor: "#FFFFFF",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//     padding: 10,
//   },
//   boxContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     gap: 10,
//     width: "100%",
//   },
//   smallBox: {
//     width: 80,
//     height: 150,
//     backgroundColor: "#D9D9D9",
//     borderRadius: 5,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   plusSign: {
//     fontSize: 40,
//     color: "#375894",
//     fontWeight: "bold",
//   },
//   image: { width: "100%", height: "100%", resizeMode: "cover" },
//   imagePreview: { width: 80, height: 80, borderRadius: 10 },
// });
import { router, useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal, // ✅ ADDED: JM 03-25-2025
} from "react-native";
import { getDeviceID } from "../components/deviceInfo";
import CryptoJS from "crypto-js";
import { XMLParser } from "fast-xml-parser";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Feather } from "@expo/vector-icons"; // ADDED: JM 03-21-2025

export default function () {
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [procedureName, setProcedureName] = useState("");
  const [procedureSerial, setProcedureSerial] = useState(""); // State for Serial
  const [images, setImages] = useState<string[]>([]);
  const [alwaysDo, setAlwaysDo] = useState("");
  const [watchFor, setWatchFor] = useState("");
  const [neverDo, setNeverDo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigateIndex, setNavigateIndex] = useState<number | null>(null);

  const [authorizationCode, setAuthorizationCode] = useState<string | null>(
    null
  ); // Added state for authorization code

  const router = useRouter();
  const params = useLocalSearchParams();
  const { serial } = params;
  const [imageDetails, setImageDetails] = useState<
    { pictureName: string; pictureNote: string }[]
  >([]);

  const [procedureDetails, setProcedureDetails] = useState({
    alwaysDo: "",
    watchFor: "",
    neverDo: "",
  });

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();

      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  useEffect(() => {
    if (deviceID) {
      getProcedureList();
    }
  }, [deviceID]);

  // Fetch authorization code from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchAuthorizationCode = async () => {
      try {
        console.log("Fetching authorization code from AsyncStorage...");
        const code = await AsyncStorage.getItem("authorizationCode");
        if (code) {
          console.log("Fetched authorization code:", code); // Debugging statement
          setAuthorizationCode(code);
        } else {
          console.log("No authorization code found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching authorization code:", error);
      }
    };
    fetchAuthorizationCode();
  }, []); // Added useEffect to fetch authorization code

  const getProcedureList = async () => {
    setIsLoading(true);
    try {
      if (!deviceID) {
        console.log("Device ID:", deviceID);
        throw new Error("Device information not found");
      }
      console.log("DeviceID:", deviceID.id);

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

      const url = `https://PrefPic.com/dev/PPService/GetProcedure.php?DeviceID=${encodeURIComponent(
        deviceID.id
      )}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1&Procedure=${serial}`;

      console.log("URL:", url);

      const response = await fetch(url);
      const data = await response.text();
      // console.log("Response",response);
      console.log("Data", data);

      const parser = new XMLParser();
      const result = parser.parse(data);
      const procedureList = result?.ResultInfo?.Selections?.Procedure;
      const procedureName = result?.resultInfo?.Selections?.Name;
      const procedureSerial = result?.resultInfo?.Selections?.Serial;

      if (procedureList) {
        const procedureName = procedureList?.ProcedureName || "";
        const alwaysDo = procedureList?.Always || "";
        const watchFor = procedureList?.Watch || "";
        const neverDo = procedureList?.Never || "";

        const proceduresArray = Array.isArray(procedureList)
          ? procedureList
          : [procedureList];

        const extractedImages: string[] = [];
        const extractedImageDetails: {
          pictureName: string;
          pictureNote: string;
        }[] = [];

        proceduresArray.forEach((proc) => {
          const pictures = proc?.Pictures?.Picture;
          if (!pictures) return;

          const pictureArray = Array.isArray(pictures) ? pictures : [pictures];

          pictureArray.forEach((picture) => {
            extractedImages.push(`data:image/jpeg;base64,${picture.Media}`);
            extractedImageDetails.push({
              pictureName: picture.PictureName || "",
              pictureNote: picture.PictureNote || "",
            });
          });
        });

        setProcedureName(procedureName);
        setProcedureSerial(procedureSerial);
        setProcedureDetails({ alwaysDo, watchFor, neverDo });
        setImages(extractedImages);
        setImageDetails(extractedImageDetails); // Store image details separately
      }
    } catch (error) {
      console.error("Error fetching procedure list:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching the procedure list"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isNavigating && navigateIndex !== null) {
      const timer = setTimeout(() => {
        const pictureName = imageDetails[navigateIndex]?.pictureName || "";
        const pictureNote = imageDetails[navigateIndex]?.pictureNote || "";

        router.push({
          pathname: "editPictureText",
          params: {
            photoUri: images[navigateIndex],
            imageIndex: navigateIndex,
            procedureName: procedureName,
            updatedDescription: pictureName,
            updatedNotes: pictureNote,
          },
        });

        setIsNavigating(false); // Reset loading after navigation
        setNavigateIndex(null);
      }, 300); // Short delay to let the loading screen render

      return () => clearTimeout(timer); // Cleanup
    }
  }, [isNavigating, navigateIndex]);

  const handleImagePress = async (index: number) => {
    if (images[index]) {
      setIsNavigating(true); // Show loading screen
      setNavigateIndex(index); // Store index to use in effect
    } else {
      // Navigate to camera
      router.push({
        pathname: "camera",
        params: {
          procedureName: procedureName,
        },
      });
    }
  };

  const navigateToAddPearls = () => {
    console.log("Procedure Serial:", serial);
    router.push({
      pathname: "addPearls",
      params: {
        updatedProcedureSerial: serial,
        procedureName: procedureName,
        alwaysDo: procedureDetails.alwaysDo,
        watchFor: procedureDetails.watchFor,
        neverDo: procedureDetails.neverDo,
      },
    });
  };

  const handleNextPress = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigateToLibrary(); // Navigate after the delay
      setIsLoading(false); // Reset loading state after navigation
    }, 1000); // 1000 milliseconds = 1 second
  };

  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { name: procedureName },
    });
  };

  //=======================================================================================================
  // ✅ ADDED: JM 03-25-2025
  // State for modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success Deletion modal

  // Show delete confirmation modal
  const confirmDeleteProcedure = () => {
    setShowDeleteModal(true);
  };

  const deleteProcedure = async () => {
    // Close delete confirmation modal
    setShowDeleteModal(false);

    if (!serial || !deviceID || !authorizationCode) {
      Alert.alert(
        "Error",
        "Missing required information to delete the procedure."
      );
      return;
    }

    const procedureSerial = Array.isArray(serial) ? serial[0] : serial;
    const authCode = Array.isArray(authorizationCode)
      ? authorizationCode[0]
      : authorizationCode;

    setIsLoading(true);
    try {
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

      const keyString = `${deviceID.id}${formattedDate}${authCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      const url = `https://PrefPic.com/dev/PPService/DeleteProcedure.php?DeviceID=${encodeURIComponent(
        deviceID.id
      )}&Date=${formattedDate}&Key=${key}&AC=${authCode}&PrefPicVersion=1&Serial=${encodeURIComponent(
        procedureSerial
      )}`;

      const response = await fetch(url, { method: "GET" });
      const responseText = await response.text();

      console.log("Delete Response:", responseText);

      if (responseText.includes("<Result>Success</Result>")) {
        console.log(
          `Procedure Deleted: Name - ${procedureName}, Serial - ${procedureSerial}`
        );

        // Remove procedure pearls from AsyncStorage
        await AsyncStorage.removeItem(`procedurePearls_${procedureName}`);
        await AsyncStorage.removeItem(`procedurePearls_${procedureSerial}`);

        //=======================================================================================================
        // ✅ ADDED: JM 03-25-2025
        // Show success deletion modal
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to delete procedure.");
      }
    } catch (error) {
      console.error("Error deleting procedure:", error);
      Alert.alert("Error", "An error occurred while deleting the procedure.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to close success modal and navigate to library
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace("library");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* //=======================================================================================================
          // ✅ ADDED: JM 03-25-2025 */}
      {/* Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="alert-circle" size={50} color="red" />
            <Text style={styles.modalTitle}>Delete Procedure</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete the procedure: {procedureName}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={deleteProcedure}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="check-circle" size={50} color="green" />
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>
              Procedure "{procedureName}" deleted successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeSuccessModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isLoading || isNavigating ? (
        // Loading Screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A5A8C" />
        </View>
      ) : (
        // Main Content
        <>
          {/* //=================================================================
        // ADDED: 03-21-2025 
        // Change the back icon*/}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={18} color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Images Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Images</Text>
                {/* <Text style={styles.editText}>Edit</Text>  */}
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.procedureName}>{procedureName}</Text>
                {/* <Text style={styles.subtitle}>Review Summary</Text> */}
              </View>

              <View style={styles.centerBox}>
                <View style={styles.boxContainer}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.smallBox}
                      onPress={() => handleImagePress(index)}
                    >
                      {images[index] ? (
                        <Image
                          source={{ uri: images[index] }}
                          style={styles.image}
                        />
                      ) : (
                        <Text style={styles.plusSign}>+</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Procedure Pearls Section */}
            <SafeAreaView style={styles.card}>
              {/* //================================================================= */}
              {/* // MODIFIED: JM 03-21-2025 */}
              <View style={styles.cardProcedurePearls}>
                <Text style={styles.cardTitle}>Procedure Pearls</Text>
                <TouchableOpacity onPress={navigateToAddPearls}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={{ left: 10 }}>
                <View style={styles.procedurePearls}>
                  <Text style={[{ color: "green" }]}>● Always Do</Text>
                  <Text style={styles.description}>
                    {procedureDetails.alwaysDo}
                  </Text>

                  <Text style={[{ color: "orange" }]}>● Watch For</Text>
                  <Text style={styles.description}>
                    {procedureDetails.watchFor}
                  </Text>

                  <Text style={[{ color: "red" }]}>● Never Do</Text>
                  <Text style={styles.description}>
                    {procedureDetails.neverDo}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </ScrollView>

          {/* //=================================================================
        // ADDED: JM 03-21-2025 
        // Put the button inside the view*/}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDeleteProcedure}
            >
              <Text style={styles.FinishButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#375894",
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f6fc",
    padding: 20,
    alignContent: "center",
  },
  //=================================================================
  // Added: JM 2025/03/07
  backButton: {
    // top: 20,
    zIndex: 50,
    flexDirection: "row",
    left: 5,
  },
  backText: {
    fontSize: 18,
    color: "#3b82f6",
    marginBottom: 10,
  },
  titleSection: {
    alignItems: "center",
    marginTop: 10,
  },
  procedureName: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  // subtitle: {
  //   fontSize: 20,
  //   color: "#6b7280",
  // },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  //=================================================================
  // MODIFIED: JM 03-21-2025
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 15,
  },
  //=================================================================
  // ADDED: JM 03-21-2025
  cardProcedurePearls: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
  //=================================================================
  // ADDED: JM 03-21-2025
  procedurePearls: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 10,
    gap: 10,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 15,
    marginLeft: 15, // ADDED: JM 03-21-2025
  },
  //=================================================================
  // ADDED: 03-21-2025
  buttonContainer: {
    alignItems: "center",
  },
  //=================================================================
  // MODIFIED: JM 03-21-2025
  deleteButton: {
    backgroundColor: "#375894",
    paddingVertical: 15,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
    width: "95%", // ADDED: JM 03-21-2025
  },
  //=================================================================
  // MODIFIED: JM 03-21-2025
  FinishButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // MODIFIED: JM 03-21-2025
  centerBox: {
    width: "100%",
    height: 350,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  // MODIFIED: JM 03-21-2025
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
    width: "89.5%", // MODIFIED: JM 03-21-2025
  },
  smallBox: {
    width: 100,
    height: 150,
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // ADDED: JM 03-21-2025
  },
  plusSign: {
    fontSize: 40,
    color: "#375894",
    fontWeight: "bold",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePreview: { width: 80, height: 80, borderRadius: 10 },

  //=======================================================================================================
  // ✅ ADDED: JM 03-25-2025
  // Style for Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "75%",
    backgroundColor: "white",
    paddingVertical: 30,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    width: "50%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
