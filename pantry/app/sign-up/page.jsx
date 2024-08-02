"use client";

import Alert from '@mui/material/Alert';

import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import { signUpUser } from '@/app/firebaseService';
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

// SignUp component
const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
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
        const { username, email, password } = formData;
        console.log('Form submitted:', formData);
        try {
            const res = await signUpUser(username, email, password);
            console.log({ res });
            setFormData({
                username: '',
                email: '',
                password: ''
            });
            // Optionally redirect after successful sign-up
            router.push('/pantry');
        } catch (e) {
            console.error(e);
            // Optionally set an error state and show an error message
        }
    };

    const handleSignUpRedirect = () => {
        router.push('/sign-in');
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
                        Sign Up
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
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
                            Sign Up
                        </Button>
                        <Link href="#" variant="body2" onClick={handleSignUpRedirect}>
                            {"Already have an account? Sign In"}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default SignUp;
