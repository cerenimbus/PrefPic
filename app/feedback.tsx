import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
  name: string;
  email: string;
  phone: string;
  wantResponse: boolean;
  wantUpdates: boolean;
  comment: string;
}
interface DeviceInfo {
  id: string;
  type: string;
  model: string;
  version: string;
  softwareVersion: string;
}

const feedbackScreen: React.FC = () => {
  const router = useRouter();
  const [deviceID, setDeviceID] = useState<string | null>(null);
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    wantResponse: false,
    wantUpdates: false,
    comment: ''
  });

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
      try {
        const deviceData: DeviceInfo = await getDeviceID();
        setDeviceID(deviceData.id); // Store only the 'id' as a string
      } catch (error) {
        console.error('Error fetching device ID:', error);
        Alert.alert('Error', 'Failed to get device information');
      }
    };
    fetchDeviceID();
  }, []);

  useEffect(() => {
    setIsSubmitEnabled(formData.comment.trim().length > 0);
  }, [formData.comment]);

// const validateEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (email && !emailRegex.test(email)) {
//       Alert.alert('Invalid Email', 'Must enter a validly formatted email');
//     }
//   };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  //const validatePhoneNumber = (phone: string) => {
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // MG 02/26/2025
  // adjust the alert if the email is invalid
  const submitFeedback = async () => {
    if (!deviceID || !authorizationCode) {
      console.error('Device ID or Authorization Code not found');
      return;
      //MLI 02/28/2025 allow feedback submission even when an email is not provided.
      //Fixed the issue where entering a phone number exceeding 10 digits caused an error.
    //} else if (formData.email && !validateEmail(formData.email)) {
    } else if (formData.email && !validateEmail(formData.email)) {
      Alert.alert('Invalid Email', 'Must enter a validly formatted email');
      return;
    } else if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    } else {
      setPhoneError(null);
    }

    setIsLoading(true);
    try {
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      const keyString = `${deviceID}${formattedDate}${authorizationCode}`;
      const key = CryptoJS.SHA1(keyString).toString();

      const url = `https://PrefPic.com/dev/PPService/CreateFeedback.php?DeviceID=${encodeURIComponent(deviceID)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&Name=${encodeURIComponent(formData.name)}&Email=${encodeURIComponent(formData.email)}&Phone=${encodeURIComponent(formData.phone)}&Response=${formData.wantResponse ? 'Y' : 'N'}&OptIn=${formData.wantUpdates ? 'Y' : 'N'}&Comment=${encodeURIComponent(formData.comment)}&PrefPicVersion=1&TestFlag=1`;

      console.log('Submitting feedback to URL:', url);

      const response = await fetch(url);
      const data = await response.text();
      console.log('API response:', data);

      const parser = new XMLParser();
      const result = parser.parse(data);

      if (result.ResultInfo.Result === 'Success') {
        //MLI 03/10/2025 added a redirect path based on the status of the user
        const status = await AsyncStorage.getItem('status');
        console.log('Current user status:', status);
        let redirectPath = '/mainAccountPage'; // Default path

        if (status === 'Demo') {
          redirectPath = '/library';
          console.log('Demo user detected, redirecting to:', redirectPath);
        } else if (status === 'Active') {
          redirectPath = '/sign-in';
          console.log('Active user detected, redirecting to:', redirectPath);
        } else if (status === 'Verified') {
          redirectPath = '/mainAccountPage';
          console.log('Verified user detected, redirecting to:', redirectPath);
        }
        
        Alert.alert('Success', result.ResultInfo.Message, [
          { text: 'OK', onPress: () => router.replace(redirectPath) }
        ]);
      } else {
        Alert.alert('Error', result.ResultInfo.Message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'An error occurred while submitting feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Feedback</Text>
      <Text style={styles.description}>
        Let us know what could improve the PrefPic app.
      </Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formWrapper}>
          {/* <TouchableOpacity 
            style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backTextArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity> */}

          <TextInput
            style={styles.inputName}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholderTextColor="#999999"
          />

          <TextInput
            style={styles.inputEmail}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, email: text }));
              validateEmail(text);
            }}
            keyboardType="email-address"
            placeholderTextColor="#999999"
          />

          {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
          <TextInput
            style={styles.inputPhone}
            placeholder="Phone"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, phone: text }));
              if (text.length !== 10) {
                setPhoneError('Phone number must be exactly 10 digits');
              } else {
                setPhoneError(null);
              }
            }}
            keyboardType="phone-pad"
            placeholderTextColor="#999999"
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setFormData(prev => ({ ...prev, wantResponse: !prev.wantResponse }))}>

              <View style={[styles.checkbox, formData.wantResponse && styles.checkboxChecked]}>
                {formData.wantResponse && <Text style={styles.checkmark}>✔</Text>}
              </View>
              <Text style={styles.checkboxLabel}>I would like a response.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setFormData(prev => ({ ...prev, wantUpdates: !prev.wantUpdates }))}>
              <View style={[styles.checkbox, formData.wantUpdates && styles.checkboxChecked]}>
                {formData.wantUpdates && <Text style={styles.checkmark}>✔</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Email me about updates.</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.inputComment, styles.textArea]}
            placeholder="Comment:"
            value={formData.comment}
            onChangeText={(text) => setFormData(prev => ({ ...prev, comment: text }))}
            multiline
            numberOfLines={6}
            placeholderTextColor="#999999"
          />

          <TouchableOpacity 
            style={[styles.submitButton, !isSubmitEnabled && styles.submitButtonDisabled]} 
            onPress={submitFeedback}
            disabled={!isSubmitEnabled}>
              {/* MLI - 03/05/2025 added an Activity Indicator */}
              {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7EFFF',
  },
  scrollView: {
    flex: 1,
  },
  formWrapper: {
    padding: 16,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#375894',
    fontSize: 20, 
    marginTop: 30,
    fontFamily: "Darker Grotesque",
    width: 58,
    height: 27,
  },
  backTextArrow: {
    color: '#375894',
    fontSize: 20,
    fontFamily: "Darker Grotesque",
    marginTop: 23,
  }, 
  inputName: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputEmail: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputPhone: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    // marginTop: 15,
    fontSize: 16,
  },
  inputComment: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    height: 119,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 185,
    textAlignVertical: 'top',
    marginTop: -15,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999999',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center', //
    justifyContent: 'center', //
  },
  checkboxChecked: {
    backgroundColor: '#4A6FA5',
    borderColor: '#4A6FA5',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
    fontFamily: "Manrope",
  },
  submitButton: {
    backgroundColor: '#375894',
    borderRadius: 31,
    padding: 16,
    alignItems: 'center',
    marginLeft: 57,
    marginRight: 57,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#999999',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 35,
    marginBottom: 5,
    fontFamily: "Darker Grotesque",
  },
  description: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "Darker Grotesque",
    gap: 15,
    marginLeft: 34,
    marginRight: 30,
    marginTop: -5,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 12,
  },
});

export default feedbackScreen;