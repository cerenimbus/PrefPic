import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import BottomNavigation from '../components/bottomNav';
import { useRouter, useLocalSearchParams } from 'expo-router';

const mainAccountPage: React.FC = () => {
    const router = useRouter();
    return(
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←  Back</Text>
        </TouchableOpacity>
            <View style={styles.center}>
                <View style={styles.imageHolder}>
                    <Image 
                    source={{uri: '../assets/Procedure_blue.png'}}
                    style={styles.image}/>
                </View>
                <View style={styles.info}>
                    <Text style={styles.infoText}>[Title]</Text>
                    <Text style={styles.infoText}>[First Name]</Text>
                    <Text style={{color: '#999999'}}>[Last Name]</Text>
                </View>
                <TextInput 
                        style={styles.input} 
                        multiline placeholder="Enter details..." />
            </View>
            <BottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f6fc',
    },
    backText: {
        fontSize: 16,
        color: "#3b82f6",
        marginBottom: 10,
        marginRight: 300,
        top: -80
      },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 12,
        fontSize: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        height: 280,
        width: 380,
        textAlignVertical: 'top',
        position: 'absolute',
        margin: '90%',
        boxShadow: '0 4px 6px rgba(20, 20, 27, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 10,

    },
    infoText: {
        marginRight: 10, 
        fontFamily: 'Darker Grotesque',
        fontSize: 15,
        color: '#999999',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 500, 
    },
    emailText: {
        fontSize: 15,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999999',
        textAlign: 'center',
    },
    imageHolder: {
        width: 100,
        height: 100,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 80,
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});

export default mainAccountPage;