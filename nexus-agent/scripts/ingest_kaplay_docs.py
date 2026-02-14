"""Ingest Kaplay.js MDX documentation into a persistent ChromaDB vector store."""

import re
import sys
from pathlib import Path

import chromadb

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = PROJECT_ROOT / "kaplay_docs" / "en"
CHROMA_DIR = PROJECT_ROOT / "data" / "chroma_db"
COLLECTION_NAME = "kaplay_docs"

CHUNK_SIZE = 1500  # characters (~375 tokens)
CHUNK_OVERLAP = 200


def strip_mdx_frontmatter_and_imports(text: str) -> str:
    """Remove YAML frontmatter and Astro/MDX import lines."""
    # Strip frontmatter
    text = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.DOTALL)
    # Strip import lines
    text = re.sub(r"^import .+$", "", text, flags=re.MULTILINE)
    return text.strip()


def extract_title(text: str) -> str:
    """Pull the title from YAML frontmatter."""
    match = re.search(r"^---\n.*?title:\s*(.+?)$.*?\n---", text, re.DOTALL | re.MULTILINE)
    return match.group(1).strip() if match else "Unknown"


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks, breaking on paragraph boundaries."""
    paragraphs = re.split(r"\n{2,}", text)
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 > chunk_size and current:
            chunks.append(current.strip())
            # Keep overlap from end of current chunk
            current = current[-overlap:] + "\n\n" + para if overlap else para
        else:
            current = current + "\n\n" + para if current else para

    if current.strip():
        chunks.append(current.strip())

    return chunks


def ingest():
    mdx_files = sorted(DOCS_DIR.rglob("*.mdx"))

    if not mdx_files:
        print(f"No .mdx files found in {DOCS_DIR}")
        sys.exit(1)

    print(f"Found {len(mdx_files)} MDX files")

    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    # Idempotent: delete and recreate
    try:
        client.delete_collection(COLLECTION_NAME)
    except (ValueError, chromadb.errors.NotFoundError):
        pass
    collection = client.create_collection(COLLECTION_NAME)

    all_ids = []
    all_docs = []
    all_metas = []

    for mdx_path in mdx_files:
        raw = mdx_path.read_text(encoding="utf-8")
        title = extract_title(raw)
        clean = strip_mdx_frontmatter_and_imports(raw)
        category = mdx_path.parent.name
        rel_path = str(mdx_path.relative_to(PROJECT_ROOT))

        chunks = chunk_text(clean)
        for i, chunk in enumerate(chunks):
            doc_id = f"{mdx_path.stem}_{i}"
            all_ids.append(doc_id)
            all_docs.append(chunk)
            all_metas.append({
                "title": title,
                "category": category,
                "source": rel_path,
                "chunk_index": i,
            })

    # ChromaDB batch limit is 5461, we're well under
    collection.add(ids=all_ids, documents=all_docs, metadatas=all_metas)
    print(f"Ingested {len(all_ids)} chunks from {len(mdx_files)} files into '{COLLECTION_NAME}'")


if __name__ == "__main__":
    ingest()
