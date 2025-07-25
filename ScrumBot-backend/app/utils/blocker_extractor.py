

import re

# Define blocker-related keywords (you can expand this list)
BLOCKER_KEYWORDS = [
    "blocked", "blocker", "stuck", "issue", "problem",
    "unable", "fail", "failing", "error", "delay", "delayed",
    "dependency", "waiting", "halted", "can't", "cannot"
]

def clean_text(text: str) -> str:
    
    return re.sub(r'\s+', ' ', text).strip()

def extract_blockers(summary: str) -> list[str]:
   
    if not summary:
        return []

    summary = clean_text(summary)
    sentences = re.split(r'(?<=[.?!])\s+', summary)  # Split into sentences
    blockers = []

    for sentence in sentences:
        lowered = sentence.lower()
        if any(keyword in lowered for keyword in BLOCKER_KEYWORDS):
            blockers.append(sentence.strip())

    return blockers
