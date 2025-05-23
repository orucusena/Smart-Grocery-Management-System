import { View, Text, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, StatusBar } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '@/firebaseConfig'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { NavigationProp } from '@react-navigation/native';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';


interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const SignupPage = ({ navigation }: RouterProps) => {

    
    let [fontsLoaded] = useFonts({
        Quicksand_400Regular,
        Quicksand_700Bold,
    });

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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FFDE59"/>

            <View style={styles.topSection}>
                <Text style={styles.topSectionText}>SIGN UP</Text>
             </View>

             <View style={styles.bottomSection}>
            <KeyboardAvoidingView>

                <View style={styles.formContainer}>

                <Text>First Name</Text>
                <TextInput value={fname} style={styles.input} placeholder="First Name" autoCapitalize="none" onChangeText={(text) => setFname(text)}></TextInput>
                <Text>Last Name</Text>
                <TextInput value={lname} style={styles.input} placeholder="Last Name" autoCapitalize="none" onChangeText={(text) => setLname(text)}></TextInput>
                <Text>Email</Text>
                <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)}></TextInput>
                <Text>Password</Text>
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" autoCapitalize="none" onChangeText={(text) => setPassword(text)}></TextInput>

                 <View style={styles.buttonContainer}>
                {loading ? <ActivityIndicator size="large" color="#0000ff" />
                    : <>
                        <TouchableOpacity style={styles.button} onPress={signUp}>
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity>   
                    </>
                }
                </View>
                </View>
                <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>
                    Already have an account {" "} </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.signupText}>login</Text>
                    </TouchableOpacity>
                    </View> 
            </KeyboardAvoidingView>
            </View>
        </View>
    );
};

export default SignupPage;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#FFDE59',
},
    input: {
        marginVertical: 10,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'
    },
    topSection: {
    height: '18%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFDE59',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 24,
  },
  topSectionText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    marginTop: '10%',
  },
  formContainer: {
    justifyContent: 'center',
    marginVertical: 75,
    marginHorizontal: 30,
  },
  buttonContainer: {
    paddingTop: '5%', 
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFDE59',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: '80%',
  },
  buttonText: {
    color: '#00000',
    fontWeight: '600',
    fontSize: 16,
  },
  signupText: {
    color: '#FFDE59',
    textDecorationLine: 'underline',
  },
  bottomTextContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: -30,
},
  bottomText: {
    textAlign: 'center',
    color: '#000',
  },
});