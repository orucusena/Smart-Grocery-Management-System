import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator,RefreshControl,SafeAreaView,StatusBar,Modal,TouchableOpacity,ScrollView } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';


interface RouterProps {
    navigation: NavigationProp<any, any>;
}

// TypeScript interface for recall items
interface RecallItem {
  recall_number?: string;
  product_description?: string;
  recalling_firm?: string;
  reason_for_recall?: string;
  report_date?: string;
  classification?: string;
  state?: string;
  voluntary_mandated?: string;
  distribution_pattern?: string;
  code_info?: string;
  product_quantity?: string;
  recall_initiation_date?: string;
  status?: string;
  city?: string;
  country?: string;
}

const FoodRecallsScreen = ( {navigation}: RouterProps ) => {
  const [recalls, setRecalls] = useState<RecallItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecall, setSelectedRecall] = useState<RecallItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [addMenuVisible, setAddMenuVisible] = useState(false);
  
  // Fetch food recalls from FDA API
  const fetchRecalls = async () => {
    try {
      setError(null);
      
      // Build the API URL, get the recent 50 food recalls
      const apiUrl = 'https://api.fda.gov/food/enforcement.json?limit=50&sort=report_date:desc';
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.results) {
        setRecalls(data.results);
      } else {
        // error handling
        setError('No recall data available');
      }
    } catch (err) {
      console.error('Error fetching recalls:', err);
      setError('Failed to load recalls. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchRecalls();
  }, []);
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRecalls();
  };
  
  // Format date from YYYYMMDD to MM/DD/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length !== 8) return '';
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${month}/${day}/${year}`;
  };
  
  // Get classification label
  const getClassificationLabel = (classification: string) => {
    if (!classification) return '';
    
    if (classification === 'Class I') {
      return '🔴 ';
    } else if (classification === 'Class II') {
      return '🟠 ';
    } else if (classification === 'Class III') {
      return '🟢 ';
    }
    
    return '';
  };
  
  // Get appropriate color for recall classification
  const getClassificationColor = (classification: string) => {
    if (!classification) return '#999';
    
    if (classification === 'Class I') {
      return '#ff4444'; // Red for Class I (most severe)
    } else if (classification === 'Class II') {
      return '#ffbb33'; // Orange for Class II
    } else if (classification === 'Class III') {
      return '#99cc00'; // Green for Class III (least severe)
    }
    
    return '#999'; // Default gray
  };
  
  // Get classification description
  const getClassificationDescription = (classification: string) => {
    if (!classification) return 'Unknown classification';
    
    if (classification === 'Class I') {
      return 'Dangerous or defective products that could cause serious health problems or death';
    } else if (classification === 'Class II') {
      return 'Products that might cause a temporary health problem, or pose a slight threat';
    } else if (classification === 'Class III') {
      return 'Products that are unlikely to cause any adverse health reaction but violate FDA regulations';
    }
    
    return 'Unknown classification';
  };
  
  // Handle recall item selection
  const handleRecallPress = (item: RecallItem) => {
    setSelectedRecall(item);
    setModalVisible(true);
  };
  
  // Render recall detail modal
  const renderRecallModal = () => {
    if (!selectedRecall) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={[
                styles.modalHeader, 
                { backgroundColor: getClassificationColor(selectedRecall.classification ?? '') }
              ]}>
                <Text style={styles.modalClassification}>
                  {selectedRecall.classification || 'Unknown Classification'}
                </Text>
                <Text style={styles.modalDate}>
                  Reported: {formatDate(selectedRecall.report_date ?? '')}
                </Text>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>
                  {selectedRecall.product_description || 'Unknown Product'}
                </Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Recalling Company</Text>
                  <Text style={styles.modalSectionContent}>
                    {selectedRecall.recalling_firm || 'Unknown'} ({selectedRecall.state || 'Unknown location'})
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Reason for Recall</Text>
                  <Text style={styles.modalSectionContent}>
                    {selectedRecall.reason_for_recall || 'No reason provided'}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Distribution Pattern</Text>
                  <Text style={styles.modalSectionContent}>
                    {selectedRecall.distribution_pattern || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Product Quantity</Text>
                  <Text style={styles.modalSectionContent}>
                    {selectedRecall.product_quantity || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Product Code Info</Text>
                  <Text style={styles.modalSectionContent}>
                    {selectedRecall.code_info || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Recall Details</Text>
                  <Text style={styles.modalSectionContent}>
                    <Text style={styles.infoLabel}>Recall Number: </Text>
                    {selectedRecall.recall_number || 'Unknown'}{'\n'}
                    <Text style={styles.infoLabel}>Initiated: </Text>
                    {formatDate(selectedRecall.recall_initiation_date ?? '')}{'\n'}
                    <Text style={styles.infoLabel}>Status: </Text>
                    {selectedRecall.status || 'Unknown'}{'\n'}
                    <Text style={styles.infoLabel}>Type: </Text>
                    {selectedRecall.voluntary_mandated || 'Unknown'}
                  </Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>What to Do</Text>
                  <Text style={styles.modalSectionContent}>
                    If you have this product, do not consume it. Return it to the place of purchase or dispose of it properly.
                  </Text>
                </View>
                
                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterText}>
                    Data source: FDA Food Enforcement Reports
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
    );
  };
  
  // Render a single recall item
  const renderRecallItem = ({ item }: { item: RecallItem }) => {
    return (
      <TouchableOpacity 
        style={styles.recallItem}
        onPress={() => handleRecallPress(item)}
      >
        <View style={styles.recallHeader}>
          <Text style={styles.dateText}>{formatDate(item.report_date ?? '')}</Text>
          <Text style={styles.classText}>
            {getClassificationLabel(item.classification ?? '')}{item.classification || ''}
          </Text>
        </View>
        
        <Text style={styles.productText} numberOfLines={2}>
          {item.product_description || 'Unknown Product'}
        </Text>
        
        <Text style={styles.companyText} numberOfLines={1}>
          {item.recalling_firm || ''} • {item.state || ''}
        </Text>
        
        <Text style={styles.reasonText} numberOfLines={2}>
          {item.reason_for_recall || 'No reason provided'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render separator between items
  const renderSeparator = () => (
    <View style={styles.separator} />
  );
  
  // Render header with explanation of classifications
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Recent Food Recalls</Text>
      <Text style={styles.listHeaderSubtitle}>From FDA Enforcement Reports</Text>
      
      <View style={styles.legendContainer}>
        <Text style={styles.legendItem}>🔴 Class I: High Risk</Text>
        <Text style={styles.legendItem}>🟠 Class II: Medium Risk</Text>
        <Text style={styles.legendItem}>🟢 Class III: Low Risk</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading recalls...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={recalls}
          renderItem={renderRecallItem}
          keyExtractor={(item, index) => `${item.recall_number || ''}${index}`}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recalls found</Text>
            </View>
          }
        />
      )}
      
      {renderRecallModal()}
      {/* Bottom Navigation */}
<View style={styles.bottomNavigation}>
  <TouchableOpacity 
    style={styles.navItem} 
    onPress={() => navigation.navigate('Dashboard')}
  >
    <MaterialIcons name="home" size={24} /*color="#FFDE59" */ color="#91b38e"/>
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


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#FFDE59',
    backgroundColor: '#91b38e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Quicksand_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    fontFamily: 'Quicksand_400Regular',
  },
  listHeader: {
    padding: 16,
    //backgroundColor: '#FFDE59',
    backgroundColor: '#91b38e',
    marginBottom: 8,
  },
  listHeaderTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Quicksand_700Bold',
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Quicksand_400Regular',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    fontSize: 12,
    color: '#000',
    marginRight: 10,
    marginBottom: 4,
    fontFamily: 'Quicksand_400Regular',
  },
  recallItem: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  recallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Quicksand_400Regular',
  },
  classText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Quicksand_700Bold',
  },
  productText: {
    fontSize: 18,
    //fontWeight: 'bold',
    fontFamily: 'Quicksand_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  companyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Quicksand_400Regular',
  },
  reasonText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Quicksand_700Bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    //backgroundColor:  '#FFDE59',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Quicksand_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    padding: 16,
    backgroundColor: '#ff4444',
  },
  modalClassification: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Quicksand_400Regular',
  },
  modalDate: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
  },
  modalBody: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Quicksand_700Bold',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
    fontFamily: 'Quicksand_700Bold',
  },
  modalSectionContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontFamily: 'Quicksand_400Regular',
  },
  infoLabel: {
    fontWeight: '500',
    color: '#555',
  },
  modalFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  modalFooterText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Quicksand_400Regular',
  },
  closeButton: {
    //backgroundColor: '#FFDE59',
    backgroundColor: '#91b38e',
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_700Bold',
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

export default FoodRecallsScreen;