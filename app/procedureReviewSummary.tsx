import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';

export default function ProcedureReviewSummary() {
  const router = useRouter();
  const { procedureSerial } = useLocalSearchParams();
  const [alwaysDo, setAlwaysDo] = useState("");
  const [watchFor, setWatchFor] = useState("");
  const [neverDo, setNeverDo] = useState("");
  const [procedureName, setProcedureName] = useState('');
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchProcedureDetails = async () => {
      console.log("Device ID:", deviceID);
      console.log("Authorization Code:", authorizationCode);
      console.log("Procedure Serial:", procedureSerial);

      if (!deviceID || !deviceID.id || !authorizationCode || !procedureSerial) {
        Alert.alert("Error", "Device ID, Authorization Code, or Procedure Serial is missing.");
        return; // Exit early if values are not valid
      }

      // Ensure procedureSerial is a string
      const validProcedureSerial = Array.isArray(procedureSerial) ? procedureSerial[0] : procedureSerial;

      try {
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
        const key = CryptoJS.SHA1(keyString).toString();

        const url = `https://PrefPic.com/dev/PPService/GetProcedure.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1&Procedure=${encodeURIComponent(validProcedureSerial)}`;

        const response = await fetch(url);
        const data = await response.text();
        console.log("API Response Data:", data); // Log the raw response data

        // Parse the response XML using fast-xml-parser
        const parser = new XMLParser();
        const xmlDocument = parser.parse(data);
        console.log("Parsed XML Document:", xmlDocument); // Log parsed XML

        const result = xmlDocument.ResultInfo.Result;

        if (result === "Success") {
          setProcedureName(xmlDocument.ResultInfo.Procedure.ProcedureName);
          setAlwaysDo(xmlDocument.ResultInfo.Selections.Procedure.Always);
          setWatchFor(xmlDocument.ResultInfo.Selections.Procedure.Watch);
          setNeverDo(xmlDocument.ResultInfo.Selections.Procedure.Never);
        } else {
          const message = xmlDocument.ResultInfo.Message || "Failed to retrieve procedure details.";
          Alert.alert("Error", message);
        }
      } catch (error) {
        console.error("Error fetching procedure details:", error);
        Alert.alert("Error", "An error occurred while fetching procedure details.");
      }
    };

    if (deviceID && authorizationCode && procedureSerial) { // Ensure all values are available before fetching
      fetchProcedureDetails();
    }
  }, [deviceID, authorizationCode, procedureSerial]);

  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
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