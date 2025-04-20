import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { collection, onSnapshot, DocumentData, query, where } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig'; 
import InventoryScreen from "../../InventoryScreen"; 

export default function HomeScreen() {
  const [testData, setTestData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    console.log("Setting up Firestore listener for user: ", user.uid);

    const userQuery = query(
      collection(FIREBASE_DB, "inventory"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestData(data);
      setLoading(false);
      console.log("User's Inventory Updated: ", data);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Show Add Item Form */}
      <InventoryScreen />

      {/* Display Inventory List */}
      <Text style={styles.title}>📦 Inventory List</Text>
      {testData.length > 0 ? (
        testData.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>🛒 {item.name}</Text>
            <Text style={styles.itemDetail}>📌 {item.category}</Text>
            <Text style={styles.itemDetail}>📆 Expiration Date: {item.expirationDate}</Text>
            <Text style={styles.itemDetail}>🔢 Quantity: {item.quantity}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.errorText}>No data found. Please add data to Firestore.</Text>
      )}
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  itemDetail: {
    fontSize: 16,
    color: "#555",
    marginTop: 3,
  },
  loadingText: {
    fontSize: 20,
    color: "blue",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});