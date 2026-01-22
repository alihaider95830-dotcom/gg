"""
Data loading and preprocessing for SQuAD 2.0 dataset.
"""
from datasets import load_dataset
from typing import List, Dict, Optional
import tiktoken


class DataLoader:
    """Load and preprocess SQuAD dataset."""

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        use_token_chunking: bool = True,
    ):
        """
        Initialize data loader.

        Args:
            chunk_size: Maximum chunk size (tokens or characters)
            chunk_overlap: Overlap between chunks
            use_token_chunking: Use token-based chunking instead of character-based
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.use_token_chunking = use_token_chunking

        if use_token_chunking:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def load_squad(self, split: str = "train", num_samples: Optional[int] = None) -> List[Dict]:
        """
        Load SQuAD 2.0 dataset.

        Args:
            split: Dataset split ('train' or 'validation')
            num_samples: Optional limit on number of samples

        Returns:
            List of document dicts
        """
        dataset = load_dataset("squad_v2", split=split)

        if num_samples:
            dataset = dataset.select(range(min(num_samples, len(dataset))))

        documents = []
        for item in dataset:
            documents.append({
                "id": item["id"],
                "title": item["title"],
                "context": item["context"],
                "question": item["question"],
                "answers": item["answers"],
            })

        return documents

    def _chunk_text_by_tokens(self, text: str) -> List[str]:
        """
        Chunk text by token count.

        Args:
            text: Input text

        Returns:
            List of text chunks
        """
        tokens = self.tokenizer.encode(text)
        chunks = []

        i = 0
        while i < len(tokens):
            # Get chunk of tokens
            chunk_tokens = tokens[i : i + self.chunk_size]

            # Decode back to text
            chunk_text = self.tokenizer.decode(chunk_tokens)
            chunks.append(chunk_text)

            # Move to next chunk with overlap
            i += self.chunk_size - self.chunk_overlap

        return chunks

    def _chunk_text_by_chars(self, text: str) -> List[str]:
        """
        Chunk text by character count.

        Args:
            text: Input text

        Returns:
            List of text chunks
        """
        chunks = []
        i = 0

        while i < len(text):
            chunk = text[i : i + self.chunk_size]
            chunks.append(chunk)
            i += self.chunk_size - self.chunk_overlap

        return chunks

    def chunk_documents(self, documents: List[Dict]) -> List[Dict]:
        """
        Chunk documents into smaller pieces.

        Args:
            documents: List of document dicts

        Returns:
            List of chunked document dicts with metadata
        """
        chunked_docs = []

        for doc in documents:
            text = doc["context"]

            # Chunk the text
            if self.use_token_chunking:
                chunks = self._chunk_text_by_tokens(text)
            else:
                chunks = self._chunk_text_by_chars(text)

            # Create metadata for each chunk
            for i, chunk in enumerate(chunks):
                chunked_docs.append({
                    "text": chunk,
                    "metadata": {
                        "source_id": doc["id"],
                        "title": doc.get("title", ""),
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                    },
                })

        return chunked_docs

    def prepare_for_ingestion(
        self,
        split: str = "train",
        num_samples: Optional[int] = None,
    ) -> List[Dict]:
        """
        Load and prepare documents for ingestion.

        Args:
            split: Dataset split
            num_samples: Optional sample limit

        Returns:
            List of chunked documents ready for ingestion
        """
        documents = self.load_squad(split=split, num_samples=num_samples)
        return self.chunk_documents(documents)
