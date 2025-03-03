  import React, { useState, useEffect, useRef } from "react";
  import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback, Alert, SafeAreaView } from "react-native";
  import { useRouter, useLocalSearchParams } from "expo-router";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import CryptoJS from "crypto-js";
  import { getDeviceID } from "../components/deviceInfo";

  const AddPearls: React.FC = () => {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView | null>(null);
    const alwaysDoRef = useRef<TextInput | null>(null);
    const watchForRef = useRef<TextInput | null>(null);
    const neverDoRef = useRef<TextInput | null>(null);

    const params = useLocalSearchParams();
    const procedureName = Array.isArray(params.procedureName) ? params.procedureName[0] : params.procedureName;

    const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
    const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
    const [alwaysDo, setAlwaysDo] = useState<string>("");
    const [watchFor, setWatchFor] = useState<string>("");
    const [neverDo, setNeverDo] = useState<string>("");
    const [activeField, setActiveField] = useState<React.RefObject<TextInput> | null>(null);

    useEffect(() => {
      const fetchDeviceID = async () => {
        const id = await getDeviceID();
        setDeviceID(id);
      };
      fetchDeviceID();
    }, []);

    useEffect(() => {
      const fetchAuthorizationCode = async () => {
        const code = await AsyncStorage.getItem("authorizationCode");
        setAuthorizationCode(code);
      };
      fetchAuthorizationCode();
    }, []);

    const navigateToProcedureReviewSummary = async () => {
      if (!deviceID || !deviceID.id || !authorizationCode) {
        Alert.alert("Error", "Device ID or Authorization Code is missing.");
        return;
      }

      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      
      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      const newEntry = {
        always: alwaysDo,
        watch: watchFor,
        never: neverDo,
      };

      // Fetch existing entries
      const existingEntries = await AsyncStorage.getItem(`procedurePearls_${procedureName}`);
      let pearlsArray = existingEntries ? JSON.parse(existingEntries) : [];

      // Add new entry
      pearlsArray.push(newEntry);
      await AsyncStorage.setItem(`procedurePearls_${procedureName}`, JSON.stringify(pearlsArray));

      // Call UpdateProcedure API
      const url = `https://PrefPic.com/dev/PPService/UpdateProcedure.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1&Serial=${encodeURIComponent(procedureName)}&Name=${encodeURIComponent(procedureName)}&Always=${encodeURIComponent(alwaysDo)}&Watch=${encodeURIComponent(watchFor)}&Never=${encodeURIComponent(neverDo)}`;

      try {
        const response = await fetch(url);
        const data = await response.text();

        if (response.ok) {
          Alert.alert('Success', 'Procedure updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update procedure');
        }
      } catch (error) {
        console.error('Error during API call:', error);
        Alert.alert('Error', 'An error occurred while updating the procedure.');
      }

      // Navigate to the library screen
      router.push({
        pathname: "library",
        params: { procedureName },
      });
    };

    const handleFocus = (inputRef: React.RefObject<TextInput>) => {
      setActiveField(inputRef);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 100, animated: true });
      }, 300);
    };

    const handleBlur = () => {
      setActiveField(null);
    };

    const dismissKeyboard = () => {
      Keyboard.dismiss();
      handleBlur();
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.header}>Procedure Pearls</Text>

            {/* Always Do */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <View style={[styles.dot, { backgroundColor: "green" }]} />
                <Text style={styles.label}>Always Do</Text>
              </View>
              <TextInput
                ref={alwaysDoRef}
                style={[styles.input, activeField === alwaysDoRef ? styles.activeInput : {}]}
                multiline
                placeholder="Enter details..."
                value={alwaysDo}
                onChangeText={setAlwaysDo}
                onFocus={() => handleFocus(alwaysDoRef)}
                onBlur={handleBlur}
                returnKeyType="done"
              />
            </View>

            {/* Watch For */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <View style={[styles.dot, { backgroundColor: "orange" }]} />
                <Text style={styles.label}>Watch For</Text>
              </View>
              <TextInput
                ref={watchForRef}
                style={[styles.input, activeField === watchForRef ? styles.activeInput : {}]}
                multiline
                placeholder="Enter details..."
                value={watchFor}
                onChangeText={setWatchFor}
                onFocus={() => handleFocus(watchForRef)}
                onBlur={handleBlur}
                returnKeyType="done"
              />
            </View>

            {/* Never Do */}
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <View style={[styles.dot, { backgroundColor: "red" }]} />
                <Text style={styles.label}>Never Do</Text>
              </View>
              <TextInput
                ref={neverDoRef}
                style={[styles.input, activeField === neverDoRef ? styles.activeInput : {}]}
                multiline
                placeholder="Enter details..."
                value={neverDo}
                onChangeText={setNeverDo}
                onFocus={() => handleFocus(neverDoRef)}
                onBlur={handleBlur}
                returnKeyType="done"
              />
            </View>

            {/* Done Button */}
            {activeField && (
              <TouchableOpacity style={styles.doneButton} onPress={dismissKeyboard}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Next Button */}
            <TouchableOpacity style={styles.button} onPress={navigateToProcedureReviewSummary}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: "#fff",
    },
    backText: {
      fontSize: 18,
      color: "#007AFF",
      marginBottom: 20,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    section: {
      marginBottom: 20,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      backgroundColor: "#f9f9f9",
      minHeight: 120,
    },
    activeInput: {
      borderColor: "#007AFF",
      backgroundColor: "#e6f0ff",
    },
    button: {
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    doneButton: {
      backgroundColor: "#007AFF",
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
      alignSelf: "flex-end",
      marginTop: 10,
    },
    doneText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  export default AddPearls;