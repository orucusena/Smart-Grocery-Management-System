import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal, Platform, TextInput} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig'; 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const BarcodeScanning = () => {
  const [facing] = useState<CameraType>('back');  //default is 'back' camera.
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasScannedRef = useRef(false);
  
  // Add item modal
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');  //Stores the quantity, initially set to "1".
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Category & Unit
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('pcs');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);

  //Lists for categories and units.
  const categoryOptions = ['Vegetbales', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Beverages', 'Snacks', 'Other'];
  const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'oz', 'lb'];

  // Format date for display. Format: YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; 
  };
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  //Fetch from OpenFoodFacts API
  const fetchProductInfo = async (code: string) => {
    setLoading(true);
    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 1) {
        // Product found!
        console.log('Product:', data.product);
        
        // Create product object
        const product = {
          barcode: code,
          name: data.product.product_name || 'Unknown Product',
          brand: data.product.brands || 'Unknown Brand',
          image: data.product.image_url,
          quantity: data.product.quantity || '',
          categories: data.product.categories || '',
        };

        //Match a category based on the scanned product information
        if (data.product.categories){

          const productCategories = data.product.categories.toLowerCase().split(',');
          
          for (const category of categoryOptions) {
            if (productCategories.some( (pc:string) => category.toLowerCase().includes(pc.trim()) || pc.trim().includes(category.toLowerCase()))){
              setSelectedCategory(category);
              break;
            }
          }
        }
        
        // Set scanned product and show modal
        setScannedProduct(product);
        setModalVisible(true);
      } else {
        // Product not found
        console.log('Product not found!');
        alert('Product not found. Please try again or add manually.');
        setScanned(false);
        hasScannedRef.current = false;
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      alert('Error fetching product data. Please try again.');
      setScanned(false);
      hasScannedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (hasScannedRef.current) return; // Ignore if already scanned
    hasScannedRef.current = true;
    setScanned(true);
    console.log(`Scanned type: ${type}, data: ${data}`);
    fetchProductInfo(data);
  };
  
  // Add item to inventory
  const addToInventory = async () => {
    if (!scannedProduct) return;
    
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        alert('You must be logged in to add items');
        return;
      }
      
      // Add to Firestore
      await addDoc(collection(FIREBASE_DB, 'inventory'), {
        name: scannedProduct.name,
        quantity: parseInt(quantity),
        expirationDate: formatDate(expirationDate),
        category: selectedCategory,
        userId: currentUser.uid,
        dateAdded: new Date().toISOString(),
        barcode: scannedProduct.barcode,
        brand: scannedProduct.brand,
        image: scannedProduct.image
      });
      
      // Show success message
      alert(`${scannedProduct.name} added to your inventory!`);
      
      // Reset and close modal
      setModalVisible(false);
      setScannedProduct(null);
      setQuantity('1');
      setSelectedCategory('');
      setSelectedUnit('pcs');
      
      // Allow scanning again
      setScanned(false);
      hasScannedRef.current = false;
    } catch (error) {
      console.error('Error adding to inventory:', error);
      alert('Error adding item to inventory');
    }
  };
  
  // Cancel adding item
  const cancelAddItem = () => {
    setModalVisible(false);
    setScanned(false);
    hasScannedRef.current = false;
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera to scan barcodes</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return ( 
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Fetching product information...</Text>
        </View>
      ) : (
        <>
          <CameraView 
            style={styles.camera} 
            facing={facing}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'upc_a', 'qr', 'code128']
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanBox} />
            </View>
          </CameraView>
          
          <Text style={styles.instructionText}>Position barcode within the square</Text>
          
          {scanned && !modalVisible && (
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={() => {
                setScanned(false);
                hasScannedRef.current = false;
              }}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
          
          {/*Add Item Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                
                {scannedProduct && (
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{scannedProduct.name}</Text>
                    <Text style={styles.productBrand}>{scannedProduct.brand}</Text>
                  </View>
                )}
                 <KeyboardAwareScrollView>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantity:</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                    
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                

                {/* Category Picker Modal */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category:</Text>
                  <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} style={styles.unitPicker}>
                    <Text style={styles.unitText}>Category: {selectedCategory || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Unit Picker Modal */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Unit:</Text>
                  <TouchableOpacity onPress={() => setIsUnitModalVisible(true)} style={styles.unitPicker}>
                    <Text style={styles.unitText}>Unit: {selectedUnit}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Category Modal */}
                <Modal 
                  visible={isCategoryModalVisible} 
                  transparent 
                  animationType="slide" 
                  onRequestClose={() => setIsCategoryModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      {categoryOptions.map(opt => (
                        <TouchableOpacity key={opt} onPress={() => {
                          setSelectedCategory(opt);
                          setIsCategoryModalVisible(false);
                        }} style={styles.modalItem}>
                          <Text style={styles.modalItemText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                
                {/* Unit Modal */}
                <Modal
                  visible={isUnitModalVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setIsUnitModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      {unitOptions.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => {
                            setSelectedUnit(opt);
                            setIsUnitModalVisible(false);
                          }}
                          style={styles.modalItem}
                        >
                          <Text style={styles.modalItemText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => setIsUnitModalVisible(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Expiration Date:</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>{formatDate(expirationDate)}</Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={expirationDate}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
                </KeyboardAwareScrollView>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonCancel]}
                    onPress={cancelAddItem}
                  >
                    <Text style={styles.textStyle}>Cancel</Text>
                  </TouchableOpacity>
            
                  <TouchableOpacity
                    style={[styles.button, styles.buttonAdd]}
                    onPress={addToInventory}
                  >
                    <Text style={styles.textStyle}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 30,
    fontFamily: 'Quicksand_400Regular',
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_400Regular',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFDE59',
    backgroundColor: 'transparent',
  },
  instructionText: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Quicksand_400Regular',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor:'#FFDE59',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
    fontFamily: 'Quicksand_400Regular',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Quicksand_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Quicksand_700Bold',
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Quicksand_700Bold',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontFamily: 'Quicksand_400Regular',
  },
  formGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Quicksand_400Regular',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#FFDE59',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'Quicksand_400Regular',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 12,
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    marginHorizontal: 10,
  },
  buttonAdd: {
    backgroundColor: '#FFDE59',
  },
  buttonCancel: {
    backgroundColor: '#FFDE59',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitPicker: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 5,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Quicksand_400Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 18,
    fontFamily: 'Quicksand_400Regular',
  },
  modalCancel: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
  },
});

export default BarcodeScanning;