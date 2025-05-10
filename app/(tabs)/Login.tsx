import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH} from '@/firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { NavigationProp } from '@react-navigation/native';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';


interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Login = ({ navigation }: RouterProps) => {
  
  let [fontsLoaded] = useFonts({
          Quicksand_400Regular,
          Quicksand_700Bold,
      });
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);

    } catch (error: any) {
      console.log(error);
      alert('Sign in failed!' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor="#FFDE59"/>
      <View style={styles.topSection}>
        <Text style={styles.topSectionText}>LOGIN</Text>
      </View>

      <View style={styles.bottomSection}>
     
      <KeyboardAvoidingView behavior='padding'>
         <View style={styles.formContainer}>

        <Text>Email</Text>
        <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)}></TextInput>
        <Text>Password</Text>
        <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" autoCapitalize="none" onChangeText={(text) => setPassword(text)}></TextInput>

        <View style={styles.buttonContainer}>
        {loading ? <ActivityIndicator size="large" color="#FFDE59" />
          : <>
            <TouchableOpacity style={styles.button} onPress={signIn}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>            
          </>
        }
        </View>
        </View>
        <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          Don't have an account{" "} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignupPage')}>
            <Text style={styles.signupText}>sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default Login;

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
    backgroundColor: '#fff',
  },
  topSection: {
    height: '25%',
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
    paddingTop: 30,
  },
  topSectionText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: '10%',
    color: '#1E1E1E',
    textAlign: 'center',
    fontFamily: 'Quicksand_700Bold',
  },
  formContainer: {
    justifyContent: 'center',
    marginVertical: 75,
    marginHorizontal: 30,
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
  buttonContainer: {
    paddingTop: '20%', 
    alignItems: 'center',
  },
  bottomTextContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: -20,
},
  bottomText: {
    textAlign: 'center',
    color: '#000',
  },
  signupText: {
    color: '#FFDE59',
    textDecorationLine: 'underline',
  }
});