import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export default function RecipeSuggestions() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const fetchInventory = async (userId: string) => {
    const q = query(collection(FIREBASE_DB, 'inventory'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => doc.data());
    return items.map(item => item.name.toLowerCase());
  };

  const fetchMealSuggestions = async (userId: string) => {
    try {
      const ingredients = await fetchInventory(userId);
      let allMeals: Meal[] = [];

      for (const ingredient of ingredients) {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
        );
        const data = await response.json();
        if (data.meals) {
          allMeals = [...allMeals, ...data.meals];
        }
      }

      const uniqueMeals = Array.from(new Map(allMeals.map(m => [m.idMeal, m])).values());
      setMeals(uniqueMeals);
    } catch (error) {
      console.error('Error fetching meal suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, user => {
      if (user) {
        fetchMealSuggestions(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No meal suggestions found based on your inventory!</Text>
      </View>
    );
  }

  return (
    <View>
    <FlatList
      data={meals}
      keyExtractor={(item) => item.idMeal}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('MealDetailsScreen', { mealId: item.idMeal })}
        >
          <ImageBackground
            source={{ uri: item.strMealThumb }}
            style={styles.card}
            imageStyle={styles.image}
          >
            <View style={styles.overlay}>
              <Text style={styles.mealName}>{item.strMeal}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ 
        paddingVertical: 12, 
        backgroundColor: '#fff'
      }}
    />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
  },
  mealName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_700Bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'Quicksand_700Bold',
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
addOptionsContainer: {
  backgroundColor: 'white',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  width: '100%',
  paddingBottom: 90, 
  paddingTop: 20,
},
addOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  paddingHorizontal: 25,
},
addOptionText: {
  fontSize: 16,
  marginLeft: 15,
  fontWeight: '500',
  color: '#333',
},
optionDivider: {
  height: 1,
  backgroundColor: '#eee',
  marginHorizontal: 15,
},
});