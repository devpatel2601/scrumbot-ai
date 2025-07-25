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
        report_lines.append(f"- **Transcript:** {log.transcript}\n")

    return {"markdown_report": "\n".join(report_lines)}
