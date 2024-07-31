"use client";

import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, Autocomplete, TextField, useMediaQuery } from "@mui/material";
import { fetchFoodSuggestions, addItemToPantry, removeItemFromPantry, listenToPantry } from "@/app/firebaseService";
import ApiService from '@/api';

const Page = () => {
  const [pantry, setPantry] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState(1);

  const apiService = new ApiService();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const unsubscribePantry = listenToPantry(setPantry);
    const unsubscribeFoodSuggestions = fetchFoodSuggestions(setFoodOptions);

    return () => {
      unsubscribePantry();
      unsubscribeFoodSuggestions();
    };
  }, []);

  const handleAddItem = async () => {
    if (itemName.trim() && itemCount > 0) {
      await addItemToPantry(itemName, itemCount);
      setItemName('');
      setItemCount(1);
      handleClose();
    }
  };

  const handleRecipesSearch = async () => {
    const ingredients = ['tomato', 'cheese', 'basil']; // Test ingredients
    try {
      const recipeSuggestions = await apiService.fetchRecipeSuggestions(ingredients);
      console.log('Recipe Suggestions:', recipeSuggestions);
    } catch (error) {
      console.error('Failed to fetch recipe suggestions:', error);
    }
  };

  if (useMediaQuery('(max-width:850px)')){
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      sx={{ width: 300, flex: 1 }}
                    />
                  )}
                />
                <TextField
                  label="Count"
                  type="number"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100 }}
                />
              </Box>
              <Button variant="contained" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          paddingX={2}
        >
          <Box
            display="flex"
            width="100%"
            justifyContent="space-between"
            gap={2}
            paddingX={2}
          >
          <Button variant="contained" onClick={handleOpen}>Add Items</Button>
          <Button variant="contained" onClick={handleRecipesSearch}>Search Recipes</Button>
          </Box>
          <Box border="1px solid #333">
            <Box
              width="800px"
              height="100px"
              bgcolor="#add8e6"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                variant="h2"
                color="#333"
                textAlign="center"
              >
                Pantry Items
              </Typography>
            </Box>
            <Stack
              width="800px"
              height="200px"
              spacing={2}
              overflow="auto"
            >
              {pantry.map((i) => (
                <Box
                  key={i.name}
                  width="100%"
                  height="300px"
                  display="flex"
                  justifyContent="space-between"
                  padding={2}
                  alignItems="center"
                  bgcolor="#f0f0f0"
                >
                  <Typography
                    variant="h3"
                    color="#333"
                    textAlign="center"
                  >
                    {i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}
                  </Typography>
                  <Typography
                    variant="h3"
                    color="#333"
                    textAlign="center"
                  >
                    x{i.count}
                  </Typography>
                  <Button variant="contained" onClick={async () => await removeItemFromPantry(i.name)}>Remove</Button>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      sx={{ width: 300, flex: 1 }}
                    />
                  )}
                />
                <TextField
                  label="Count"
                  type="number"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100 }}
                />
              </Box>
              <Button variant="contained" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          paddingX={2}
        >
          <Box
            display="flex"
            width="100%"
            justifyContent="space-between"
            gap={2}
            paddingX={2}
          >
          <Button variant="contained" onClick={handleOpen}>Add Items</Button>
          </Box>
          <Box border="1px solid #333">
            <Box
              width="800px"
              height="100px"
              bgcolor="#add8e6"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                variant="h2"
                color="#333"
                textAlign="center"
              >
                Pantry Items
              </Typography>
            </Box>
            <Stack
              width="800px"
              height="200px"
              spacing={2}
              overflow="auto"
            >
              {pantry.map((i) => (
                <Box
                  key={i.name}
                  width="100%"
                  height="300px"
                  display="flex"
                  justifyContent="space-between"
                  padding={2}
                  alignItems="center"
                  bgcolor="#f0f0f0"
                >
                  <Typography
                    variant="h3"
                    color="#333"
                    textAlign="center"
                  >
                    {i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}
                  </Typography>
                  <Typography
                    variant="h3"
                    color="#333"
                    textAlign="center"
                  >
                    x{i.count}
                  </Typography>
                  <Button variant="contained" onClick={async () => await removeItemFromPantry(i.name)}>Remove</Button>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    );
  }
};

export default Page;
