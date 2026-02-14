#!/usr/bin/env python3
"""
Manim Sprite Generator for Educational Videos
Generates creative, topic-relevant PNG sprites with transparent backgrounds.

Usage:
    python3 generate_sprites.py <json_file> <output_dir>
    python3 generate_sprites.py --render-single <json_data>
"""

import sys
import json
import os
import shutil
import hashlib
import subprocess
import numpy as np

# Manim imports
from manim import *


# ── Color Helpers ─────────────────────────────────────────────────────────

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def lighten(hex_color, amount=0.3):
    r, g, b = hex_to_rgb(hex_color)
    return f"#{min(255,int((r+amount)*255)):02x}{min(255,int((g+amount)*255)):02x}{min(255,int((b+amount)*255)):02x}"

def darken(hex_color, amount=0.3):
    r, g, b = hex_to_rgb(hex_color)
    return f"#{max(0,int((r-amount)*255)):02x}{max(0,int((g-amount)*255)):02x}{max(0,int((b-amount)*255)):02x}"


# ── Sprite Builders ──────────────────────────────────────────────────────

def build_sun(color):
    glow = Circle(radius=1.8, color=color, fill_opacity=0.12, stroke_width=0)
    body = Circle(radius=1.1, color=color, fill_opacity=0.95, stroke_width=2, stroke_color=darken(color, 0.15))
    inner = Circle(radius=0.6, color=lighten(color, 0.2), fill_opacity=0.4, stroke_width=0)
    rays = VGroup()
    for i in range(12):
        angle = i * PI / 6
        d = np.array([np.cos(angle), np.sin(angle), 0])
        ray = Line(1.3*d, 2.1*d, color=color, stroke_width=5 if i%3==0 else 3, stroke_opacity=0.85)
        rays.add(ray)
    return VGroup(glow, rays, body, inner)

def build_water_drop(color):
    drop_body = Circle(radius=0.9, color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1))
    tip = Polygon(
        np.array([-0.45, 0.7, 0]), np.array([0, 1.8, 0]), np.array([0.45, 0.7, 0]),
        color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1)
    )
    highlight = Arc(radius=0.4, angle=PI*0.5, color=lighten(color, 0.4), stroke_width=3).shift(LEFT*0.2 + UP*0.1)
    r1 = Arc(radius=1.3, angle=PI*0.5, color=color, stroke_opacity=0.3, stroke_width=2).shift(DOWN*1.2)
    r2 = Arc(radius=1.6, angle=PI*0.35, color=color, stroke_opacity=0.15, stroke_width=2).shift(DOWN*1.4)
    return VGroup(r2, r1, drop_body, tip, highlight)

def build_plant(color):
    stem = Line(DOWN*1.2, UP*0.2, color=darken(color, 0.2), stroke_width=5)
    leaf1 = Ellipse(width=1.2, height=0.5, color=color, fill_opacity=0.85, stroke_width=2).rotate(PI/5).shift(UP*0.3 + RIGHT*0.4)
    leaf2 = Ellipse(width=1.0, height=0.45, color=lighten(color, 0.1), fill_opacity=0.8, stroke_width=2).rotate(-PI/4).shift(UP*0.8 + LEFT*0.3)
    leaf3 = Ellipse(width=0.7, height=0.35, color=color, fill_opacity=0.9, stroke_width=2).rotate(PI/8).shift(UP*1.3 + RIGHT*0.1)
    ground = Ellipse(width=2.0, height=0.3, color=darken(color, 0.4), fill_opacity=0.4, stroke_width=0).shift(DOWN*1.2)
    v1 = Line(UP*0.3+RIGHT*0.05, UP*0.3+RIGHT*0.7, color=darken(color, 0.15), stroke_width=1.5).rotate(PI/5, about_point=UP*0.3+RIGHT*0.05)
    return VGroup(ground, stem, leaf1, leaf2, leaf3, v1)

