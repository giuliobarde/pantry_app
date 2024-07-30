import { firestore } from "@/firebase";
import { collection, query, getDocs, onSnapshot, setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";

export const fetchFoodSuggestions = async () => {
  try {
    const snapshot = await getDocs(query(collection(firestore, "items")));
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching items data:", error);
    return [];
  }
};

export const addItemToPantry = async (item) => {
  try {
    const pantryRef = doc(collection(firestore, 'pantry'), item);
    const pantrySnap = await getDoc(pantryRef);
    if (pantrySnap.exists()) {
      const currentCount = pantrySnap.data().count;
      await setDoc(pantryRef, { count: currentCount + 1 });
    } else {
      await setDoc(pantryRef, { count: 1 });
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

export const listenToPantry = (callback) => {
  return onSnapshot(collection(firestore, 'pantry'), (snapshot) => {
    const pantryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    callback(pantryList);
  }, (error) => {
    console.error("Error listening to pantry changes:", error);
  });
};
