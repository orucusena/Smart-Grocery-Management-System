import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { collection, onSnapshot, DocumentData, query, where } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/firebaseConfig";

const IndexScreen = () => {
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
      <Text style={styles.title}>📊 Grocery Summary</Text>
      <Text style={styles.subtitle}>You have {testData.length} items:</Text>
      {testData.map((item) => (
        <View key={item.id} style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetail}>📆 {item.expirationDate}</Text>
          <Text style={styles.itemDetail}>📌 {item.category}</Text>
          <Text style={styles.itemDetail}>🔢 {item.quantity}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f4f4",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetail: {
    fontSize: 16,
    marginTop: 4,
  },
  loadingText: {
    fontSize: 20,
    color: "blue",
    textAlign: "center",
  },
});

export default IndexScreen;