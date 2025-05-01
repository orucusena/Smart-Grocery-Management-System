import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

const RecipeSuggestions = () => {
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
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  if (meals.length === 0) return <Text style={styles.emptyText}>No meal suggestions found!</Text>;

  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.idMeal}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MealDetailsScreen', { mealId: item.idMeal })}>
          <View style={styles.card}>
            <Image source={{ uri: item.strMealThumb }} style={styles.image} />
            <Text style={styles.title}>{item.strMeal}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default RecipeSuggestions;