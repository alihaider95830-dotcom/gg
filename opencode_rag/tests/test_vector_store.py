"""
Tests for vector store functionality.
"""
import pytest
import tempfile
import shutil
from vector_store import VectorStore


@pytest.fixture
def temp_dir():
    """Create temporary directory for tests."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def vector_store(temp_dir):
    """Create vector store instance for testing."""
    return VectorStore(
        embedding_model="all-MiniLM-L6-v2",
        persist_directory=temp_dir,
        collection_name="test_collection",
    )


def test_vector_store_init(vector_store):
    """Test vector store initialization."""
    assert vector_store is not None
    assert vector_store.embedding_model_name == "all-MiniLM-L6-v2"
    assert vector_store.collection is not None


def test_add_documents(vector_store):
    """Test adding documents to vector store."""
    texts = [
        "The quick brown fox jumps over the lazy dog.",
        "Python is a popular programming language.",
        "Machine learning is a subset of artificial intelligence.",
    ]

    vector_store.add_documents(texts=texts)

    stats = vector_store.get_collection_stats()
    assert stats["total_documents"] == 3


def test_search(vector_store):
    """Test searching for documents."""
    texts = [
        "Paris is the capital of France.",
        "London is the capital of England.",
        "Berlin is the capital of Germany.",
    ]

    vector_store.add_documents(texts=texts)

    results = vector_store.search("What is the capital of France?", top_k=1)

    assert len(results) == 1
    assert "Paris" in results[0]["text"]
    assert results[0]["score"] > 0


def test_search_top_k(vector_store):
    """Test top-k search results."""
    texts = [
        "Apple is a fruit.",
        "Banana is a fruit.",
        "Carrot is a vegetable.",
        "Dogs are animals.",
        "Cats are animals.",
    ]

    vector_store.add_documents(texts=texts)

    results = vector_store.search("fruits and vegetables", top_k=3)

    assert len(results) == 3


def test_add_documents_with_metadata(vector_store):
    """Test adding documents with metadata."""
    texts = ["Document 1", "Document 2"]
    metadatas = [
        {"source": "test1", "page": 1},
        {"source": "test2", "page": 2},
    ]

    vector_store.add_documents(texts=texts, metadatas=metadatas)

    results = vector_store.search("Document", top_k=2)

    assert len(results) == 2
    assert results[0]["metadata"]["source"] in ["test1", "test2"]


def test_get_collection_stats(vector_store):
    """Test getting collection statistics."""
    stats = vector_store.get_collection_stats()

    assert "total_documents" in stats
    assert "embedding_model" in stats
    assert "collection_name" in stats
    assert stats["total_documents"] == 0


def test_clear_collection(vector_store):
    """Test clearing collection."""
    texts = ["Doc 1", "Doc 2", "Doc 3"]
    vector_store.add_documents(texts=texts)

    stats = vector_store.get_collection_stats()
    assert stats["total_documents"] == 3

    vector_store.clear()

    stats = vector_store.get_collection_stats()
    assert stats["total_documents"] == 0


def test_embedding_generation(vector_store):
    """Test embedding generation."""
    texts = ["Test document"]
    embeddings = vector_store._embed(texts)

    assert len(embeddings) == 1
    assert len(embeddings[0]) == 384  # MiniLM-L6-v2 dimension
