import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from "@/firebaseConfig";
import type { InventoryItem } from "@/types";

// Add Inventory Item
export const addInventoryItem = async (
  name: string,
  quantity: number, 
  unit: string,
  category: string,
  expirationDate: string
): Promise<void> => {
  const user = getAuth().currentUser;
  if (!user) return;

  try {
    await addDoc(collection(FIREBASE_DB, "inventory"), {
      userId: user.uid,
      name,
      quantity,
      unit,
      category,
      expirationDate,
    });
  } catch (error) {
    console.error("Error adding item: ", error);
  }
};

// Get Inventory Items (for current user)
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const user = getAuth().currentUser;
  if (!user) return [];

  try {
    const q = query(collection(FIREBASE_DB, "inventory"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        expirationDate: data.expirationDate,
      };
    });
  } catch (error) {
    console.error("Error retrieving inventory items: ", error);
    return [];
  }
};

// Update Inventory Item
export const updateInventoryItem = async (
  itemId: string,
  updatedData: Partial<Omit<InventoryItem, "id">>
): Promise<void> => {
  try {
    const itemRef = doc(FIREBASE_DB, "inventory", itemId);
    await updateDoc(itemRef, updatedData);
  } catch (error) {
    console.error("Error updating item: ", error);
  }
};

// Delete Inventory Item
export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(FIREBASE_DB, "inventory", itemId));
  } catch (error) {
    console.error("Error deleting item: ", error);
  }
};

// Check for Expired Items (warn user)
export const checkForExpiredItems = async (): Promise<void> => {
  const user = getAuth().currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  try {
    const q = query(collection(FIREBASE_DB, "inventory"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.docs.forEach((docSnap) => {
      const { expirationDate, name } = docSnap.data();
      if (expirationDate && expirationDate < today) {
        console.warn(`⚠️ Item Expired: ${name} (${expirationDate})`);
        alert(`⚠️ ALERT: ${name} expired on ${expirationDate}!`);
      }
    });
  } catch (error) {
    console.error("Error checking for expired items: ", error);
  }
};