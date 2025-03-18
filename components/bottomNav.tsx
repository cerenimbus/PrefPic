
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from "expo-router";
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomNavigation: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [userType, setUserType] = useState<string | null>(null); //
    
    const navigateToLibrary = () => {
        router.push('library');
        // router.push('mainAccountPage');
    };

    //MLI 02/28/2025 for the Surgical Staff role, it will navigate to the enterTeamMember page
    const userRole = "SurgicalStaff";
    //

    ///Alberto 02/21/2024 fixed router
    const navigateToTeamMember = async () => {
        //MLI 02/28/2025 for the Surgical Staff role, it will navigate to the enterTeamMember page
        // if (userRole === "SurgicalStaff") {
        //     router.push("enterTeamMember");
        // }
        // else {
        router.push("/teamMember");
        // }

       //RHCM 3/5/2025 Adjusted the routings 
                  const storedType = await AsyncStorage.getItem("type");
                  setUserType(storedType);
                  if (storedType === "SurgicalStaff") {
                    router.replace('/enterTeamMember');
                  } else if (storedType === "Physician") {
                    router.replace('/teamMember');
                  }
               
    };

    // const isTeamActive = pathname === "/teamMember";
    const isTeamActive1 = pathname === "/enterTeamMember";
    // const isFeedbackActive = pathname === "/feedback";
    //const isProcedureActive = pathname === "/library";
    const isProcedureDisabled = pathname === "/teamMember" || pathname === "/feedback" || pathname === "/enterTeamMember";


    const navigateToHelp = () => {
        router.push('/help');
    };
    // const navigateToTeamMember = () => {
    //     router.push("teamMember"); 
    // };
    const navigateToFeedback = () => {

        router.push("feedback"); 

    };
    const ismainAccountPageActive = pathname === "/mainAccountPage"
    const isTeamActive = pathname === "/teamMember";
    const isFeedbackActive = pathname === "/feedback";
    const isHelpActive = pathname === "/help";
    const isProcedureActive = pathname === "/library";
    //const isProcedureDisabled = pathname === "/teamMember" || pathname === "/feedback";

    {/* 
    MG 02/21/2025
    Fixed Routings
    */}
    return (
        <View style={styles.container}>

            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>
                <Image 
                    source={require('../assets/Procedure_blue.png')}
                    style={styles.icon}/>
                <Text style={styles.navTextActive}>Procedure</Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>
                <Image
                    // source={require('../assets/Procedure_blue.png')}
                    source={isProcedureActive ? require('../assets/Procedure_blue.png') : require('../assets/Procedure_grayed.png')}
                    style={styles.icon}
                />
                <Text style={isProcedureActive ? styles.navTextActive: styles.navText}>Procedure</Text>
            </TouchableOpacity> */}
            {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isProcedureActive ? styles.navItemActive : styles.navItem} onPress={navigateToLibrary}>
                <Image 
                    source={require('../assets/Procedure_blue.png')}
                    style={[styles.icon, isProcedureActive && styles.iconActive]} 
                />
                <Text style={isProcedureActive ? styles.navTextActive : styles.navText}>Procedure</Text>
            </TouchableOpacity>



            {/* <TouchableOpacity style={styles.navItem}//turn to false for testing 
             onPress={() => router.push('addTeamMember')}>
                <Image 
                    source={require('../assets/Team_grayed.png')}
                    style={styles.icon}/>
                <Text style={styles.navText}>Team</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToTeamMember}>
                <Image
                    // source={require('../assets/Team_grayed.png')}

                    source={isTeamActive || isTeamActive1 ? require('../assets/Team_blue.png') : require('../assets/Team_grayed.png')}
                    style={styles.icon} />

                <Text style={isTeamActive ? styles.navTextActive : styles.navText}>Team</Text>
            </TouchableOpacity> */}

            {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isTeamActive || isTeamActive1 ? styles.navItemActive : styles.navItem} onPress={navigateToTeamMember}>
                <Image 
                    source={require('../assets/Team_blue.png')}
                    style={[styles.icon, (isTeamActive || isTeamActive1) && styles.iconActive]} 
                />
                <Text style={isTeamActive || isTeamActive1 ? styles.navTextActive : styles.navText}>Team</Text>
            </TouchableOpacity>


            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToHelp}>

                <Image 

                   source={isHelpActive || ismainAccountPageActive ? require('../assets/Help_blue.png') : require('../assets/Help_grayed.png')}

                    style={styles.icon}
                />
                <Text style={isHelpActive ? styles.navTextActive : styles.navText}>Help</Text>
            </TouchableOpacity> */}

            {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isHelpActive || ismainAccountPageActive ? styles.navItemActive : styles.navItem} onPress={navigateToHelp}>
                <Image 
                    source={require('../assets/Help_blue.png')}
                    style={[styles.icon, (isHelpActive || ismainAccountPageActive) && styles.iconActive]} 
                />
                <Text style={isHelpActive || ismainAccountPageActive ? styles.navTextActive : styles.navText}>Help</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.navItem}>
                <Image 
                    source={require('../assets/Feedback_grayed.png')}
                    style={styles.icon}/>
                <Text style={styles.navText}>Feedback</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToFeedback}>
                <Image
                    source={isFeedbackActive ? require('../assets/Feedback_blue.png') : require('../assets/Feedback_grayed.png')}

                    style={styles.icon}
                    />

                <Text style={isFeedbackActive ? styles.navTextActive : styles.navText}>Feedback</Text>
            </TouchableOpacity> */}

            {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isFeedbackActive ? styles.navItemActive : styles.navItem} onPress={navigateToFeedback}>
                <Image 
                    source={require('../assets/Feedback_blue.png')}
                    style={[styles.icon, isFeedbackActive && styles.iconActive]} 
                />
                <Text style={isFeedbackActive ? styles.navTextActive : styles.navText}>Feedback</Text>
            </TouchableOpacity>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // ADDED: JM 03-10-2025
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
    },
    navItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
     // ADDED: JM 03-10-2025
    navItemActive: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderTopWidth: 3,  // Active indicator
        borderTopColor: '#4A6FA5', // Highlight color when active
    },
     // EDITED: JM 03-10-2025
    icon: {
        width: 24, // Adjust icon size
        height: 24,
        tintColor: '#4A6FA5', 
    },
     // ADDED: JM 03-10-2025
    iconActive: {
        tintColor: '#4A6FA5', // Bright and engaging color for active state
    },
     // EDITED: JM 03-10-2025
    navText: {
        fontSize: 12,
        color: '#4A6FA5', 
        marginTop: 4,
    },
     // ADDED: JM 03-10-2025
    navTextActive: {
        fontSize: 12,
        color: '#4A6FA5', // Color for the active item
        marginTop: 4,
        fontWeight: 'bold',
    },
     // EDITED: JM 03-10-2025
    navTextDisabled: {
        fontSize: 12,
        color: '#4A6FA5', 
        marginTop: 4,
    },
});

export default BottomNavigation;