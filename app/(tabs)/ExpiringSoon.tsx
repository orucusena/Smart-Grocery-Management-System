import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string;
};

const getUrgencyColor = (days: number) => {
  if (days <= 1) return '#ff4d4d';     // red
  if (days <= 3) return '#ff9933';     // orange
  if (days <= 7) return '#ffd633';     // yellow
  return '#ccc';
};

const getDaysUntil = (dateStr: string) => {
  const today = new Date();
  const targetDate = new Date(dateStr);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function ExpiringSoonScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringItems = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const q = query(collection(FIREBASE_DB, 'inventory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);

      const expiringItems = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as InventoryItem))
        .filter((item) => {
          const itemDate = new Date(item.expirationDate);
          return itemDate >= now && itemDate <= oneWeekFromNow;
        });

      setItems(expiringItems);
      setLoading(false);
    };

    fetchExpiringItems();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🕑 Expiring Soon (7 Days)</Text>
      {items.length > 0 ? (
        items.map((item) => {
          const daysLeft = getDaysUntil(item.expirationDate);
          const urgencyColor = getUrgencyColor(daysLeft);
          return (
            <View
              key={item.id}
              style={[styles.item, { borderLeftColor: urgencyColor, borderLeftWidth: 6 }]}
            >
              <Text style={styles.itemName}>🛒 {item.name}</Text>
              <Text style={styles.detail}>📆 {item.expirationDate}</Text>
              <Text style={styles.detail}>📌 {item.category}</Text>
              <Text style={styles.detail}>🔢 {item.quantity} {item.unit}</Text>
              <Text style={styles.urgency}>⏳ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</Text>
            </View>
          );
        })
      ) : (
        <Text style={styles.empty}>No items expiring within 7 days.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 18,
    color: 'blue',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    borderLeftColor: '#ccc',
    borderLeftWidth: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 16,
    marginTop: 4,
  },
  urgency: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
    color: '#555',
  },
  empty: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});