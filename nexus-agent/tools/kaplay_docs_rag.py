"""Kaplay.js documentation retrieval via ChromaDB vector store."""

from langchain_core.tools import tool

from utils.config import settings

_collection = None


def _get_collection():
    """Lazy-init the ChromaDB collection on first use."""
    global _collection
    if _collection is None:
        import chromadb
        client = chromadb.PersistentClient(path=settings.chroma_db_dir)
        _collection = client.get_collection("kaplay_docs")
    return _collection


@tool
def search_kaplay_docs(query: str) -> str:
    """Search Kaplay.js documentation for API references, method signatures, and usage patterns.

    Each call must use a NEW, specific query — one question per call.
    Good:  "how to use tween for animation"
    Good:  "area component collision shapes"
    Bad:   "tween and collision and sprites" (too many topics bundled)
    Bad:   repeating a previous query verbatim
    """
    collection = _get_collection()
    results = collection.query(query_texts=[query], n_results=5)

    if not results["documents"] or not results["documents"][0]:
        return f"No results found for: {query}"

    chunks = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        header = f"[{meta['title']}] ({meta['source']})"
        chunks.append(f"{header}\n{doc}")

    return "\n\n---\n\n".join(chunks)
