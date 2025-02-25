import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';

const enterTeamMember = () => {

  const router = useRouter();
  const [teamNumber, setTeamNumber] = useState('');

  const handleSubmit = () => {
    console.log('Team Number Submitted:', teamNumber);
    // Add your submission logic here
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>←  Back</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <BottomNavigation />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4fa',
    padding: 20,
    //marginTop: 30,
    //top: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 10,
    marginRight: 300,
    top: -10
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2c4a92',
    paddingVertical: 12,
    paddingHorizontal: 110,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default enterTeamMember;
