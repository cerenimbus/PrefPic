import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';

interface TeamMember {
  id: string;
  name: string;
}

const TeamMembersScreen: React.FC = () => {
  const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{id: string, fullName: string, title: string}>>([]);

  const router = useRouter();
  const searchParams = useLocalSearchParams();  
  const memberName = Array.isArray(searchParams.memberName) ? searchParams.memberName[0] : searchParams.memberName;
  
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

  useEffect(() => {
      if (authorizationCode) {
          console.log('Calling getTeamList with authorization code:', authorizationCode);
          getTeamList();
      } else {
          console.log('Authorization code not available yet');
      }
  }, [authorizationCode]);

  useEffect(() => {
    if (memberName && !teamMembers.some(member => member.fullName === memberName)) {
        setTeamMembers((prev) => [...prev, { id: Date.now().toString(), fullName: memberName, title: 'New Member' }]);
    }
  }, [memberName, teamMembers]);

  const getTeamList = async () => {
    if (!deviceID) {
      console.error('Device information not found');
      return;
    }
    
    setIsLoading(true);
    try {
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
        const key = CryptoJS.SHA1(keyString).toString();

        const url = `https://PrefPic.com/dev/PPService/GetTeamList.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1`;
        console.log('Fetching getTeam list from URL:', url);
        const response = await fetch(url);
        const data = await response.text();
        console.log('API response:', data);

        const parser = new XMLParser();
        const result = parser.parse(data);

        const teamList = result?.TeamList?.Member || [];
        setTeamMembers(teamList.map((member: any) => ({ 
          id: member.ID || Date.now().toString(),
          fullName: member.Name,
          title: member.Title || 'Member'
        })));
    } catch (error) {
        console.error('Error fetching team list:', error);
        Alert.alert('Error', 'An error occurred while fetching the team list');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddMember = () => {
   router.push("/addTeamMember")
    if (!isAddingMember) {
      setIsAddingMember(true);
      return;
    }

    if (newMemberName.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberName.trim()
      };
      setMembers([...members, newMember]);
      setNewMemberName('');
      setIsAddingMember(false);
    }
  };
  
  const navigateToLibrary = () => {
    router.push({
      pathname: "library"
    });
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigateToLibrary}>
        <Text style={styles.backTextArrow}>←</Text>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Team Members</Text>
      <Text style={styles.subtitle}>[Title]   [First Name]   [Last Name]</Text>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          {isAddingMember ? (
            <TextInput
              style={styles.input}
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder=""
              placeholderTextColor="#A0A0A0"
              autoFocus
            />
          ) : (
            <Text style={styles.nameText}>Name</Text>
          )}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Text style={styles.addButtonText} >Add</Text>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersList}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Text style={styles.memberName}>{member.name}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveMember(member.id)}
              >
                <Text style={styles.minusIcon}>-</Text>
              </TouchableOpacity>
            </View>
          ))}
          {Array(7 - members.length).fill(null).map((_, index) => (
            <View key={`empty-${index}`} style={styles.memberItem}>
              <Text style={styles.memberName}>[Full Name]</Text>
              <TouchableOpacity style={styles.removeButton} >
                <Text style={styles.minusIcon}>-</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7EFFF',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    maxHeight: 600,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 55,
    marginBottom: 5,
    fontFamily: "Darker Grotesque",
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "Inter",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  nameText: {
    fontSize: 20,
    color: "#636060",
    fontFamily: "Inter",
    flex: 1,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4A6FA5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 31,
    minWidth: 92,
    marginRight: -10,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
  plusIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    fontSize: 20,
    color: '#666',
    flex: 1,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4A6FA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusIcon: {
    color: '#4A6FA5',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  backTextArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
    marginLeft: -175,
  }, 
  backText: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
    width: 58,
    height: 27,
    marginLeft: -150,
    marginTop: -23.5,
  }, 
});

export default TeamMembersScreen;
