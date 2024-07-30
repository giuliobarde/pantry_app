import React from 'react';
import { Box, Typography, Button } from "@mui/material";

const PantryItemComponent = ({ item, removeItem }) => (
  <Box
    key={item.name}
    width="100%"
    height="300px"
    display="flex"
    justifyContent="space-between"
    padding={2}
    alignItems="center"
    bgcolor="#f0f0f0"
  >
    <Typography variant="h3" color="#333" textAlign="center">
      {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
    </Typography>
    <Typography variant="h3" color="#333" textAlign="center">x{item.count}</Typography>
    <Button variant="contained" onClick={async () => await removeItem(item.name)}>Remove</Button>
  </Box>
);

export default PantryItemComponent;
