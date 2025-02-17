import { router, useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import React from "react";
import BottomNavigation from "../components/bottomNav";

const helpScreen: React.FC = () => {
  const router = useRouter();
  const buttonHelp = [
    {title: 'Leave Feedback or Ask Questions'},
    {title: 'Help About Teams'},
    {title: 'Help About Pictures'},  
    {title: 'Help About Procedures'},
  ];

  const navigateToMainAccountPage = () => {
    router.push('mainAccountPage');
  };

  const handlePress = async (title: string) => {
    let topic = '';
    if (title === 'Help About Procedures') {
      topic = 'Procedure';
    } else if (title === 'Help About Teams') {
      topic = 'Team';
    } else if (title === 'Help About Pictures') {
      topic = 'Picture';
    }

    if (topic) {
      try {
        const response = await fetch('https://prefpic.com/dev/PPService/GetHelp.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Topic: topic }),
        });
        const responseText = await response.text(); // Get the response text
        console.log('Response Text:', responseText); // Log the response text

        // Check if the response is valid JSON
        let data;
        try {
          data = JSON.parse(responseText); // Parse the response text as JSON
        } catch (error) {
          console.error('Error parsing JSON:', error);
          Alert.alert('Error', 'Failed to parse response from server.');
          return;
        }

        Alert.alert(
          `Help About ${title.split(' ')[2]}`,
          data.helpText,
          [
            { text: 'Ok', onPress: navigateToMainAccountPage },
            { text: 'Back', onPress: navigateToMainAccountPage },
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error('Error fetching help:', error);
        Alert.alert('Error', 'Failed to fetch help from server.');
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text style={styles.helpText}>Help</Text>
      </View>
      <View style={styles.container}>
        {buttonHelp.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            onPress={() => handlePress(item.title)}
          >
            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <BottomNavigation/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
  },
  helpText: {
    fontSize: 40,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Darker Grotesque',
    top: 40,
    paddingTop: 40,
    paddingBottom: 80,
  },
  bottomNav: {
    width: '100%',
    maxWidth: 400,
    height: 500,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  card: {
    width: '47%',
    height: 240,
    backgroundColor: '#2E518B',
    padding: 20,
    margin: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Darker Grotesque',
  },
});

export default helpScreen;