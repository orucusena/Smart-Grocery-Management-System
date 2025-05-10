import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar,StyleSheet, Button, Modal } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import React, { useState } from 'react'
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH,FIREBASE_DB } from '@/firebaseConfig'; 
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { MaterialIcons, Entypo } from '@expo/vector-icons';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

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


const List = ({ navigation }: RouterProps) => {
    const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemCount, setItemCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [recentItems, setRecentItems] = useState<InventoryItem[]>([]);

    const [addMenuVisible, setAddMenuVisible] = useState(false);
    
  
  let [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_700Bold,
  });


  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) return;

    const q = query(collection(FIREBASE_DB, 'inventory'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);

    //Item Count
    const allItems = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()} as InventoryItem) );
    setItemCount(allItems.length);

    //Category count
    const uniqueCategories = new Set(allItems.map(item => item.category));
    setCategoryCount(uniqueCategories.size);
    setCategories(Array.from(uniqueCategories));

    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    const expiringItems = allItems.filter((item) => {
        const itemDate = new Date(item.expirationDate);
        return itemDate >= now && itemDate <= oneWeekFromNow;
    });

      setExpiringItems(expiringItems);
      setLoading(false);

    const recentItemsQuery = query( collection( FIREBASE_DB, 'inventory' ), where( 'userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));

    try {
      const recentSnapshot = await getDocs(recentItemsQuery);
      const recentItemsList = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as InventoryItem);
      setRecentItems(recentItemsList);
    } catch (error) {
      // If you don't have a createdAt field or orderBy isn't working:
      // Just get the most recent 5 items from allItems
      const sortedItems = [...allItems].sort((a, b) => {
        // This is a fallback sorting if you don't have timestamps
        // You might want to use some other logic depending on your data structure
        return b.id.localeCompare(a.id); // Assuming newer items have "larger" IDs
      });
      setRecentItems(sortedItems.slice(0, 5));
    }

    setLoading(false);
  };

    setLoading(true);
    fetchData();

    return () => {

    };
  },  [])
);
  
  // Recent Item component
  const RecentItem = ({ item }: { item: InventoryItem }) => (
  <TouchableOpacity 
    style={styles.recentItem}
    onPress={() => navigation.navigate('Inventory', { editId: item.id })}
  >
    <View style={styles.recentItemLeft}>
      <Text style={styles.recentItemName}>{item.name}</Text>
      <Text style={styles.recentItemDetail}>
        {item.quantity} {item.unit} · {item.category}
      </Text>
    </View>
    <View style={styles.recentItemRight}>
      <Text style={styles.recentItemExp}>Exp: {item.expirationDate}</Text>
    </View>
  </TouchableOpacity>
);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" /*backgroundColor="#FFDE59"*/ backgroundColor="#91b38e" />

      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Details')}>
            <MaterialIcons name="person" size={50} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      

      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentInner}>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statValue}>{itemCount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.viewAllTextStats}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Categories</Text>
            <Text style={styles.statValue}>{categoryCount}</Text>
          </View>
        </View>

        {/* Expiring Soon Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Expiring Soon</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExpiringSoon')}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Expiring Items */}
          {expiringItems.length > 0 ? (
            <View style={styles.expiringItemsContainer}>
                {expiringItems.slice(0, 3).map((item) => {
                    const daysLeft = getDaysUntil(item.expirationDate);
                    const urgencyColor = getUrgencyColor(daysLeft);

                    return (
                      <View
                        key={item.id}
                        style={[styles.item, { borderLeftColor: urgencyColor, borderLeftWidth: 6 }]}
                      >
                        <View style={styles.expiringItemContent}>
                        <Text style={styles.expiringItemName}>{item.name}</Text>
                        <Text style={styles.expiringItemDetail}> {item.quantity} {item.unit}</Text>


                      </View>
                      <Text style={styles.expiringItemDays}>
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </Text>
                  </View>
                );
              })}
              
              {expiringItems.length > 3 && (
                <TouchableOpacity onPress={() => navigation.navigate('ExpiringSoon')}>
                <Text style={styles.moreItems}>
                  +{expiringItems.length - 3} more item{expiringItems.length - 3 !== 1 ? 's' : ''}
                </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.emptyMessage}>No items expiring within 7 days.</Text>
          )}
        </View>
        
        {/* Inventory Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Inventory</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
 
 {/* Recently Added LIst */}
 <Text style={styles.sectionLabel}>Recently Added</Text>
    <View style={styles.recentItemsContainer}>
       {recentItems.length > 0 ? (
        recentItems.map(item => (
      <RecentItem key={item.id} item={item} />
    ))
  ) : (
    <Text style={styles.emptyMessage}>No items added yet.</Text>
  )}
</View>
        </View>
        <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
      </ScrollView>
      
    {/* Bottom Navigation */}
<View style={styles.bottomNavigation}>
  <TouchableOpacity 
    style={styles.navItem} 
    onPress={() => navigation.navigate('Dashboard')}
  >
    <MaterialIcons name="home" size={24} /*color="#FFDE59"*/ color="#91b38e" />
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
          navigation.navigate('Inventory', { screen: 'AddManually' });
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
};

export default List;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  topSection: {
    //backgroundColor: '#FFDE59',
    backgroundColor: '#91b38e',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 30,
    color: '#000',
  },
  nameText: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 24,
    color: '#FFF',
  },
  profileButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 12,
    color: '#000',
    paddingBottom: 10,
  },
  statValue: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 24,
    color: '#00',
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 16,
    color: '#333',
  },
  viewAllText: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 12,
    //color: '#000',
    //color: '#FFDE59',
    color: '#91b38e',
  },
  viewAllTextStats: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 12,
    //color: '#000',
    //color: '#FFDE59',
    color: '#91b38e',
    paddingTop: 10,
  },
  expiringItemsContainer: {

  },
  item: {
    marginBottom: '5%',
  },
  expiringItemContent: {
    paddingHorizontal: '5%',
  },
  expiringItemName: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  expiringItemDetail: {
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 4,
  },
  expiringItemDays: {
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 4,
    paddingHorizontal: '5%',
  },
  moreItems: {
    marginBottom: 4,
    marginTop: 6,
    fontFamily: 'Quicksand_400Regular',
    paddingHorizontal: '5%',
  },
  categoryContainer: {
    marginVertical: 12,
  },
  categoryScroll: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionLabel: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  recentItemsContainer: {
    marginBottom: 15,
  },
  recentItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  recentItemLeft: {
    flex: 3,
  },
  recentItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  recentItemName: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  recentItemDetail: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#666',
  },
  recentItemExp: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 12,
    color: '#999',
  },
  emptyMessage: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 15,
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
addButton: {
  alignItems: 'center',
  justifyContent: 'center',
},
addButtonInner: {
  //backgroundColor: '#FFDE59',
  backgroundColor: '#91b38e',
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
  paddingBottom: 90, // Space for the bottom nav
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