def build_cloud(color):
    c1 = Circle(radius=0.8, color=color, fill_opacity=0.85, stroke_width=1.5, stroke_color=darken(color, 0.05))
    c2 = Circle(radius=0.65, color=color, fill_opacity=0.85, stroke_width=1.5, stroke_color=darken(color, 0.05)).shift(LEFT*0.7 + DOWN*0.2)
    c3 = Circle(radius=0.55, color=color, fill_opacity=0.85, stroke_width=1.5, stroke_color=darken(color, 0.05)).shift(RIGHT*0.7 + DOWN*0.15)
    c4 = Circle(radius=0.6, color=color, fill_opacity=0.85, stroke_width=1.5, stroke_color=darken(color, 0.05)).shift(UP*0.4 + LEFT*0.2)
    c5 = Circle(radius=0.5, color=color, fill_opacity=0.85, stroke_width=1.5, stroke_color=darken(color, 0.05)).shift(UP*0.35 + RIGHT*0.35)
    shadow = Ellipse(width=2.2, height=0.3, color=darken(color, 0.3), fill_opacity=0.15, stroke_width=0).shift(DOWN*0.8)
    return VGroup(shadow, c2, c3, c1, c4, c5)

def build_lightning(color):
    bolt = Polygon(
        np.array([-0.1, 1.8, 0]), np.array([0.5, 0.3, 0]), np.array([0.1, 0.3, 0]),
        np.array([0.6, -1.5, 0]), np.array([-0.1, -0.1, 0]), np.array([0.2, -0.1, 0]),
        color=color, fill_opacity=0.95, stroke_width=2, stroke_color=darken(color, 0.1)
    )
    glow = bolt.copy().set_stroke(color=color, width=8, opacity=0.2).set_fill(opacity=0)
    sparks = VGroup()
    for a in [PI/4, 3*PI/4, 5*PI/4, 7*PI/4]:
        spark = Line(ORIGIN, 0.3*np.array([np.cos(a), np.sin(a), 0]),
                     color=lighten(color, 0.3), stroke_width=2, stroke_opacity=0.6)
        spark.shift(np.array([0.2, -0.5, 0]))
        sparks.add(spark)
    return VGroup(glow, bolt, sparks)

def build_atom(color):
    nucleus = Circle(radius=0.35, color=color, fill_opacity=0.95, stroke_width=2)
    orbits = VGroup()
    electrons = VGroup()
    for i, angle in enumerate([0, PI/3, 2*PI/3]):
        orbit = Ellipse(width=3.2, height=1.2, color=color, stroke_opacity=0.4, stroke_width=1.5, fill_opacity=0)
        orbit.rotate(angle)
        orbits.add(orbit)
        e_angle = (i * 2 * PI / 3)
        ex = 1.6*np.cos(e_angle)*np.cos(angle) - 0.6*np.sin(e_angle)*np.sin(angle)
        ey = 1.6*np.cos(e_angle)*np.sin(angle) + 0.6*np.sin(e_angle)*np.cos(angle)
        electron = Dot(point=np.array([ex, ey, 0]), radius=0.12, color=lighten(color, 0.3))
        electrons.add(electron)
    return VGroup(orbits, nucleus, electrons)

def build_flask(color):
    body = Polygon(
        np.array([-0.8, -1.2, 0]), np.array([-0.3, 0.3, 0]),
        np.array([-0.3, 0.8, 0]), np.array([0.3, 0.8, 0]),
        np.array([0.3, 0.3, 0]), np.array([0.8, -1.2, 0]),
        color=lighten(color, 0.3), fill_opacity=0.3, stroke_width=2.5, stroke_color=lighten(color, 0.2)
    )
    liquid = Polygon(
        np.array([-0.65, -1.2, 0]), np.array([-0.35, -0.1, 0]),
        np.array([0.35, -0.1, 0]), np.array([0.65, -1.2, 0]),
        color=color, fill_opacity=0.7, stroke_width=0
    )
    b1 = Circle(radius=0.08, color=lighten(color, 0.3), fill_opacity=0.6, stroke_width=0).shift(LEFT*0.1 + DOWN*0.5)
    b2 = Circle(radius=0.06, color=lighten(color, 0.3), fill_opacity=0.5, stroke_width=0).shift(RIGHT*0.15 + DOWN*0.3)
    b3 = Circle(radius=0.1, color=lighten(color, 0.3), fill_opacity=0.4, stroke_width=0).shift(DOWN*0.7)
    neck = Line(np.array([-0.35, 0.8, 0]), np.array([0.35, 0.8, 0]), color=lighten(color, 0.2), stroke_width=2.5)
    return VGroup(body, liquid, b1, b2, b3, neck)

