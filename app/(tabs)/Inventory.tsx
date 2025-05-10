import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { deleteInventoryItem } from '@/firestore';
import { RefreshControl } from 'react-native';
import type { InventoryItem } from '@/types';


const getUrgencyColor = (days: number) => {
  if (days <= 1) return '#ff4d4d';
  if (days <= 3) return '#ff9933';
  if (days <= 7) return '#ffd633';
  return '#91b38e';
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const navigation = useNavigation<NavigationProp<any>>();
  const [refreshing, setRefreshing] = useState(false);


  const fetchItems = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const q = query(collection(FIREBASE_DB, 'inventory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch inventory.');
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();  
    setRefreshing(false);
  };


  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (itemId: string) => {
    try {
      await deleteInventoryItem(itemId);
      fetchItems(); 
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while deleting the item. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inventory</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {items.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>
            No inventory items yet. Tap + to add one!
          </Text>
        )}

        {items.map(item => {
          const daysLeft = Math.ceil(
            (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const borderColor = getUrgencyColor(daysLeft);
  
          return (
            <View key={item.id} style={[styles.card, { borderLeftColor: borderColor }]}>
              <Text style={styles.itemName}>
                <MaterialIcons name="shopping-cart" size={16} color= "#91b38e" /> {item.name}
              </Text>
              <Text style={styles.itemDetail}>
                <MaterialIcons name="category" size={16} color="#888" /> {item.category}
              </Text>
              <Text style={styles.itemDetail}>
                <MaterialIcons name="event" size={16} color="#888" /> {item.expirationDate}
              </Text>
              <Text style={styles.itemDetail}>
                <Entypo name="calculator" size={16} color="#888" /> {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.expireText, { color: borderColor }]}>
                {daysLeft <= 0 ? 'Expired' : `${daysLeft} day(s) left`}
              </Text>
  
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('AddItem', { editId: item.id })}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem')}>
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    borderLeftWidth: 6,
    gap: 4,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: 16,
    color: '#555',
  },
  expireText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#91b38e',
  },
  deleteButton: {
    backgroundColor: '#5a855f',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#91b38e',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});