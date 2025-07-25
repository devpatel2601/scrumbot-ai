# app/utils/transcript_utils.py

from app.utils.llm_utils import clean_transcript_with_llm


def split_transcript(text, max_chars=1000):
    """
    Splits transcript text into smaller chunks based on sentence length.
    """
    sentences = text.split('. ')
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        # Add the period back since split removed it
        sentence = sentence.strip()
        if not sentence.endswith('.'):
            sentence += '.'

        if len(current_chunk) + len(sentence) <= max_chars:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


def clean_transcript_chunkwise(raw_transcript: str) -> str:
    """
    Splits the transcript and sends each chunk to the LLM for cleaning.
    Returns the full cleaned transcript.
    """
    chunks = split_transcript(raw_transcript)
    cleaned_chunks = []

    for i, chunk in enumerate(chunks):
        try:
            print(f"Cleaning chunk {i + 1}/{len(chunks)} (approx {len(chunk)} chars)...")
            cleaned = clean_transcript_with_llm(chunk)
            cleaned_chunks.append(cleaned.strip())
        except Exception as e:
            print(f"Error processing chunk {i + 1}: {e}")
            cleaned_chunks.append(chunk)  # Fallback to original if LLM fails

    return " ".join(cleaned_chunks)
