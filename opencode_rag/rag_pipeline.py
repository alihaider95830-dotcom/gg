"""
RAG Pipeline orchestrating retrieval, context compression, and generation.
"""
import openai
import google.generativeai as genai
from sentence_transformers import CrossEncoder
from typing import List, Dict, Optional
from config import RAGConfig
from vector_store import VectorStore


class RAGPipeline:
    """End-to-end RAG pipeline."""

    def __init__(
        self,
        vector_store: VectorStore,
        config: RAGConfig,
        api_key: str,
    ):
        """
        Initialize RAG pipeline.

        Args:
            vector_store: VectorStore instance
            config: RAG configuration
            api_key: API key for LLM provider
        """
        self.vector_store = vector_store
        self.config = config
        self.api_key = api_key

        # Initialize reranker if enabled
        self.reranker = None
        if config.use_reranking:
            self.reranker = CrossEncoder(config.reranker_model)

        # Configure LLM client
        self.openai_client = None
        self._configure_llm()

    def _configure_llm(self):
        """Configure LLM client based on provider."""
        if self.config.llm_provider == "openai":
            self.openai_client = openai.OpenAI(api_key=self.api_key)

        elif self.config.llm_provider == "openrouter":
            self.openai_client = openai.OpenAI(
                api_key=self.api_key,
                base_url="https://openrouter.ai/api/v1"
            )

        elif self.config.llm_provider == "gemini":
            genai.configure(api_key=self.api_key)

    def _retrieve_documents(self, query: str) -> List[Dict]:
        """
        Retrieve relevant documents.

        Args:
            query: User query

        Returns:
            List of retrieved documents
        """
        return self.vector_store.search(
            query=query,
            top_k=self.config.top_k,
            reranker=self.reranker,
        )

    def _compress_context(self, documents: List[Dict]) -> str:
        """
        Compress and format context from documents.

        Args:
            documents: Retrieved documents

        Returns:
            Formatted context string
        """
        context_parts = []
        current_length = 0

        for i, doc in enumerate(documents):
            text = doc["text"]

            # Simple compression: truncate if needed
            if self.config.compress_context:
                if current_length + len(text) > self.config.max_context_length:
                    remaining = self.config.max_context_length - current_length
                    if remaining > 100:  # Only add if meaningful
                        text = text[:remaining] + "..."
                    else:
                        break

            context_part = f"[Context {i+1}]\n{text}\n"
            context_parts.append(context_part)
            current_length += len(text)

            if current_length >= self.config.max_context_length:
                break

        return "\n".join(context_parts)

    def _generate_answer(self, query: str, context: str) -> str:
        """
        Generate answer using LLM.

        Args:
            query: User query
            context: Retrieved context

        Returns:
            Generated answer
        """
        # Note: prompt injection risk mitigation is limited without structured output enforcement
        # or strict separation tokens supported by all models.
        # We rely on the role separation in chat format below.

        if self.config.llm_provider in ["openai", "openrouter"]:
            if not self.openai_client:
                raise ValueError("OpenAI client not initialized")

            response = self.openai_client.chat.completions.create(
                model=self.config.llm_model,
                messages=[
                    {"role": "system", "content": self.config.system_prompt},
                    {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
                ],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
            )
            return response.choices[0].message.content.strip()

        elif self.config.llm_provider == "gemini":
            prompt = f"""{self.config.system_prompt}

Context:
{context}

Question: {query}

Answer:"""
            model = genai.GenerativeModel(self.config.llm_model)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.config.temperature,
                    max_output_tokens=self.config.max_tokens,
                ),
            )
            return response.text.strip()

        else:
            raise ValueError(f"Unsupported LLM provider: {self.config.llm_provider}")

    def _verify_grounding(self, answer: str, contexts: List[str]) -> float:
        """
        Verify if answer is grounded in context.

        Args:
            answer: Generated answer
            contexts: List of context strings

        Returns:
            Confidence score (0-1)
        """
        if not self.config.enable_grounding_check:
            return 1.0

        # Simple word overlap check
        answer_words = set(answer.lower().split())
        context_text = " ".join(contexts).lower()
        context_words = set(context_text.split())

        if not answer_words:
            return 0.0

        overlap = len(answer_words & context_words)
        score = overlap / len(answer_words)

        return min(score, 1.0)

    def query(self, query: str) -> Dict:
        """
        Process a query through the RAG pipeline.

        Args:
            query: User query

        Returns:
            Dict with answer, sources, and metadata
        """
        # Step 1: Retrieve documents
        documents = self._retrieve_documents(query)

        if not documents:
            return {
                "answer": "I couldn't find any relevant information to answer your question.",
                "sources": [],
                "confidence": 0.0,
            }

        # Step 2: Compress context
        context = self._compress_context(documents)

        # Step 3: Generate answer
        answer = self._generate_answer(query, context)

        # Step 4: Verify grounding
        contexts = [doc["text"] for doc in documents]
        confidence = self._verify_grounding(answer, contexts)

        # Format sources
        sources = []
        for i, doc in enumerate(documents):
            sources.append({
                "context_number": i + 1,
                "text": doc["text"][:200] + "..." if len(doc["text"]) > 200 else doc["text"],
                "metadata": doc.get("metadata", {}),
                "score": doc.get("score", 0.0),
            })

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
            "retrieval_count": len(documents),
        }
