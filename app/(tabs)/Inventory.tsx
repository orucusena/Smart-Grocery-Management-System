import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
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

  const [addMenuVisible, setAddMenuVisible] = useState(false);
      


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
          style={[styles.addButton, styles.navItem]}
          onPress={() => setAddMenuVisible(true)}
        >
          <View style={styles.addButtonInner}>
            <MaterialIcons name="add" size={32} color="#FFF" />
          </View>
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

      {/* Add Options Modal */}
      <Modal
        transparent={true}
        visible={addMenuVisible}
        animationType="fade"
        onRequestClose={() => setAddMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlayNav}
          activeOpacity={1}
          onPress={() => setAddMenuVisible(false)}
        >
          <View style={styles.addOptionsContainer}>
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => {
                setAddMenuVisible(false);
                navigation.navigate('BarcodeScanning');
              }}
            >
              <MaterialIcons name="qr-code-scanner" size={28} color="#333" />
              <Text style={styles.addOptionText}>Scan Barcode</Text>
            </TouchableOpacity>
            
            <View style={styles.optionDivider} />
            
            <TouchableOpacity
              style={styles.addOption}
              onPress={() => {
                setAddMenuVisible(false);
                navigation.navigate('AddItem', { screen: 'AddManually' });
              }}
            >
              <MaterialIcons name="edit" size={28} color="#333" />
              <Text style={styles.addOptionText}>Add Manually</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    marginTop: '20%',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Quicksand_700Bold',
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
    backgroundColor: '#FFDE59',
  },
  deleteButton: {
    backgroundColor: '#fffc00',
  },
  actionButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#FFDE59',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
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
addButton: {
  alignItems: 'center',
  justifyContent: 'center',
},
addButtonInner: {
  backgroundColor: '#FFDE59',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
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