import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getDeviceID } from '../components/deviceInfo';

type Member = {
  id: string;
  name: string;
  phone: string;
};

type RemoveTeamMemberModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onRemove: (member: Member) => void;
  member: Member;
};

const RemoveTeamMemberModal: React.FC<RemoveTeamMemberModalProps> = ({
  isVisible,
  onClose,
  onRemove,
  member,
}) => {
  const [deviceID, setDeviceID] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await getDeviceID();
      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

  const deleteTeamMember = async (member: Member) => {
    if (!deviceID || !authorizationCode) {
      Alert.alert('Error', 'Missing device information or authorization code.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${member.name} (Phone: ${member.phone}, Serial: ${member.id})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const currentDate = new Date();
              const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
              const keyString = `${deviceID.id}${formattedDate}${authorizationCode}${member.id}`;
              const key = CryptoJS.SHA1(keyString).toString();

              const url = `https://PrefPic.com/dev/PPService/DeleteTeamMember.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&UserSerial=${encodeURIComponent(member.id)}`;

              console.log('Deleting team member with URL:', url);

              const response = await fetch(url);
              const data = await response.text();
              console.log('DeleteTeamMember API response:', data);

              if (data.includes('<Success>')) {
                Alert.alert('Success', `${member.name} has been removed from the team.`);
                onRemove(member);
              } else {
                Alert.alert('Error', 'Failed to delete the team member. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting team member:', error);
              Alert.alert('Error', 'An error occurred while deleting the team member.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.8}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Remove Team Member</Text>
        <Text style={styles.message}>
          Are you sure you want to remove{" "}
          <Text style={styles.boldText}>{member.name}</Text> -{" "}
          <Text style={styles.boldText}>{member.phone}</Text> from your team?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={onClose}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => deleteTeamMember(member)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goBackButton: {
    backgroundColor: '#2c4a92',
    paddingVertical: 11,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  goBackText: {
    fontWeight: "bold",
    color: "white",
  },
  removeButton: {
    backgroundColor: '#2c4a92',
    paddingVertical: 11,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  removeText: {
    color: "white",
  },
});

export default RemoveTeamMemberModal;
