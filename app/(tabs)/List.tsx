import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { NavigationProp } from '@react-navigation/native';
<<<<<<< HEAD
import { FIREBASE_AUTH } from '@/firebaseConfig'; 
=======
import { FIREBASE_AUTH } from '@/firebaseConfig';
>>>>>>> d395adf (Added barcode scanning camera)

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProps) => {


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome back</Text>
            <Button onPress={() => navigation.navigate('Details')} title="Open Details" />
            <Button onPress={() => navigation.navigate('Inventory')} title="Inventory Management" />
<<<<<<< HEAD
=======
            <Button onPress={() => navigation.navigate('BarcodeScanning')} title="Scan" />
>>>>>>> d395adf (Added barcode scanning camera)
            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
        </View>
    );
};

export default List; 
