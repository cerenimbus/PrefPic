import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getDeviceID } from '../components/deviceInfo';
import { XMLParser } from 'fast-xml-parser';

const mainAccountPage: React.FC = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorizationCode = async () => {
      try {
        const code = await AsyncStorage.getItem('authorizationCode');
        if (code) {
          setAuthorizationCode(code);
          console.log('Authorization Code:', code); // Log the authorization code
        } else {
          console.log('Authorization code not found');
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
      console.log('Device ID:', id); // Log the device ID
    };
    fetchDeviceID();
  }, []);

  useEffect(() => {
    if (deviceID && authorizationCode) {
      getHelp();
    }
  }, [deviceID, authorizationCode]);

  const navigateToMainAccountPage = () => {
    router.push('mainAccountPage');
  };

  const getHelp = async () => {
    const topic = 'Instructions';
    console.log('Device ID:', deviceID); // Log the device ID
    console.log('Authorization Code:', authorizationCode); // Log the authorization code

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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>←  Back</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <View style={styles.imageHolder}>
          <Image 
            source={{uri: '../assets/Procedure_blue.png'}}
            style={styles.image}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.infoText}>[Title]</Text>
          <Text style={styles.infoText}>[First Name]</Text>
          <Text style={{color: '#999999'}}>[Last Name]</Text>
        </View>
        <TextInput 
          style={styles.input} 
          multiline 
          placeholder="Enter details..." 
        />
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f6fc',
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 10,
    marginRight: 300,
    top: -80
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 280,
    width: 380,
    textAlignVertical: 'top',
    position: 'absolute',
    margin: '90%',
    boxShadow: '0 4px 6px rgba(20, 20, 27, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  infoText: {
    marginRight: 10, 
    fontFamily: 'Darker Grotesque',
    fontSize: 15,
    color: '#999999',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 500, 
  },
  emailText: {
    fontSize: 15,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#999999',
    textAlign: 'center',
  },
  imageHolder: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default mainAccountPage;