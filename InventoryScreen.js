import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { addInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem, checkForExpiredItems } from "./firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

const InventoryScreen = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInventory();
    checkForExpiredItems();
  }, []);

  const fetchInventory = async () => {
    const data = await getInventoryItems();
    setItems(data);
  };

  const handleConfirmDate = (selectedDate) => {
    setIsDatePickerVisible(false);
    if (selectedDate) {
      setExpirationDate(new Date(selectedDate));
    } else {
      console.warn("Date selection was canceled.");
    }
  };

  const handleAddOrUpdateItem = async () => {
    if (!name || !quantity || !category || !expirationDate) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    try {
      const formattedDate = expirationDate.toISOString().split("T")[0];

      if (editingId) {
        await updateInventoryItem(editingId, { name, quantity: parseInt(quantity), category, expirationDate: formattedDate });
        Alert.alert("Success", "Item updated successfully!");
        setEditingId(null);
      } else {
        await addInventoryItem(name, parseInt(quantity), category, formattedDate);
        Alert.alert("Success", "Item added successfully!");
      }

      setName("");
      setQuantity("");
      setCategory("");
      setExpirationDate(new Date());
      fetchInventory();
    } catch (error) {
      console.error("Error adding/updating item:", error);
      Alert.alert("Error", "Failed to save item. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editingId ? "✏️ Edit Inventory Item" : "➕ Add Inventory Item"}</Text>
      <TextInput style={styles.input} placeholder="Item Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />


      {/* Date Picker */}
      <TouchableOpacity onPress={() => setIsDatePickerVisible(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>
          📅 {expirationDate ? expirationDate.toDateString() : "Select Expiration Date"}
        </Text>
      </TouchableOpacity>


      {/* Actual Date Picker */}
      {isDatePickerVisible && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setIsDatePickerVisible(false);
            if (event.type !== "dismissed" && selectedDate) {
              setExpirationDate(selectedDate);
            }
          }}
        />
      )}

      <Button title={editingId ? "Update Item" : "Add Item"} onPress={handleAddOrUpdateItem} />

      <Text style={styles.subtitle}>📦 Inventory List:</Text>
      {items.length > 0 ? (
        items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemName}>🛒 {item.name}</Text>
            <Text style={styles.itemDetail}>📌 {item.category}</Text>
            <Text style={styles.itemDetail}>📆 {item.expirationDate}</Text>
            <Text style={styles.itemDetail}>🔢 {item.quantity}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => {
                setEditingId(item.id);
                setName(item.name);
                setQuantity(item.quantity.toString());
                setCategory(item.category);
                setExpirationDate(new Date(item.expirationDate));
              }}>
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

// Styles
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 10, backgroundColor: "#fff" },
  datePicker: { padding: 10, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", alignItems: "center", marginBottom: 10 },
  dateText: { fontSize: 16, color: "#555" },
  itemContainer: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8, elevation: 3 },
  itemName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  itemDetail: { fontSize: 16, color: "#555", marginTop: 3 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  editButton: { color: "blue", fontWeight: "bold", marginRight: 10 },
  deleteButton: { color: "red", fontWeight: "bold" },
  errorText: { fontSize: 18, color: "red", textAlign: "center" },
});

export default InventoryScreen;