def build_star_shape(color):
    star = Star(n=5, outer_radius=1.5, inner_radius=0.6, color=color, fill_opacity=0.9, stroke_width=2, stroke_color=darken(color, 0.1))
    inner_star = Star(n=5, outer_radius=0.8, inner_radius=0.35, color=lighten(color, 0.25), fill_opacity=0.4, stroke_width=0)
    glow = Circle(radius=1.8, color=color, fill_opacity=0.08, stroke_width=0)
    sparkles = VGroup()
    for angle in [PI/5, 3*PI/5, PI, 7*PI/5, 9*PI/5]:
        d = np.array([np.cos(angle), np.sin(angle), 0])
        sparkles.add(Dot(point=2.0*d, radius=0.06, color=lighten(color, 0.3)))
    return VGroup(glow, star, inner_star, sparkles)

def build_gear(color):
    n_teeth = 8
    points = []
    for i in range(n_teeth * 2):
        angle = i * PI / n_teeth
        r = 1.3 if i % 2 == 0 else 1.0
        points.append(np.array([r*np.cos(angle), r*np.sin(angle), 0]))
    gear = Polygon(*points, color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1))
    center = Circle(radius=0.35, color=darken(color, 0.3), fill_opacity=0.8, stroke_width=2, stroke_color=color)
    inner_ring = Circle(radius=0.55, color=color, fill_opacity=0, stroke_width=1.5, stroke_color=darken(color, 0.1))
    return VGroup(gear, inner_ring, center)

def build_book(color):
    left = Polygon(
        np.array([-1.5, -0.8, 0]), np.array([-1.5, 0.8, 0]),
        np.array([-0.05, 0.7, 0]), np.array([-0.05, -0.9, 0]),
        color=lighten(color, 0.4), fill_opacity=0.85, stroke_width=2, stroke_color=color
    )
    right = Polygon(
        np.array([1.5, -0.8, 0]), np.array([1.5, 0.8, 0]),
        np.array([0.05, 0.7, 0]), np.array([0.05, -0.9, 0]),
        color=lighten(color, 0.45), fill_opacity=0.85, stroke_width=2, stroke_color=color
    )
    spine = Line(np.array([0, -0.9, 0]), np.array([0, 0.7, 0]), color=darken(color, 0.1), stroke_width=3)
    lines = VGroup()
    for y in [-0.4, -0.1, 0.2, 0.5]:
        lines.add(Line(np.array([-1.2, y, 0]), np.array([-0.3, y, 0]), color=color, stroke_width=1.5, stroke_opacity=0.4))
        lines.add(Line(np.array([0.3, y, 0]), np.array([1.2, y, 0]), color=color, stroke_width=1.5, stroke_opacity=0.4))
    return VGroup(left, right, spine, lines)

def build_arrow_cycle(color):
    arrows = VGroup()
    for i in range(3):
        start_angle = i * 2 * PI / 3 + PI / 6
        arc = Arc(radius=1.2, start_angle=start_angle, angle=1.6, color=color, stroke_width=4)
        tip_angle = start_angle + 1.6
        tip_pos = 1.2 * np.array([np.cos(tip_angle), np.sin(tip_angle), 0])
        arrow_head = Triangle(color=color, fill_opacity=0.9, stroke_width=0).scale(0.15)
        arrow_head.rotate(tip_angle - PI/2)
        arrow_head.move_to(tip_pos)
        arrows.add(arc, arrow_head)
    center_dot = Dot(ORIGIN, radius=0.15, color=lighten(color, 0.2))
    return VGroup(arrows, center_dot)

def build_molecule(color):
    center = Circle(radius=0.4, color=color, fill_opacity=0.9, stroke_width=2)
    atoms = VGroup()
    bonds = VGroup()
    for pos in [UP*1.2, DOWN*1.2+LEFT*0.8, DOWN*1.2+RIGHT*0.8, RIGHT*1.4+UP*0.3]:
        bond = Line(ORIGIN, pos*0.65, color=color, stroke_width=3, stroke_opacity=0.6)
        atom = Circle(radius=0.25, color=lighten(color, 0.2), fill_opacity=0.85, stroke_width=1.5, stroke_color=color)
        atom.move_to(pos)
        bonds.add(bond)
        atoms.add(atom)
    return VGroup(bonds, center, atoms)

def build_mountain(color):
    mountain = Polygon(
        np.array([-1.8, -1.2, 0]), np.array([0, 1.5, 0]), np.array([1.8, -1.2, 0]),
        color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1)
    )
    snow = Polygon(
        np.array([-0.4, 0.9, 0]), np.array([0, 1.5, 0]), np.array([0.4, 0.9, 0]),
        np.array([0.2, 1.0, 0]), np.array([-0.2, 1.0, 0]),
        color=WHITE, fill_opacity=0.7, stroke_width=0
    )
    bg_mountain = Polygon(
        np.array([-2.5, -1.2, 0]), np.array([-0.8, 0.8, 0]), np.array([1.0, -1.2, 0]),
        color=darken(color, 0.15), fill_opacity=0.5, stroke_width=0
    )
    return VGroup(bg_mountain, mountain, snow)

