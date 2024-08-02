import { firestore, auth } from "@/firebase";
import { collection, query, getDocs, onSnapshot, setDoc, doc, deleteDoc, getDoc, where, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

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
export const addItemToPantry = async (item, count = 1, userId, expirationDate) => {
  try {
    // Ensure expirationDate is a Date object
    if (!(expirationDate instanceof Date)) {
      throw new Error("Invalid expiration date format.");
    }

    const pantryRef = collection(firestore, 'pantry');
    const itemQuery = query(pantryRef, where("name", "==", item), where("userId", "==", userId));
    const querySnapshot = await getDocs(itemQuery);

    const expirationDateStr = expirationDate.toISOString(); // Convert to string for comparison

    if (!querySnapshot.empty) {
      const existingItem = querySnapshot.docs[0];
      const data = existingItem.data();
      const newVersions = data.versions || [];

      const versionIndex = newVersions.findIndex(version => version.expirationDate === expirationDateStr);

      if (versionIndex >= 0) {
        // Update existing version
        newVersions[versionIndex].quantity += count;
      } else {
        // Add new version
        newVersions.push({ quantity: count, expirationDate: expirationDateStr });
      }

      await updateDoc(existingItem.ref, { versions: newVersions });
    } else {
      // Create new item
      const newItem = {
        name: item,
        count,
        versions: [{ quantity: count, expirationDate: expirationDateStr }],
        userId
      };
      await setDoc(doc(pantryRef, `${userId}_${item}`), newItem);
    }
  } catch (error) {
    console.error("Error adding item to pantry:", error);
  }
};

// Remove specific version of an item from pantry
export const removeItemFromPantry = async (item, count = 1, userId) => {
  try {
    const pantryRef = collection(firestore, 'pantry');
    const itemQuery = query(pantryRef, where("name", "==", item), where("userId", "==", userId));
    const querySnapshot = await getDocs(itemQuery);

    if (querySnapshot.empty) {
      throw new Error("Item not found in pantry.");
    }

    const existingItem = querySnapshot.docs[0];
    const data = existingItem.data();
    const newVersions = data.versions || [];

    // Sort versions by expiration date to find the closest one
    newVersions.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

    if (newVersions.length === 0) {
      throw new Error("No versions found for the item.");
    }

    const closestVersion = newVersions[0];
    
    if (count >= closestVersion.quantity) {
      // Remove the version if the quantity to remove is greater than or equal to the available quantity
      newVersions.shift();
    } else {
      // Decrease the quantity of the closest version
      closestVersion.quantity -= count;
    }

    if (newVersions.length === 0) {
      // Remove the entire item if no versions are left
      await deleteDoc(existingItem.ref);
    } else {
      await updateDoc(existingItem.ref, { versions: newVersions });
    }
    
  } catch (error) {
    console.error("Error removing item from pantry:", error);
  }
};

// Listen to pantry changes
export const listenToPantry = (userId, callback) => {
  return onSnapshot(query(collection(firestore, 'pantry'), where("__name__", ">=", `${userId}_`), where("__name__", "<", `${userId}_\uf8ff`)), (snapshot) => {
    const pantryList = snapshot.docs.map(doc => ({ name: doc.id.split('_')[1], ...doc.data() }));
    callback(pantryList);
  }, (error) => {
    console.error("Error listening to pantry changes:", error);
  });
};

// User sign-up
export const signUpUser = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem('user', true);
    await setDoc(doc(firestore, "users", res.user.uid), {
      username,
      email,
    });
    return res;
  } catch (error) {
    throw error;
  }
};

// User sign-in with email or username
export const signInUser = async (identifier, password) => {
  try {
    let userEmail;

    if (identifier.includes('@')) {
      userEmail = identifier;
    } else {
      const userQuery = query(collection(firestore, "users"), where("username", "==", identifier));
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        throw new Error("No user found with the provided username.");
      }

      const userDoc = querySnapshot.docs[0];
      userEmail = userDoc.data().email;
    }

    const res = await signInWithEmailAndPassword(auth, userEmail, password);
    sessionStorage.setItem('user', true);

    const userDoc = await getDoc(doc(firestore, "users", res.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        email: res.user.email,
        username: userData.username,
        userId: res.user.uid
      };
    } else {
      throw new Error("User data not found");
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
