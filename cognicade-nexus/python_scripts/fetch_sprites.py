#!/usr/bin/env python3
"""
High-Quality Sprite Fetcher
Downloads transparent PNG icons/illustrations from Iconify API for video elements.
"""

import sys
import json
import os
import urllib.request
import urllib.error
from pathlib import Path
import time


def fetch_sprite(query: str, output_path: str, timeout: int = 10) -> dict:
    """
    Fetch a high-quality sprite icon from Iconify API.

    Args:
        query: Search term (e.g., "Sun", "Water", "Plant")
        output_path: Where to save the SVG file
        timeout: Download timeout in seconds

    Returns:
        dict with success status and image path or error
    """
    try:
        # Normalize query to simple keyword
        keywords = query.lower().strip().split()
        search_term = keywords[0] if keywords else query.lower()

        print(f"[fetch_sprite] Searching for icon: {search_term}", file=sys.stderr)

        # Search Iconify API for matching icons
        search_url = f"https://api.iconify.design/search?query={search_term}&limit=5&pretty=1"

        headers = {
            'User-Agent': 'Mozilla/5.0 Educational Video Generator'
        }
        req = urllib.request.Request(search_url, headers=headers)

        with urllib.request.urlopen(req, timeout=timeout) as response:
            search_data = json.loads(response.read().decode('utf-8'))

        # Get the first matching icon
        icons = search_data.get('icons', [])
        if not icons:
            print(f"[fetch_sprite] No icons found for: {search_term}", file=sys.stderr)
            return {"success": False, "error": "No icons found"}

        # Take the first icon
        first_icon = icons[0]
        print(f"[fetch_sprite] Found icon: {first_icon}", file=sys.stderr)

        # Download the SVG
        icon_url = f"https://api.iconify.design/{first_icon}.svg?height=128"
        req = urllib.request.Request(icon_url, headers=headers)

        with urllib.request.urlopen(req, timeout=timeout) as response:
            svg_data = response.read()

        # Save to output path (as SVG)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        output_svg = output_path.replace('.png', '.svg')
        with open(output_svg, 'wb') as f:
            f.write(svg_data)

        size_kb = len(svg_data) / 1024
        print(f"[fetch_sprite] Downloaded: {output_svg} ({size_kb:.1f} KB)", file=sys.stderr)

        return {
            "success": True,
            "path": output_svg,
            "url": icon_url,
            "size": len(svg_data)
        }

    except Exception as e:
        print(f"[fetch_sprite] Error: {e}", file=sys.stderr)
        return {"success": False, "error": str(e)}


def fetch_sprites_batch(elements: list, output_dir: str) -> dict:
    """
    Fetch sprites for multiple elements.

    Args:
        elements: List of element names to fetch sprites for
        output_dir: Directory to save sprites

    Returns:
        dict mapping element names to sprite paths
    """
    results = {}

    for i, element in enumerate(elements):
        # Clean element name for filename
        safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in element)
        safe_name = safe_name.replace(' ', '_')[:50]  # Limit length

        output_path = os.path.join(output_dir, f"{safe_name}.svg")

        # Skip if already exists (check both .svg and .png)
        if os.path.exists(output_path) or os.path.exists(output_path.replace('.svg', '.png')):
            print(f"[fetch_sprite] Using cached: {output_path}", file=sys.stderr)
            results[element] = output_path
            continue

        # Add small delay between requests (be nice to API)
        if i > 0:
            time.sleep(0.3)

        # Fetch new sprite
        result = fetch_sprite(element, output_path)

        if result["success"]:
            results[element] = result["path"]
        else:
            results[element] = None

    return results


# ── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python fetch_sprites.py <element_name> <output_path>")
        print("   OR: python fetch_sprites.py --batch <json_elements> <output_dir>")
        sys.exit(1)

    if sys.argv[1] == "--batch":
        # Batch mode
        elements = json.loads(sys.argv[2])
        output_dir = sys.argv[3]
        results = fetch_sprites_batch(elements, output_dir)
        print(json.dumps({"success": True, "sprites": results}))
    else:
        # Single mode
        query = sys.argv[1]
        output_path = sys.argv[2]
        result = fetch_sprite(query, output_path)
        print(json.dumps(result))
