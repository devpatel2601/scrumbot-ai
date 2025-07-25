# llm_utils.py
import ollama
import json

def clean_transcript_with_llm(raw_transcript: str) -> str:
    prompt = f"""
    You are a transcription cleaner.
    Clean up this voice transcript to improve clarity, grammar, and remove filler words.

    Input: "{raw_transcript}"

    Output:
    """
    response = ollama.chat(model="mistral", messages=[
        {"role": "user", "content": prompt}
    ])
    return response['message']['content'].strip()

def structured_summary_with_llm(transcript: str) -> dict:
    prompt = f"""
You are a smart assistant. Extract structured information from the following transcript of a daily standup voice update.

Transcript:
\"\"\"
{transcript}
\"\"\"

Return only a JSON response in this format:

{{
  "summary": "...",
  "blockers": ["..."],
  "progress": ["..."],
  "next_steps": ["..."],
  "sentiment": "positive" | "neutral" | "negative"
}}
    """

    response = ollama.chat(model="mistral", messages=[
        {"role": "user", "content": prompt}
    ])

    try:
        import json
        return json.loads(response['message']['content'])
    except Exception as e:
        print("⚠️ JSON parsing failed:", e)
        return {
            "summary": transcript,  # fallback
            "blockers": [],
            "progress": [],
            "next_steps": [],
            "sentiment": "neutral"
        }


def generate_trend_analysis_from_logs(logs: list[dict]) -> dict:
    """
    Takes in a list of structured voice logs and returns AI-analyzed trends in JSON.
    Each log should include filename, summary, blockers, progress, next_steps, sentiment, and timestamp.
    """
    log_text = ""
    for log in logs:
        log_text += f"""
    Filename: {log['filename']}
    Summary: {log['summary']}
    Blockers: {", ".join(log['blockers'])}
    Progress: {", ".join(log['progress'])}
    Next Steps: {", ".join(log['next_steps'])}
    Sentiment: {log['sentiment']}
    Timestamp: {log['created_at']}
---
"""

    prompt = f"""
You are a sprint trend analyst AI. Analyze the following standup logs from a development team.

{log_text}

Please return a JSON report with the following structure:

{{
  "top_blockers": ["..."],
  "frequent_next_steps": ["..."],
  "emotion_trend": "positive" | "negative" | "mixed",
  "progress_health": "good" | "medium" | "poor",
  "risk_level": "low" | "medium" | "high",
  "ai_insights": "Your detailed insights here..."
}}
"""

    response = ollama.chat(model="mistral", messages=[
        {"role": "user", "content": prompt}
    ])

    try:
        return json.loads(response['message']['content'])
    except Exception as e:
        print("⚠️ Trend analyzer JSON parsing failed:", e)
        return {
            "top_blockers": [],
            "frequent_next_steps": [],
            "emotion_trend": "mixed",
            "progress_health": "medium",
            "risk_level": "medium",
            "ai_insights": "Could not analyze trends properly."
        }

def analyze_trends_with_llm(trends_dict: dict) -> str:
    prompt = f"""
    You are a product manager assistant. Analyze this 7-day voice log trend report and summarize key findings, patterns, and concerns.

    Raw trend data (JSON format):
    {trends_dict}

    Provide a short markdown summary for a standup leader:
    - Major emotional patterns
    - Sudden drops or spikes
    - Blocker trends (if seen)
    - Team health indicators
    """
    response = ollama.chat(model="mistral", messages=[
        {"role": "user", "content": prompt}
    ])
    return response["message"]["content"].strip()