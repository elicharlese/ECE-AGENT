"""
Enhanced AGENT System - Advanced Memory Systems with Vector Database
Batch 3: Advanced AI Features & Production Optimizations

Vector database integration for semantic search, long-term memory,
and context optimization for the multi-agent system.
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import hashlib
import uuid
from enum import Enum

# Vector database dependencies
try:
    import chromadb
    from chromadb.config import Settings
    import sentence_transformers
    from sentence_transformers import SentenceTransformer
except ImportError:
    chromadb = None
    sentence_transformers = None
    SentenceTransformer = None

logger = logging.getLogger(__name__)

class MemoryType(Enum):
    """Types of memory storage"""
    EPISODIC = "episodic"        # Specific events and conversations
    SEMANTIC = "semantic"        # General knowledge and facts
    PROCEDURAL = "procedural"    # Skills and procedures
    WORKING = "working"          # Temporary context
    LONG_TERM = "long_term"      # Persistent memories

class MemoryPriority(Enum):
    """Memory priority levels"""
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    TEMPORARY = 1

@dataclass
class MemoryItem:
    """Individual memory item"""
    id: str
    content: str
    memory_type: MemoryType
    priority: MemoryPriority
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)
    access_count: int = 0
    importance_score: float = 0.5
    tags: List[str] = field(default_factory=list)
    related_memories: List[str] = field(default_factory=list)

@dataclass
class SearchResult:
    """Search result from vector database"""
    memory_item: MemoryItem
    similarity_score: float
    relevance_score: float

class VectorMemorySystem:
    """
    Advanced vector-based memory system with semantic search,
    memory consolidation, and context optimization
    """
    
    def __init__(self, persist_directory: str = "./vector_memory"):
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None
        self.embedding_model = None
        self.memory_cache: Dict[str, MemoryItem] = {}
        self.max_cache_size = 1000
        
        # Memory management settings
        self.max_working_memory = 50
        self.consolidation_threshold = 100
        self.decay_factor = 0.95
        self.min_importance_threshold = 0.1
        
        # Initialize the system
        asyncio.create_task(self._initialize_system())
    
    async def _initialize_system(self):
        """Initialize vector database and embedding model"""
        try:
            if not chromadb:
                logger.warning("ChromaDB not available - using mock vector memory")
                return
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    chroma_db_impl="duckdb+parquet",
                    persist_directory=self.persist_directory
                )
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name="agent_memory",
                metadata={"hnsw:space": "cosine"}
            )
            
            # Initialize embedding model
            if sentence_transformers:
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("Vector memory system initialized with sentence transformers")
            else:
                logger.warning("Sentence transformers not available - using mock embeddings")
            
            # Start background tasks
            asyncio.create_task(self._memory_consolidation_task())
            asyncio.create_task(self._memory_decay_task())
            
        except Exception as e:
            logger.error(f"Failed to initialize vector memory system: {e}")
    
    async def store_memory(self, content: str, memory_type: MemoryType, 
                          priority: MemoryPriority = MemoryPriority.MEDIUM,
                          metadata: Optional[Dict[str, Any]] = None,
                          tags: Optional[List[str]] = None) -> str:
        """
        Store a new memory item
        
        Args:
            content: Memory content
            memory_type: Type of memory
            priority: Memory priority
            metadata: Additional metadata
            tags: Memory tags
            
        Returns:
            Memory ID
        """
        memory_id = str(uuid.uuid4())
        
        # Create memory item
        memory_item = MemoryItem(
            id=memory_id,
            content=content,
            memory_type=memory_type,
            priority=priority,
            metadata=metadata or {},
            tags=tags or [],
            importance_score=self._calculate_importance(content, priority, metadata)
        )
        
        # Generate embedding
        if self.embedding_model:
            embedding = self.embedding_model.encode(content).tolist()
            memory_item.embedding = embedding
        else:
            # Mock embedding for testing
            embedding = np.random.random(384).tolist()
            memory_item.embedding = embedding
        
        # Store in vector database
        await self._store_in_vector_db(memory_item)
        
        # Cache the memory
        self._cache_memory(memory_item)
        
        logger.info(f"Stored memory: {memory_id} ({memory_type.value})")
        return memory_id
    
    async def search_memories(self, query: str, memory_types: Optional[List[MemoryType]] = None,
                             limit: int = 10, min_similarity: float = 0.3) -> List[SearchResult]:
        """
        Search memories using semantic similarity
        
        Args:
            query: Search query
            memory_types: Filter by memory types
            limit: Maximum results
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of search results
        """
        try:
            if not self.collection or not self.embedding_model:
                return await self._mock_search(query, limit)
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Prepare filter
            where_filter = {}
            if memory_types:
                where_filter["memory_type"] = {"$in": [mt.value for mt in memory_types]}
            
            # Search vector database
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where_filter if where_filter else None
            )
            
            # Process results
            search_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    distance = results['distances'][0][i]
                    similarity = 1 - distance  # Convert distance to similarity
                    
                    if similarity >= min_similarity:
                        metadata = results['metadatas'][0][i]
                        memory_id = results['ids'][0][i]
                        
                        # Reconstruct memory item
                        memory_item = await self._get_memory_by_id(memory_id)
                        if memory_item:
                            relevance = self._calculate_relevance(memory_item, query, similarity)
                            
                            search_results.append(SearchResult(
                                memory_item=memory_item,
                                similarity_score=similarity,
                                relevance_score=relevance
                            ))
            
            # Sort by relevance
            search_results.sort(key=lambda x: x.relevance_score, reverse=True)
            
            # Update access counts
            for result in search_results:
                await self._update_access_count(result.memory_item.id)
            
            return search_results
            
        except Exception as e:
            logger.error(f"Memory search failed: {e}")
            return []
    
    async def get_contextual_memories(self, current_context: str, 
                                    conversation_history: List[str],
                                    limit: int = 5) -> List[MemoryItem]:
        """
        Get contextually relevant memories for current conversation
        
        Args:
            current_context: Current conversation context
            conversation_history: Recent conversation history
            limit: Maximum memories to return
            
        Returns:
            List of relevant memories
        """
        # Combine context and history for search
        combined_query = f"{current_context} {' '.join(conversation_history[-3:])}"
        
        # Search for relevant memories
        search_results = await self.search_memories(
            query=combined_query,
            memory_types=[MemoryType.EPISODIC, MemoryType.SEMANTIC],
            limit=limit * 2,  # Get more to filter
            min_similarity=0.4
        )
        
        # Filter and rank by context relevance
        contextual_memories = []
        for result in search_results:
            memory = result.memory_item
            
            # Skip very recent memories (avoid redundancy)
            if (datetime.now() - memory.created_at).total_seconds() < 300:  # 5 minutes
                continue
            
            # Boost importance based on access patterns
            boosted_relevance = result.relevance_score * (1 + memory.access_count * 0.1)
            
            contextual_memories.append((memory, boosted_relevance))
            
            if len(contextual_memories) >= limit:
                break
        
        # Sort by boosted relevance and return memories
        contextual_memories.sort(key=lambda x: x[1], reverse=True)
        return [memory for memory, _ in contextual_memories]
    
    async def consolidate_memories(self) -> Dict[str, int]:
        """
        Consolidate related memories and remove duplicates
        
        Returns:
            Consolidation statistics
        """
        stats = {"consolidated": 0, "removed": 0, "merged": 0}
        
        try:
            if not self.collection:
                return stats
            
            # Get all memories
            all_memories = self.collection.get()
            
            if not all_memories['documents']:
                return stats
            
            # Group similar memories
            similarity_groups = []
            processed_ids = set()
            
            for i, doc in enumerate(all_memories['documents']):
                memory_id = all_memories['ids'][i]
                
                if memory_id in processed_ids:
                    continue
                
                # Find similar memories
                similar_memories = [memory_id]
                processed_ids.add(memory_id)
                
                for j, other_doc in enumerate(all_memories['documents']):
                    if i == j:
                        continue
                    
                    other_id = all_memories['ids'][j]
                    if other_id in processed_ids:
                        continue
                    
                    # Calculate similarity (simplified)
                    similarity = self._calculate_text_similarity(doc, other_doc)
                    
                    if similarity > 0.8:  # High similarity threshold
                        similar_memories.append(other_id)
                        processed_ids.add(other_id)
                
                if len(similar_memories) > 1:
                    similarity_groups.append(similar_memories)
            
            # Consolidate similar memories
            for group in similarity_groups:
                await self._merge_memories(group)
                stats["consolidated"] += 1
                stats["merged"] += len(group) - 1
            
            # Remove low-importance memories
            removed_count = await self._cleanup_low_importance_memories()
            stats["removed"] = removed_count
            
            logger.info(f"Memory consolidation completed: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Memory consolidation failed: {e}")
            return stats
    
    async def get_memory_statistics(self) -> Dict[str, Any]:
        """Get comprehensive memory statistics"""
        try:
            if not self.collection:
                return {"error": "Vector database not available"}
            
            # Get collection info
            collection_count = self.collection.count()
            
            # Memory type distribution
            type_distribution = {}
            priority_distribution = {}
            
            # Get sample of memories for analysis
            sample_memories = self.collection.get(limit=min(1000, collection_count))
            
            if sample_memories['metadatas']:
                for metadata in sample_memories['metadatas']:
                    mem_type = metadata.get('memory_type', 'unknown')
                    priority = metadata.get('priority', 'unknown')
                    
                    type_distribution[mem_type] = type_distribution.get(mem_type, 0) + 1
                    priority_distribution[priority] = priority_distribution.get(priority, 0) + 1
            
            return {
                "total_memories": collection_count,
                "cached_memories": len(self.memory_cache),
                "type_distribution": type_distribution,
                "priority_distribution": priority_distribution,
                "cache_hit_rate": getattr(self, '_cache_hit_rate', 0.0),
                "avg_similarity_threshold": 0.3,
                "consolidation_threshold": self.consolidation_threshold,
                "last_consolidation": getattr(self, '_last_consolidation', None)
            }
            
        except Exception as e:
            logger.error(f"Failed to get memory statistics: {e}")
            return {"error": str(e)}
    
    def _calculate_importance(self, content: str, priority: MemoryPriority, 
                            metadata: Optional[Dict[str, Any]]) -> float:
        """Calculate importance score for memory"""
        base_score = priority.value / 5.0  # Normalize to 0-1
        
        # Boost based on content characteristics
        content_lower = content.lower()
        
        # Important keywords boost
        important_keywords = ['error', 'critical', 'important', 'remember', 'key', 'vital']
        keyword_boost = sum(0.1 for keyword in important_keywords if keyword in content_lower)
        
        # Length consideration (moderate length preferred)
        length_score = min(1.0, len(content) / 500) * 0.1
        
        # Metadata boost
        metadata_boost = 0.0
        if metadata:
            if metadata.get('user_flagged'):
                metadata_boost += 0.2
            if metadata.get('system_critical'):
                metadata_boost += 0.3
        
        final_score = min(1.0, base_score + keyword_boost + length_score + metadata_boost)
        return final_score
    
    def _calculate_relevance(self, memory_item: MemoryItem, query: str, similarity: float) -> float:
        """Calculate relevance score combining similarity and other factors"""
        base_relevance = similarity
        
        # Boost based on importance
        importance_boost = memory_item.importance_score * 0.2
        
        # Boost based on recency (decay over time)
        time_diff = (datetime.now() - memory_item.last_accessed).total_seconds()
        recency_boost = max(0, (86400 - time_diff) / 86400) * 0.1  # 24 hour decay
        
        # Boost based on access frequency
        frequency_boost = min(0.2, memory_item.access_count * 0.01)
        
        return min(1.0, base_relevance + importance_boost + recency_boost + frequency_boost)
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Simple text similarity calculation"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    async def _store_in_vector_db(self, memory_item: MemoryItem):
        """Store memory item in vector database"""
        try:
            if self.collection and memory_item.embedding:
                self.collection.add(
                    embeddings=[memory_item.embedding],
                    documents=[memory_item.content],
                    metadatas=[{
                        "memory_type": memory_item.memory_type.value,
                        "priority": memory_item.priority.value,
                        "created_at": memory_item.created_at.isoformat(),
                        "importance_score": memory_item.importance_score,
                        "tags": json.dumps(memory_item.tags),
                        **memory_item.metadata
                    }],
                    ids=[memory_item.id]
                )
        except Exception as e:
            logger.error(f"Failed to store in vector DB: {e}")
    
    async def _get_memory_by_id(self, memory_id: str) -> Optional[MemoryItem]:
        """Get memory item by ID"""
        # Check cache first
        if memory_id in self.memory_cache:
            return self.memory_cache[memory_id]
        
        # Query vector database
        try:
            if not self.collection:
                return None
            
            results = self.collection.get(ids=[memory_id])
            
            if results['documents'] and results['documents'][0]:
                doc = results['documents'][0]
                metadata = results['metadatas'][0]
                
                memory_item = MemoryItem(
                    id=memory_id,
                    content=doc,
                    memory_type=MemoryType(metadata['memory_type']),
                    priority=MemoryPriority(metadata['priority']),
                    created_at=datetime.fromisoformat(metadata['created_at']),
                    importance_score=metadata['importance_score'],
                    tags=json.loads(metadata.get('tags', '[]')),
                    metadata={k: v for k, v in metadata.items() 
                             if k not in ['memory_type', 'priority', 'created_at', 'importance_score', 'tags']}
                )
                
                # Cache the memory
                self._cache_memory(memory_item)
                return memory_item
                
        except Exception as e:
            logger.error(f"Failed to get memory by ID: {e}")
        
        return None
    
    async def _update_access_count(self, memory_id: str):
        """Update access count for memory"""
        memory_item = await self._get_memory_by_id(memory_id)
        if memory_item:
            memory_item.access_count += 1
            memory_item.last_accessed = datetime.now()
            
            # Update in cache
            self.memory_cache[memory_id] = memory_item
    
    def _cache_memory(self, memory_item: MemoryItem):
        """Cache memory item"""
        self.memory_cache[memory_item.id] = memory_item
        
        # Limit cache size
        if len(self.memory_cache) > self.max_cache_size:
            # Remove least recently accessed
            oldest_id = min(
                self.memory_cache.keys(),
                key=lambda x: self.memory_cache[x].last_accessed
            )
            del self.memory_cache[oldest_id]
    
    async def _mock_search(self, query: str, limit: int) -> List[SearchResult]:
        """Mock search implementation for testing"""
        mock_memories = [
            MemoryItem(
                id=f"mock_{i}",
                content=f"Mock memory {i} related to: {query[:30]}",
                memory_type=MemoryType.SEMANTIC,
                priority=MemoryPriority.MEDIUM,
                importance_score=0.7
            )
            for i in range(min(3, limit))
        ]
        
        return [
            SearchResult(
                memory_item=memory,
                similarity_score=0.8 - i * 0.1,
                relevance_score=0.7 - i * 0.1
            )
            for i, memory in enumerate(mock_memories)
        ]
    
    async def _merge_memories(self, memory_ids: List[str]):
        """Merge similar memories"""
        # Implementation for merging similar memories
        # This would combine content and update embeddings
        pass
    
    async def _cleanup_low_importance_memories(self) -> int:
        """Remove memories below importance threshold"""
        # Implementation for cleaning up low-importance memories
        return 0
    
    async def _memory_consolidation_task(self):
        """Background task for memory consolidation"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                if self.collection and self.collection.count() > self.consolidation_threshold:
                    await self.consolidate_memories()
                    self._last_consolidation = datetime.now()
                    
            except Exception as e:
                logger.error(f"Memory consolidation task error: {e}")
    
    async def _memory_decay_task(self):
        """Background task for memory decay"""
        while True:
            try:
                await asyncio.sleep(86400)  # Run daily
                
                # Apply decay to importance scores
                # Implementation would update importance scores based on time and access
                
            except Exception as e:
                logger.error(f"Memory decay task error: {e}")

