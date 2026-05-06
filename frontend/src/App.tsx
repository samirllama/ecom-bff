import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-commerce Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the E-com BFF Frontend scaffolded with React, TypeScript, and MUI.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
