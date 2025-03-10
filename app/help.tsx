import { router, useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import React from "react";
import BottomNavigation from "../components/bottomNav";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getDeviceID } from '../components/deviceInfo';
import { XMLParser } from 'fast-xml-parser';
import { SafeAreaView } from "react-native-safe-area-context";

const helpScreen: React.FC = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // MG 02/21/2025
  // Added background image to the button
  const buttonHelp = [
    { title: 'Leave Feedback or Ask Questions', image: require('../assets/questions.png') },
    { title: 'Teams', image: require('../assets/Teams.png') },
    { title: 'Pictures', image: require('../assets/pictures.png') },
    { title: 'Procedures', image: require('../assets/helpAboutProcedure.png') },
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
  const navigateToFeedback = () => {
    router.push('/feedback');
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem("status");
        setStatus(storedStatus);
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };
    fetchUserStatus();
  }, []);

  const navigateAfterHelp = () => {
    if (status === 'Demo') {
      router.push('/library'); // Redirect to Library page
    } else if (status === 'Active') {
      router.push('/sign-in'); // Redirect to Account Sign In page
    } else if (status === 'Verified') {
      router.push('/mainAccountPage'); // Redirect to Main Account Page
    }
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
      console.log("Constructed URL: ",url);
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
          data.ResultInfo.Help,
          [
            { text: 'Ok', onPress: navigateAfterHelp },
            { text: 'Back', onPress: navigateAfterHelp },
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
    if(title === 'Leave Feedback or Ask Questions') {
      navigateToFeedback();
      return;
    }
    
    let topic = '';
    if (title === 'Procedures') {
      topic = 'Procedure';
    } else if (title === 'Teams') {
      topic = 'Team';
    } else if (title === 'Pictures') {
      topic = 'Picture';
    }

    if (topic) {
      getHelp(topic);
    }
  };
  console.log('Status', status);

  return (
    <SafeAreaView style={{flex: 1,backgroundColor: '#E7EFFF', }}>
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
            <ImageBackground source={item.image} style={styles.imageBackground} imageStyle={styles.imageStyle}>
              <View style={styles.textContainer}>
                <Text style={styles.text}>{item.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
      <BottomNavigation/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 10,
  },
  helpText: {
    fontSize: 60,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Darker Grotesque',
    top: 40,
    paddingTop: 40,
    paddingBottom: 60,
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
    margin: 4,
    borderRadius: 10,
    // alignItems: 'center',
    // justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    backgroundColor: 'rgba(92, 168, 209, 0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Darker Grotesque',
    padding: 10,
    fontSize: 20,
  },
});

export default helpScreen;