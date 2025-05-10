import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

export default function AboutUs() {
  const navigation = useNavigation<NavigationProp<any>>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('@/UI/logo7.png')} style={styles.logo} />
      
      <Text style={styles.heading}>About Smart Grocery</Text>
      <Text style={styles.paragraph}>
        Smart Grocery helps users manage grocery inventory, reduce food waste, and stay informed about expiration dates and food recalls. Built with simplicity and efficiency in mind.
      </Text>
      
      <View style={styles.headingRow}>
        <MaterialIcons name="lightbulb" size={24} color= "#FFDE59" />
            <Text style={styles.subheading}> Features</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="inventory" size={22} color="#FFDE59" />
        <Text style={styles.featureText}>Manage grocery inventory easily</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="date-range" size={22} color="#FFDE59" />
        <Text style={styles.featureText}>Track expiration dates with alerts</Text>
      </View>
      <View style={styles.feature}>
        <FontAwesome5 name="utensils" size={22} color="#FFDE59" />
        <Text style={styles.featureText}>Get recipe suggestions based on what you have</Text>
      </View>
      <View style={styles.feature}>
        <MaterialIcons name="qr-code-scanner" size={22} color="#FFDE59" />
        <Text style={styles.featureText}>Quickly add items using barcode scanning</Text>
      </View>

      <View style={styles.feature}>
        <MaterialIcons name="warning" size={22} color="#FFDE59" />
        <Text style={styles.featureText}>Stay informed with food recall alerts</Text>
      </View>

      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('MyProfile')}>
        <Text style={styles.outlineButtonText}>Go Back</Text>
        </TouchableOpacity>

      {/* Bottom Navigation */}
            <View style={styles.bottomNavigation}>
              <TouchableOpacity 
                style={styles.navItem} 
                onPress={() => navigation.navigate('Dashboard')}
              >
                <MaterialIcons name="home" size={24}/>
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
    marginTop: '20%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Quicksand_700Bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  subheading: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 19,
    color: '#555',
    lineHeight: 22,
    fontFamily: 'Quicksand_400Regular'
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
    fontFamily: 'Quicksand_400Regular',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
},
outlineButton: {
    borderWidth: 1,
    width: '50%',
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
});