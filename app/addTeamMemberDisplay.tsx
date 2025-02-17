import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import BottomNavigation from "../components/bottomNav";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    padding: 16,
  },

  backText: {
    fontSize: 16,
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

  imageLine: {
    width: '85%',
    height: 2,
    marginVertical: 16,
    backgroundColor: "#036484",
    alignSelf: 'center',
  },

  ProcedureListContainer: {
    flexDirection: 'row', // Aligns text and image horizontally
    justifyContent: 'space-between', // Ensures space between text and image
    alignItems: 'center', // Vertically centers the items
    marginVertical: 10,
  },

  ProcedureList: {
    fontSize: 20,
    fontFamily: "Lexend",
    fontWeight: "300",
    color: "#636060",
    left:22,
  },

  image: {
    width: 30, // Adjust the size of the image as needed
    height: 30,
    right: 22,
  },
});

export default function AddTeamMemberDisplay() {
  const router = useRouter();

  const handleImageClick = () => {
    // Navigate back to the previous screen
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Add Team Member</Text>

      {/* Repeating Procedure List with Clickable Image */}
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.imageLine}></View>
        <View style={styles.ProcedureListContainer}>
          <Text style={styles.ProcedureList}>Procedure List</Text>
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={require('../assets/Frame.png')} style={styles.image} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavigation />
    </View>
  );
}
