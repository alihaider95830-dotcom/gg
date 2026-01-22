"""
Tests for RAG pipeline functionality.
"""
import pytest
import tempfile
import shutil
from unittest.mock import Mock, patch
from config import RAGConfig
from vector_store import VectorStore
from rag_pipeline import RAGPipeline


@pytest.fixture
def temp_dir():
    """Create temporary directory for tests."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def config():
    """Create test configuration."""
    return RAGConfig(
        embedding_model="all-MiniLM-L6-v2",
        chunk_size=300,
        top_k=2,
        llm_provider="openai",
        llm_model="gpt-3.5-turbo",
        max_context_length=1000,
        enable_grounding_check=True,
    )


@pytest.fixture
def vector_store(temp_dir):
    """Create vector store with test data."""
    vs = VectorStore(
        embedding_model="all-MiniLM-L6-v2",
        persist_directory=temp_dir,
        collection_name="test_rag",
    )

    # Add test documents
    texts = [
        "Paris is the capital and most populous city of France.",
        "The Eiffel Tower is a wrought-iron lattice tower located in Paris.",
        "France is a country in Western Europe.",
    ]
    vs.add_documents(texts=texts)

    return vs


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response."""
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "Paris is the capital of France."
    return mock_response


def test_rag_pipeline_init(vector_store, config):
    """Test RAG pipeline initialization."""
    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    assert pipeline is not None
    assert pipeline.vector_store == vector_store
    assert pipeline.config == config


def test_retrieve_documents(vector_store, config):
    """Test document retrieval."""
    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    documents = pipeline._retrieve_documents("What is the capital of France?")

    assert len(documents) > 0
    assert len(documents) <= config.top_k


def test_compress_context(vector_store, config):
    """Test context compression."""
    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    documents = [
        {"text": "Document 1 content"},
        {"text": "Document 2 content"},
    ]

    context = pipeline._compress_context(documents)

    assert "[Context 1]" in context
    assert "[Context 2]" in context
    assert "Document 1 content" in context


def test_compress_context_length_limit(vector_store, config):
    """Test that context compression respects length limit."""
    config.max_context_length = 50
    config.compress_context = True

    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    long_text = "A" * 100
    documents = [{"text": long_text}]

    context = pipeline._compress_context(documents)

    # Context should be truncated
    assert len(context) <= 100  # Includes formatting


def test_verify_grounding(vector_store, config):
    """Test grounding verification."""
    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    contexts = ["Paris is the capital of France."]
    answer = "Paris is the capital of France."

    score = pipeline._verify_grounding(answer, contexts)

    assert score > 0.5  # High overlap


def test_verify_grounding_low_overlap(vector_store, config):
    """Test grounding with low overlap."""
    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    contexts = ["Paris is the capital of France."]
    answer = "The sky is blue and water is wet."

    score = pipeline._verify_grounding(answer, contexts)

    assert score < 0.5  # Low overlap


@patch('openai.chat.completions.create')
def test_query_full_pipeline(mock_openai, vector_store, config, mock_openai_response):
    """Test full query pipeline."""
    mock_openai.return_value = mock_openai_response

    pipeline = RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key="test-key",
    )

    result = pipeline.query("What is the capital of France?")

    assert "answer" in result
    assert "sources" in result
    assert "confidence" in result
    assert result["retrieval_count"] > 0


@patch('openai.chat.completions.create')
def test_query_no_results(mock_openai, temp_dir, config, mock_openai_response):
    """Test query with no matching documents."""
    # Create empty vector store
    vs = VectorStore(
        embedding_model="all-MiniLM-L6-v2",
        persist_directory=temp_dir,
        collection_name="empty_test",
    )

    pipeline = RAGPipeline(
        vector_store=vs,
        config=config,
        api_key="test-key",
    )

    result = pipeline.query("What is the capital of France?")

    assert "couldn't find" in result["answer"].lower()
    assert len(result["sources"]) == 0
    assert result["confidence"] == 0.0