def build_eye(color):
    outer = Ellipse(width=2.4, height=1.4, color=color, fill_opacity=0.15, stroke_width=2.5, stroke_color=color)
    iris = Circle(radius=0.5, color=color, fill_opacity=0.85, stroke_width=1.5)
    pupil = Circle(radius=0.22, color=darken(color, 0.5), fill_opacity=0.95, stroke_width=0)
    highlight = Dot(point=np.array([0.12, 0.12, 0]), radius=0.08, color=WHITE)
    top = ArcBetweenPoints(np.array([-1.2, 0, 0]), np.array([1.2, 0, 0]), angle=-PI/3, color=color, stroke_width=2)
    bottom = ArcBetweenPoints(np.array([-1.2, 0, 0]), np.array([1.2, 0, 0]), angle=PI/3, color=color, stroke_width=2)
    return VGroup(outer, iris, pupil, highlight, top, bottom)

def build_heart(color):
    left_arc = Circle(radius=0.65, color=color, fill_opacity=0.9, stroke_width=0).shift(LEFT*0.55 + UP*0.3)
    right_arc = Circle(radius=0.65, color=color, fill_opacity=0.9, stroke_width=0).shift(RIGHT*0.55 + UP*0.3)
    btm = Polygon(
        np.array([-1.15, 0.15, 0]), np.array([0, -1.4, 0]), np.array([1.15, 0.15, 0]),
        color=color, fill_opacity=0.9, stroke_width=0
    )
    outline = VGroup(left_arc.copy(), right_arc.copy(), btm.copy()).set_fill(opacity=0).set_stroke(color=darken(color, 0.1), width=2)
    highlight = Arc(radius=0.35, angle=PI*0.6, color=lighten(color, 0.3), stroke_width=2.5).shift(LEFT*0.3 + UP*0.4)
    return VGroup(btm, left_arc, right_arc, outline, highlight)

def build_magnifier(color):
    lens = Circle(radius=0.9, color=lighten(color, 0.3), fill_opacity=0.15, stroke_width=3, stroke_color=color)
    handle = Line(np.array([0.63, -0.63, 0]), np.array([1.5, -1.5, 0]), color=darken(color, 0.2), stroke_width=6)
    glare = Arc(radius=0.5, angle=PI*0.4, color=lighten(color, 0.4), stroke_width=2).shift(LEFT*0.15 + UP*0.15)
    return VGroup(lens, handle, glare)

def build_generic_circle(color):
    glow = Circle(radius=1.5, color=color, fill_opacity=0.1, stroke_width=0)
    outer = Circle(radius=1.1, color=color, fill_opacity=0.15, stroke_width=2, stroke_color=color)
    inner = Circle(radius=0.7, color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1))
    highlight = Arc(radius=0.35, angle=PI*0.5, color=lighten(color, 0.3), stroke_width=2).shift(LEFT*0.1 + UP*0.1)
    return VGroup(glow, outer, inner, highlight)

def build_generic_polygon(color):
    hex_shape = RegularPolygon(n=6, color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1)).scale(1.2)
    inner_hex = RegularPolygon(n=6, color=lighten(color, 0.2), fill_opacity=0.3, stroke_width=0).scale(0.7)
    glow = Circle(radius=1.5, color=color, fill_opacity=0.08, stroke_width=0)
    return VGroup(glow, hex_shape, inner_hex)

def build_generic_rect(color):
    rect = RoundedRectangle(corner_radius=0.2, width=2.0, height=1.5, color=color, fill_opacity=0.85, stroke_width=2, stroke_color=darken(color, 0.1))
    inner = RoundedRectangle(corner_radius=0.15, width=1.4, height=1.0, color=lighten(color, 0.15), fill_opacity=0.3, stroke_width=0)
    glow = RoundedRectangle(corner_radius=0.3, width=2.4, height=1.9, color=color, fill_opacity=0.08, stroke_width=0)
    return VGroup(glow, rect, inner)


# ── Label-to-Sprite Mapping ──────────────────────────────────────────────

