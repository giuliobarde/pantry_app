// Sign In page

"use client";

import Alert from '@mui/material/Alert';

import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import { signInUser } from '@/app/firebaseService';
import { useRouter } from 'next/navigation';
import Navbar from 'react-bootstrap/Navbar';

// Navbar component
const MyNavbar = () => {
    const router = useRouter();

    const handleRedirectHome = () => {
        router.push('/');
    };

    return (
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
            <div 
                onClick={handleRedirectHome}
                style={{ 
                    color: '#1976d2', 
                    fontSize: '24px', 
                    cursor: 'pointer' 
                }}
            >
                X
            </div>
        </Navbar>
    );
};

// SignIn component
const SignIn = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { identifier, password } = formData;
        try {
            const res = await signInUser(identifier, password);
            console.log('User signed in:', res);
            router.push('/pantry');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSignUpRedirect = () => {
        router.push('/sign-up');
    };

    return (
        <>
        <MyNavbar />
            <Container maxWidth="sm">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mt: 8,
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Sign In
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="identifier"
                            label="Email or Username"
                            name="identifier"
                            autoComplete="username"
                            autoFocus
                            value={formData.identifier}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Link href="#" variant="body2" onClick={handleSignUpRedirect}>
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default SignIn;
