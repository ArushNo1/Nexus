#!/usr/bin/env python3
"""
Animated Educational Video Generator
Uses Gemini-generated Manim code per scene, renders with Manim,
concatenates with FFmpeg, and adds Edge TTS narration.
"""

import sys
import json
import os
import asyncio
import tempfile
import textwrap
import subprocess
import re
import glob
import urllib.request
import urllib.error
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import edge_tts

# ── Constants ────────────────────────────────────────────────────────────
WIDTH = 1280
HEIGHT = 720
FPS = 24
BG_COLOR = "#0f0f19"

# ── TTS Helper ───────────────────────────────────────────────────────────

def generate_narration_sync(text, output_path):
    """Generate narration using Edge TTS."""
    async def _run():
        c = edge_tts.Communicate(text, "en-US-AriaNeural")
        await c.save(output_path)
    asyncio.run(_run())

def get_font(size=28):
    for p in ["/System/Library/Fonts/Helvetica.ttc",
              "/System/Library/Fonts/SFNSText.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


# ── Title / Ending slides ───────────────────────────────────────────────

def create_slide_image(title, subtitle=""):
    """Create a title/ending slide image, return path."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (15, 15, 25))
    draw = ImageDraw.Draw(img)

    line_y = HEIGHT // 2 - 30
    draw.rectangle([(WIDTH // 4, line_y), (3 * WIDTH // 4, line_y + 3)],
                   fill=(79, 172, 254))

    wrapped = textwrap.fill(title, width=30)
    font = get_font(52)
    bbox = draw.textbbox((0, 0), wrapped, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((WIDTH - tw) // 2, line_y - th - 25), wrapped,
              fill=(240, 240, 245), font=font)

    if subtitle:
        sfont = get_font(26)
        wrapped_sub = textwrap.fill(subtitle, width=50)
        
        # Calculate height of wrapped subtitle
        sbbox = draw.multiline_textbbox((0, 0), wrapped_sub, font=sfont)
        sw = sbbox[2] - sbbox[0]
        # Draw centrally
        draw.multiline_text(((WIDTH - sw) // 2, line_y + 18), wrapped_sub,
                  fill=(79, 172, 254), font=sfont, align="center")

    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
    img.save(tmp.name)
    return tmp.name


# ── Manim Scene Rendering ───────────────────────────────────────────────

MANIM_WRAPPER = '''#!/usr/bin/env python3
from manim import *
import numpy as np

config.pixel_width = {width}
config.pixel_height = {height}
config.frame_rate = {fps}
config.media_dir = "{media_dir}"
config.background_color = "{bg_color}"
config.disable_caching = True

class AnimatedScene(Scene):
    def construct(self):
{code}

scene = AnimatedScene()
scene.render()
'''


def render_manim_code(code: str, scene_dir: str) -> str | None:
    """Execute Manim code and return the rendered .mp4 path, or None on failure."""
    os.makedirs(scene_dir, exist_ok=True)

    # Indent all lines by 8 spaces (inside construct body)
    lines = textwrap.dedent(code).strip().split('\n')
    indented = '\n'.join('        ' + line for line in lines)

    script = MANIM_WRAPPER.format(
        width=WIDTH, height=HEIGHT, fps=FPS,
        media_dir=scene_dir.replace("\\", "/"),
        bg_color=BG_COLOR,
        code=indented
    )

    script_path = os.path.join(scene_dir, "scene.py")
    with open(script_path, 'w') as f:
        f.write(script)

    try:
        result = subprocess.run(
            ["python3", script_path],
            capture_output=True, text=True, timeout=45,
            cwd=scene_dir
        )

        # Find output mp4
        mp4s = glob.glob(os.path.join(scene_dir, "**/*.mp4"), recursive=True)
        mp4s = [f for f in mp4s if "partial" not in f]

        if mp4s:
            return mp4s[-1]

        # Print error info
        if result.stderr:
            err = result.stderr.strip().split('\n')
            print(f"[manim] Error (last 3 lines):", file=sys.stderr)
            for line in err[-3:]:
                print(f"  {line}", file=sys.stderr)

        return None

    except subprocess.TimeoutExpired:
        print("[manim] Timed out", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[manim] Exception: {e}", file=sys.stderr)
        return None


# ── Fallback patterns ───────────────────────────────────────────────────

FALLBACK_CONCEPT_MAP = '''
title = Text("{title}", font_size=40, color=BLUE_C)
self.play(Write(title), run_time=1.0)
self.play(title.animate.to_edge(UP), run_time=0.8)

center = RoundedRectangle(corner_radius=0.5, width=5.0, height=2.0,
                           color=BLUE_D, fill_opacity=0.2, stroke_width=3)
center_text = Text("{center}".replace("\\n", "\n"), font_size=32, color=WHITE)
center_grp = VGroup(center, center_text)
self.play(DrawBorderThenFill(center), Write(center_text), run_time=1.5)

items = {items}
colors = [TEAL_C, GOLD_C, RED_C, PURPLE_C, GREEN_C, ORANGE]
for i, item in enumerate(items[:6]):
    angle = i * TAU / min(len(items), 6)
    pos = 3.5 * np.array([np.cos(angle), np.sin(angle), 0])
    
    # Connection
    line = Line(center.get_edge_center(pos), pos, color=colors[i % 6], stroke_opacity=0.6)
    
    # Item Box
    box = RoundedRectangle(corner_radius=0.2, width=3.0, height=1.0,
                            color=colors[i % 6], fill_opacity=0.15, stroke_width=2).move_to(pos)
    
    # Full text with scaling if needed
    # Full text with scaling if needed
    lbl = Text(item.replace("\\n", "\n"), font_size=20, color=WHITE).move_to(pos)
    if lbl.width > 2.8:
        lbl.scale_to_fit_width(2.8)
    
    self.play(
        Create(line, rate_func=smooth),
        FadeIn(box, shift=pos*0.1),
        Write(lbl),
        run_time=0.8
    )
    self.wait(0.5)

# Hold and pulse to reach ~30s
self.wait(2.0)
for _ in range(4):
    self.play(Indicate(center_grp, scale_factor=1.05), run_time=1.5)
    self.wait(3.0)
'''

FALLBACK_PROCESS = '''
title = Text("{title}", font_size=40, color=BLUE_C)
self.play(Write(title), run_time=1.0)
self.play(title.animate.to_edge(UP), run_time=0.8)

steps = {steps}
colors = [BLUE_C, TEAL_C, GREEN_C, YELLOW_C, RED_C]
prev = None
groups = VGroup()

for i, step in enumerate(steps[:5]):
    x = -5 + i * 2.5
    
    # Step Number Circle
    num_circ = Circle(radius=0.3, color=colors[i % 5], fill_opacity=0.2)
    num = Text(str(i+1), font_size=24, color=colors[i % 5], weight=BOLD)
    num_grp = VGroup(num_circ, num).move_to([x, 0.8, 0])
    
    # Box for text
    box = RoundedRectangle(corner_radius=0.2, width=2.4, height=1.4,
                            color=WHITE, fill_opacity=0.05, stroke_width=2).move_to([x, -0.4, 0])
    
    # Full text
    # Full text
    lbl = Text((item if 'item' in locals() else step).replace("\\n", "\n"), font_size=18, color=WHITE).move_to([x, -0.4, 0])
    if lbl.width > 2.2:
        lbl.scale_to_fit_width(2.2)
    
    grp = VGroup(num_grp, box, lbl)
    groups.add(grp)
    
    self.play(
        FadeIn(num_grp, shift=UP*0.5),
        GrowFromCenter(box),
        Write(lbl),
        run_time=0.7
    )
    
    if prev is not None:
        arr = Arrow(prev.get_right(), box.get_left(), color=GREY_B, buff=0.1, stroke_width=2)
        self.play(GrowArrow(arr), run_time=0.4)
        
    prev = box

self.wait(1.0)

# Loop to fill time to ~30s
self.wait(2.0)
for _ in range(5):
    self.play(Wiggle(groups, scale_value=1.05), run_time=2.0)
    self.wait(2.0)
'''

FALLBACK_GAME_INTRO = '''
title = Text("{title}", font_size=48, color=GREEN)
self.play(Write(title), run_time=1.0)
self.play(title.animate.to_edge(UP), run_time=0.8)

# Game icon / Sprite
controller = VGroup(
    RoundedRectangle(width=4, height=2.5, corner_radius=0.4, color=TEAL, fill_opacity=0.3),
    Text("🎮", font_size=80).shift(UP * 0.1),
    Text("START", font_size=24, color=YELLOW).shift(DOWN * 0.8)
)
self.play(FadeIn(controller, scale=0.5), run_time=1.0)

desc = Text("{desc}".replace("\\n", "\n"), font_size=24, color=WHITE)
# Wrap text if needed (manual approx)
if len("{desc}") > 40:
    desc.scale(0.8)

desc.next_to(controller, DOWN, buff=0.8)
self.play(Write(desc), run_time=1.5)

# Highlight
box = SurroundingRectangle(desc, color=YELLOW, buff=0.3, corner_radius=0.2)
self.play(Create(box), run_time=0.8)
self.wait(1.0)

# Fill time
for _ in range(6):
    self.play(
        controller.animate.scale(1.1),
        rate_func=there_and_back,
        run_time=1.0
    )
    self.play(Flash(controller, color=GOLD, line_length=0.5), run_time=1.0)
    self.wait(1.0)
'''


def _safe(text, wrap_width=None):
    """Clean text and optionally wrap it."""
    clean = text.replace('"', "'").replace("\\", "").replace("\n", " ").strip()
    if wrap_width and len(clean) > wrap_width:
        return "\\n".join(textwrap.wrap(clean, width=wrap_width))
    return clean


def get_fallback_code(scene_idx, narration, lesson_data):
    """Generate fallback Manim code when Gemini code fails."""
    objectives = lesson_data.get("lessonPlan", {}).get("objectives", [])
    title_text = lesson_data.get("lessonPlan", {}).get("title", "Concept")

    if scene_idx == 2:
        # Game intro
        desc_text = narration if narration else "Test your knowledge and apply what you learned!"
        return FALLBACK_GAME_INTRO.format(
            title=_safe("Ready to Play!"),
            desc=_safe(desc_text, wrap_width=40)
        )
    elif scene_idx == 0:
        items = objectives if objectives else ["Concept 1", "Concept 2", "Concept 3"]
        return FALLBACK_CONCEPT_MAP.format(
            title=_safe(title_text, wrap_width=50),
            center=_safe(title_text, wrap_width=20),
            items=repr([_safe(i, wrap_width=25) for i in items])
        )
    else:
        # Extract keywords or just use objectives if narration analysis is weak
        words = objectives if objectives else ["Step 1", "Step 2", "Step 3"]
        return FALLBACK_PROCESS.format(
            title=_safe(title_text, wrap_width=50),
            steps=repr([_safe(s, wrap_width=20) for s in words])
        )


# ── Main Pipeline ────────────────────────────────────────────────────────

def generate_video(video_data, output_path, lesson_data=None):
    """
    Pipeline:
    1. Title card → image → FFmpeg segment
    2. 3 Manim-animated scenes (AI-generated code with fallback)
    3. Key takeaways → Manim animated
    4. Ending card → image → FFmpeg segment
    5. FFmpeg concat all segments
    6. Edge TTS narration
    7. FFmpeg mux audio + video
    """
    if lesson_data is None:
        lesson_data = {}

    segments = []  # ('video', path) or ('image', path, duration)
    narration_texts = []
    tmp_dir = tempfile.mkdtemp(prefix="edu_video_")

    title = video_data.get("title", "Educational Video")
    audience = video_data.get("targetAudience", "Students")
    scenes = video_data.get("scenes", [])
    takeaways = video_data.get("keyTakeaways", [])

    print(f"[video-gen] Starting: {title}")
    print(f"[video-gen] {len(scenes)} scenes, {len(takeaways)} takeaways")

    # 1. Title card (2s)
    title_img = create_slide_image(title, f"For: {audience}")
    segments.append(('image', title_img, 2.0))
    narration_texts.append(f"Welcome to {title}.")

    # 2. Animated scenes (max 3)
    for idx, scene in enumerate(scenes[:3]):
        narration = scene.get("narration", "")
        manim_code = scene.get("manimCode", "")

        scene_dir = os.path.join(tmp_dir, f"scene_{idx}")
        rendered = None

        # Try AI-generated Manim code first
        if manim_code.strip():
            print(f"[video-gen] Scene {idx + 1}: rendering AI Manim code...")
            rendered = render_manim_code(manim_code, scene_dir)

        # Fallback to pattern-based code
        if not rendered:
            print(f"[video-gen] Scene {idx + 1}: using fallback pattern")
            fallback_dir = os.path.join(tmp_dir, f"scene_{idx}_fb")
            fallback_code = get_fallback_code(idx, narration, lesson_data)
            rendered = render_manim_code(fallback_code, fallback_dir)

        if rendered:
            segments.append(('video', rendered))
            print(f"[video-gen] Scene {idx + 1}/3 ✓ animated")
        else:
            # Last resort: static slide
            print(f"[video-gen] Scene {idx + 1}/3 → static fallback")
            fb_img = create_slide_image(f"Scene {idx + 1}", narration if narration else "")
            segments.append(('image', fb_img, 5.0))

        narration_texts.append(narration)

    # 3. Key takeaways (animated)
    if takeaways:
        tk_dir = os.path.join(tmp_dir, "takeaways")
        tk_code = FALLBACK_CONCEPT_MAP.format(
            title="Key Takeaways",
            center="Remember!",
            items=repr([_safe(t, wrap_width=25) for t in takeaways[:5]])
        )
        rendered = render_manim_code(tk_code, tk_dir)
        if rendered:
            segments.append(('video', rendered))
        else:
            fb_img = create_slide_image("Key Takeaways", ", ".join(takeaways[:3]))
            segments.append(('image', fb_img, 4.0))
        narration_texts.append("Let's review: " + ". ".join(takeaways[:3]))

    # 4. Ending card (2s)
    end_img = create_slide_image("Ready to Play!", "Jump in and start learning!")
    segments.append(('image', end_img, 2.0))
    narration_texts.append("You're all set! Good luck!")

    # 5. Convert all to FFmpeg segments
    print("[video-gen] Converting to video segments...")
    seg_files = []
    for i, seg in enumerate(segments):
        seg_path = os.path.join(tmp_dir, f"seg_{i:03d}.mp4")

        if seg[0] == 'video':
            # Check duration first
            probe = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", seg[1]],
                capture_output=True, text=True
            )
            duration = float(probe.stdout.strip()) if probe.stdout.strip() else 0
            
            # If it's a scene (idx 1, 2, 3), force it to be at least 30s by looping or holding final frame
            is_scene = (1 <= i <= 3) 
            target_dur = 30.0 if is_scene else duration

            if is_scene and duration < 28.0:
               if duration <= 0:
                   print(f"[video-gen] Warning: Segment {i} has 0 duration, skipping loop.")
                   cmd = [
                        "ffmpeg", "-y", "-i", seg[1],
                        "-vf", f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,"
                               f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x0f0f19",
                        "-r", str(FPS), "-c:v", "libx264", "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p", "-an", seg_path
                   ]
               else:
                   # Loop the video to fill time
                   # Note: -stream_loop must come BEFORE -i
                   cmd = [
                       "ffmpeg", "-y", "-stream_loop", "-1", "-i", seg[1], "-t", str(target_dur),
                       "-vf", f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,"
                              f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x0f0f19",
                       "-r", str(FPS), "-c:v", "libx264", "-preset", "ultrafast",
                       "-pix_fmt", "yuv420p", "-an", seg_path
                   ]
            else:
               cmd = [
                   "ffmpeg", "-y", "-i", seg[1],
                   "-vf", f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,"
                          f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x0f0f19",
                   "-r", str(FPS), "-c:v", "libx264", "-preset", "ultrafast",
                   "-pix_fmt", "yuv420p", "-an", seg_path
               ]
        else:
            # For static images, use the duration specified
            # Scene fallbacks (idx 1,2,3) should be 30s if not specified
            dur = 30.0 if (1 <= i <= 3) else seg[2]
            
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-i", seg[1],
                "-t", str(dur), "-r", str(FPS),
                "-vf", f"scale={WIDTH}:{HEIGHT}",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", seg_path
            ]

        subprocess.run(cmd, capture_output=True, timeout=30)
        if os.path.exists(seg_path) and os.path.getsize(seg_path) > 0:
            seg_files.append(seg_path)
            print(f"[video-gen]   Segment {i} ✓")

    # 6. Concatenate
    print(f"[video-gen] Joining {len(seg_files)} segments...")
    concat_list = os.path.join(tmp_dir, "concat.txt")
    with open(concat_list, 'w') as f:
        for s in seg_files:
            f.write(f"file '{s}'\n")

    no_audio = os.path.join(tmp_dir, "combined.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list, "-c", "copy", no_audio
    ], capture_output=True, timeout=60)

    # 7. Narration
    narration_path = os.path.join(tmp_dir, "narration.mp3")
    full_narration = " ... ".join(narration_texts)
    has_narration = False

    try:
        print("[video-gen] Generating narration...")
        generate_narration_sync(full_narration, narration_path)
        has_narration = os.path.exists(narration_path) and os.path.getsize(narration_path) > 0
    except Exception as e:
        print(f"[video-gen] Narration failed: {e}", file=sys.stderr)

    # 8. Mux
    if has_narration:
        print("[video-gen] Muxing audio...")
        result = subprocess.run([
            "ffmpeg", "-y", "-i", no_audio, "-i", narration_path,
            "-c:v", "copy", "-c:a", "aac", "-shortest", output_path
        ], capture_output=True, timeout=60)
        if result.returncode != 0:
            import shutil
            shutil.copy2(no_audio, output_path)
    else:
        import shutil
        shutil.copy2(no_audio, output_path)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[video-gen] ✓ Done: {output_path} ({size_mb:.1f} MB)")
    return output_path


# ── CLI ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_video.py <json_file> <output_file>")
        sys.exit(1)

    try:
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)

        lesson_data = data.pop("_lessonData", {})
        result = generate_video(data, sys.argv[2], lesson_data)
        print(json.dumps({"success": True, "output": result}))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
