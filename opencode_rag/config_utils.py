"""
Utility functions for creating configured component instances.
"""
import os
from dotenv import load_dotenv
from config import RAGConfig, get_config

load_dotenv()


def get_api_key(provider: str) -> str:
    """
    Get API key for specified provider.

    Args:
        provider: LLM provider name

    Returns:
        API key string

    Raises:
        ValueError: If API key not found
    """
    key_map = {
        "openai": "OPENAI_API_KEY",
        "openrouter": "OPENROUTER_API_KEY",
        "gemini": "GOOGLE_API_KEY",
    }

    env_var = key_map.get(provider)
    if not env_var:
        raise ValueError(f"Unknown provider: {provider}")

    api_key = os.getenv(env_var)
    if not api_key:
        raise ValueError(f"{env_var} not found in environment variables")

    return api_key


def create_vector_store(config: RAGConfig):
    """
    Create and return a VectorStore instance.

    Args:
        config: RAG configuration

    Returns:
        VectorStore instance
    """
    from vector_store import VectorStore

    return VectorStore(
        embedding_model=config.embedding_model,
        persist_directory=config.persist_directory,
        collection_name=config.collection_name,
    )


def create_rag_pipeline(config: RAGConfig):
    """
    Create and return a RAGPipeline instance.

    Args:
        config: RAG configuration

    Returns:
        RAGPipeline instance
    """
    from rag_pipeline import RAGPipeline

    api_key = get_api_key(config.llm_provider)
    vector_store = create_vector_store(config)

    return RAGPipeline(
        vector_store=vector_store,
        config=config,
        api_key=api_key,
    )


def get_configured_pipeline(profile: str = None):
    """
    Get a fully configured RAG pipeline.

    Args:
        profile: Configuration profile name (defaults to env or 'balanced')

    Returns:
        RAGPipeline instance
    """
    if profile is None:
        profile = os.getenv("CONFIG_PROFILE", "balanced")

    config = get_config(profile)
    return create_rag_pipeline(config)
