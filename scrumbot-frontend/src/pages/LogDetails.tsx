// src/pages/LogDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLogById, type VoiceLogResponse } from '../services/api';
import {
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function LogDetails() {
  const { id } = useParams<{ id: string }>();
  const [log, setLog] = useState<VoiceLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const logId = parseInt(id, 10);
          const data = await getLogById(logId);
          setLog(data);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch voice log details.');
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
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
      </Box>
    );
  }

  if (!log) {
    return (
      <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
        <Typography variant="body1">Log not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Voice Log Details
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Filename:</Typography>
          <Typography variant="body1">{log.filename}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Emotion:</Typography>
          <Typography variant="body1">{log.emotion}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Summary:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{log.summary}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Transcript:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{log.transcript}</Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Section title="Progress" items={log.progress} />
        <Section title="Next Steps" items={log.next_steps} />
        <Section title="Blockers" items={log.blockers} />

        {log.jira_issue_url && (
          <Box sx={{ mt: 3 }}>
            <Link href={log.jira_issue_url} target="_blank" rel="noopener noreferrer" underline="hover">
              <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              View Jira Issue
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// Reusable list section component
const Section = ({ title, items }: { title: string; items: string[] }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {title}:
    </Typography>
    <List dense>
      {items.length > 0 ? (
        items.map((item, idx) => (
          <ListItem key={idx}>
            <ListItemText primary={item} />
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="None" />
        </ListItem>
      )}
    </List>
  </Box>
);

export default LogDetails;
