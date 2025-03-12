
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomNavigation from "../components/bottomNav";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },
  backText: {
    marginTop: 40,
    fontSize: 16,
    color: "#007AFF",
  },
  header: {
    fontSize: 40,
    textAlign: "center",
    marginVertical: 16,
    paddingTop: 40,
    fontWeight: "600",
    fontFamily: "Dark Grotesque",
    color: "#000000",
  },
// jm_branch
<!--   teamNumber: { -->

  teamCode: {

    fontSize: 20,
    textAlign: "center",
    fontFamily: "Lexend",
    marginVertical: 10,
    fontWeight: "300",
    color: "#636060",
  },
  centerBox: {
    marginTop: 30,
    width: 340,
    height: 290,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    padding: 10,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 10,
    elevation: 5,
  },
  contentContainer: {
    padding: 16,
    width: "100%",
  },
  contents: {
    fontSize: 14,
    color: "#636060",
  },
  doneButton: {
    fontWeight: "800",
    fontFamily: "Inter",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    borderColor: "#FFFF",
    width: 130,
    backgroundColor: "#375894",
    borderWidth: 2,
    marginTop: 80,
  },
  doneButtonText: {
    color: "#FFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default function AddTeamMember() {
  const router = useRouter();
// jm_branch
<!--   const params = useLocalSearchParams();
  const teamNumber = params.teamNumber;
  console.log("Params received:", teamNumber);
  return (
    <View style={styles.container}>
      {/* Header */} -->

// MJ2_new_branch
  const params = useLocalSearchParams();
  const [userType, setUserType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // const teamNumber = params.teamNumber;
  const teamCode = useLocalSearchParams();
  const teamNumber = params.teamNumber;
  console.log("Params received:", teamCode);

 //MLI 03/10/2025  
//   const { teamCode } = useLocalSearchParams();
  const [userType, setUserType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedType = await AsyncStorage.getItem("type");
        const storedStatus = await AsyncStorage.getItem("status");

        setUserType(storedType);
        setStatus(storedStatus);

        console.log("User Type:", storedType);
        console.log("Status:", storedStatus);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleDonePress = () => {
    console.log("Done pressed - userType:", userType, "status:", status);
    
    if (userType === "Surgical Staff") {
      console.log("Routing to enterTeamMember (surgical staff)");
      router.push("/enterTeamMember");
    } else if (userType === "Physician") {
      if (status === "Demo") {
        console.log("Routing to library (physician in demo mode)");
        router.push("/library");
      } else {
        console.log("Routing to mainAccount (physician in non-demo mode)");
        router.push("/mainAccountPage");
      }
    } else {
      console.log("User type not set, defaulting to enterTeamMember");
      router.push("/enterTeamMember");
    }
  };

//MJ2_new_branch

  console.log("Params received:", teamNumber);

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Add Team Member</Text>

<!-- jm_branch -->
<!--       <Text style={styles.teamNumber}>
        Team Number: {teamNumber  }
      </Text>

      {/* Center box */}
        <View style={styles.centerBox}>
          <View style={styles.contentContainer}>
            <Text style={styles.contents}>
              Give this Team Number to your Surgical Team with instructions to
              download this app and create an account.
            </Text>
          </View>
          {/* Button*/}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.push("/enterTeamMember")}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View> -->


      <Text style={styles.teamCode}>
        Team Number: {teamNumber}
      </Text>

<!--       <Text style={styles.teamCode}>Team Number: {teamCode}</Text> -->


      <View style={styles.centerBox}>
        <View style={styles.contentContainer}>
          <Text style={styles.contents}>
            Give this Team Number to your Surgical Team with instructions to
            download this app and create an account.
          </Text>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>


      <BottomNavigation />
    </View>
  );
}