KEYWORD_MAP = {
    "sun": build_sun, "sunlight": build_sun, "solar": build_sun, "light": build_sun, "bright": build_sun,
    "water": build_water_drop, "rain": build_water_drop, "drop": build_water_drop, "liquid": build_water_drop, "h2o": build_water_drop, "ocean": build_water_drop, "sea": build_water_drop,
    "plant": build_plant, "leaf": build_plant, "tree": build_plant, "vegetation": build_plant, "grow": build_plant, "sprout": build_plant, "seed": build_plant, "root": build_plant, "photosynthesis": build_plant, "grass": build_plant, "flower": build_plant,
    "cloud": build_cloud, "vapor": build_cloud, "steam": build_cloud, "fog": build_cloud, "evaporation": build_cloud, "condensation": build_cloud,
    "mountain": build_mountain, "hill": build_mountain, "volcano": build_mountain, "rock": build_mountain, "earth": build_mountain, "land": build_mountain,
    "energy": build_lightning, "lightning": build_lightning, "bolt": build_lightning, "electricity": build_lightning, "power": build_lightning, "spark": build_lightning, "electric": build_lightning, "charge": build_lightning, "voltage": build_lightning,
    "atom": build_atom, "electron": build_atom, "proton": build_atom, "neutron": build_atom, "nucleus": build_atom, "orbital": build_atom, "particle": build_atom,
    "flask": build_flask, "beaker": build_flask, "chemical": build_flask, "reaction": build_flask, "experiment": build_flask, "lab": build_flask, "chemistry": build_flask, "solution": build_flask, "acid": build_flask, "base": build_flask,
    "molecule": build_molecule, "compound": build_molecule, "bond": build_molecule, "element": build_molecule, "structure": build_molecule, "formula": build_molecule, "substance": build_molecule,
    "cycle": build_arrow_cycle, "loop": build_arrow_cycle, "process": build_arrow_cycle, "flow": build_arrow_cycle, "circulation": build_arrow_cycle, "repeat": build_arrow_cycle,
    "gear": build_gear, "machine": build_gear, "engine": build_gear, "mechanical": build_gear, "motor": build_gear, "system": build_gear, "mechanism": build_gear,
    "book": build_book, "read": build_book, "study": build_book, "learn": build_book, "knowledge": build_book, "education": build_book, "page": build_book, "literature": build_book,
    "observe": build_eye, "see": build_eye, "eye": build_eye, "look": build_eye, "watch": build_eye, "view": build_eye, "vision": build_eye, "inspect": build_eye,
    "search": build_magnifier, "find": build_magnifier, "discover": build_magnifier, "explore": build_magnifier, "investigate": build_magnifier, "magnify": build_magnifier, "analyze": build_magnifier, "research": build_magnifier,
    "heart": build_heart, "love": build_heart, "care": build_heart, "feel": build_heart, "emotion": build_heart, "health": build_heart, "life": build_heart,
    "star": build_star_shape, "important": build_star_shape, "highlight": build_star_shape, "special": build_star_shape, "award": build_star_shape, "achieve": build_star_shape, "goal": build_star_shape, "success": build_star_shape,
    "gas": build_cloud, "oxygen": build_cloud, "carbon": build_cloud, "dioxide": build_cloud, "nitrogen": build_cloud, "air": build_cloud, "atmosphere": build_cloud, "co2": build_cloud, "o2": build_cloud,
    "food": build_generic_circle, "sugar": build_generic_polygon, "glucose": build_generic_polygon, "starch": build_generic_polygon, "protein": build_molecule, "dna": build_molecule, "cell": build_atom,
}

def get_sprite_builder(label, shape):
    label_lower = label.lower()
    for keyword, builder in KEYWORD_MAP.items():
        if keyword in label_lower:
            return builder
    shape_fallbacks = {
        "circle": build_generic_circle, "star": build_star_shape,
        "triangle": build_mountain, "rect": build_generic_rect,
        "rectangle": build_generic_rect, "ellipse": build_generic_circle,
        "pie": build_generic_circle, "polygon": build_generic_polygon,
        "hexagon": build_generic_polygon,
    }
    return shape_fallbacks.get((shape or "").lower(), build_generic_circle)


# ── Scene Renderer ───────────────────────────────────────────────────────

class SpriteScene(Scene):
    def __init__(self, sprite_group, **kwargs):
        self.sprite_group = sprite_group
        super().__init__(**kwargs)

    def construct(self):
        self.add(self.sprite_group)


