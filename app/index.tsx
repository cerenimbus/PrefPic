import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";



export default function HomeScreen() {
const router = useRouter();

const navigateToAddPearls = () => {
  router.push("addPearls");


};
const navigateToreviewImage = () => {
   router.push("reviewImage");

};

const navigateToviewEditPicture = () => {
  router.push("viewEditPicture");
};

const navigateToretakePicture = () => {
  router.push("retakePicture");
};


  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Screen!</Text>
        <TouchableOpacity onPress={navigateToAddPearls}>
            <Text>Go to add pearl screen</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToreviewImage}>
            <Text>Go to add_3 slide</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToviewEditPicture}>
            <Text>Go to viewEditPicture</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToretakePicture}>
            <Text>Go to retakePicture</Text>
        </TouchableOpacity>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
