// src/services/api.ts
import axios from "axios";

const API_BASE = "http://localhost:8000/api"; // Change if your backend URL differs

export interface VoiceLogResponse {
    id: number;
    filename: string;
    transcript: string;
    summary: string;
    emotion: string;
    jira_issue_url?: string | null;
    progress: string[];
    next_steps: string[];
    blockers: string[];
    created_at: string;
}
export const fetchVoiceLogs = async (): Promise<VoiceLogResponse[]> => {
  const response = await axios.get<VoiceLogResponse[]>(`${API_BASE}/logs`);
  return response.data;
};

export interface TaskStatusResponse {
    status: string; // "pending", "success", "failure"
    log_url?: string | null;
    error_message?: string | null;
}

export const pingBackend = async () => {
    const res = await axios.get(`${API_BASE}/ping`);
    return res.data;
};

export const getLogs = async (): Promise<VoiceLogResponse[]> => {
    const res = await axios.get<VoiceLogResponse[]>(`${API_BASE}/logs`);
    return res.data;
};

export const getLogById = async (logId: number): Promise<VoiceLogResponse> => {
    const res = await axios.get<VoiceLogResponse>(`${API_BASE}/logs/${logId}`);
    return res.data;
};

// 🔄 Updated: Fetch trends from Redis-cached endpoint
export const getTrends = async (): Promise<any> => {
    const res = await axios.get(`${API_BASE}/trends/latest`);
    return res.data;
};

export const getTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
    const res = await axios.get<TaskStatusResponse>(`${API_BASE}/task_status/${taskId}`);
    return res.data;
};

export const getReport = async (days: number): Promise<any> => {
    const res = await axios.get(`${API_BASE}/report?days=${days}`);
    return res.data;
};

export const getInsights = async (): Promise<any> => {
    const res = await axios.get(`${API_BASE}/trends/insights`);
    return res.data;
};

export const uploadAudio = async (formData: FormData): Promise<any> => {
    const res = await axios.post(`${API_BASE}/upload_audio`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
