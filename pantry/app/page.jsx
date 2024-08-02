import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const LandingPage = () => {
  return (
    <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        padding={2}
        sx={{ backgroundColor: '#000', color: '#fff' }}
    >
      <Typography
        variant="h1"
        component="h1"
        style={{ color: 'white', fontWeight: 'bold' }}
    >
        Pantr<span style={{ color: '#1976d2' }}>AI</span>
    </Typography>
      <Typography
        variant="subtitle1"
        component="a"
        href="https://giuliobardelli.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ marginBottom: 4, fontSize: '1.25rem', textAlign: 'center', textDecoration: 'none', color: '#1976d2' }}
      >
        by Giulio Bardelli
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        href="/sign-in"
        sx={{ padding: '16px 32px', fontSize: '1.25rem' }}
      >
        Sign In
      </Button>
    </Box>
  );
};

export default LandingPage;
