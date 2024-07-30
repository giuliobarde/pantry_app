import { useState, useEffect } from 'react';
import { fetchFoodSuggestions, listenToPantry, addItemToPantry, removeItemFromPantry } from '@/app/firebaseUtils';

export const usePantry = () => {
  const [pantry, setPantry] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);

  useEffect(() => {
    const unsubscribePantry = listenToPantry(setPantry);
    fetchFoodSuggestions().then(setFoodOptions);
    return () => unsubscribePantry();
  }, []);

  return { pantry, foodOptions, addItemToPantry, removeItemFromPantry };
};
