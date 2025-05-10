import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '@/firebaseConfig'; 

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProps) => {


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome back</Text>
            <Button onPress={() => navigation.navigate('Details')} title="Open Details" />
            <Button onPress={() => navigation.navigate('Inventory')} title="Inventory Management" />
            <Button onPress={() => navigation.navigate('BarcodeScanning')} title="Scan" />
            <Button onPress={() => navigation.navigate('ExpiringSoon')} title="Expiring Soon" />
            <Button onPress={() => navigation.navigate('RecipeSuggestions')} title="Recipe Suggestions" />
            <Button onPress={() => navigation.navigate('FoodRecallsScreen')} title="Food Recalls" />
            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
        </View>
    );
};

export default List; 