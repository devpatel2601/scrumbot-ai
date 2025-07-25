from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
import json

Base = declarative_base()

class VoiceLog(Base):
    __tablename__ = "voice_logs1"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True)
    transcript = Column(Text)
    summary = Column(Text)
    emotion = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    jira_issue_url = Column(String, nullable=True)

    # Store JSON as string
    progress_json = Column("progress", Text, nullable=True)
    next_steps_json = Column("next_steps", Text, nullable=True)
    blockers_json = Column("blockers", Text, nullable=True)

    # Convenience properties for easy access
    @property
    def progress(self):
        return json.loads(self.progress_json) if self.progress_json else []

    @progress.setter
    def progress(self, value):
        self.progress_json = json.dumps(value)

    @property
    def next_steps(self):
        return json.loads(self.next_steps_json) if self.next_steps_json else []

    @next_steps.setter
    def next_steps(self, value):
        self.next_steps_json = json.dumps(value)

    @property
    def blockers(self):
        return json.loads(self.blockers_json) if self.blockers_json else []

    @blockers.setter
    def blockers(self, value):
        self.blockers_json = json.dumps(value)
