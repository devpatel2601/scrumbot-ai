from collections import Counter, defaultdict
from app.db.models import VoiceLog
from datetime import datetime
from sqlalchemy.orm import Session

def analyze_trends_from_logs(logs: list[VoiceLog]) -> dict:
    emotion_by_date = defaultdict(Counter)
    blockers_counter = Counter()
    next_steps_counter = Counter()

    for log in logs:
        date_key = log.created_at.strftime("%Y-%m-%d")
        emotion_by_date[date_key][log.emotion or "neutral"] += 1

        blockers_counter.update(log.blockers or [])
        next_steps_counter.update(log.next_steps or [])

    # Prepare emotion trend chart data
    sorted_dates = sorted(emotion_by_date.keys())
    emotion_trends = {emotion: [] for emotion in set(e for d in emotion_by_date.values() for e in d)}

    for date in sorted_dates:
        for emotion in emotion_trends.keys():
            emotion_trends[emotion].append(emotion_by_date[date].get(emotion, 0))

    return {
        "dates": sorted_dates,
        "emotions": emotion_trends,
        "top_blockers": blockers_counter.most_common(5),
        "frequent_next_steps": next_steps_counter.most_common(5),
    }
