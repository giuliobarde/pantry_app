"use client";

import Alert from '@mui/material/Alert';

import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, Autocomplete, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { fetchFoodSuggestions, addItemToPantry, removeItemFromPantry, listenToPantry } from "@/app/firebaseService";
import ApiService from '@/api';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from 'react-bootstrap';
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

  const apiService = new ApiService();

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const unsubscribePantry = listenToPantry(userId, setPantry);
      const unsubscribeFoodSuggestions = fetchFoodSuggestions(setFoodOptions);

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
      try {
        const response = await apiService.fetchRecipeSuggestions(ingredients);

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
            width: { xs: '90%', sm: 500 }, // Adjust width based on screen size
            maxWidth: 500, // Ensure modal doesn't grow too large
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
                flexDirection: { xs: 'column', sm: 'row' }, // Stack items vertically on small screens
                alignItems: { xs: 'flex-start', sm: 'center' }, // Align items at the start on small screens
                gap: 2 // Add spacing between items in the column layout
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
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MuiDatePicker
                label="Expiration Date"
                value={itemExpirationDate}
                onChange={(newValue) => setItemExpirationDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            <Button variant="contained" onClick={handleAddItem} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
          alignItems="center"
          sx={{
            '@media (max-width: 600px)': {
              flexDirection: 'column'
            }
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width="100%"
            alignItems="center"
            sx={{
              '@media (max-width: 600px)': {
                gap: 1
              }
            }}
          >
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
              width="100%"
              alignItems="center"
              sx={{ 
                maxWidth: '500px',
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <Button 
                variant="contained" 
                onClick={handleOpen}
                sx={{ width: { xs: '100%', sm: '150px', maxWidth: '150px' } }}
              >
                Add Items
              </Button>
              <TextField
                label="Search Pantry"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
            </Box>
          </Box>
          <Box
            border="1px solid #333"
            width="100%"
            maxWidth="800px"
            minHeight="300px"  // Ensure minimum height of 300px
            maxHeight="400px"  // Optional: Limit the height to 400px for more consistent behavior
            sx={{
              '@media (max-width: 600px)': {
                marginTop: 2
              }
            }}
          >
            <Box
              width="100%"
              height="100px"
              bgcolor="#1976d2"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                variant="h3"
                color="#fff"
                textAlign="center"
              >
                Pantry Items
              </Typography>
            </Box>
            <Stack
              width="100%"
              maxWidth="800px"
              spacing={2}
              overflow="auto"
              sx={{ height: 'calc(100% - 100px)' }} // Ensure content area fills remaining space
            >
              {filteredPantry && Array.isArray(filteredPantry) && filteredPantry.map((item) => (
                <Box
                  key={item.id}
                  width="100%"
                  height="auto"
                  display="flex"
                  flexDirection="row"
                  justifyContent={'space-between'}
                  padding={2}
                  bgcolor="#f0f0f0"
                  onClick={() => handleItemClick(item)}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                  >
                    <Typography
                      variant="h5"
                      color="#333"
                      textAlign="center"
                    >
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                    </Typography>
                    {item.versions && Array.isArray(item.versions) && (
                      <Box display="flex" justifyContent="space-between" paddingY={1}>
                        <Typography>{`Quantity: ${item.versions?.reduce((sum, version) => sum + version.quantity, 0) || 0}`}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Button 
                    variant="contained"
                    onClick={(e) => { 
                      e.stopPropagation();
                      const sortedVersions = item.versions.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
                      const closestVersion = sortedVersions[0];
                      removeItemFromPantry(item.name, 1, user.uid, closestVersion.expirationDate); 
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
          <Button 
            variant="contained" 
            onClick={handleRecipesSearch}
            sx={{ width: '100%', maxWidth: '300px', marginTop: 2 }}
          >
            Search Recipes
          </Button>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
              <CircularProgress />
              <Typography variant="h6">Generating recipe...</Typography>
            </Box>
          ) : (
            recipeSuggestions && (
              <Box 
                border="1px solid #333" 
                padding={2} 
                width="100%" 
                maxWidth="800px" 
                bgcolor="#f9f9f9"
                maxHeight="400px"
                overflow="auto"
                sx={{ marginTop: 2 }}
              >
                <Typography variant="h5">Recipe Suggestions:</Typography>
                <Typography>{recipeSuggestions}</Typography>
              </Box>
            )
          )}
        </Box>
      </Box>
      <Dialog
        open={itemDetailsOpen}
        onClose={handleCloseItemDetails}
        fullWidth
        maxWidth="lg"
        sx={{ padding: '16px' }}
      >
        <DialogTitle>Item Details</DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          {selectedItem && (
            <Box>
              <Typography variant="h6" marginBottom={2}>{selectedItem.name}</Typography>
              {selectedItem.versions && Array.isArray(selectedItem.versions) && selectedItem.versions.map((version) => (
                <Box key={version.id} display="flex" justifyContent="space-between" paddingY={1}>
                  <Typography>{`Quantity: ${version.quantity}`}</Typography>
                  <Typography>{`Expiration Date: ${version.expirationDate ? new Date(version.expirationDate).toLocaleDateString() : 'N/A'}`}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Page;
