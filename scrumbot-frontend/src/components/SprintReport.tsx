// src/components/SprintReport.tsx
import React, { useState, useCallback } from 'react';
import {
    Typography,
    Paper,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getReport } from '../services/api'; // Import getReport
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

function SprintReport() {
    const [days, setDays] = useState(7);
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDays(parseInt(event.target.value, 10));
    };

   const downloadReport = useCallback(() => {
        if (report) {
            const blob = new Blob([report], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sprint-report-${days}-days.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, [report, days]);
    

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getReport(days); // Use the getReport function
            setReport(data.markdown_report); // Access the markdown_report property
        } catch (error: any) {
            setError(error.message || 'Failed to generate sprint report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Sprint Report
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                    label="Days"
                    type="number"
                    value={days}
                    onChange={handleDaysChange}
                />
                <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
                    Generate Report
                </Button>
            </Box>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Alert
                    severity="error"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setError(null);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            )}
            {/* Markdown report display */}
            {report && (
                <>
                    <ReactMarkdown>{report}</ReactMarkdown>
                     <Button variant="contained" onClick={downloadReport}>
                        Download Report
                    </Button>
                </>
            )}
        </Paper>
    );
}

export default SprintReport;