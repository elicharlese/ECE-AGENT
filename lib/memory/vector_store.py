"""
Free Vector Store - In-memory vector store for AGENT LLM system
Provides semantic search and example retrieval without external dependencies
"""

import numpy as np
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import hashlib
import re
from collections import defaultdict

logger = logging.getLogger(__name__)

class FreeVectorStore:
    """
    In-memory vector store using simple TF-IDF and cosine similarity
    No external dependencies - works entirely in memory
    """
    
    def __init__(self, max_examples: int = 10000):
        """
        Initialize the vector store
        
        Args:
            max_examples: Maximum number of examples to store
        """
        self.max_examples = max_examples
        self.examples = []
        self.vectors = []
        self.metadata = []
        self.vocabulary = set()
        self.idf_scores = {}
        self.next_id = 1
        
        # Statistics
        self.stats = {
            "total_examples": 0,
            "total_searches": 0,
            "average_similarity": 0.0,
            "last_updated": datetime.now().isoformat()
        }
        
        logger.info("FreeVectorStore initialized")
    
    def _preprocess_text(self, text: str) -> List[str]:
        """Preprocess text for vectorization"""
        # Convert to lowercase and split into words
        text = text.lower()
        # Remove punctuation and split
        words = re.findall(r'\b\w+\b', text)
        # Filter out very short words
        words = [word for word in words if len(word) > 2]
        return words
    
    def _compute_tf_idf(self, text: str) -> Dict[str, float]:
        """Compute TF-IDF vector for text"""
        words = self._preprocess_text(text)
        
        # Term frequency
        tf = defaultdict(int)
        for word in words:
            tf[word] += 1
        
        # Normalize by document length
        doc_length = len(words)
        if doc_length > 0:
            tf = {word: count / doc_length for word, count in tf.items()}
        
        # Apply IDF scores
        tf_idf = {}
        for word, tf_score in tf.items():
            idf_score = self.idf_scores.get(word, 1.0)
            tf_idf[word] = tf_score * idf_score
        
        return tf_idf
    
    def _update_idf_scores(self):
        """Update IDF scores based on current examples"""
        if not self.examples:
            return
        
        total_docs = len(self.examples)
        word_doc_counts = defaultdict(int)
        
        # Count documents containing each word
        for example in self.examples:
            words = set(self._preprocess_text(example["text"]))
            for word in words:
                word_doc_counts[word] += 1
        
        # Compute IDF scores
        self.idf_scores = {}
        for word, doc_count in word_doc_counts.items():
            self.idf_scores[word] = np.log(total_docs / doc_count)
    
    def _vectorize_text(self, text: str) -> np.ndarray:
        """Convert text to vector representation"""
        tf_idf = self._compute_tf_idf(text)
        
        # Create vector with vocabulary size
        vector = np.zeros(len(self.vocabulary))
        vocab_list = list(self.vocabulary)
        
        for word, score in tf_idf.items():
            if word in self.vocabulary:
                idx = vocab_list.index(word)
                vector[idx] = score
        
        # Normalize vector
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        
        return vector
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity between two vectors"""
        if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
            return 0.0
        
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def add_example(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        example_id: Optional[str] = None
    ) -> str:
        """
        Add an example to the vector store
        
        Args:
            text: Example text content
            metadata: Optional metadata dictionary
            example_id: Optional custom ID
            
        Returns:
            Example ID
        """
        if len(self.examples) >= self.max_examples:
            # Remove oldest example
            self.examples.pop(0)
            self.vectors.pop(0)
            self.metadata.pop(0)
        
        # Generate ID if not provided
        if example_id is None:
            example_id = f"example_{self.next_id}"
            self.next_id += 1
        
        # Prepare metadata
        meta = metadata or {}
        meta.update({
            "id": example_id,
            "created_at": datetime.now().isoformat(),
            "text_length": len(text)
        })
        
        # Add to examples
        example = {
            "id": example_id,
            "text": text,
            "metadata": meta
        }
        
        self.examples.append(example)
        
        # Update vocabulary
        words = self._preprocess_text(text)
        self.vocabulary.update(words)
        
        # Update IDF scores
        self._update_idf_scores()
        
        # Vectorize and store
        vector = self._vectorize_text(text)
        self.vectors.append(vector)
        self.metadata.append(meta)
        
        # Update statistics
        self.stats["total_examples"] = len(self.examples)
        self.stats["last_updated"] = datetime.now().isoformat()
        
        logger.info(f"Added example {example_id} to vector store")
        return example_id
    
    def search_similar(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
        min_similarity: float = 0.1
    ) -> List[Dict[str, Any]]:
        """
        Search for similar examples
        
        Args:
            query: Search query
            n_results: Number of results to return
            where: Optional metadata filter
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of similar examples with similarity scores
        """
        if not self.examples:
            return []
        
        # Vectorize query
        query_vector = self._vectorize_text(query)
        
        # Compute similarities
        similarities = []
        for i, vector in enumerate(self.vectors):
            similarity = self._cosine_similarity(query_vector, vector)
            
            # Apply metadata filter if provided
            if where:
                meta = self.metadata[i]
                if not all(meta.get(key) == value for key, value in where.items()):
                    continue
            
            if similarity >= min_similarity:
                similarities.append((i, similarity))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Return top results
        results = []
        for i, similarity in similarities[:n_results]:
            example = self.examples[i].copy()
            example["similarity_score"] = similarity
            results.append(example)
        
        # Update statistics
        self.stats["total_searches"] += 1
        if results:
            avg_sim = sum(r["similarity_score"] for r in results) / len(results)
            self.stats["average_similarity"] = avg_sim
        
        logger.info(f"Found {len(results)} similar examples for query")
        return results
    
    def get_example(self, example_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific example by ID"""
        for example in self.examples:
            if example["id"] == example_id:
                return example
        return None
    
    def update_example(self, example_id: str, text: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Update an existing example"""
        for i, example in enumerate(self.examples):
            if example["id"] == example_id:
                # Update text
                example["text"] = text
                
                # Update metadata
                if metadata:
                    example["metadata"].update(metadata)
                
                # Re-vectorize
                self.vectors[i] = self._vectorize_text(text)
                
                # Update vocabulary and IDF
                words = self._preprocess_text(text)
                self.vocabulary.update(words)
                self._update_idf_scores()
                
                logger.info(f"Updated example {example_id}")
                return True
        
        return False
    
    def delete_example(self, example_id: str) -> bool:
        """Delete an example by ID"""
        for i, example in enumerate(self.examples):
            if example["id"] == example_id:
                del self.examples[i]
                del self.vectors[i]
                del self.metadata[i]
                
                # Update vocabulary and IDF
                self._update_idf_scores()
                
                # Update statistics
                self.stats["total_examples"] = len(self.examples)
                self.stats["last_updated"] = datetime.now().isoformat()
                
                logger.info(f"Deleted example {example_id}")
                return True
        
        return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        return {
            "total_examples": len(self.examples),
            "vocabulary_size": len(self.vocabulary),
            "max_examples": self.max_examples,
            "utilization": len(self.examples) / self.max_examples,
            "stats": self.stats.copy()
        }
    
    def clear(self) -> None:
        """Clear all examples from the store"""
        self.examples.clear()
        self.vectors.clear()
        self.metadata.clear()
        self.vocabulary.clear()
        self.idf_scores.clear()
        self.next_id = 1
        
        self.stats = {
            "total_examples": 0,
            "total_searches": 0,
            "average_similarity": 0.0,
            "last_updated": datetime.now().isoformat()
        }
        
        logger.info("Vector store cleared")
    
    def export_examples(self) -> List[Dict[str, Any]]:
        """Export all examples"""
        return self.examples.copy()
    
    def import_examples(self, examples: List[Dict[str, Any]]) -> None:
        """Import examples from a list"""
        for example in examples:
            self.add_example(
                text=example["text"],
                metadata=example.get("metadata", {}),
                example_id=example.get("id")
            )
    
    def initialize_with_default_examples(self) -> None:
        """Initialize with some default examples for each agent mode"""
        
        default_examples = [
            # Smart Assistant examples
            {
                "text": "How can I organize my daily tasks more effectively?",
                "metadata": {"mode": "smart_assistant", "category": "productivity"}
            },
            {
                "text": "What's the best way to schedule meetings with multiple time zones?",
                "metadata": {"mode": "smart_assistant", "category": "scheduling"}
            },
            {
                "text": "Help me create a weekly planning routine",
                "metadata": {"mode": "smart_assistant", "category": "planning"}
            },
            
            # Code Companion examples
            {
                "text": "How do I debug a Python function that's returning None?",
                "metadata": {"mode": "code_companion", "category": "debugging"}
            },
            {
                "text": "What's the best way to structure a React component?",
                "metadata": {"mode": "code_companion", "category": "architecture"}
            },
            {
                "text": "How can I optimize database queries for better performance?",
                "metadata": {"mode": "code_companion", "category": "optimization"}
            },
            
            # Creative Writer examples
            {
                "text": "Help me develop a compelling character for my story",
                "metadata": {"mode": "creative_writer", "category": "character_development"}
            },
            {
                "text": "How do I write engaging dialogue between two characters?",
                "metadata": {"mode": "creative_writer", "category": "dialogue"}
            },
            {
                "text": "What are some techniques for building suspense in a narrative?",
                "metadata": {"mode": "creative_writer", "category": "storytelling"}
            },
            
            # Legal Assistant examples
            {
                "text": "What should I look for when reviewing a software license agreement?",
                "metadata": {"mode": "legal_assistant", "category": "contract_review"}
            },
            {
                "text": "How do I ensure my website complies with GDPR requirements?",
                "metadata": {"mode": "legal_assistant", "category": "compliance"}
            },
            {
                "text": "What are the key elements of a privacy policy?",
                "metadata": {"mode": "legal_assistant", "category": "legal_documents"}
            },
            
            # Designer Agent examples
            {
                "text": "How can I improve the user experience of my mobile app?",
                "metadata": {"mode": "designer_agent", "category": "ux_design"}
            },
            {
                "text": "What color combinations work well for a professional website?",
                "metadata": {"mode": "designer_agent", "category": "visual_design"}
            },
            {
                "text": "How do I make my interface more accessible to users with disabilities?",
                "metadata": {"mode": "designer_agent", "category": "accessibility"}
            }
        ]
        
        for example in default_examples:
            self.add_example(
                text=example["text"],
                metadata=example["metadata"]
            )
        
        logger.info(f"Initialized vector store with {len(default_examples)} default examples")