# Global instance
vector_memory_system = VectorMemorySystem()

# Convenience functions
async def store_conversation_memory(content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    """Store conversation memory"""
    return await vector_memory_system.store_memory(
        content=content,
        memory_type=MemoryType.EPISODIC,
        priority=MemoryPriority.MEDIUM,
        metadata=metadata
    )

async def store_knowledge_memory(content: str, tags: Optional[List[str]] = None) -> str:
    """Store knowledge memory"""
    return await vector_memory_system.store_memory(
        content=content,
        memory_type=MemoryType.SEMANTIC,
        priority=MemoryPriority.HIGH,
        tags=tags
    )

async def search_relevant_memories(query: str, limit: int = 5) -> List[SearchResult]:
    """Search for relevant memories"""
    return await vector_memory_system.search_memories(query, limit=limit)

async def get_contextual_conversation_memories(context: str, history: List[str]) -> List[MemoryItem]:
    """Get contextual memories for conversation"""
    return await vector_memory_system.get_contextual_memories(context, history)

# Example usage and testing
if __name__ == "__main__":
    async def test_vector_memory():
        """Test vector memory system"""
        print("🧠 Testing Vector Memory System")
        print("=" * 40)
        
        # Store some test memories
        test_memories = [
            ("Python is a high-level programming language", MemoryType.SEMANTIC, ["programming", "python"]),
            ("User asked about machine learning algorithms", MemoryType.EPISODIC, ["ml", "conversation"]),
            ("FastAPI is great for building APIs", MemoryType.SEMANTIC, ["api", "fastapi"]),
            ("User had trouble with Docker containers", MemoryType.EPISODIC, ["docker", "help"]),
            ("Neural networks require lots of training data", MemoryType.SEMANTIC, ["ai", "neural-networks"])
        ]
        
        print("\n📝 Storing memories...")
        for content, mem_type, tags in test_memories:
            memory_id = await vector_memory_system.store_memory(
                content=content,
                memory_type=mem_type,
                tags=tags
            )
            print(f"✅ Stored: {memory_id[:8]}... - {content[:50]}")
        
        # Test search
        print("\n🔍 Searching memories...")
        search_queries = [
            "programming languages",
            "machine learning",
            "API development",
            "containerization"
        ]
        
        for query in search_queries:
            results = await vector_memory_system.search_memories(query, limit=3)
            print(f"\nQuery: '{query}'")
            for result in results:
                print(f"  📄 {result.similarity_score:.2f} - {result.memory_item.content[:60]}")
        
        # Test contextual memories
        print("\n🎯 Testing contextual memories...")
        context = "I need help with Python web development"
        history = ["What's the best framework?", "How do I deploy it?"]
        
        contextual = await vector_memory_system.get_contextual_memories(context, history)
        print(f"Found {len(contextual)} contextual memories:")
        for memory in contextual:
            print(f"  🔗 {memory.content[:60]}")
        
        # Get statistics
        print("\n📊 Memory Statistics")
        stats = await vector_memory_system.get_memory_statistics()
        print(json.dumps(stats, indent=2, default=str))
    
    # Run test
    asyncio.run(test_vector_memory())
