"""
Vector store implementation using ChromaDB with sentence transformers.
"""
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer, CrossEncoder
from typing import List, Dict, Optional, Tuple
import uuid


class VectorStore:
    """Wrapper for ChromaDB with semantic search capabilities."""

    def __init__(
        self,
        embedding_model: str = "all-MiniLM-L6-v2",
        persist_directory: str = "./chroma_db",
        collection_name: str = "squad_docs",
    ):
        """
        Initialize vector store.

        Args:
            embedding_model: Name of sentence transformer model
            persist_directory: Directory to persist ChromaDB
            collection_name: Name of the collection
        """
        self.embedding_model_name = embedding_model
        self.embedding_model = SentenceTransformer(embedding_model)

        # Initialize ChromaDB client
        # Use PersistentClient for persistence in ChromaDB 0.4.x
        try:
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(anonymized_telemetry=False)
            )
        except AttributeError:
            # Fallback for older versions or if PersistentClient is not available
            self.client = chromadb.Client(
                Settings(
                    persist_directory=persist_directory,
                    anonymized_telemetry=False,
                )
            )

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def _embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for texts.

        Args:
            texts: List of text strings

        Returns:
            List of embedding vectors
        """
        embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

    def add_documents(
        self,
        texts: List[str],
        metadatas: Optional[List[Dict]] = None,
        ids: Optional[List[str]] = None,
    ):
        """
        Add documents to vector store.

        Args:
            texts: List of document texts
            metadatas: Optional list of metadata dicts
            ids: Optional list of document IDs
        """
        if not texts:
            return

        # Generate IDs if not provided
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]

        # Generate embeddings
        embeddings = self._embed(texts)

        # Add to collection
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas or [{} for _ in texts],
            ids=ids,
        )

    def search(
        self,
        query: str,
        top_k: int = 3,
        reranker: Optional[CrossEncoder] = None,
    ) -> List[Dict]:
        """
        Search for relevant documents.

        Args:
            query: Search query
            top_k: Number of results to return
            reranker: Optional cross-encoder for reranking

        Returns:
            List of result dicts with keys: text, metadata, score
        """
        # Embed query
        query_embedding = self._embed([query])[0]

        # Initial retrieval (get more if reranking)
        n_results = top_k * 3 if reranker else top_k

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )

        # Format results
        documents = []
        for i in range(len(results["ids"][0])):
            documents.append({
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": 1 - results["distances"][0][i],  # Convert distance to similarity
                "id": results["ids"][0][i],
            })

        # Rerank if specified
        if reranker and documents:
            pairs = [[query, doc["text"]] for doc in documents]
            rerank_scores = reranker.predict(pairs)

            for doc, score in zip(documents, rerank_scores):
                doc["rerank_score"] = float(score)

            documents.sort(key=lambda x: x["rerank_score"], reverse=True)
            documents = documents[:top_k]

        return documents

    def get_collection_stats(self) -> Dict:
        """
        Get statistics about the collection.

        Returns:
            Dict with collection statistics
        """
        count = self.collection.count()
        return {
            "total_documents": count,
            "embedding_model": self.embedding_model_name,
            "collection_name": self.collection.name,
        }

    def delete_collection(self):
        """Delete the collection."""
        self.client.delete_collection(self.collection.name)

    def clear(self):
        """Clear all documents from collection."""
        self.delete_collection()
        self.collection = self.client.get_or_create_collection(
            name=self.collection.name,
            metadata={"hnsw:space": "cosine"},
        )
