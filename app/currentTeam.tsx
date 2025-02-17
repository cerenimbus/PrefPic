import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';


interface TeamMember {
  id: string;
  fullName: string;
  title: string;
}

const CurrentTeamScreen: React.FC = () => {
  const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', fullName: '', title: '' },
    { id: '2', fullName: '', title: '' },
    { id: '3', fullName: '', title: '' },
    { id: '4', fullName: '', title: '' },
    { id: '5', fullName: '', title: '' },
    { id: '6', fullName: '', title: '' },
    { id: '7', fullName: '', title: '' },
    { id: '8', fullName: '', title: '' }
  ]);

  const router = useRouter();
  const searchParams = useLocalSearchParams();  
  const memberName = Array.isArray(searchParams.memberName) ? searchParams.memberName[0] : searchParams.memberName;

  useEffect(() => {
    const fetchAuthorizationCode = async () => {
        try {
            console.log('Fetching authorization code from AsyncStorage...');
            const code = await AsyncStorage.getItem('authorizationCode');
            if (code) {
                console.log('Fetched authorization code:', code); // Debugging statement
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
    // useEffect(() => {
    //   const fetchAuthorizationCode = async () => {
    //     try {
    //       const code = await AsyncStorage.getItem('authorizationCode');
    //       if (code) setAuthorizationCode(code);
    //     } catch (error) {
    //       console.error('Error fetching authorization code:', error);
    //     }
    //   };
    //   fetchAuthorizationCode();
    // }, []);


    useEffect(() => {
      const fetchDeviceID = async () => {
          const id = await getDeviceID();
          setDeviceID(id);
      };
      fetchDeviceID();
  }, []);

  useEffect(() => {
          if (authorizationCode) {
              console.log('Calling getTeamList with authorization code:', authorizationCode); // Debugging statement
              getTeamList(); //getTeamList
          } else {
              console.log('Authorization code not available yet'); // Debugging statement
          }
      }, [authorizationCode]);
  // const handleAddTeamMember = () => {
  //   setTeamMembers(prev => [...prev, { id: Date.now().toString(), fullName: '', title: '' }]);
  // };
//   useEffect(() => {
//     if (authorizationCode) getTeamList();
// }, [authorizationCode]);
//
// useEffect(() => {
//     if (memberName && !teamMembers.includes(memberName)) {
//         setTeamMembers((prev) => [...prev, memberName]);
//     }
// }, [memberName]);
  // useEffect(() => {
  //   if (memberName && !teamMembers.some(member => member.fullName === memberName)) {
  //     setTeamMembers((prev) => [...prev, { id: Date.now().toString(), fullName: memberName, title: 'New Member' }]);
  //   }
  // }, [memberName]);
  useEffect(() => {
    if (memberName && !teamMembers.some(member => member.fullName === memberName)) {
      setTeamMembers((prev) => [...prev, { id: Date.now().toString(), fullName: memberName, title: 'New Member' }]);
    }
  }, [memberName]);


// const navigateToAddMember = () => {
//     router.push('addMember');
// };

const getTeamList = async () => {
  if (!deviceID) {
    console.error('Device information not found');
    return;

  }
    setIsLoading(true);
    try {
        //if (!deviceID) throw new Error('Device information not found');
        const currentDate = new Date();
        const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
        const key = CryptoJS.SHA1(keyString).toString();

        //API URL
        const url = `https://PrefPic.com/dev/PPService/GetTeamList.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1`;
        console.log('Fetching getTeam list from URL:', url);
        const response = await fetch(url);
        const data = await response.text();
        console.log('API response:', data); 

        const parser = new XMLParser();
        const result = parser.parse(data);

        const teamList = result?.TeamList?.Member || [];
        //console.log('Parsed getTeam list:', teamList);
        setTeamMembers(teamList.map((member: any) => member.Name));
    } catch (error) {
        console.error('Error fetching team list:', error);
        Alert.alert('Error', 'An error occurred while fetching the team list');
    } finally {
        setIsLoading(false);
    }
};

  const navigateToTeamMember = () => {
    router.push({
      pathname: "teamMember"
    });
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };
  const navigateToLibrary = () => {
      router.push({
        pathname: "library",
      });
    };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigateToLibrary}>
              <Text style={styles.backTextArrow}>← </Text>
              <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.leadershipContainer}>
        <View style={styles.avatar} />
        <View style={styles.leadershipTextContainer}>
          <Text style={styles.leadershipText}>Surgical Staff</Text>
          <Text style={styles.leadershipText}>First Name</Text>
          <Text style={styles.leadershipText}>Last Name</Text>
        </View>
      </View>

      <View style={styles.teamContainer}>
        <View style={styles.teamHeaderContainer}>
          <Text style={styles.teamTitle}>Team</Text>
        </View>

        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            {/* <TouchableOpacity onPress={handleAddTeamMember}> */}
            <TouchableOpacity onPress={navigateToTeamMember}>
              <Text style={styles.addText}>+Add</Text>
            </TouchableOpacity>
          </View>

          {teamMembers.map(member => (
            <View key={member.id} style={styles.teamMemberRow}>
              <Text style={styles.memberText}>Full Name</Text>
              <Text style={styles.memberTitleText}>Title</Text>
              <TouchableOpacity 
                onPress={() => handleRemoveTeamMember(member.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remove</Text>
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
    backgroundColor: '#F1F5FC',
  },
  leadershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    margin: 16,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    marginRight: 16,
  },
  leadershipTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leadershipText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  teamContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  teamHeaderContainer: {
    marginBottom: 8,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  teamTitle: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  addText: {
    color: '#64748B',
    fontSize: 14,
  },
  teamMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 8,
  },
  memberText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
  },
  memberTitleText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 16,
  },
  removeButton: {
    backgroundColor: '#EBFAFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  removeText: {
    color: '#636060',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Lexend',
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  backTextArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
  }, 
  backText: {
    fontSize: 20,
    color: '#007AFF',
    fontFamily: "Darker Grotesque", //
    width: 58,
    height: 27,
    marginLeft: 20,
    marginTop: -23.5,
  }, 
});

export default CurrentTeamScreen;