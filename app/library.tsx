import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import BottomNavigation from '../components/bottomNavDemo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';
import { getDeviceID } from '../components/deviceInfo';
import { Dimensions } from 'react-native';

interface UserDetails {
    firstName: string;
    lastName: string;
  }


const LibraryScreen: React.FC = () => {
    const { width, height } = Dimensions.get('window');
    const [deviceID, setDeviceID] = useState<{id:string} | null>(null);
    const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
    const [isAddProcedureLoading, setIsAddProcedureLoading] = useState(false); // Added state for loading
    const [isFinishDemoLoading, setIsFinishDemoLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authorizationCode, setAuthorizationCode] = useState<string | null>(null); // Added state for authorization code
    const [procedures, setProcedures] = useState<{name:string;serial:string}[]>([]); // Updated state for procedures
    const [alwaysDo, setAlwaysDo] = useState(""); // Added state for alwaysDo
    const [watchFor, setWatchFor] = useState(""); // Added state for watchFor
    const [neverDo, setNeverDo] = useState(""); // Added state for neverDo
    const router = useRouter();
    const searchParams = useLocalSearchParams();
    const procedureName = Array.isArray(searchParams.procedureName) ? searchParams.procedureName[0] : searchParams.procedureName;
    const [isSurgicalStaff, setIsSurgicalStaff] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    // MG 02/21/2025
    // added parameters for title, firstName, and lastName
    // const title = Array.isArray(searchParams.title) ? searchParams.title[0] : searchParams.title;
    // const firstName = Array.isArray(searchParams.firstName) ? searchParams.firstName[0] : searchParams.firstName;
    // const lastName = Array.isArray(searchParams.lastName) ? searchParams.lastName[0] : searchParams.lastName;

    useEffect(() => {
        const alwaysDoParam = searchParams.alwaysDo;
        const watchForParam = searchParams.watchFor;
        const neverDoParam = searchParams.neverDo;
        if (alwaysDoParam) {
            setAlwaysDo(Array.isArray(alwaysDoParam) ? alwaysDoParam[0] : alwaysDoParam);
        }
        if (watchForParam) {
            setWatchFor(Array.isArray(watchForParam) ? watchForParam[0] : watchForParam);
        }
        if (neverDoParam) {
            setNeverDo(Array.isArray(neverDoParam) ? neverDoParam[0] : neverDoParam);
        }
    }, [searchParams.alwaysDo, searchParams.watchFor, searchParams.neverDo]);

    useEffect(() => {
        const fetchUserDetails = async () => {
          try {
            const jsonValue = await AsyncStorage.getItem('userDetails');
            if (jsonValue != null) {
              setUserDetails(JSON.parse(jsonValue));
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        };
    
        fetchUserDetails();
      }, []);
    
    useEffect(() => {
        const checkUserType = async () => {
          const value = await AsyncStorage.getItem("isSurgicalStaff");
          setIsSurgicalStaff(value === "true");
        };
        checkUserType();
      }, []);

    // Fetch authorization code from AsyncStorage when the component mounts
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
    }, []); // Added useEffect to fetch authorization code
    useEffect(() => {
      
      const fetchDeviceID = async () => {
        const id = await getDeviceID();
        setDeviceID(id);
      };
        fetchDeviceID();
      }, []);

    // Call GetProcedureList API when the authorization code is available
    useEffect(() => {
        if (authorizationCode) {
            console.log('Calling getProcedureList with authorization code:', authorizationCode); // Debugging statement
            getProcedureList();
        } else {
            console.log('Authorization code not available yet'); // Debugging statement
        }
    }, [authorizationCode]); // Added useEffect to call GetProcedureList API

    // Update the procedure list when procedureName is passed
    // useEffect(() => {
    //     if (procedureName && !procedures.includes(procedureName)) {
    //         setProcedures((prevProcedures) => [...prevProcedures, procedureName]);
    //     }
    // }, [procedureName]);

    const navigateToAddProcedure = () => {
        router.push('addProcedure');
    };
    
    const navigateToviewProcedure = (procedure: any) => {
        console.log("Navigating with procedure:", procedure); // Debugging log
        router.push({
        pathname: "procedureReviewSummary",
        params: { 
            name:procedure.name, 

            serial:procedure.serial

        },
    });
    const navigateToMainAccountPage = () => {
        router.push('mainAccountPage');
    };    
      
};
    const handleNextPressCompleteDemo =  () => {
        setIsFinishDemoLoading(true);
        setTimeout(() => {
            navigateToCompleteDemo(); // Navigate after the delay
            setIsFinishDemoLoading(false); // Reset loading state after navigation
        }, 1000); // 1000 milliseconds = 1 second 
    };
    const navigateToCompleteDemo = () => {
        router.push('completeDemo');
    };  
    // MG 02/13/2025
    // Function to call GetProcedureList API
    const getProcedureList = async () => {
        setIsLoading(true);
        try {
            if (!deviceID) {
                console.log('Device ID:', deviceID);
                throw new Error('Device information not found');
            }
            console.log('DeviceID:', deviceID.id); // Debugging statement
            const currentDate = new Date();
            const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(
                currentDate.getDate()
            ).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(
                currentDate.getMinutes()
            ).padStart(2, '0')}`;
    
            const keyString = `${deviceID.id}${formattedDate}${authorizationCode}`;
            const key = CryptoJS.SHA1(keyString).toString();
    
            
            const url = `https://PrefPic.com/dev/PPService/GetProcedureList.php?DeviceID=${encodeURIComponent(deviceID.id)}&Date=${formattedDate}&Key=${key}&AC=${authorizationCode}&PrefPicVersion=1`;
            console.log('Fetching procedure list from URL:', url); // Debugging statement
            const response = await fetch(url);
            const data = await response.text();
            console.log('API response:', data); // Debugging statement
    
            const parser = new XMLParser();
            const result = parser.parse(data);
    
            // Correctly extract the procedure list
            const procedureList = result?.ResultInfo?.Selections?.Procedure;
            const proceduresArray = Array.isArray(procedureList) ? procedureList : procedureList ? [procedureList] : [];
            const updatedProcedures = proceduresArray.map((procedure : any) => ({
                name:procedure?.Name,

                serial:procedure?.Serial

            }));
            console.log("parsedProcedures", updatedProcedures);

            
            setProcedures(updatedProcedures);
        console.log('Parsed procedure list:', updatedProcedures); // Debugging statement
    } catch (error) {
        console.error('Error fetching procedure list:', error);
        Alert.alert('Error', 'An error occurred while fetching the procedure list');
    } finally {
        setIsLoading(false);
    }
    };// Added getProcedureList function

    const handleCodeSubmit = async () => {

        if (!deviceID || Array.isArray(deviceID)) return;

        const parsedDeviceInfo = JSON.parse(deviceID.id);

        setIsLoading(true);

        try {
            const currentDate = new Date();
            const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}-${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
            const keyString = `${parsedDeviceInfo.id}${formattedDate}`;
            const key = CryptoJS.SHA1(keyString).toString();

            const url = `https://PrefPic.com/dev/PPService/AuthorizeDeviceID.php?DeviceID=${encodeURIComponent(
                parsedDeviceInfo.id
            )}&Date=${formattedDate}&Key=${key}&PrefPicVersion=10`;
            console.log('Authorization URL:', url); // Debugging statement
            const response = await fetch(url);
            const data = await response.text();

            const parser = new XMLParser();
            const result = parser.parse(data);

            const resultInfo = result?.ResultInfo;

            if (resultInfo) {
                const resultCode = resultInfo.Result;
                const message = resultInfo.Message;

                if (resultCode === 'Success') {
                    const authorizationCode = resultInfo.Auth; // Extract the Auth code
                    await AsyncStorage.setItem('authorizationCode', authorizationCode); // Save the authorizationCode to AsyncStorage
                    setAuthorizationCode(authorizationCode); // Update the context
                    getProcedureList(); // Call GetProcedureList API after successful authorization
                } else {
                    Alert.alert('Authorization Failed', message || 'An unknown error occurred');
                }
            } else {
                Alert.alert('Authorization Failed', 'The server response was not in the expected format.');
            }
        } catch (error) {
            console.error('Error during authorization:', error);
            Alert.alert('Authorization Failed', 'An error occurred during authorization');
        } finally {
            setIsLoading(false);
        }
    }; // Added handleCodeSubmit function

    const navigateToAddPearls = (procedureName: string) => {
        router.push({
            pathname: "addPearls",
            params: { procedureName }
        });
    };

    const navigateToMainAccountPage = () => {
        router.push('mainAccountPage');
    };
    
    //function navigateToAddPearls(procedure: string): void {
        //throw new Error('Function not implemented.');
    //}
    
    const handleNextPress =  () => {
            setIsAddProcedureLoading(true);
            setTimeout(() => {
                navigateToAddProcedure(); // Navigate after the delay
                setIsAddProcedureLoading(false); // Reset loading state after navigation
              }, 1000); // 1000 milliseconds = 1 second 
      };
    

    return (
        
        <SafeAreaView style={{flex:1}}>
            <View style={styles.container}>

                {/*<Text style={styles.title}>{title}{firstName}{lastName}</Text>*/}
                <Text style={styles.username}>{userDetails?.firstName}{" "}{userDetails?.lastName}</Text>
                <Text style={styles.subtitle}>Procedures Library</Text>
                <Text style={styles.description}>
                    On this screen you create or edit your medical procedures practices.
                    Then you will add your pictures.
                </Text>
                <View style={styles.card}>
                    {!isSurgicalStaff && (
                    <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleNextPress}
                    disabled={isAddProcedureLoading}
                >
                    {isAddProcedureLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.addProcedureButtonText}>Add Procedure</Text>
                    )}
                </TouchableOpacity>
                    )}
                    {procedures.length >= 5 ? (
                        <ScrollView style = {{flex: 1}}>
                            {procedures.map((procedure, index) => (
                                <TouchableOpacity key={index} style={styles.procedureContainer} onPress={()=>navigateToviewProcedure(procedure)}>
                                    <Text style={styles.procedureNameButtonText}>{procedure.name}</Text>
                                    <TouchableOpacity style={styles.procedureButton}>
                                        <Text style={styles.item}>{'>'}</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View>
                            {procedures.map((procedure, index) => (
                                <TouchableOpacity key={index} style={styles.procedureContainer} onPress={()=>navigateToviewProcedure(procedure)}>
                                    <Text style={styles.procedureNameButtonText}>{procedure.name}</Text>
                                    <TouchableOpacity style={styles.procedureButton}>
                                        <Text style={styles.item}>{'>'}</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <View>
                </View>
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPress={handleNextPressCompleteDemo}
                        disabled={isFinishDemoLoading}
                    >
                        {isFinishDemoLoading ? (
                            <ActivityIndicator size="small" color="#3A5A8C" />
                        ) : (
                            <Text style={styles.FinishButtonText}>Finish Demo</Text>
                        )}
                    </TouchableOpacity>
                </View> 
                </View>
            <BottomNavigation />
        </SafeAreaView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '5%',
        backgroundColor: '#E7EFFF',
    },
    username: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Darker Grotesque',
    },
    finishDemoContainer: {
        alignItems: 'center', // Center the button horizontally
        marginBottom: '5%', // Add spacing from the BottomNavigation
    },
    procedureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#B0BEC5',
    },
    item: {
        color: 'gray',
        fontSize: 18,
        fontWeight: 'bold',
    },
    procedureButton: {
        backgroundColor: '#ffffff', // Button background color
        width: 40, // Set width for the circle
        height: 40, // Set height for the circle
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
    },
    navItem: {
        alignItems: 'center'
    },
    FinishButtonText: {
        color: '#3A5A8C',
        fontSize: 20, // Adjusted font size
        fontWeight: 'bold',
    },
    addProcedureButtonText: {
        color: '#ffffff',
        fontSize: 20, // Adjusted font size
        fontWeight: 'bold',
    },
    procedureNameButtonText: {
        color: 'gray',
        fontSize: 20, // Adjusted font size
    },
    arrow: {
        color: '#4A6FA5', // Arrow color
        fontSize: 20,
    },
    card: {
        flex: 1,
        width: '100%', // or maxWidth: 400
        // height: '100%', // Adjust height as needed
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: '5%', // Padding for inner content
        borderWidth: 2, // Add border
        borderColor: 'white', // Border color
        shadowColor: '#000', // Shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        justifyContent: 'space-between',
        marginBottom: '8%',
    },
    bottomNav: {
        width: '100%', // or maxWidth: 400
        maxWidth: 400,
        height: 500, // Adjust height as needed
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20, // Padding for inner content
        borderWidth: 2, // Add border
        borderColor: 'white', // Border color
        shadowColor: '#000', // Shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        justifyContent: "center",
        alignItems: "center",
        fontSize: 13,
        marginBottom: 5,
        color: '#4A6FA5',
        textAlign: 'center',
        fontFamily: 'Darker Grotesque',
    },
    subtitle: {
        fontSize: 40,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Darker Grotesque',
    },
    description: {
        marginBottom: 20,
        fontSize: 20,
        lineHeight: 24,
        textAlign: 'center',
        // width: 307,
        // height: 67,
        fontFamily: 'Darker Grotesque',
    },
    addButton: {
        backgroundColor: '#375894',
        color: 'white',
        paddingVertical: '3%',
        paddingHorizontal: '10%',
        height: 50,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 5,
        justifyContent: 'center',
        
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Align text and arrow
        width: '100%',
        maxWidth: 400,
        padding: 15,
        borderWidth: 1,
        borderColor: '#4A6FA5',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        shadowColor: '#4A6FA5',
    },
    finishButton: {
        backgroundColor: 'white',
        paddingVertical: '3%',
        paddingHorizontal: '10%',
        color: 'white',
        borderRadius: 30,
        alignItems: 'center',
        borderColor: "#3A5A8C",
        width: '100%', // Ensure it spans the card width
        marginTop: 'auto',
        borderWidth: 2,
        marginBottom: '9%',

    },
});

export default LibraryScreen;
