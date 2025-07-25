import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { getTrends } from '../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function TrendChart() {
    const [trendsData, setTrendsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Optional: Poll every 10 seconds
    useEffect(() => {
        const fetchTrendsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getTrends();
                setTrendsData(data);
            } catch (error: any) {
                setError(error.message || 'Failed to fetch trends data.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendsData();
        const interval = setInterval(fetchTrendsData, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setError(null)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                {error}
            </Alert>
        );
    }

    const emotionLabels = trendsData?.dates || [];
    const emotionData = trendsData?.emotions || {};

    const colorPalette = [
        '#007bff', '#dc3545', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'
    ];

    const datasets = Object.keys(emotionData).map((emotion, index) => ({
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        data: emotionData[emotion],
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length] + '33', // light fill
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
    }));

    const chartData = {
        labels: emotionLabels,
        datasets,
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 20,
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Team Emotion Trends Over Time',
                font: {
                    size: 20,
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}`,
                },
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Emotion Frequency',
                    font: { size: 14 }
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: { size: 14 }
                },
            }
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Trends Dashboard
            </Typography>
            <Line options={chartOptions} data={chartData} />
        </Paper>
    );
}

export default TrendChart;
