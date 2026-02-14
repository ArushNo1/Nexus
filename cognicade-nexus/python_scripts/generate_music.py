#!/usr/bin/env python3
"""
Procedural Background Music Generator
Generates ambient/lofi educational background music using audio synthesis.
No external APIs required — pure math-based audio generation.
"""

import sys
import json
import hashlib
import numpy as np
from pydub import AudioSegment
from pydub.generators import Sine


def note_freq(note_name):
    """Convert note name to frequency."""
    notes = {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
        'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00,
    }
    return notes.get(note_name, 261.63)


def make_tone(freq, duration_ms, volume=-20):
    """Generate a sine wave tone with fade in/out."""
    tone = Sine(freq).to_audio_segment(duration=duration_ms)
    tone = tone + volume  # Reduce volume
    tone = tone.fade_in(min(50, duration_ms // 4)).fade_out(min(100, duration_ms // 3))
    return tone


def make_pad(freq, duration_ms, volume=-28):
    """Generate a warm pad sound (layered detuned sines)."""
    t1 = Sine(freq).to_audio_segment(duration=duration_ms) + volume
    t2 = Sine(freq * 1.002).to_audio_segment(duration=duration_ms) + (volume - 3)
    t3 = Sine(freq * 0.998).to_audio_segment(duration=duration_ms) + (volume - 3)
    t4 = Sine(freq * 2.0).to_audio_segment(duration=duration_ms) + (volume - 8)  # octave up, quiet
    pad = t1.overlay(t2).overlay(t3).overlay(t4)
    pad = pad.fade_in(min(200, duration_ms // 3)).fade_out(min(300, duration_ms // 3))
    return pad


def seed_from_string(s):
    """Generate a numeric seed from a string."""
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


# ── Chord Progressions ──────────────────────────────────────────────────

PROGRESSIONS = {
    'hopeful': [
        ['C4', 'E4', 'G4'],
        ['F4', 'A4', 'C5'],
        ['G4', 'B4', 'D5'],
        ['C4', 'E4', 'G4'],
    ],
    'dreamy': [
        ['D4', 'F4', 'A4'],
        ['G3', 'B3', 'D4'],
        ['C4', 'E4', 'G4'],
        ['A3', 'C4', 'E4'],
    ],
    'chill': [
        ['E4', 'G4', 'B4'],
        ['A3', 'C4', 'E4'],
        ['D4', 'F4', 'A4'],
        ['G3', 'B3', 'D4'],
    ],
    'upbeat': [
        ['C4', 'E4', 'G4'],
        ['A3', 'C4', 'E4'],
        ['F3', 'A3', 'C4'],
        ['G3', 'B3', 'D4'],
    ],
    'calm': [
        ['F4', 'A4', 'C5'],
        ['D4', 'F4', 'A4'],
        ['E4', 'G4', 'B4'],
        ['C4', 'E4', 'G4'],
    ],
}

# ── Melody Patterns (scale degrees 0-7) ──────────────────────────────────

SCALES = {
    'major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    'pentatonic': ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
    'dorian': ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],
}

MELODY_PATTERNS = [
    [0, 2, 4, 2, 3, 1, 0, -1],
    [4, 3, 2, 0, 1, 2, 4, 3],
    [0, 0, 2, 4, 4, 2, 1, 0],
    [2, 4, 5, 4, 2, 0, 1, 2],
    [0, 4, 3, 2, 4, 3, 1, 0],
]


def generate_music(title, genre, duration_sec, output_path):
    """Generate procedural background music."""
    
    seed = seed_from_string(title + genre)
    rng = np.random.RandomState(seed)
    
    # Pick progression and scale based on seed
    prog_keys = list(PROGRESSIONS.keys())
    scale_keys = list(SCALES.keys())
    prog_name = prog_keys[seed % len(prog_keys)]
    scale_name = scale_keys[seed % len(scale_keys)]
    
    progression = PROGRESSIONS[prog_name]
    scale = SCALES[scale_name]
    melody_pattern = MELODY_PATTERNS[seed % len(MELODY_PATTERNS)]
    
    # Base tempo: 70-100 BPM depending on genre
    bpm = 75 + (seed % 30)
    beat_ms = int(60000 / bpm)
    bar_ms = beat_ms * 4  # 4/4 time
    
    total_ms = duration_sec * 1000
    
    # Create silent base track
    track = AudioSegment.silent(duration=total_ms)
    
    # ── Layer 1: Pad chords (warm background) ──────────────────────────
    pad_track = AudioSegment.silent(duration=total_ms)
    pos = 0
    while pos < total_ms:
        chord_idx = (pos // bar_ms) % len(progression)
        chord_notes = progression[chord_idx]
        chord_duration = min(bar_ms, total_ms - pos)
        
        # Create pad chord
        chord_audio = AudioSegment.silent(duration=chord_duration)
        for note in chord_notes:
            freq = note_freq(note)
            pad = make_pad(freq, chord_duration, volume=-30)
            chord_audio = chord_audio.overlay(pad)
        
        # Also add bass note (octave below root)
        bass_freq = note_freq(chord_notes[0]) / 2
        bass = make_tone(bass_freq, chord_duration, volume=-26)
        chord_audio = chord_audio.overlay(bass)
        
        pad_track = pad_track.overlay(chord_audio, position=pos)
        pos += bar_ms
    
    track = track.overlay(pad_track)
    
    # ── Layer 2: Melody (simple sine melody, comes in after 4 bars) ────
    melody_track = AudioSegment.silent(duration=total_ms)
    melody_start = bar_ms * 2  # Start melody after 2 bars
    note_duration = beat_ms  # Each note = 1 beat
    
    pos = melody_start
    note_idx = 0
    while pos < total_ms - note_duration:
        pattern_idx = note_idx % len(melody_pattern)
        scale_idx = melody_pattern[pattern_idx]
        
        # Keep within scale bounds
        scale_idx = max(0, min(scale_idx, len(scale) - 1))
        freq = note_freq(scale[scale_idx])
        
        # Vary note duration: some notes longer
        if rng.random() < 0.3:
            dur = note_duration * 2  # half note
        else:
            dur = note_duration  # quarter note
        
        # Skip some notes for rhythm variety
        if rng.random() < 0.2:
            pos += note_duration
            note_idx += 1
            continue
        
        dur = min(dur, total_ms - pos)
        note_audio = make_tone(freq, dur, volume=-22)
        melody_track = melody_track.overlay(note_audio, position=pos)
        
        pos += dur
        note_idx += 1
    
    track = track.overlay(melody_track)
    
    # ── Layer 3: Light percussion (soft clicks) ────────────────────────
    perc_track = AudioSegment.silent(duration=total_ms)
    perc_start = bar_ms * 4  # Percussion enters after 4 bars
    
    pos = perc_start
    beat_num = 0
    while pos < total_ms:
        # Hi-hat on every beat
        if beat_num % 2 == 0:  # Every other beat
            click = Sine(8000).to_audio_segment(duration=15) + (-35)
            click = click.fade_out(10)
            perc_track = perc_track.overlay(click, position=pos)
        
        # Kick-like thump on beats 1 and 3
        if beat_num % 4 == 0:
            kick = Sine(60).to_audio_segment(duration=80) + (-28)
            kick = kick.fade_out(60)
            perc_track = perc_track.overlay(kick, position=pos)
        
        pos += beat_ms
        beat_num += 1
    
    track = track.overlay(perc_track)
    
    # ── Final processing ───────────────────────────────────────────────
    # Fade in and out
    track = track.fade_in(2000).fade_out(3000)
    
    # Normalize volume
    track = track.normalize()
    track = track - 6  # Reduce overall volume so it's background-level
    
    # Export
    track.export(output_path, format="mp3", bitrate="128k")
    
    return {
        "success": True,
        "output": output_path,
        "bpm": bpm,
        "progression": prog_name,
        "scale": scale_name,
        "duration_sec": duration_sec,
    }


def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Usage: python generate_music.py <title> <genre> <output_file> [duration_sec]"
        }))
        sys.exit(1)
    
    title = sys.argv[1]
    genre = sys.argv[2]
    output_file = sys.argv[3]
    duration_sec = int(sys.argv[4]) if len(sys.argv) > 4 else 90
    
    try:
        result = generate_music(title, genre, duration_sec, output_file)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
