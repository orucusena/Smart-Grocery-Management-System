import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Button, Platform, Modal, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { addInventoryItem, updateInventoryItem } from '@/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'oz', 'lb'];
const categoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Beverages', 'Snacks', 'Other'];


type ParamList = {
  AddItem: { editId?: string };
};

export default function AddItem() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'AddItem'>>();
  const editId = route.params?.editId;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!editId) return;
      try {
        const docRef = doc(FIREBASE_DB, 'inventory', editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const item = docSnap.data();
          setName(item.name || '');
          setQuantity(item.quantity?.toString() || '');
          setUnit(item.unit || 'pcs');
          setCategory(item.category || '');
          setExpirationDate(new Date(item.expirationDate));
        }
      } catch (err) {
        console.error('Error loading item:', err);
        Alert.alert('Error', 'Failed to load item data.');
      }
    };
    fetchItem();
  }, [editId]);

  const handleSubmit = async () => {
    if (!name || !quantity || !unit || !category || !expirationDate) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }

    try {
      const formattedDate = expirationDate.toISOString().split('T')[0];

      if (editId) {
        await updateInventoryItem(editId, {
          name,
          quantity: parseInt(quantity),
          unit,
          category,
          expirationDate: formattedDate,
        });
        Alert.alert('Success', 'Item updated!');
      } else {
        await addInventoryItem(name, parseInt(quantity), unit, category, formattedDate);
        Alert.alert('Success', 'Item added!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save item:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text 
        style={styles.title}>{editId ? 'Edit Inventory Item' : 'Add Inventory Item'}
      </Text>

      <TextInput 
        style={[styles.input, { fontSize: 16 }]} 
        placeholder="Item Name" 
        placeholderTextColor="#555"
        value={name} 
        onChangeText={setName} 
      />
      <TextInput
        style={[styles.input, { fontSize: 16 }]}
        placeholder="Quantity"
        placeholderTextColor="#555"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      {/* Unit Picker */}
      <TouchableOpacity onPress={() => setShowUnitModal(true)} style={styles.pickerBox}>
        <Text style={styles.pickerText}>
          <MaterialIcons name="straighten" size={18} color="#555" /> Unit: {unit}
        </Text>
      </TouchableOpacity>
      <Modal transparent animationType="slide" visible={showUnitModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {unitOptions.map((u) => (
              <TouchableOpacity key={u} style={styles.modalItem} onPress={() => {
                setUnit(u);
                setShowUnitModal(false);
              }}>
                <Text style={styles.modalItemText}>{u}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowUnitModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Picker */}
      <TouchableOpacity onPress={() => setShowCategoryModal(true)} style={styles.pickerBox}>
        <Text style={styles.pickerText}>
          <MaterialIcons name="category" size={18} color="#555" /> Category: {category || 'Select Category'}
        </Text>
      </TouchableOpacity>
      <Modal transparent animationType="slide" visible={showCategoryModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {categoryOptions.map((c) => (
              <TouchableOpacity key={c} style={styles.modalItem} onPress={() => {
                setCategory(c);
                setShowCategoryModal(false);
              }}>
                <Text style={styles.modalItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      <TouchableOpacity style={styles.pickerBox} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerText}>
          <MaterialIcons name="calendar-today" size={18} color="#555" /> {expirationDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setExpirationDate(date);
          }}
        />
      )}

    <TouchableOpacity
        style={[styles.addButton, editId ? styles.updateButton : styles.createButton]} 
        onPress={handleSubmit}
    >           
        <Text style={styles.addButtonText}>{editId ? 'Update Item' : 'Add Item'}</Text>
    </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
    padding: 20,
},  
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center' 
},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  pickerText: { 
    fontSize: 16, 
    color: '#555' 
},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
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
    fontSize: 18 
},
  cancel: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
  },
  
  createButton: {
    backgroundColor: '#91b38e',
  },
  
  updateButton: {
    backgroundColor: '#5a855f',
  },
  
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },  
});