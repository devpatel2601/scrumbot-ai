// src/pages/Dashboard.tsx
import React from 'react';
import AudioUploader from '../components/AudioUploader';
import { Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';

// Styled component for the main container
const DashboardContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    gap: '1rem',
});

// Styled component for the paper
const DashboardPaper = styled(Paper)({
    padding: '2rem',
    maxWidth: '600px', // Adjust as needed
    width: '100%',
    textAlign: 'center',
    elevation: 3,
});

function Dashboard() {
    return (
        <DashboardContainer>
            <DashboardPaper>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to the ScrumBot AI Dashboard! Upload your voice standups here.
                </Typography>
                <AudioUploader />
            </DashboardPaper>
        </DashboardContainer>
    );
}

export default Dashboard;