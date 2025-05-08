import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem, checkForExpiredItems, } from '@/firestore';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string;
};

const Inventory = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  
  const categoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Beverages', 'Snacks', 'Other'];
  const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'oz', 'lb'];

  useEffect(() => {
    fetchInventory();
    checkForExpiredItems();
  }, []);

  const fetchInventory = async () => {
    const data = await getInventoryItems();
    setItems(data as InventoryItem[]);
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !quantity || !category || !expirationDate || !unit) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }

    const formattedDate = expirationDate.toISOString().split('T')[0];

    try {
      if (editingId) {
        await updateInventoryItem(editingId, {
          name,
          quantity: parseInt(quantity),
          unit,
          category,
          expirationDate: formattedDate,
        });
        Alert.alert('Success', 'Item updated successfully!');
        setEditingId(null);
      } else {
        await addInventoryItem(name, parseInt(quantity), unit, category, formattedDate);
        Alert.alert('Success', 'Item added successfully!');
      }

      setName('');
      setQuantity('');
      setUnit('pcs');
      setCategory('');
      setExpirationDate(new Date());
      fetchInventory();
    } catch (error) {
      console.error('Error adding/updating item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editingId ? '✏️ Edit Inventory Item' : '➕ Add Inventory Item'}</Text>
      <TextInput style={styles.input} placeholder="Item Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      {/* Category Picker Modal */}
      <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} style={styles.unitPicker}>
        <Text style={styles.unitText}>📂 Category: {category || 'Select'}</Text>
      </TouchableOpacity>
      <Modal visible={isCategoryModalVisible} transparent animationType="slide" onRequestClose={() => setIsCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {categoryOptions.map(opt => (
              <TouchableOpacity key={opt} onPress={() => {
                setCategory(opt);
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
    

      {/* Modal-style unit picker */}
      <TouchableOpacity onPress={() => setIsUnitModalVisible(true)} style={styles.unitPicker}>
        <Text style={styles.unitText}>📏 Unit: {unit}</Text>
      </TouchableOpacity>

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
                  setUnit(opt);
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

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>📅 {expirationDate.toDateString()}</Text>
      </TouchableOpacity>

      {isDatePickerVisible && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setIsDatePickerVisible(false);
            if (selectedDate) {
              setExpirationDate(selectedDate);
            }
          }}
        />
      )}

      <Button title={editingId ? 'Update Item' : 'Add Item'} onPress={handleAddOrUpdateItem} />

      <Text style={styles.subtitle}>📦 Inventory List:</Text>
      {items.length > 0 ? (
        items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemName}>🛒 {item.name}</Text>
            <Text style={styles.itemDetail}>📌 {item.category}</Text>
            <Text style={styles.itemDetail}>📆 {item.expirationDate}</Text>
            <Text style={styles.itemDetail}>🔢 {item.quantity} {item.unit}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setQuantity(item.quantity.toString());
                  setCategory(item.category);
                  setExpirationDate(new Date(item.expirationDate));
                  setUnit(item.unit || 'pcs');
                }}
              >
                <Text style={styles.editButton}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteInventoryItem(item.id)}>
                <Text style={styles.deleteButton}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.errorText}>No items in inventory.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#f8f9fa' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    color: '#333' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  unitPicker: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
    color: '#555',
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
  },
  modalCancel: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
  datePicker: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: { 
    fontSize: 16, 
    color: '#555' 
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  itemName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  itemDetail: { 
    fontSize: 16, 
    color: '#555', 
    marginTop: 3 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  editButton: { 
    color: 'blue', 
    fontWeight: 'bold', 
    marginRight: 10 
  },
  deleteButton: { 
    color: 'red', 
    fontWeight: 'bold' 
  },
  subtitle: { 
    fontSize: 20, 
    marginVertical: 15, 
    textAlign: 'center' 
  },
  errorText: { 
    fontSize: 18, 
    color: 'red', 
    textAlign: 'center' 
  },
});

export default Inventory;