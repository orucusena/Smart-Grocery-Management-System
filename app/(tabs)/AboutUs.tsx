import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function AboutUs() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('@/assets/app-logo.png')} style={styles.logo} />
      
      <Text style={styles.heading}>About Smart Grocery</Text>
      <Text style={styles.paragraph}>
        Smart Grocery helps users manage grocery inventory, reduce food waste, and stay informed about expiration dates and food recalls. Built with simplicity and efficiency in mind.
      </Text>
      
      <View style={styles.headingRow}>
        <MaterialIcons name="lightbulb" size={24} color= "#91b38e" />
            <Text style={styles.subheading}> Features</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="inventory" size={22} color="#91b38e" />
        <Text style={styles.featureText}>Manage grocery inventory easily</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="date-range" size={22} color="#91b38e" />
        <Text style={styles.featureText}>Track expiration dates with alerts</Text>
      </View>
      <View style={styles.feature}>
        <FontAwesome5 name="utensils" size={22} color="#91b38e" />
        <Text style={styles.featureText}>Get recipe suggestions based on what you have</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="qr-code-scanner" size={22} color="#91b38e" />
        <Text style={styles.featureText}>Quickly add items using barcode scanning</Text>
      </View>

      <View style={styles.feature}>
        <MaterialIcons name="warning" size={22} color="#91b38e" />
        <Text style={styles.featureText}>Stay informed with food recall alerts</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  subheading: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 19,
    color: '#555',
    lineHeight: 22,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#444',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },  
});