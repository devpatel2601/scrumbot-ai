from app.services.transcriber import transcribe_audio
from app.services.summarizer import summarize
from app.utils.emotion_utils import detect_emotions
from app.db.session import SessionLocal
from app.db.models import VoiceLog
import logging
from app.services.jira_client import create_jira_issue
from app.utils.blocker_extractor import extract_blockers
from app.utils.llm_utils import clean_transcript_with_llm
from app.utils.llm_utils import structured_summary_with_llm
from sqlalchemy.orm import Session
import redis
import json
from app.services.trend_analyzer import analyze_trends_from_logs
from app.utils.llm_utils import analyze_trends_with_llm



logging.basicConfig(level=logging.INFO)

def process_audio(file_path: str, file_name: str):
    logging.info(f"Starting audio processing: {file_name}")
    db: Session = SessionLocal()

    try:
        # Step 1: Transcribe
        raw_transcript = transcribe_audio(file_path)
        logging.info(f"Raw transcript complete for: {file_name}")

        # Step 2: Clean transcript using LLM
        transcript = clean_transcript_with_llm(raw_transcript)
        logging.info(f"Cleaned transcript complete for: {file_name}")

        # Step 3: Structured Summary
        structured_summary = structured_summary_with_llm(transcript)
        summary = structured_summary["summary"]
        blockers = structured_summary["blockers"]
        logging.info(f"Summary complete for: {file_name}")

        # Step 4: Emotion Detection
        emotion = detect_emotions(transcript)
        logging.info(f"Emotion detection complete for: {file_name}")

        # Step 5: (Optional) Jira Ticket Creation
        jira_issue_url = None
        if blockers:
            issue_key = create_jira_issue(
                summary=f"Blocker from ScrumBot: {blockers[0]}",
                description=f"Audio File: {file_name}\nTranscript: {transcript}\nSummary: {summary}"
            )
            jira_issue_url = f"https://devpatel26612.atlassian.net/browse/{issue_key}"
            logging.info(f"Created Jira issue: {jira_issue_url}")

        # Step 6: Save to DB
        log = VoiceLog(
            filename=file_name,
            transcript=transcript,
            summary=summary,
            emotion=emotion,
            jira_issue_url=jira_issue_url,
            progress=structured_summary.get("progress", []),
            next_steps=structured_summary.get("next_steps", []),
            blockers=structured_summary.get("blockers", [])
        )

        db.add(log)
        db.commit()
        db.refresh(log)
        log_id = log.id
        logging.info(f"Saved voice log for: {file_name} with id: {log_id}")

        # # Step 7: Trend Analysis Trigger
        # logs = db.query(VoiceLog).all()
        # raw_trends = analyze_trends_from_logs(logs)
        # insights = analyze_trends_with_llm(raw_trends)

        # logging.info("Trend analysis and insights complete.")
        # logging.debug(f"Raw Trends: {raw_trends}")
        # logging.debug(f"Trend Insights (LLM): {insights}")

        return {"log_id": log_id}

    except Exception as e:
        logging.error(f"Error processing {file_name}: {e}", exc_info=True)
        raise

    finally:
        db.close()
    


def run_trend_analysis():
    db = SessionLocal()
    try:
        logs = db.query(VoiceLog).all()
        result = analyze_trends_from_logs(logs)
        redis_conn = redis.Redis()
        # Save to Redis cache
        redis_conn.set("latest_trends", json.dumps(result), ex=360000)  # cache for 1 hour
        return result
    finally:
        db.close()