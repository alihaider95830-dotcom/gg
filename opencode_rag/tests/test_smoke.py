"""
Smoke tests for basic functionality.
"""
import pytest
from config import get_config, PROFILES


def test_config_profiles():
    """Test that all config profiles are valid."""
    for profile_name in PROFILES.keys():
        config = get_config(profile_name)
        assert config is not None
        assert config.embedding_model
        assert config.llm_model
        assert config.chunk_size > 0
        assert config.top_k > 0


def test_config_default():
    """Test default configuration."""
    config = get_config("balanced")
    assert config.embedding_model == "all-MiniLM-L6-v2"
    assert config.chunk_size == 500
    assert config.top_k == 3


def test_config_invalid_profile():
    """Test handling of invalid profile."""
    config = get_config("nonexistent_profile")
    assert config is not None  # Should fallback to balanced


def test_fast_profile():
    """Test fast profile configuration."""
    config = get_config("fast")
    assert config.chunk_size == 300
    assert config.top_k == 2
    assert config.llm_model == "gpt-3.5-turbo"


def test_accurate_profile():
    """Test accurate profile configuration."""
    config = get_config("accurate")
    assert config.chunk_size == 700
    assert config.top_k == 5
    assert config.use_reranking is True
    assert config.llm_model == "gpt-4"


def test_gemini_profile():
    """Test gemini profile configuration."""
    config = get_config("gemini")
    assert config.llm_provider == "gemini"
    assert config.llm_model == "gemini-1.5-flash"
