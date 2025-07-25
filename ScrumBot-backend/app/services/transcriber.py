# app/services/transcriber.py

from faster_whisper import WhisperModel
from app.utils.transcript_utils import clean_transcript_chunkwise
from app.utils.emotion_utils import detect_emotions


def transcribe_audio(audio_path: str) -> str:
    # Use 'int8' for better performance on CPU
    model = WhisperModel("base", compute_type="int8", device="cpu")
    
    segments, _ = model.transcribe(audio_path)

    # Join all segments into one raw transcript
    raw_transcription = " ".join([segment.text for segment in segments]).strip()

    # Clean it in small LLM chunks
    cleaned_transcript = clean_transcript_chunkwise(raw_transcription)

     # Step 3: Detect emotion
    emotion = detect_emotions(cleaned_transcript)


    return cleaned_transcript, emotion
