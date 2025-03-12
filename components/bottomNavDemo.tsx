
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
    };
    const navigateToHelp = () => {
        router.push('help');
    };

    const navigateToTeamMember = () => {
        router.push('teamMember');
    };
    const navigateToFeedback = () => {
        router.push('feedback');
    };
    {/* 
    MG 02/21/2025
    constant if the button is active 
    */}
    const isTeamActive = pathname === "/teamMember";
    const isFeedbackActive = pathname === "/feedback";
    const isHelpActive = pathname === "/help";
    const isProcedureActive = pathname === "/library";
    return (
        <View style={styles.container}>
            {/* 
            MG 02/21/2025
            Procedure Icon */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>

                <Image 
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
            {/* 
            MG 02/21/2025
            Team Icon */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToTeamMember}>
                <Image 
                    source={isTeamActive ? require('../assets/Team_blue.png') : require('../assets/Team_grayed.png')}
                    style={styles.icon}
                />
                <Text style={isTeamActive ? styles.navTextActive: styles.navText}>Team</Text>
            </TouchableOpacity> */}

             {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isTeamActive ? styles.navItemActive : styles.navItem} onPress={navigateToTeamMember}>
                <Image 
                    source={require('../assets/Team_blue.png')}
                    style={[styles.icon, isTeamActive && styles.iconActive]} 
                />
                <Text style={isTeamActive ? styles.navTextActive : styles.navText}>Team</Text>
            </TouchableOpacity>

            {/* 
            MG 02/21/2025
            Help Icon */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToHelp}>

                <Image 
                    source={isHelpActive ? require('../assets/Help_blue.png') : require('../assets/Help_grayed.png')}
                    style={styles.icon}
                />
                <Text style={isHelpActive ? styles.navTextActive: styles.navText}>Help</Text>
            </TouchableOpacity> */}

             {/* EDITED: JM 03-10-2025*/}
            <TouchableOpacity style={isHelpActive ? styles.navItemActive : styles.navItem} onPress={navigateToHelp}>
                <Image 
                    source={require('../assets/Help_blue.png')}
                    style={[styles.icon, isHelpActive && styles.iconActive]} 
                />
                <Text style={isHelpActive ? styles.navTextActive : styles.navText}>Help</Text>
            </TouchableOpacity>

            {/* 
            MG 02/21/2025
            Feedback Icon */}
            {/* <TouchableOpacity style={styles.navItem} onPress={navigateToFeedback}>

                <Image 
                    source={isFeedbackActive ? require('../assets/Feedback_blue.png') : require('../assets/Feedback_grayed.png')}
                    style={styles.icon}
                />
                <Text style={isFeedbackActive ? styles.navTextActive: styles.navText}>Feedback</Text>
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
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
         // ADDED: JM 03-10-2025
        elevation: 5, // Adds shadow on Android
        shadowColor: '#000', // Adds shadow on iOS
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
    },
     // EDITED: JM 03-10-2025
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
    iconActive: {// Bright and engaging color for active state
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
        fontWeight: 'bold',
        color: '#4A6FA5', // Color for the active item
        marginTop: 4,
    },
});

export default BottomNavigation;