def get_custom_builder(code_str):
    """Parse and return a custom sprite builder function from code string."""
    if not code_str:
        return None
    try:
        # Prepare a scope with Manim and helpers available
        # We expect the code to define 'build_sprite(color)'
        # Remove any Markdown code fences if present
        cleaned_code = code_str.replace("```python", "").replace("```", "").strip()
        
        local_scope = {}
        # Execute in global scope so it sees Manim classes, but capture locals
        exec(cleaned_code, globals(), local_scope)
        
        if 'build_sprite' in local_scope:
            return local_scope['build_sprite']
        else:
            print("  ⚠ Custom code did not define 'build_sprite(color)'", file=sys.stderr)
    except Exception as e:
        print(f"  ⚠ Error parsing custom Manim code: {e}", file=sys.stderr)
    return None


def render_sprite(label, color, shape, size, output_path, manim_code=None):
    """Render a single sprite to PNG."""
    try:
        # Try custom code first, then fallback to keyword map
        builder = get_custom_builder(manim_code)
        if not builder:
            builder = get_sprite_builder(label, shape)
            
        sprite = builder(color)
        sprite.scale(0.7 + (size - 1) * 0.15)

        unique_id = hashlib.md5(f"{output_path}_{label}_{os.getpid()}".encode()).hexdigest()[:10]
        tmp_media = os.path.join("/tmp", "manim_sprites", f"render_{unique_id}")
        if os.path.exists(tmp_media):
            shutil.rmtree(tmp_media, ignore_errors=True)

        config.pixel_width = 320
        config.pixel_height = 320
        config.frame_rate = 1
        config.save_last_frame = True
        config.write_to_movie = False
        config.format = "png"
        config.quality = "low_quality"
        config.disable_caching = True
        config.transparent = True
        config.verbosity = "WARNING"
        config.media_dir = tmp_media

        scene = SpriteScene(sprite)
        scene.render()

        # Find the output PNG
        found = False
        for root, dirs, files in os.walk(tmp_media):
            for f in files:
                if f.endswith(".png"):
                    shutil.copy2(os.path.join(root, f), output_path)
                    found = True
                    break
            if found:
                break

        shutil.rmtree(tmp_media, ignore_errors=True)
        return found

    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return False


# ── Main ─────────────────────────────────────────────────────────────────

def render_single():
    """Render a single sprite (called as subprocess for clean Manim config)."""
    data = json.loads(sys.argv[2])
    success = render_sprite(data["label"], data["color"], data["shape"], data["size"], data["output_path"], data.get("manim_code"))
    print(f"RESULT:{json.dumps({'success': success})}")


def main():
    if len(sys.argv) >= 3 and sys.argv[1] == "--render-single":
        render_single()
        return

    if len(sys.argv) < 3:
        print("Usage: python3 generate_sprites.py <json_file> <output_dir>", file=sys.stderr)
        sys.exit(1)

    json_file = sys.argv[1]
    output_dir = sys.argv[2]

    with open(json_file) as f:
        elements = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    script_path = os.path.abspath(__file__)
    results = []

    for i, el in enumerate(elements):
        label = el.get("label", f"Element {i}")
        color = el.get("color", "#7c5cfc")
        shape = el.get("shape", "circle")
        size = el.get("size", 2)
        manim_code = el.get("manim_code", None)
        filename = el.get("filename", f"sprite-{i}.png")
        output_path = os.path.join(output_dir, filename)

        print(f"  [{i+1}/{len(elements)}] '{label}' -> {filename}")
        if manim_code:
            print("    (using custom Manim code)")

        # Spawn subprocess for clean Manim config each time
        sprite_data = json.dumps({
            "label": label, "color": color, "shape": shape,
            "size": size, "output_path": output_path,
            "manim_code": manim_code
        })

        try:
            proc = subprocess.run(
                ["python3", script_path, "--render-single", sprite_data],
                capture_output=True, text=True, timeout=30
            )

            success = False
            for line in proc.stdout.strip().split("\n"):
                if line.startswith("RESULT:"):
                    success = json.loads(line[7:]).get("success", False)
                    break

            if success:
                sz = os.path.getsize(output_path)
                print(f"    ✓ {sz // 1024}KB")
            else:
                err = proc.stderr[-200:] if proc.stderr else "unknown"
                print(f"    ✗ Failed: {err}")

        except subprocess.TimeoutExpired:
            print(f"    ✗ Timeout")
            success = False

        results.append({
            "index": i, "label": label, "filename": filename,
            "success": success, "path": output_path if success else None,
        })

    print(f"RESULTS:{json.dumps(results)}")


if __name__ == "__main__":
    main()
