"use client";

import { Box, Typography, Stack, Button } from "@mui/material";
import { useState } from "react";
import ModalComponent from "./ModalComponent";
import PantryItemComponent from "./PantryItemComponent";
import { usePantry } from "@/app/usePantry";

export default function Home() {
  const { pantry, foodOptions, addItemToPantry, removeItemFromPantry } = usePantry();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" flexDirection="column" alignItems="center" gap={2}>
      <ModalComponent open={open} handleClose={handleClose} foodOptions={foodOptions} addItem={addItemToPantry} />
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#add8e6" display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h2" color="#333" textAlign="center">Pantry Items</Typography>
        </Box>
        <Stack width="800px" height="200px" spacing={2} overflow="auto">
          {pantry.map(item => (
            <PantryItemComponent key={item.name} item={item} removeItem={removeItemFromPantry} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
