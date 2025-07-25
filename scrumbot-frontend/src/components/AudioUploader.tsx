// src/components/AudioUploader.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Typography, Box, LinearProgress, Alert, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Styled components for better visual appearance
const StyledInput = styled(Input)({
    display: 'none',
});

function AudioUploader() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null); // Store the task ID
    const [logLink, setLogLink] = useState<string | null>(null); // Store the link to the created log

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        setSelectedFile(file || null);
        setUploadStatus('idle');
        setErrorMessage(null);
        setTaskId(null);        // Reset task ID
        setLogLink(null);       // Reset log link
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMessage('Please select a file.');
            setUploadStatus('error');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploadStatus('uploading');
        setUploadProgress(0);

        try {
            const response = await axios.post('http://localhost:8000/api/upload_audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                },
            });

            if (response.status === 200) {
                // Assuming the backend returns a task_id in the response
              
                const task_id = response.data.task_id;
                setTaskId(task_id);
                setUploadStatus('processing'); // Transition to processing state

            } else {
                setUploadStatus('error');
                setErrorMessage(`Upload failed: ${response.statusText}`);
            }
        } catch (error: any) {
            setUploadStatus('error');
            setErrorMessage(`Upload failed: ${error.message || 'An unexpected error occurred.'}`);
        }
    };

    // Polling function to check task status
    useEffect(() => {
        if (taskId) {
            const pollTaskStatus = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/task_status/${taskId}`);
                    const status = response.data.status;

                    if (status === 'success') {
                        setUploadStatus('success');
                        setLogLink(response.data.log_url || null); // Assuming backend returns log URL
                        setErrorMessage(null);
                    } else if (status === 'failure') {
                        setUploadStatus('error');
                        setErrorMessage(response.data.error_message || 'Task failed.');
                    } else if (status === 'pending') {
                        setUploadStatus('processing'); // Keep processing state
                    }
                } catch (error: any) {
                    setUploadStatus('error');
                    setErrorMessage(`Error checking task status: ${error.message}`);
                }
            };

            const intervalId = setInterval(pollTaskStatus, 3000); // Poll every 3 seconds

            return () => clearInterval(intervalId); // Clean up on unmount or taskId change
        }
    }, [taskId]);

    // Function to clear messages after a certain time
    useEffect(() => {
        if (uploadStatus === 'success' || uploadStatus === 'error') {
            const timer = setTimeout(() => {
                setUploadStatus('idle');
                setErrorMessage(null);
                setUploadProgress(0);
                setTaskId(null);
                setLogLink(null);
                setSelectedFile(null);
            }, 25000);

            return () => clearTimeout(timer); // Clear timeout on unmount
        }
    }, [uploadStatus]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 3 }}>
            <Typography variant="h6">Upload Voice Standup</Typography>

            <label htmlFor="audio-upload">
                <StyledInput
                    id="audio-upload"
                    type="file"
                    onChange={handleFileChange}
                    inputProps={{ accept: "audio/*" }}
                />
                <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Select Audio File'}
                </Button>
            </label>

            {selectedFile && (
                <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploadStatus === 'uploading'}>
                    Upload
                </Button>
            )}

            {uploadStatus === 'uploading' && (
                <Box sx={{ width: '100%' }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="text.secondary">{`${uploadProgress}%`}</Typography>
                </Box>
            )}

            {uploadStatus === 'processing' && (
                <Typography variant="subtitle1">Processing...</Typography>
            )}

            {uploadStatus === 'success' && (
                <Alert
                    icon={<CheckCircleIcon fontSize="inherit" />}
                    severity="success"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setUploadStatus('idle');
                                setLogLink(null);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Upload successful!  {logLink && <a href={logLink}>View Log</a>}
                </Alert>
            )}

            {uploadStatus === 'error' && errorMessage && (
                <Alert
                    severity="error"
                    icon={<ErrorIcon fontSize="inherit" />}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setUploadStatus('idle');
                                setErrorMessage(null);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {errorMessage}
                </Alert>
            )}
        </Box>
    );
}

export default AudioUploader; 