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

export default function ProcedureReviewSummary() {
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

  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { name: procedureName },
    });
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
      // setIsNavigating(true); // Show loading screen
      // setNavigateIndex(index); // Store index to use in effect
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

  //=======================================================================================================
  // ✅ ADDED: JM 03-25-2025
  // State for modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleNextPress = () => {
    setIsLoading(true);
    setTimeout(() => {
      //=======================================================================================================
      // ✅ ADDED: JM 03-25-2025
      // Show success modal
      setShowSuccessModal(true); // Show success modal
      setIsLoading(false);

      navigateToLibrary(); // Navigate after the delay
      setIsLoading(false); // Reset loading state after navigation
    }, 1000); // 1000 milliseconds = 1 second
  };

  //=======================================================================================================
  // ✅ ADDED: JM 03-25-2025
  // Function to close modal and navigate
  const closeModalAndNavigate = () => {
    setShowSuccessModal(false);
    navigateToLibrary(); // Navigate to library after modal closes
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* //=======================================================================================================
          // ✅ ADDED: JM 03-25-2025 */}
      {/* Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={closeModalAndNavigate}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="check-circle" size={50} color="green" />
            <Text style={styles.modalText}>
              Procedure "{procedureName}" Created Successfully!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModalAndNavigate}
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
              // ADDED: JM 03-21-2025 
              // Change the back icon*/}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={18} color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.procedureName}>{procedureName}</Text>
            <Text style={styles.subtitle}>Review Summary</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Images Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Images</Text>
                {/* <Text style={styles.editText}>Edit</Text> */}
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
                <View style={styles.label}>
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
            <TouchableOpacity style={styles.button} onPress={handleNextPress}>
              <Text style={styles.buttonText}>
                {isLoading ? "Loading..." : "Done"}
              </Text>
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
    marginBottom: 20,
  },
  procedureName: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  // MODIFIED: JM 03-21-2025
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 10,
    gap: 5,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 15,
    marginLeft: 15, // ADDED: JM 03-21-2025
  },
  //=================================================================
  // ADDED: JM 03-21-2025
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#375894",
    paddingVertical: 15,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
    width: "95%", // ADDED: JM 03-21-2025
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  //MODIFIED: JM 03-21-2025
  centerBox: {
    // marginTop: 20,
    width: "100%", //MODIFIED: JM 03-21-2025
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
    width: "95.3%", //MODIFIED: JM 03-21-2025
  },
  smallBox: {
    width: 100,
    height: 150,
    backgroundColor: "#D9D9D9",
    borderRadius: 10, //MODIFIED: JM 03-21-2025
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
    width: "70%",
    backgroundColor: "white",
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 25,
    textAlign: "center",
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
