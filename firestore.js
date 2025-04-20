import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from "@/firebaseConfig";

// Function to Add Inventory Item
export const addInventoryItem = async (name, quantity, category, expirationDate) => {
  const user = getAuth().currentUser;
  if (!user) return;

  try {
    const docRef = await addDoc(collection(FIREBASE_DB, "inventory"), {
      userId: user.uid,
      name,
      quantity,
      category,
      expirationDate,
    });
    console.log("Item added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding item: ", error);
  }
};

// Function to Get Inventory Items (per user)
export const getInventoryItems = async () => {
  const user = getAuth().currentUser;
  if (!user) return [];

  try {
    const q = query(collection(FIREBASE_DB, "inventory"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return items;
  } catch (error) {
    console.error("Error retrieving inventory items: ", error);
    return [];
  }
};

// Function to Update Inventory Item
export const updateInventoryItem = async (itemId, updatedData) => {
  try {
    const itemRef = doc(FIREBASE_DB, "inventory", itemId);
    await updateDoc(itemRef, updatedData);
    console.log("Item updated: ", itemId);
  } catch (error) {
    console.error("Error updating item: ", error);
  }
};

// Function to Delete Inventory Item
export const deleteInventoryItem = async (itemId) => {
  try {
    await deleteDoc(doc(FIREBASE_DB, "inventory", itemId));
    console.log("Item deleted: ", itemId);
  } catch (error) {
    console.error("Error deleting item: ", error);
  }
};

// Function to Check for Expired Items (per user)
export const checkForExpiredItems = async () => {
  const user = getAuth().currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  const q = query(collection(FIREBASE_DB, "inventory"), where("userId", "==", user.uid));

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => {
      const { expirationDate, name } = doc.data();
      if (expirationDate && expirationDate < today) {
        console.warn(`⚠️ Item Expired: ${name} (${expirationDate})`);
        alert(`⚠️ ALERT: ${name} expired on ${expirationDate}!`);
      }
    });
  } catch (error) {
    console.error("Error checking for expired items: ", error);
  }
};