"""
Tests for data loader functionality.
"""
import pytest
from data_loader import DataLoader


@pytest.fixture
def data_loader():
    """Create data loader instance."""
    return DataLoader(
        chunk_size=100,
        chunk_overlap=20,
        use_token_chunking=False,
    )


@pytest.fixture
def token_data_loader():
    """Create token-based data loader instance."""
    return DataLoader(
        chunk_size=50,
        chunk_overlap=10,
        use_token_chunking=True,
    )


def test_data_loader_init(data_loader):
    """Test data loader initialization."""
    assert data_loader.chunk_size == 100
    assert data_loader.chunk_overlap == 20
    assert data_loader.use_token_chunking is False


def test_chunk_text_by_chars(data_loader):
    """Test character-based text chunking."""
    text = "A" * 250  # 250 characters

    chunks = data_loader._chunk_text_by_chars(text)

    assert len(chunks) > 1
    assert len(chunks[0]) == 100


def test_chunk_text_with_overlap(data_loader):
    """Test that chunks have overlap."""
    text = "A" * 250

    chunks = data_loader._chunk_text_by_chars(text)

    # With chunk_size=100 and overlap=20, should have overlap
    assert len(chunks) >= 2


def test_chunk_text_by_tokens(token_data_loader):
    """Test token-based text chunking."""
    text = "This is a test sentence. " * 20

    chunks = token_data_loader._chunk_text_by_tokens(text)

    assert len(chunks) > 0


def test_chunk_documents(data_loader):
    """Test chunking of documents."""
    documents = [
        {
            "id": "test1",
            "context": "A" * 250,
            "title": "Test Document",
        },
        {
            "id": "test2",
            "context": "B" * 300,
            "title": "Test Document 2",
        },
    ]

    chunked = data_loader.chunk_documents(documents)

    assert len(chunked) > 2  # Should create multiple chunks
    assert all("text" in doc for doc in chunked)
    assert all("metadata" in doc for doc in chunked)


def test_chunk_metadata(data_loader):
    """Test that chunk metadata is correct."""
    documents = [
        {
            "id": "test1",
            "context": "A" * 250,
            "title": "Test",
        },
    ]

    chunked = data_loader.chunk_documents(documents)

    assert chunked[0]["metadata"]["source_id"] == "test1"
    assert chunked[0]["metadata"]["title"] == "Test"
    assert "chunk_index" in chunked[0]["metadata"]
    assert "total_chunks" in chunked[0]["metadata"]


def test_load_squad(data_loader):
    """Test loading SQuAD dataset."""
    # Load small sample
    documents = data_loader.load_squad(split="train", num_samples=5)

    assert len(documents) == 5
    assert all("context" in doc for doc in documents)
    assert all("question" in doc for doc in documents)


def test_prepare_for_ingestion(data_loader):
    """Test full preparation pipeline."""
    prepared = data_loader.prepare_for_ingestion(
        split="train",
        num_samples=3,
    )

    assert len(prepared) > 0
    assert all("text" in doc for doc in prepared)
    assert all("metadata" in doc for doc in prepared)
