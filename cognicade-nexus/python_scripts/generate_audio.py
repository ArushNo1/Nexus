#!/usr/bin/env python3
"""
Edge TTS Audio Generator for Educational Songs
Generates spoken/sung lyrics using Microsoft Edge TTS
"""

import sys
import json
import asyncio
import edge_tts

async def generate_song_audio(lyrics, voice, output_path):
    """Generate audio from lyrics using Edge TTS"""

    # Available voices:
    # en-US-AriaNeural (female, friendly)
    # en-US-GuyNeural (male, professional)
    # en-US-JennyNeural (female, warm)
    # en-GB-SoniaNeural (British female)
    # And many more...

    communicate = edge_tts.Communicate(lyrics, voice)
    await communicate.save(output_path)

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
