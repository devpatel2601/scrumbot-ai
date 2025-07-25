// src/components/VoiceLogList.tsx
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchVoiceLogs, type VoiceLogResponse } from '../services/api';

const VoiceLogList: React.FC = () => {
  const [logs, setLogs] = useState<VoiceLogResponse[]>([]);
  const navigate = useNavigate();
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await fetchVoiceLogs();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };
    fetchLogs();
  }, []);

  const handleRowClick = (id: number) => {
    setSelectedRowId(id);
    setTimeout(() => {
      navigate(`/logs/${id}`);
    }, 200); // for animation effect
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>Voice Logs</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Filename</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Emotion</TableCell>
            <TableCell>Jira Issue</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow
              key={log.id}
              hover
              onClick={() => handleRowClick(log.id)}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedRowId === log.id ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                transition: 'background-color 0.3s ease-in-out',
              }}
            >
              <TableCell>{log.id}</TableCell>
              <TableCell>{log.filename}</TableCell>
              <TableCell>{log.summary}</TableCell>
              <TableCell>{log.emotion}</TableCell>
              <TableCell>
                {log.jira_issue_url ? (
                  <a href={log.jira_issue_url} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                ) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VoiceLogList;
