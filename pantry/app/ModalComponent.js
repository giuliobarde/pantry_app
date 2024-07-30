import React, { useState } from 'react';
import { Box, Typography, Stack, Autocomplete, TextField, Button, Modal } from "@mui/material";

const ModalComponent = ({ open, handleClose, foodOptions, addItem }) => {
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState(1);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">Add Item</Typography>
        <Stack spacing={2} sx={{ width: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
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
                  label="Search input"
                  InputProps={{ ...params.InputProps, type: 'search' }}
                  sx={{ width: '300%' }}
                />
              )}
            />
            <TextField
              label="Count"
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ width: '1%' }}
            />
            <Button
              variant="contained"
              onClick={async () => {
                if (itemName.trim()) {
                  await addItem(itemName);
                  setItemName('');
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
