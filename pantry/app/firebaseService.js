import { firestore } from "@/firebase";
import { collection, query, getDocs, onSnapshot, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";

// Fetch food suggestions in real-time
export const fetchFoodSuggestions = (callback) => {
  return onSnapshot(query(collection(firestore, "items")), (snapshot) => {
    const foodList = snapshot.docs.map((doc) => doc.id);
    callback(foodList);
  }, (error) => {
    console.error("Error fetching items data:", error);
    callback([]);
  });
};

// Add item to pantry
export const addItemToPantry = async (item, count = 1) => {
  try {
    const pantryRef = doc(collection(firestore, 'pantry'), item);
    const pantrySnap = await getDoc(pantryRef);
    if (pantrySnap.exists()) {
      const currentCount = pantrySnap.data().count;
      await setDoc(pantryRef, { count: currentCount + count });
    } else {
      await setDoc(pantryRef, { count });
    }

    const itemsRef = doc(collection(firestore, 'items'), item);
    const itemsSnap = await getDoc(itemsRef);
    if (!itemsSnap.exists()) {
      await setDoc(itemsRef, {});
    }
  } catch (error) {
    console.error("Error adding item:", error);
  }
};

// Remove item from pantry
export const removeItemFromPantry = async (item) => {
  try {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCount = docSnap.data().count;
      if (currentCount === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: currentCount - 1 });
      }
    }
  } catch (error) {
    console.error("Error removing item:", error);
  }
};

// Listen to pantry changes
export const listenToPantry = (callback) => {
  return onSnapshot(collection(firestore, 'pantry'), (snapshot) => {
    const pantryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    callback(pantryList);
  }, (error) => {
    console.error("Error listening to pantry changes:", error);
  });
};
