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
        <MaterialIcons name="person" size={24} color="#91b38e" />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{displayName || 'N/A'}</Text>
      </View>

      <View style={[styles.profileInfo, { marginTop: 16 }]}>
        <MaterialIcons name="email" size={24} color="#91b38e" />
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
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000000' 
  },
  value: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  button: {
    backgroundColor: '#91b38e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#91b38e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#91b38e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
});