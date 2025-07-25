from transformers import pipeline

# Load the emotion classification pipeline (one time only, outside function)
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=False,
    top_k=None
)

def detect_emotion(text: str) -> str:
    try:
        result = emotion_classifier(text)

        # Debug print (optional, remove in prod)
        print("Emotion classification result:", result)

        # Check format and return label
        if isinstance(result, list) and isinstance(result[0], dict) and 'label' in result[0]:
            return result[0]['label']
        else:
            return "unknown"
    except Exception as e:
        print(f"[Emotion Detection Error] {e}")
        return "error"
