
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from "expo-router";
import { usePathname } from 'expo-router';

const BottomNavigation: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navigateToLibrary = () => {
        router.push('library');
        // router.push('mainAccountPage');
    };

    const navigateToTeamMember = () => {
        router.push("/teamMember");
    };
    const isTeamActive = pathname === "/teamMember";
    const isTeamActive1 = pathname === "/enterTeamMember";
    const isFeedbackActive = pathname === "/feedback";
    //const isProcedureActive = pathname === "/library";
    const isProcedureDisabled = pathname === "/teamMember" || pathname === "/feedback" || pathname === "/enterTeamMember";

    const navigateToHelp = () => {
        router.push('help');
    };

    const navigateToFeedback = () => {
        router.push("/feedback");
    };

    return (
        <View style={styles.container}>

            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>
                <Image 
                    source={require('../assets/Procedure_blue.png')}
                    style={styles.icon}/>
                <Text style={styles.navTextActive}>Procedure</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>
                <Image
                    // source={require('../assets/Procedure_blue.png')}
                    source={isProcedureDisabled ? require('../assets/Procedure_grayed.png') : require('../assets/Procedure_blue.png')}
                    style={styles.icon}
                />
                {/* <Text style={styles.navTextActive}>Procedure</Text> */}
                <Text style={isProcedureDisabled ? styles.navTextDisabled : styles.navText}>Procedure</Text>
            </TouchableOpacity>


            {/* <TouchableOpacity style={styles.navItem}//turn to false for testing 
             onPress={() => router.push('addTeamMember')}>
                <Image 
                    source={require('../assets/Team_grayed.png')}
                    style={styles.icon}/>
                <Text style={styles.navText}>Team</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.navItem} onPress={navigateToTeamMember}>
                <Image
                    // source={require('../assets/Team_grayed.png')}
                    source={isTeamActive || isTeamActive1 ? require('../assets/Team_blue.png') : require('../assets/Team_grayed.png')}
                    style={styles.icon} />
                {/* <Text style={styles.navText}>Team</Text> */}
                <Text style={isTeamActive ? styles.navTextActive : styles.navText}>Team</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.navItem} onPress={navigateToHelp}>
                <Image
                    source={require('../assets/Help_grayed.png')}
                    style={styles.icon}
                />
                <Text style={styles.navText}>Help</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.navItem}>
                <Image 
                    source={require('../assets/Feedback_grayed.png')}
                    style={styles.icon}/>
                <Text style={styles.navText}>Feedback</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.navItem} onPress={navigateToFeedback}>
                <Image
                    source={isFeedbackActive ? require('../assets/Feedback_blue.png') : require('../assets/Feedback_grayed.png')}
                    style={styles.icon} />
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
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
    },
    icon: {
        width: 24, // Adjust icon size
        height: 24,
    },
    navText: {
        fontSize: 12,
        color: '#999999', // Default text color for inactive items
    },
    navTextActive: {
        fontSize: 12,
        color: '#4A6FA5', // Color for the active item
    },
    navTextDisabled: {
        fontSize: 12,
        color: '#d3d3d3', // Gray color for disabled text
    },
});

export default BottomNavigation;