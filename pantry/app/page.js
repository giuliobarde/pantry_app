"use client";

import { Box, Stack, Typography, Button, Modal, Autocomplete, TextField } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, getDocs, query, setDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const foodSuggestions = ['potato', 'tomato', 'banana', 'bread'];

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    try {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      const pantryList = docs.docs.map(doc => doc.id);
      console.log(pantryList);
      setPantry(pantryList);
    } catch (error) {
      console.error("Error fetching pantry data:", error);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    try {
      await setDoc(doc(collection(firestore, 'pantry'), item), { name: item });
      updatePantry();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

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
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack spacing={2} sx={{ width: 300 }}>
            <Autocomplete
              freeSolo
              id="free-solo-2-demo"
              disableClearable
              options={foodSuggestions}
              value={itemName}
              onChange={(event, newValue) => {
                setItemName(newValue || '');
              }}
              onInputChange={(event, newInputValue) => {
                setItemName(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search input"
                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={() => {
                if (itemName.trim()) {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
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
              key={i}
              width="100%"
              height="300px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="#f0f0f0"
            >
              <Typography
                variant="h3"
                color="#333"
                textAlign="center"
              >
                {i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
