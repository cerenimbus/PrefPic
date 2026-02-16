import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import BottomNavigation from '../components/bottomNav';

const SecondLibraryScreen: React.FC = () => {
    {/* 
    //MG 
    //Sample Procedure Names*/}
    const procedures = [
        "Procedure Name",
        "Procedure Name",
        "Procedure Name",
        "Procedure Name",
        "Procedure Name",
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.name}>
                    <Text>Full name</Text>
                    <Text style={styles.titlename}>Title</Text>
                </View>
                
                <View style={styles.card}>
                    {/* 
                    //MG 
                    //Add Procedure */}
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addProcedureButtonText}>Add Procedure   +</Text>
                    </TouchableOpacity>
                    {/* 
                    //MG 
                    //Procedure List*/}
                    <ScrollView>
                        {procedures.map((procedure, index) => (
                            <View key={index} style={styles.procedureContainer}>
                                <Text style={styles.procedureNameButtonText}>{procedure}</Text>
                                <TouchableOpacity style={styles.procedureButton}>
                                    <Text style={styles.item}>+</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <BottomNavigation />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E7EFFF',
    },
    innerContainer: {
        flex: 1, // Allow the inner container to stretch
    },
    name: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    titlename: {
        left: 50,
    },
    card: {
        width: '100%',
        height: 600,
        maxWidth: 400,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    addButton: {
        backgroundColor: '#375894',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
    },
    procedureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#B0BEC5',
    },
    procedureNameButtonText: {
        color: 'black',
        fontSize: 18,
        flex: 1,
        flexShrink: 1,
        marginRight: 10,
    },
    procedureButton: {
        backgroundColor: '#ffffff', // Button background color
        borderRadius: 30, // Adjust this value to make it circular
        width: 40, // Set width for the circle
        height: 40, // Set height for the circle
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
        borderColor: '#4A6FA5',
        borderWidth: 2,
        
        
    },
    addProcedureButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    item: {
        color: '#375894',
        fontSize: 18,
        fontWeight: 'bold',
        
    },
});

export default SecondLibraryScreen;