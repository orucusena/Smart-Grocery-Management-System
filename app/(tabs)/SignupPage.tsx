import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '@/firebaseConfig'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { TouchableOpacity } from "react-native";
import { NavigationProp } from '@react-navigation/native';


interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const SignupPage = ({ navigation }: RouterProps) => {

    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signUp = async () => {
        setLoading(true);
        try {
          const response = await createUserWithEmailAndPassword(auth, email, password);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: `${fname} ${lname}`.trim(),
            });
          }
          alert('Account created! Please check your email.');
        } catch (error: any) {
          console.error(error);
          alert('Sign up failed: ' + error.message);
        } finally {
          setLoading(false);
        }
      };      

    const fnameToNextScreen = () => {
        // Navigate to the next screen and pass `fname` as a parameter
        navigation.navigate('List', { fname });
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>

                <TextInput value={fname} style={styles.input} placeholder="First Name" autoCapitalize="none" onChangeText={(text) => setFname(text)}></TextInput>
                <TextInput value={lname} style={styles.input} placeholder="Last Name" autoCapitalize="none" onChangeText={(text) => setLname(text)}></TextInput>
                <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" autoCapitalize="none" onChangeText={(text) => setPassword(text)}></TextInput>

                {loading ? <ActivityIndicator size="large" color="#0000ff" />
                    : <>
                        <Button title="Create account" onPress={signUp} />
                    </>
                }
                <Text>
                    Already have an account {" "}
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={{ color: "blue", textDecorationLine: "underline" }}>Login</Text>
                    </TouchableOpacity>
                </Text>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignupPage;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'
    }
});