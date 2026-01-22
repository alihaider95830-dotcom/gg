"""
Configuration management for RAG system with predefined profiles.
"""
from dataclasses import dataclass
from typing import Literal, Optional


@dataclass
class RAGConfig:
    """Configuration for RAG system components."""

    # Embedding Model
    embedding_model: str = "all-MiniLM-L6-v2"

    # Chunking Parameters
    chunk_size: int = 500
    chunk_overlap: int = 50
    use_token_chunking: bool = True

    # Retrieval Parameters
    top_k: int = 3
    use_reranking: bool = False
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"

    # LLM Parameters
    llm_provider: Literal["openai", "openrouter", "gemini"] = "gemini"
    llm_model: str = "gemini-1.5-flash"
    temperature: float = 0.1
    max_tokens: int = 500

    # Context Management
    max_context_length: int = 2000
    compress_context: bool = True

    # Grounding Verification
    enable_grounding_check: bool = True
    grounding_threshold: float = 0.7

    # Vector Store
    persist_directory: str = "./chroma_db"
    collection_name: str = "squad_docs"

    # System Prompts
    system_prompt: str = """You are a helpful AI assistant that answers questions based on the provided context.
Only use information from the given context to answer questions.
If the context doesn't contain enough information to answer the question, say so clearly.
Always cite which context number you're using by referring to [Context N]."""


# Predefined Configuration Profiles

PROFILES = {
    "fast": RAGConfig(
        embedding_model="all-MiniLM-L6-v2",
        chunk_size=300,
        chunk_overlap=30,
        top_k=2,
        use_reranking=False,
        llm_provider="openai",
        llm_model="gpt-3.5-turbo",
        temperature=0.1,
        max_tokens=300,
        max_context_length=1000,
    ),

    "balanced": RAGConfig(
        embedding_model="all-MiniLM-L6-v2",
        chunk_size=500,
        chunk_overlap=50,
        top_k=3,
        use_reranking=False,
        llm_provider="gemini",
        llm_model="gemini-1.5-flash",
        temperature=0.1,
        max_tokens=500,
        max_context_length=2000,
    ),

    "accurate": RAGConfig(
        embedding_model="all-mpnet-base-v2",
        chunk_size=700,
        chunk_overlap=100,
        top_k=5,
        use_reranking=True,
        llm_provider="openai",
        llm_model="gpt-4",
        temperature=0.0,
        max_tokens=800,
        max_context_length=3000,
    ),

    "gemini": RAGConfig(
        embedding_model="all-MiniLM-L6-v2",
        chunk_size=500,
        chunk_overlap=50,
        top_k=3,
        use_reranking=False,
        llm_provider="gemini",
        llm_model="gemini-1.5-flash",
        temperature=0.1,
        max_tokens=500,
        max_context_length=2000,
    ),

    "default": RAGConfig(),
}


def get_config(profile: str = "balanced") -> RAGConfig:
    """
    Get configuration by profile name.

    Args:
        profile: Name of the configuration profile

    Returns:
        RAGConfig instance
    """
    if profile not in PROFILES:
        print(f"Warning: Profile '{profile}' not found. Using 'balanced' profile.")
        profile = "balanced"

    return PROFILES[profile]
