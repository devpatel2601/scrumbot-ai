// src/components/InsightsPanel.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, Typography, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VoiceLogList from './VoiceLogList';
import type { VoiceLogResponse } from '../services/api';
import { fetchVoiceLogs } from '../services/api';


const InsightsPanel: React.FC = () => {
  const [logs, setLogs] = useState<VoiceLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVoiceLogs();
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setError('Unexpected data format from server.');
          setLogs([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch voice logs.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Compute emotion counts from logs
  const emotionData = React.useMemo(() => {
    if (!Array.isArray(logs)) return [];

    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const em = log.emotion || 'unknown';
      counts[em] = (counts[em] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Voice Log Insights Panel
      </Typography>

      {/* Voice Log Table */}
      <VoiceLogList logs={logs} />

      {/* Emotion Data JSON display */}
      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Emotion Data (counts)
        </Typography>
        <pre>{JSON.stringify({ emotionData }, null, 2)}</pre>
      </Paper>
    </Box>
  );
};

export default InsightsPanel;
