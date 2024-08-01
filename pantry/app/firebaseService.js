import { firestore, auth } from "@/firebase";
import { collection, query, getDocs, onSnapshot, setDoc, doc, deleteDoc, getDoc, where } from "firebase/firestore";
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
export const addItemToPantry = async (item, count = 1, userId) => {
  try {
    const pantryRef = doc(collection(firestore, 'pantry'), `${userId}_${item}`);
    const pantrySnap = await getDoc(pantryRef);
    if (pantrySnap.exists()) {
      const currentCount = pantrySnap.data().count;
      await setDoc(pantryRef, { count: currentCount + count }, { merge: true });
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
export const removeItemFromPantry = async (item, userId) => {
  try {
    const docRef = doc(collection(firestore, 'pantry'), `${userId}_${item}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCount = docSnap.data().count;
      if (currentCount === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: currentCount - 1 }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error removing item:", error);
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

    // Determine the email based on identifier
    if (identifier.includes('@')) {
      userEmail = identifier;
    } else {
      // Fetch the email associated with the username
      const userQuery = query(collection(firestore, "users"), where("username", "==", identifier));
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        throw new Error("No user found with the provided username.");
      }

      const userDoc = querySnapshot.docs[0];
      userEmail = userDoc.data().email;
    }

    // Sign in with email and password
    const res = await signInWithEmailAndPassword(auth, userEmail, password);
    sessionStorage.setItem('user', true);

    // Fetch user document
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
