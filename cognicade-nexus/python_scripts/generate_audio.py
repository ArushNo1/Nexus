#!/usr/bin/env python3
"""
ElevenLabs TTS Audio Generator for Educational Songs (Replacing Edge TTS)
Generates spoken/sung lyrics using ElevenLabs API
"""

import sys
import json
import asyncio
import os
import requests

# API Key provided by user
ELEVENLABS_API_KEY = "99b55b3d5bdb12a95285d7c820545e8ee7f9bf07dc0da0ede97e23b0e9d59bcd"

# Voice mappings from Edge TTS names to ElevenLabs Voice IDs
VOICE_MAPPING = {
    "en-US-AriaNeural": "21m00Tcm4TlvDq8ikWAM",  # Rachel (American, female)
    "en-US-GuyNeural": "pNInz6obpgDQGcFmaJgB",   # Adam (American, male, deep)
    "en-US-JennyNeural": "21m00Tcm4TlvDq8ikWAM", # Rachel fallback
    "en-GB-SoniaNeural": "EXAVITQu4vr4xnSDxMaL", # Bella (American, female, soft) - acting as fallback, or pick British if available
}

# Default to Rachel if voice not found
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

async def generate_song_audio(lyrics, voice, output_path):
    """Generate audio from lyrics using ElevenLabs API"""

    voice_id = VOICE_MAPPING.get(voice, DEFAULT_VOICE_ID)
    
    # Use the ElevenLabs API
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    data = {
        "text": lyrics,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    # Note: requests is blocking, but satisfactory for this script usage
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code != 200:
        error_msg = f"ElevenLabs API Error: {response.status_code} - {response.text}"
        raise Exception(error_msg)
        
    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
                
    return output_path


async def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: python generate_audio.py <lyrics> <voice> <output_file>"
        }))
        sys.exit(1)

    lyrics = sys.argv[1]
    voice = sys.argv[2]
    output_file = sys.argv[3]

    try:
        # Ensure output directory exists
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        result_path = await generate_song_audio(lyrics, voice, output_file)
        print(json.dumps({
            "success": True,
            "output": result_path,
            "voice": voice
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
