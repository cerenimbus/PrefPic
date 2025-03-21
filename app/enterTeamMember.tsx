import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getDeviceID } from '../components/deviceInfo';

const enterTeamMember = () => {
  const router = useRouter();
  const [teamNumber, setTeamNumber] = useState('');
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

  // Fetch authorization code
  useEffect(() => {
    const fetchAuthorizationCode = async () => {
      try {
        console.log('Fetching authorization code from AsyncStorage...');
        const code = await AsyncStorage.getItem('authorizationCode');
        if (code) {
          console.log('Fetched authorization code:', code);
          setAuthorizationCode(code);
        } else {
          console.log('No authorization code found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching authorization code:', error);
      }
    };
    fetchAuthorizationCode();
  }, []);

  // Fetch device ID
  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  // Join Team Function
  const joinTeam = async () => {
    if (!deviceID || !authorizationCode) {
      Alert.alert('Error', 'Missing device information or authorization code.');
      return;
    }

    setIsLoading(true);
    try {
      // Generate formatted date and time
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

      // Create security key using SHA-1 hash
      const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      // Construct JoinTeam API URL
      const url = `https://prefpic.com/dev/PPService/JoinTeam.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&TeamNumber=${encodeURIComponent(teamNumber)}`;

      console.log('Joining team with URL:', url);

      // Send API request
      const response = await fetch(url);
      const data = await response.text();
      console.log('JoinTeam API response:', data);

      // Handle API response (assuming success message in response)
      if (data.includes("<Result>Success</Result>")) {
        //Alert.alert('Success', 'You have successfully joined the team!');
        // setTeamNumber(''); // Clear input field after success //=========================

        //===================================================================================
        // JM 03-19-2025
        // Saves the teamNumber to AsyncStorage so that it can be retrieved later.
        await AsyncStorage.setItem('teamNumber', teamNumber);

        //===================================================================================
        // JM 03-19-2025
        // Ensures that the user's identity is stored and displayed correctly in the team list.
        const storedUser = await AsyncStorage.getItem('userDetails');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const newMember = { 
            id: Date.now().toString(), 
            name: `${user.firstName} ${user.lastName}` 
          };
          //===================================================================================
          // JM 03-19-2025
          //Saves the new member data in AsyncStorage under the key joinedMember.
          await AsyncStorage.setItem('joinedMember', JSON.stringify(newMember));
          
          // Retrieves existing team members from AsyncStorage.
          const storedMembers = await AsyncStorage.getItem('teamMembers');
          let members = storedMembers ? JSON.parse(storedMembers) : [];
          
          // Check if this member is already in the list
          if (!members.some((member: { name: string; }) => member.name === newMember.name)) {
            members.push(newMember);
            await AsyncStorage.setItem('teamMembers', JSON.stringify(members));
          }
        }    

        router.push({
          // pathname: "mainAccountPage", //========================================

          //===================================================================================
          // JM 03-19-2025
          pathname: "teamMember",
          params: { teamNumber },
        });
      } 

      //===================================================================================
      // JM 03-19-2025
      // Check if the response contains "Invalid Team Number" or similar error
      else if (data.includes("<Result>Invalid Team Number</Result>") || data.includes("<Error>")) {
        Alert.alert('Error', 'The team number/code you entered is invalid or does not exist. Please enter a valid and correct team number/code.');
      } else {
        Alert.alert('Error', 'Failed to join the team. Please try again.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'An error occurred while joining the team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter Team Number to Join</Text>
      <Text style={styles.description}>
        The physician will supply a team code for you. Enter the Team Code and your join request will be sent to the physician.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Team Number"
        value={teamNumber}
        onChangeText={setTeamNumber}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={joinTeam} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: 'center',
    backgroundColor: '#f0f4fa',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 40,
    //marginRight: 300,
    marginTop: 30,
  },
  scrollcontainer: {
    flexGrow: 1,
    //padding: 20,
    //marginTop: 100,
    backgroundColor: "#f0f4fa",
  },

  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {

    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2c4a92',
    paddingVertical: 11,
    ///paddingHorizontal: 110, //RJP 3/14/2025 -> comment out padding horizontal fixing submit text
    borderRadius: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default enterTeamMember;
