import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyProfile() {
  const user = FIREBASE_AUTH.currentUser;
  const navigation = useNavigation<NavigationProp<any>>();

  const { displayName, email } = user ?? {};

  const handleLogout = () => {
    FIREBASE_AUTH.signOut()
      .then(() => Alert.alert('Logged out'))
      .catch(err => Alert.alert('Error', err.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileInfo}>
        <MaterialIcons name="person" size={24} color="#FFDE59" />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{displayName || 'N/A'}</Text>
      </View>

      <View style={[styles.profileInfo, { marginTop: 16 }]}>
        <MaterialIcons name="email" size={24} color="#FFDE59" />
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'N/A'}</Text>
      </View>


      <View style={{ marginTop: 32 }}>
        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('AboutUs')}>
          <Text style={styles.outlineButtonText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialIcons name="home" size={24} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Inventory')}
        >
          <MaterialIcons name="list" size={24} color="#777" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>
        
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('FoodRecallsScreen')}>
          <MaterialIcons name="report-problem" size={24} color="#777" />
          <Text style={styles.navText}>Recalls</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('RecipeSuggestions')}
          >
            <MaterialIcons name="restaurant" size={24} color="#777" />
            <Text style={styles.navText}>Recipes</Text>
          </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f9f9f9' 
  },
  title: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    marginTop: '20%',
    textAlign: 'center', 
    fontFamily: 'Quicksand_700Bold'
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000000', 
    fontFamily: 'Quicksand_700Bold'
  },
  value: { 
    fontSize: 16, 
    marginBottom: 10, 
    fontFamily: 'Quicksand_400Regular'
  },
  button: {
    backgroundColor: '#FFDE59',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontFamily: 'Quicksand_700Bold'
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#FFDE59',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#FFDE59',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_700Bold'
  },
  profileInfo: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bottomNavigation: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 70,
  backgroundColor: '#FFF',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#ECECEC',
  paddingHorizontal: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 5,
},
navItem: {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
},
navText: {
  fontFamily: 'Quicksand_400Regular',
  fontSize: 12,
  marginTop: 4,
  color: '#777',
},
modalOverlayNav: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
  alignItems: 'center',
}
});