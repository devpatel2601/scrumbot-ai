# app/utils/emotion_utils.py

from transformers import pipeline

# Load once when file is imported
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

def detect_emotions(transcript: str) -> str:
    """
    Returns the dominant emotion based on the transcript text.
    """
    results = emotion_classifier(transcript[:512])  # Truncate to fit model input size
    scores = results[0]

    # Sort by score
    sorted_scores = sorted(scores, key=lambda x: x['score'], reverse=True)
    top_emotion = sorted_scores[0]["label"]
    
    return top_emotion

def get_emotion_probabilities(transcript: str) -> dict:
    """
    Returns a dictionary of all emotion probabilities.
    """
    results = emotion_classifier(transcript[:512])
    scores = results[0]
    return {entry["label"]: round(entry["score"], 4) for entry in scores}
