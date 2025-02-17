// components/BottomNavigation.tsx
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const BottomNavigation: React.FC = () => {
    const router = useRouter();
    const navigateToLibrary = () => {
        router.push('library');
    };
    const navigateToHelp = () => {
        router.push('help');
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.navItem} onPress={navigateToLibrary}>
                <Image 
                    source={require('../assets/Procedure_blue.png')}
                    style={styles.icon}
                />
                <Text style={styles.navTextActive}>Procedure</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} disabled={true}>
                <Image 
                    source={require('../assets/Team_grayed.png')}
                    style={styles.icon}
                />
                <Text style={styles.navText}>Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={navigateToHelp}>
                <Image 
                    source={require('../assets/Help_grayed.png')}
                    style={styles.icon}
                />
                <Text style={styles.navText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
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
});

export default BottomNavigation;