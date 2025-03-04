import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';

export default function ProcedureReviewSummary() {
  const router = useRouter();
  // const { 
  //   procedureSerial, 
  //   alwaysDo: initialAlwaysDo, 
  //   watchFor: initialWatchFor, 
  //   neverDo: initialNeverDo 
  // } = useLocalSearchParams();
  // State for alwaysDo, watchFor, and neverDo
  // const [alwaysDo, setAlwaysDo] = useState<string>(Array.isArray(initialAlwaysDo) ? initialAlwaysDo[0] : initialAlwaysDo || "");
  // const [watchFor, setWatchFor] = useState<string>(Array.isArray(initialWatchFor) ? initialWatchFor[0] : initialWatchFor || "");
  // const [neverDo, setNeverDo] = useState<string>(Array.isArray(initialNeverDo) ? initialNeverDo[0] : initialNeverDo || "");
  // const params = useLocalSearchParams();
  // const{procedureName, procedureSerial} = params;
  //const [procedureName, setProcedureName] = useState('');
  const { name,serial,alwaysDo,watchFor,neverDo } = useLocalSearchParams();
  useEffect(() => {
    console.log("Received parameters:", { name, serial, alwaysDo, watchFor, neverDo }); // Debugging log
}, [name, serial, alwaysDo, watchFor, neverDo])
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [procedures, setProcedures] = useState<{name:string;serial:string}[]>([]);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      console.log("Fetched Device ID:", id);
      setDeviceID(id);
    };

    const fetchAuthorizationCode = async () => {
      try {
        const code = await AsyncStorage.getItem("authorizationCode");
        console.log("Fetched Authorization Code:", code);
        setAuthorizationCode(code);
      } catch (error) {
        console.error("Error fetching authorization code:", error);
      }
    };

    fetchDeviceID();
    fetchAuthorizationCode();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let didCallAPI = false;
        const fetchProcedureDetails = async () => {
      if (!deviceID || !deviceID.id || !authorizationCode || !serial) {
        Alert.alert("Error", "Device ID, Authorization Code, or Procedure Serial is missing.");
        return; // Exit early if values are not valid
      }

      const procedureSerialString = Array.isArray(serial) ? serial.join(",") : serial;

      //const validProcedureSerial = Array.isArray(procedureSerial) ? procedureSerial[0] : procedureSerial;

      try {
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(
          currentDate.getDate()
        ).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(
          currentDate.getMinutes()
        ).padStart(2, '0')}`;
            
        const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
        const key = CryptoJS.SHA1(keyString).toString();

        const url = `https://PrefPic.com/dev/PPService/GetProcedure.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1&Procedure=${encodeURIComponent(procedureSerialString)}`;
        console.log('Fetching Getprocedure from URL:', url); // Debugging statement
        console.log('Serial Number', procedureSerialString);
        const response = await fetch(url);
        const data = await response.text();
        //console.log('API response:', data); // Debugging statement

        const parser = new XMLParser();
        const result = parser.parse(data);

            const resultInfo = result?.ResultInfo;

        // const result = xmlDocument.ResultInfo.Result;

        // if (result === "Success") {
        //   setProcedureName(result.ResultInfo.Procedure.ProcedureName);
        //   // Update alwaysDo, watchFor, and neverDo with the unique values
        //   const fetchedAlwaysDo = result.ResultInfo.Selections.Procedure.Always || "";
        //   const fetchedWatchFor = result.ResultInfo.Selections.Procedure.Watch || "";
        //   const fetchedNeverDo = result.ResultInfo.Selections.Procedure.Never || "";

        //   // Avoid duplicates
        //   if (!fetchedAlwaysDo.includes(alwaysDo)) {
        //     setAlwaysDo(fetchedAlwaysDo);
        //   }
        //   if (!fetchedWatchFor.includes(watchFor)) {
        //     setWatchFor(fetchedWatchFor);
        //   }
        //   if (!fetchedNeverDo.includes(neverDo)) {
        //     setNeverDo(fetchedNeverDo);
        //   }
        // } else {
        //   const message = result.ResultInfo.Message || "Failed to retrieve procedure details.";
        //   Alert.alert("Error", message);
        // }
      } catch (error) {
        console.error("Error fetching procedure details:", error);
        Alert.alert("Error", "An error occurred while fetching procedure details.");
        } finally {
          didCallAPI = true; // Ensure we do not call the API again during this focus
        }
      };
  
      fetchProcedureDetails();
  
      return () => {
        didCallAPI = false; // Reset flag on component unmount or focus change
      };
    }, [deviceID, authorizationCode, serial])
  );
  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { name },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Text style={styles.procedureName}>{name}</Text>
        <Text style={styles.subtitle}>Review Summary</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Images Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Images</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
          <View style={styles.imagesContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.imagePlaceholder} />
            ))}
          </View>
        </View>

        {/* Procedure Pearls Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Procedure Pearls</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
          <View>
            <Text style={[styles.label, { color: "green" }]}>● Always Do</Text>
            <Text style={styles.description}>{alwaysDo}</Text>

            <Text style={[styles.label, { color: "orange" }]}>● Watch For</Text>
            <Text style={styles.description}>{watchFor}</Text>

            <Text style={[styles.label, { color: "red" }]}>● Never Do</Text>
            <Text style={styles.description}>{neverDo}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={navigateToLibrary}>
        <Text style={styles.buttonText}>Done</Text>
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
});