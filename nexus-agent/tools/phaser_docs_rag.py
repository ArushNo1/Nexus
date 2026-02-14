"""Phaser 3 documentation retrieval via ChromaDB vector store."""

from langchain.tools import tool


@tool
def search_phaser_docs(query: str) -> str:
    """Search Phaser 3 documentation for API references and patterns."""
    # TODO: Initialize ChromaDB collection with Phaser 3 docs chunks
    # from chromadb import Client
    # db = Client()
    # collection = db.get_collection("phaser3_docs")
    # results = collection.query(query_texts=[query], n_results=5)
    # return "\n---\n".join(results["documents"][0])
    return f"[RAG not configured] Query: {query}"
