import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { NavigationProp, useNavigation } from '@react-navigation/native';

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
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});