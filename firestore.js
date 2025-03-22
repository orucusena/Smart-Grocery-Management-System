import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
//import { db } from "./firebaseConfig"; 
import { FIREBASE_DB } from '@/firebaseConfig';

// Function to Add an Inventory Item
export const addInventoryItem = async (name, quantity, category, expirationDate) => {
  try {
    const docRef = await addDoc(collection(FIREBASE_DB, "inventory"), {
      name,
      quantity: Number(quantity),
      category,
      expirationDate,
      createdAt: new Date(),
    });
    console.log("Item added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding item:", error);
  }
};

// Function to Retrieve Inventory Items
export const getInventoryItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(FIREBASE_DB, "inventory"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error retrieving inventory items: ", error);
    return [];
  }
};

// Function to Update an Inventory Item
export const updateInventoryItem = async (itemId, updatedData) => {
  try {
    const itemRef = doc(FIREBASE_DB, "inventory", itemId);
    await updateDoc(itemRef, updatedData);
    console.log("Item updated:", itemId);
  } catch (error) {
    console.error("Error updating item:", error);
  }
};

// Function to Delete an Inventory Item
export const deleteInventoryItem = async (itemId) => {
  try {
    await deleteDoc(doc(FIREBASE_DB, "inventory", itemId));
    console.log("Item deleted:", itemId);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
};

// Function to Check for Expired Items
export const checkForExpiredItems = async () => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date
  const querySnapshot = await getDocs(collection(FIREBASE_DB, "inventory"));
  
  querySnapshot.docs.forEach((doc) => {
    const { expirationDate, name } = doc.data();
    if (expirationDate && expirationDate < today) {
      console.warn(`⚠️ Item Expired: ${name} (${expirationDate})`);
      alert(`⚠️ ALERT: ${name} expired on ${expirationDate}!`);
    }
  });
};