import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
//import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
//import { NavigationContainer } from '@react-navigation/native';
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
import Inventory from './(tabs)/Inventory';
import BarcodeScanning from './(tabs)/BarcodeScanning';
import RecipeSuggestions from './(tabs)/RecipeSuggestions';
import MealDetailsScreen from './(tabs)/MealDetailsScreen';
import ExpiringSoon from './(tabs)/ExpiringSoon';
import AddItem from './(tabs)/AddItem';
import FoodRecallsScreen from './(tabs)/FoodRecallsScreen';
import MyProfile from './(tabs)/MyProfile';
import AboutUs from './(tabs)/AboutUs';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();


function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WelcomePage" component={WelcomePage} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="SignupPage" component={SignupPage} options={{ headerShown: false }}  />
    </Stack.Navigator>
  );
}


function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Dashboard" component={List} options={{ headerShown: false }} />
      <InsideStack.Screen name="Details" component={Details} />
      <InsideStack.Screen name="Inventory" component={Inventory} />
      <InsideStack.Screen name="AddItem" component={AddItem} options={{ title: 'Add Item' }} />
      <InsideStack.Screen name="BarcodeScanning" component={BarcodeScanning} options={{ title: 'Barcode Scanning' }} />
      <InsideStack.Screen name="ExpiringSoon" component={ExpiringSoon} options={{ title: 'Expiring Soon' }} />
      <InsideStack.Screen name="RecipeSuggestions" component={RecipeSuggestions} options={{ title: 'Recipe Suggestions' }} />
      <InsideStack.Screen name="MealDetailsScreen" component={MealDetailsScreen} options={{ title: 'Recipe Details' }} />
      <InsideStack.Screen name="FoodRecallsScreen" component={FoodRecallsScreen} options={{ title: 'Food Recalls' }} />
      <InsideStack.Screen name="MyProfile" component={MyProfile} options={{ title: 'My Profile' }} />
      <InsideStack.Screen name="AboutUs" component={AboutUs} options={{ title: 'About Us' }} />
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