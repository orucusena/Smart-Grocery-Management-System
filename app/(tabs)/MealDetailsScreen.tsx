import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getMealById } from '../../mealdb';

type MealDetail = {
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube?: string;
  [key: string]: any;
};

type RootStackParamList = {
    MealDetailsScreen: { mealId: string };
  };
  

const MealDetailScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'MealDetailsScreen'>>();
    const { mealId } = route.params;


  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMealDetail = async () => {
    try {
      const mealData = await getMealById(mealId);
      setMeal(mealData);
    } catch (error) {
      console.error('Error fetching meal details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealDetail();
  }, []);

  const getIngredients = () => {
    const ingredients: string[] = [];
  
    if (!meal) return ingredients;
  
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
  
      if (ingredient && ingredient.trim()) {
        const formatted = measure ? `${ingredient.trim()} - ${measure.trim()}` : ingredient.trim();
        ingredients.push(formatted);
      }
    }
  
    return ingredients;
  };
  

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  if (!meal) {
    return <Text style={styles.emptyText}>Meal not found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
      <Text style={styles.title}>{meal.strMeal}</Text>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {getIngredients().map((ing, index) => (
        <Text key={index} style={styles.text}>{ing}</Text>
      ))}

      <Text style={styles.sectionTitle}>Instructions</Text>
      <Text style={styles.text}>{meal.strInstructions}</Text>

      {meal.strYoutube ? (
        <>
          <Text style={styles.sectionTitle}>Video Tutorial</Text>
          <TouchableOpacity onPress={() => meal.strYoutube && Linking.openURL(meal.strYoutube)}>
            <Text style={styles.link}>{meal.strYoutube}</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Quicksand_700Bold',
    backgroundColor: '#FFDE59',
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Quicksand_400Regular'
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular'
  },
});

export default MealDetailScreen;