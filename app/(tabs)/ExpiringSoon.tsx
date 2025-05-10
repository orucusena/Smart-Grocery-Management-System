import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/firebaseConfig';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import type { InventoryItem } from '@/types';

const getUrgencyColor = (days: number) => {
  if (days <= 1) return '#ff4d4d';
  if (days <= 3) return '#ff9933';
  if (days <= 7) return '#ffd633';
  return '#91b38e';
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
  const [refreshing, setRefreshing] = useState(false);

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
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    setItems(expiringItems);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpiringItems();
    setRefreshing(false);
  };

  useEffect(() => {
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
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Expiring Soon (7 Days)</Text>
        {items.length > 0 ? (
          items.map((item) => {
            const daysLeft = getDaysUntil(item.expirationDate);
            const urgencyColor = getUrgencyColor(daysLeft);
            return (
              <View key={item.id} style={[styles.item, { borderLeftColor: urgencyColor, borderLeftWidth: 6 }]}>
                <Text style={styles.itemName}>
                  <MaterialIcons name="shopping-cart" size={16} color="#FFDE59" /> {item.name}
                </Text>
                <Text style={styles.detail}>
                  <MaterialIcons name="event" size={16} color="#888" /> {item.expirationDate}
                </Text>
                <Text style={styles.detail}>
                  <MaterialIcons name="category" size={16} color="#FFDE59" /> {item.category}
                </Text>
                <Text style={styles.detail}>
                  <Entypo name="calculator" size={16} color="#888" /> {item.quantity} {item.unit}
                </Text>
                <Text style={[styles.urgency, { color: urgencyColor }]}>
                  <MaterialIcons name="hourglass-empty" size={16} color={urgencyColor} />{' '}
                  <Text style={{ fontWeight: 'bold' }}>{daysLeft}</Text> day{daysLeft !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.centered}>
            <MaterialIcons name="check-circle-outline" size={24} color="gray" />
            <Text style={styles.empty}>No items expiring within 7 days.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontFamily: 'Quicksand_400Regular',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_700Bold',
  },
  detail: {
    fontSize: 16,
    marginTop: 4,
    color: '#555',
    fontFamily: 'Quicksand_400Regular',
  },
  urgency: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
    fontFamily: 'Quicksand_400Regular',
  },
  empty: {
    fontSize: 16,
    color: 'gray',
    marginTop: 12,
    fontFamily: 'Quicksand_400Regular',
  },
});