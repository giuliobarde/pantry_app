"use client";

import Alert from '@mui/material/Alert';
import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, Autocomplete, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { fetchFoodSuggestions, addItemToPantry, removeItemFromPantry, listenToPantry } from "@/app/firebaseService";
import ApiService from '@/api';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Navbar from 'react-bootstrap/Navbar';
import { signOut } from 'firebase/auth';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';

const Page = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [redirectToSignIn, setRedirectToSignIn] = useState(false);
  const [pantry, setPantry] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState(1);
  const [itemExpirationDate, setItemExpirationDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipeSuggestions, setRecipeSuggestions] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [username, setUsername] = useState('');  // State to store the username

  const apiService = new ApiService();

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const unsubscribePantry = listenToPantry(userId, setPantry);
      const unsubscribeFoodSuggestions = fetchFoodSuggestions(setFoodOptions);

      const fetchUsername = async () => {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      };

      fetchUsername();

      return () => {
        unsubscribePantry();
        unsubscribeFoodSuggestions();
      };
    }
  }, [user]);

  useEffect(() => {
    if (redirectToSignIn) {
      router.push('/sign-in');
    }
  }, [redirectToSignIn, router]);

  useEffect(() => {
    if (!user && sessionStorage.getItem('user') === null) {
      setRedirectToSignIn(true);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPantry(pantry);
    } else {
      const queryLower = searchQuery.toLowerCase();
      setFilteredPantry(pantry.filter(item =>
        item.name.toLowerCase().includes(queryLower)
      ));
    }
  }, [searchQuery, pantry]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setItemCount(1);
    setItemExpirationDate(null);
  };

  const handleAddItem = async () => {
    if (itemName.trim() && itemCount > 0 && user) {
      await addItemToPantry(itemName, itemCount, user.uid, itemExpirationDate);
      handleClose();
    }
  };

  const handleRecipesSearch = async () => {
    if (user) {
      if (pantry.length === 0) {
        window.location.href = 'https://www.google.com/maps/search/restaurants';
        return;
      }

      setLoading(true);
      setRecipeSuggestions('');

      // Extract item names from pantry state
      const ingredients = pantry.flatMap(item =>
        item.versions?.map(v => v.name?.toLowerCase() || '') || []
      );

      // Debugging output
      console.log("Extracted ingredients:", ingredients);

      try {
        const response = await apiService.fetchRecipeSuggestions(ingredients);

        // Debugging output
        console.log("API response:", response);

        // Extract and clean recipe suggestions from the response
        const recipeSuggestions = response.choices && response.choices.length > 0
            ? response.choices[0].text // Adjust this based on the actual structure
            : 'No recipes found';

        // Clean the output by removing unnecessary text
        const cleanedRecipeSuggestions = cleanRecipeOutput(recipeSuggestions);

        setRecipeSuggestions(cleanedRecipeSuggestions);
      } catch (error) {
        console.error('Failed to fetch recipe suggestions:', error);
        setRecipeSuggestions('Failed to fetch recipe suggestions.');
      } finally {
        setLoading(false);
      }
    }
  };

  const cleanRecipeOutput = (text) => {
    const lines = text.split('\n');
    const recipeLines = lines.filter(line => {
      return line.trim() !== '' && !line.startsWith('Tips:') && !line.includes('.....') && !line.includes('(') && !line.includes(')') && !line.includes('[') && !line.includes(']');
    });
    return recipeLines.join('\n');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('user');
      setRedirectToSignIn(true);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setItemDetailsOpen(true);
  };

  const handleCloseItemDetails = () => {
    setItemDetailsOpen(false);
    setSelectedItem(null);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      overflow="auto"
      gap={2}
    >
      <Navbar 
        className="d-flex justify-content-between" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          width: '100%', 
          height: '70px',
          zIndex: 1000,
          backgroundColor: 'black',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography
          variant="h6"
          style={{ color: 'white', fontWeight: 'bold' }}
        >
          Pantr<span style={{ color: '#1976d2' }}>AI</span>
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleSignOut}
          style={{ padding: '8px 16px' }}
        >
          Log out
        </Button>
      </Navbar>
      <Box 
        sx={{ 
          paddingTop: '70px', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          overflow: 'auto',
          gap: 2,
          '@media (max-width: 600px)': {
            paddingTop: '60px'
          }
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {username ? `${username}'s Pantry Items` : 'Loading...'}
        </Typography>
        
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: { xs: '90%', sm: 500 },
              maxWidth: 500,
              bgcolor: 'background.paper', 
              border: '2px solid #000', 
              boxShadow: 24, 
              p: 4 
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2
                }}
              >
                <Autocomplete
                  freeSolo
                  id="free-solo-2-demo"
                  disableClearable
                  options={foodOptions}
                  value={itemName}
                  onChange={(event, newValue) => setItemName(newValue || '')}
                  onInputChange={(event, newInputValue) => setItemName(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Item"
                      InputProps={{ ...params.InputProps, type: 'search' }}
                      sx={{ width: '300px', maxWidth: 100 }}
                    />
                  )}
                />
                <TextField
                  label="Count"
                  type="number"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: '100px', maxWidth: 100 }}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <MuiDatePicker
                    label="Expiration Date"
                    value={itemExpirationDate}
                    onChange={(date) => setItemExpirationDate(date)}
                    renderInput={(params) => <TextField {...params} sx={{ width: '200px', maxWidth: 100 }} />}
                  />
                </LocalizationProvider>
              </Box>
              <Button variant="contained" onClick={handleAddItem}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        
        <Dialog
          open={itemDetailsOpen}
          onClose={handleCloseItemDetails}
          aria-labelledby="dialog-title"
        >
          <DialogTitle id="dialog-title">Item Details</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                <Typography variant="h6">Item Name: {selectedItem.name}</Typography>
                <Typography>Quantity: {selectedItem.quantity}</Typography>
                <Typography>Expiration Date: {selectedItem.expirationDate || 'N/A'}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseItemDetails}>Close</Button>
          </DialogActions>
        </Dialog>
        
        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <TextField
            label="Search Pantry"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleOpen}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            onClick={handleRecipesSearch}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Find Recipes'}
          </Button>
        </Box>

        <Box width="100%">
          {filteredPantry.map(item => (
            <Box 
              key={item.id}
              onClick={() => handleItemClick(item)}
              sx={{
                cursor: 'pointer',
                padding: 2,
                borderBottom: '1px solid #ddd',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <Typography variant="body1" component="div">
                {item.name} - {item.quantity} (Expires on: {item.expirationDate || 'N/A'})
              </Typography>
            </Box>
          ))}
        </Box>
        
        {recipeSuggestions && (
          <Box width="100%" mt={2}>
            <Typography variant="h6">Recipe Suggestions:</Typography>
            <Typography>{recipeSuggestions}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Page;
