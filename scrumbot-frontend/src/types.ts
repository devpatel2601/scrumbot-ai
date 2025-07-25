export interface VoiceLogResponse {
  id: number;
  filename: string;
  transcript: string;
  summary: string;
  emotion: string;
  jira_issue_url: string | null;
  progress: string[];
  next_steps: string[];
  blockers: string[];
}