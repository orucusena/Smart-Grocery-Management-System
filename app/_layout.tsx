import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
//import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './(tabs)/Login';
import List from './(tabs)/List';
import Details from './(tabs)/Details';
import WelcomePage from './(tabs)/WelcomePage';
import SignupPage from './(tabs)/SignupPage';
import { useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from './(tabs)';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();


function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WelcomePage" component={WelcomePage} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignupPage" component={SignupPage} options={{ headerBackVisible: true }} />
    </Stack.Navigator>
  );
}


function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="My todos" component={List} />
      <InsideStack.Screen name="Details" component={Details} />
      <InsideStack.Screen name="Inventory" component={HomeScreen} />
    </InsideStack.Navigator>
  );
}




export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });




  useEffect(() => {
    // Handle both the splash screen and authentication state change
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user); // Set the user on auth state change
    });


    // Hide the splash screen once fonts are loaded
    if (loaded) {
      SplashScreen.hideAsync();
    }


    // Cleanup the auth listener when the component unmounts
    return () => {
      unsubscribeAuth();
    };
  }, [loaded]); // Dependencies: when 'loaded' changes, this effect will run


  // If the app is still loading, render nothing
  if (!loaded) {
    return null;
  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {user ? <InsideLayout /> : <MainStack />}
      <StatusBar style="auto" />
    </ThemeProvider>

  );
}

