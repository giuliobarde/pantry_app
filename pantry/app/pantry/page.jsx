"use client";

import Alert from '@mui/material/Alert';
import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, Autocomplete, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, AppBar, Toolbar } from "@mui/material";
import { fetchFoodSuggestions, addItemToPantry, removeItemFromPantry, listenToPantry, fetchUsername } from "@/app/firebaseService";
import ApiService from '@/api';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
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
  const [username, setUsername] = useState('');

  const apiService = new ApiService();

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const unsubscribePantry = listenToPantry(userId, setPantry);
      const unsubscribeFoodSuggestions = fetchFoodSuggestions(setFoodOptions);

      const fetchUserName = async () => {
        const fetchedUsername = await fetchUsername(user);
        if (fetchedUsername) {
          setUsername(fetchedUsername);
        }
      };
      
      fetchUserName();

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

      const ingredients = pantry.flatMap(item =>
        item.versions?.map(v => v.name?.toLowerCase() || '') || []
      );
      try {
        const response = await apiService.fetchRecipeSuggestions(ingredients);
        const recipeSuggestions = response.choices && response.choices.length > 0
            ? response.choices[0].text // Adjust this based on the actual structure
            : 'No recipes found';
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
      <AppBar position="fixed" sx={{ backgroundColor: 'black' }}git >
        <Toolbar>
          <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
            Pantr<span style={{ color: '#1976d2' }}>AI</span>
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSignOut}
            color="primary"
          >
            test
          </Button>
        </Toolbar>
      </AppBar>
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
            minHeight="300px"
            maxHeight="400px"
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
                {username ? `${username}'s Pantry Items` : 'Loading...'}
              </Typography>
            </Box>
            <Stack
              width="100%"
              maxWidth="800px"
              spacing={2}
              overflow="auto"
              sx={{ height: 'calc(100% - 100px)' }}
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
