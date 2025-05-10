import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native'
import { NavigationProp } from '@react-navigation/native';



interface RouterProps {
    navigation: NavigationProp<any, any>;
}
const WelcomePage = ({ navigation }: RouterProps) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#FFDE59"/>
            
            <SafeAreaView style={styles.topSection}>
            <View style={styles.logoContainer}>
                <Image source={require('@/UI/logo4_3.png')} style={styles.logoImage} resizeMode="contain"/>
            </View>
            </SafeAreaView>

            <View style={styles.bottomSection}>
            <View style={styles.contentContainer}>
                
                
                <Text style={styles.welcomeText}>Get Sarted!</Text>
                
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.primaryButtonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignupPage')}>
                    <Text style={styles.secondaryButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>  
    );
};

const styles = StyleSheet.create({
    
    container: {
    flex: 1,
    backgroundColor: '#FFDE59',
  },
  topSection: {
    height: '40%',
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex:1,
  },
  logoImage: {
    width: 300,
    height: 300,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E1E1E',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#6E6E6E',
    marginBottom: 24,
    textAlign: 'center',
  },
  subText2: {
    fontSize: 24 ,
    color: '#6E6E6E',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 150,
    width: '100%',
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#FFDE59',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: '60%',
  },
  primaryButtonText: {
    color: '#00000',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fffc00',
    width: '60%',
  },
  secondaryButtonText: {
    color: '#1E1E1E',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WelcomePage; 