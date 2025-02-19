import { router, useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import React from "react";
import BottomNavigation from "../components/bottomNav";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getDeviceID } from '../components/deviceInfo';
import { XMLParser } from 'fast-xml-parser';

const helpScreen: React.FC = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const buttonHelp = [
    { title: 'Leave Feedback or Ask Questions' },
    { title: 'Help About Teams' },
    { title: 'Help About Pictures' },
    { title: 'Help About Procedures' },
  ];

  useEffect(() => {
    const fetchAuthorizationCode = async () => {
      try {
        const code = await AsyncStorage.getItem('authorizationCode');
        if (code) {
          setAuthorizationCode(code);
        }
      } catch (error) {
        console.error('Error fetching authorization code:', error);
      }
    };
    fetchAuthorizationCode();
  }, []);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  const navigateToMainAccountPage = () => {
    router.push('/mainAccountPage');
  };

  const getHelp = async (topic: string) => {
    if (!deviceID || !authorizationCode) {
      Alert.alert('Error', 'Device ID or authorization code not available');
      return;
    }

    try {
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(
        currentDate.getDate()
      ).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(
        currentDate.getMinutes()
      ).padStart(2, '0')}`;

      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      const url = `https://PrefPic.com/dev/PPService/GetHelp.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&Topic=${topic}&PrefPicVersion=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      // Parse the XML response
      const parser = new XMLParser();
      const data = parser.parse(responseText);
      console.log('Parsed Data:', data);

      if (data.ResultInfo && data.ResultInfo.Result === 'Success') {
        Alert.alert(
          `Help About ${topic}`,
          data.ResultInfo.Message,
          [
            { text: 'Ok', onPress: navigateToMainAccountPage },
            { text: 'Back', onPress: navigateToMainAccountPage },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'Failed to fetch help from server.');
      }
    } catch (error) {
      console.error('Error fetching help:', error);
      Alert.alert('Error', 'Failed to fetch help from server.');
    }
  };

  const handlePress = (title: string) => {
    let topic = '';
    if (title === 'Help About Procedures') {
      topic = 'Procedure';
    } else if (title === 'Help About Teams') {
      topic = 'Team';
    } else if (title === 'Help About Pictures') {
      topic = 'Picture';
    }

    if (topic) {
      getHelp(topic);
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