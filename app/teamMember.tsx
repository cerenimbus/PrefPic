import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { router } from "expo-router";
import BottomNavigation from '../components/bottomNav';

interface TeamMember {
  id: string;
  name: string;
}

const TeamMembersScreen: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
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
  
  const navigateToCurrentTeam = () => {
      router.push({
        pathname: "currentTeam"
      });
    };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigateToCurrentTeam}>
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
              autoFocus/>
          ): 
          (
            <Text style={styles.nameText}>Name</Text>
          )}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Text style={styles.addButtonText}>Add</Text>
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
              <TouchableOpacity style={styles.removeButton} disabled>
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
