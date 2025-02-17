// components/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, usePathname } from "expo-router";

const BottomNavigation: React.FC = () => {

    // MLI - 02/17/2025
    //to make screen go to Team Members Screen
    const router = useRouter();
    //to disable the colored button when I navigate to Team Member Screen
    const pathname = usePathname();

    //MLI - 02/17/2025 navigate to Team Member Screen
    const navigateToCurrentTeam = () => {
        router.push("/currentTeam"); 
    };
    
    const isTeamActive = pathname === "/currentTeam";
    const isProcedureDisabled = pathname === "/currentTeam";
    return (
        
        <View style={styles.container}>
            <TouchableOpacity style={styles.navItem} disabled={isProcedureDisabled}>
                <Image 
                    // source={require('../assets/Procedure_blue.png')}
                    source={isProcedureDisabled ? require('../assets/Procedure_grayed.png') : require('../assets/Procedure_blue.png')}
                    style={styles.icon}
                />
                {/* <Text style={styles.navTextActive}>Procedure</Text> */}
                <Text style={isProcedureDisabled ? styles.navTextDisabled : styles.navText}>Procedure</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={navigateToCurrentTeam}>
                <Image 
                    // source={require('../assets/Team_grayed.png')}
                    source={isTeamActive ? require('../assets/Team_blue.png') : require('../assets/Team_grayed.png')}
                    style={styles.icon}/>
                {/* <Text style={styles.navText}>Team</Text> */}
                <Text style={isTeamActive ? styles.navTextActive : styles.navText}>Team</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} disabled={false}>
                <Image 
                    source={require('../assets/Help_grayed.png')}
                    style={styles.icon}
                />
                <Text style={styles.navText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} disabled={true}>
                <Image 
                    source={require('../assets/Feedback_grayed.png')}
                    style={styles.icon}
                />
                <Text style={styles.navText}>Feedback</Text>
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