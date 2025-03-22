import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { NavigationProp } from '@react-navigation/native';



interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const WelcomePage = ({ navigation }: RouterProps) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Welcome to the App!</Text>
            <Button onPress={() => navigation.navigate('Login')} title="Login" />
            <Button onPress={() => navigation.navigate('SignupPage')} title="Sign-Up" />
        </View>
    );
};

export default WelcomePage; 