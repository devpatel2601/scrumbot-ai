from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional

from rq.job import Job,NoSuchJobError
from rq import Queue
import redis
import json
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.services.transcriber import transcribe_audio
from app.services.summarizer import summarize
from app.services.emotion import detect_emotion
from app.services.trend_analyzer import analyze_trends_from_logs
from app.db.session import SessionLocal
from app.db.models import VoiceLog
from pydantic import BaseModel
from worker.tasks import process_audio 
from app.utils.llm_utils import analyze_trends_with_llm
from worker.tasks import run_trend_analysis



redis_url = os.getenv("REDIS_URL", "redis://localhost:6380")
conn = redis.from_url(redis_url)


router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic response schema for voice logs
class VoiceLogResponse(BaseModel):
    id: int
    filename: str
    transcript: str
    summary: str
    emotion: str
    jira_issue_url: Optional[str] = None

    progress: List[str] = []
    next_steps: List[str] = []
    blockers: List[str] = []

    class Config:
        orm_mode = True


# Health check
@router.get("/ping")
def health_check():
    return {"status": "running"}


# Upload audio & enqueue background task (RQ)
@router.post("/upload_audio")
async def upload_audio(file: UploadFile = File(...)):
    file_name = f"{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Enqueue task with RQ
    redis_conn = redis.Redis()
    q = Queue(connection=redis_conn)
    job=q.enqueue('worker.tasks.process_audio', file_path, file_name, result_ttl=600, job_timeout=600)

    return {
        "task_id": job.id,
        "file": file_name,
        "message": "Processing started. This may take a few seconds.",
    }

@router.get("/task_status/{task_id}")
def get_task_status(task_id: str):
    try:
        redis_conn = redis.Redis()
        job = Job.fetch(task_id, connection=redis_conn)

        if job.is_finished:
            return {
                "status": "success",
                "result": job.result,
                "log_url": f"/logs/{job.result['log_id']}" if job.result else None
            }
        elif job.is_failed:
            return {
                "status": "failure",
                "error_message": str(job.exc_info)
            }
        else:
            return {"status": "pending"}

    except NoSuchJobError:
        raise HTTPException(status_code=404, detail=f"Job not found: {task_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking job status: {str(e)}")

# Get all voice logs
@router.get("/logs", response_model=List[VoiceLogResponse])
def get_all_logs(db: Session = Depends(get_db)):
    logs = db.query(VoiceLog).all()
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found")
    return logs


# Get a single voice log by ID
@router.get("/logs/{log_id}", response_model=VoiceLogResponse)
def get_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(VoiceLog).filter(VoiceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


# Trends API — emotion counts and logs per day for last 7 days
@router.get("/trends")
def enqueue_trend_analysis():
    redis_conn = redis.Redis()
    q = Queue(connection=redis_conn)
    job = q.enqueue(run_trend_analysis)
    return {"task_id": job.get_id(), "status": "queued"}

@router.get("/trends/latest")
def get_latest_trends():
    redis_conn = redis.Redis()
    trends = redis_conn.get("latest_trends")
    if trends is None:
        raise HTTPException(status_code=404, detail="No trends data available yet.")
    return json.loads(trends)

# Trends Insights (LLM-powered)
# @router.get("/trends/insights")
# def get_trends_insights(db: Session = Depends(get_db)):
#     today = datetime.utcnow().date()
#     week_ago = today - timedelta(days=7)

#     emotion_counts = (
#         db.query(
#             func.date(VoiceLog.created_at).label("date"),
#             VoiceLog.emotion,
#             func.count(VoiceLog.id)
#         )
#         .filter(VoiceLog.created_at >= week_ago)
#         .group_by("date", VoiceLog.emotion)
#         .all()
#     )

#     trends = {}
#     for date, emotion, count in emotion_counts:
#         date_str = str(date)
#         if date_str not in trends:
#             trends[date_str] = {}
#         trends[date_str][emotion] = count

#     total_logs = (
#         db.query(
#             func.date(VoiceLog.created_at).label("date"),
#             func.count(VoiceLog.id)
#         )
#         .filter(VoiceLog.created_at >= week_ago)
#         .group_by("date")
#         .all()
#     )

#     for date, total in total_logs:
#         date_str = str(date)
#         if date_str not in trends:
#             trends[date_str] = {}
#         trends[date_str]["total_logs"] = total

#     # 🧠 Generate LLM insight
#     insights = analyze_trends_with_llm(trends)

#     return {
#         "trends_data": trends,
#         "insights_summary": insights
#     }

# Sprint Report API — generates markdown report of last N days updates
@router.get("/report")
def get_report(days: int = 7, db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    logs = (
        db.query(VoiceLog)
        .filter(VoiceLog.created_at >= since)
        .order_by(VoiceLog.created_at.asc())
        .all()
    )

    report_lines = [f"# Sprint Report (last {days} days)\n"]

    for log in logs:
        date_str = log.created_at.strftime("%Y-%m-%d %H:%M")
        report_lines.append(f"## Update on {date_str}")
        report_lines.append(f"- **Summary:** {log.summary}")
        report_lines.append(f"- **Emotion:** {log.emotion}")
        report_lines.append(f"- **Transcript:** {log.transcript}")
        report_lines.append(f"- **Progress:** {', '.join(log.progress) if log.progress else 'None'}")
        report_lines.append(f"- **Next Steps:** {', '.join(log.next_steps) if log.next_steps else 'None'}")
        report_lines.append(f"- **Blockers:** {', '.join(log.blockers) if log.blockers else 'None'}")
        if log.jira_issue_url:
            report_lines.append(f"- **Jira Issue:** [{log.jira_issue_url}]({log.jira_issue_url})")
            report_lines.append("")  # Newline

    return {"markdown_report": "\n".join(report_lines)}
