"""
Knowledge Base System with GraphQL Integration
Patch 4 Implementation - Batch 2
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import uuid
from dataclasses import dataclass, asdict
from enum import Enum
import sqlite3
import aiosqlite
from pathlib import Path

# GraphQL dependencies
try:
    import graphene
    from graphene import ObjectType, String, List as GrapheneList, Field, Schema, Mutation
    GRAPHQL_AVAILABLE = True
except ImportError:
    GRAPHQL_AVAILABLE = False
    print("Warning: GraphQL dependencies not available. Install with: pip install graphene")

class KnowledgeCategory(Enum):
    TECHNICAL = "technical"
    BUSINESS = "business" 
    LEGAL = "legal"
    SECURITY = "security"
    GENERAL = "general"

class SourceType(Enum):
    CRAWLED = "crawled"
    MANUAL = "manual"
    API = "api"
    TRAINING = "training"

@dataclass
class KnowledgeEntry:
    """Represents a knowledge base entry"""
    id: str
    title: str
    content: str
    category: KnowledgeCategory
    source_type: SourceType
    source_url: Optional[str]
    confidence: float
    relevance_score: float
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    tags: List[str]

@dataclass
class CrawlerBackdoor:
    """Represents a soft backdoor for crawler retraining"""
    id: str
    name: str
    endpoint: str
    is_active: bool
    last_accessed: datetime
    access_count: int
    purpose: str
    security_level: str

class KnowledgeBase:
    """Advanced Knowledge Base with GraphQL integration"""
    
    def __init__(self, db_path: str = "data/knowledge_base.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self.logger = logging.getLogger(__name__)
        self.backdoors: Dict[str, CrawlerBackdoor] = {}
        
    async def initialize(self):
        """Initialize the knowledge base database"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_entries (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    source_url TEXT,
                    confidence REAL NOT NULL,
                    relevance_score REAL NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    metadata TEXT,
                    tags TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS crawler_backdoors (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    is_active INTEGER NOT NULL,
                    last_accessed TEXT,
                    access_count INTEGER DEFAULT 0,
                    purpose TEXT,
                    security_level TEXT DEFAULT 'medium'
                )
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_category ON knowledge_entries(category)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_source_type ON knowledge_entries(source_type)
            """)
            
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_relevance ON knowledge_entries(relevance_score)
            """)
            
            await db.commit()
            
        self.logger.info("Knowledge base initialized successfully")
        await self._load_backdoors()
    
    async def add_entry(self, title: str, content: str, category: KnowledgeCategory,
                       source_type: SourceType, source_url: Optional[str] = None,
                       confidence: float = 0.8, tags: List[str] = None,
                       metadata: Dict[str, Any] = None) -> str:
        """Add a new knowledge entry"""
        entry_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Calculate relevance score based on content quality
        relevance_score = self._calculate_relevance_score(content, confidence)
        
        entry = KnowledgeEntry(
            id=entry_id,
            title=title,
            content=content,
            category=category,
            source_type=source_type,
            source_url=source_url,
            confidence=confidence,
            relevance_score=relevance_score,
            created_at=now,
            updated_at=now,
            metadata=metadata or {},
            tags=tags or []
        )
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO knowledge_entries 
                (id, title, content, category, source_type, source_url, confidence, 
                 relevance_score, created_at, updated_at, metadata, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry.id, entry.title, entry.content, entry.category.value,
                entry.source_type.value, entry.source_url, entry.confidence,
                entry.relevance_score, entry.created_at.isoformat(),
                entry.updated_at.isoformat(), json.dumps(entry.metadata),
                json.dumps(entry.tags)
            ))
            await db.commit()
        
        self.logger.info(f"Added knowledge entry: {title}")
        return entry_id
    
    async def search_entries(self, query: str, category: Optional[KnowledgeCategory] = None,
                           limit: int = 10, min_confidence: float = 0.5) -> List[KnowledgeEntry]:
        """Search knowledge entries"""
        conditions = ["confidence >= ?"]
        params = [min_confidence]
        
        if category:
            conditions.append("category = ?")
            params.append(category.value)
        
        # Simple text search in title and content
        conditions.append("(title LIKE ? OR content LIKE ?)")
        search_term = f"%{query}%"
        params.extend([search_term, search_term])
        
        sql = f"""
            SELECT * FROM knowledge_entries 
            WHERE {' AND '.join(conditions)}
            ORDER BY relevance_score DESC, confidence DESC
            LIMIT ?
        """
        params.append(limit)
        
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(sql, params) as cursor:
                rows = await cursor.fetchall()
        
        entries = []
        for row in rows:
            entries.append(self._row_to_entry(row))
        
        return entries
    
    async def get_entry_by_id(self, entry_id: str) -> Optional[KnowledgeEntry]:
        """Get a specific entry by ID"""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT * FROM knowledge_entries WHERE id = ?", 
                (entry_id,)
            ) as cursor:
                row = await cursor.fetchone()
        
        return self._row_to_entry(row) if row else None
    
    async def update_entry(self, entry_id: str, **updates) -> bool:
        """Update an existing entry"""
        valid_fields = {
            'title', 'content', 'category', 'source_type', 'source_url',
            'confidence', 'metadata', 'tags'
        }
        
        update_fields = []
        params = []
        
        for field, value in updates.items():
            if field in valid_fields:
                if field == 'category':
                    value = value.value if isinstance(value, KnowledgeCategory) else value
                elif field == 'source_type':
                    value = value.value if isinstance(value, SourceType) else value
                elif field in ['metadata', 'tags']:
                    value = json.dumps(value)
                
                update_fields.append(f"{field} = ?")
                params.append(value)
        
        if not update_fields:
            return False
        
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(entry_id)
        
        sql = f"UPDATE knowledge_entries SET {', '.join(update_fields)} WHERE id = ?"
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(sql, params)
            await db.commit()
        
        self.logger.info(f"Updated knowledge entry: {entry_id}")
        return True
    
    async def delete_entry(self, entry_id: str) -> bool:
        """Delete an entry"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "DELETE FROM knowledge_entries WHERE id = ?", 
                (entry_id,)
            )
            await db.commit()
            return cursor.rowcount > 0
    
    def _calculate_relevance_score(self, content: str, confidence: float) -> float:
        """Calculate relevance score based on content quality and confidence"""
        # Basic scoring algorithm
        content_length_score = min(len(content) / 1000, 1.0)  # Longer content gets higher score
        word_count = len(content.split())
        complexity_score = min(word_count / 100, 1.0)  # More words = higher complexity
        
        # Combine factors
        relevance_score = (confidence * 0.5 + content_length_score * 0.3 + complexity_score * 0.2)
        return min(relevance_score, 1.0)
    
    def _row_to_entry(self, row) -> KnowledgeEntry:
        """Convert database row to KnowledgeEntry object"""
        return KnowledgeEntry(
            id=row[0],
            title=row[1],
            content=row[2],
            category=KnowledgeCategory(row[3]),
            source_type=SourceType(row[4]),
            source_url=row[5],
            confidence=row[6],
            relevance_score=row[7],
            created_at=datetime.fromisoformat(row[8]),
            updated_at=datetime.fromisoformat(row[9]),
            metadata=json.loads(row[10]) if row[10] else {},
            tags=json.loads(row[11]) if row[11] else []
        )
    
    # Soft Backdoor Management for Crawler Retraining
    async def create_backdoor(self, name: str, endpoint: str, purpose: str,
                            security_level: str = "medium") -> str:
        """Create a soft backdoor for crawler access"""
        backdoor_id = str(uuid.uuid4())
        backdoor = CrawlerBackdoor(
            id=backdoor_id,
            name=name,
            endpoint=endpoint,
            is_active=True,
            last_accessed=datetime.now(),
            access_count=0,
            purpose=purpose,
            security_level=security_level
        )
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO crawler_backdoors 
                (id, name, endpoint, is_active, last_accessed, access_count, purpose, security_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                backdoor.id, backdoor.name, backdoor.endpoint, 1,
                backdoor.last_accessed.isoformat(), backdoor.access_count,
                backdoor.purpose, backdoor.security_level
            ))
            await db.commit()
        
        self.backdoors[backdoor_id] = backdoor
        self.logger.info(f"Created soft backdoor: {name} at {endpoint}")
        return backdoor_id
    
    async def access_backdoor(self, backdoor_id: str) -> Optional[CrawlerBackdoor]:
        """Access a backdoor (soft opening)"""
        if backdoor_id not in self.backdoors:
            return None
        
        backdoor = self.backdoors[backdoor_id]
        if not backdoor.is_active:
            return None
        
        # Update access stats
        backdoor.last_accessed = datetime.now()
        backdoor.access_count += 1
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE crawler_backdoors 
                SET last_accessed = ?, access_count = ?
                WHERE id = ?
            """, (backdoor.last_accessed.isoformat(), backdoor.access_count, backdoor_id))
            await db.commit()
        
        self.logger.info(f"Accessed backdoor: {backdoor.name} (count: {backdoor.access_count})")
        return backdoor
    
    async def close_backdoor(self, backdoor_id: str, soft: bool = True) -> bool:
        """Close a backdoor (soft or hard close)"""
        if backdoor_id not in self.backdoors:
            return False
        
        backdoor = self.backdoors[backdoor_id]
        
        if soft:
            # Soft close - just deactivate
            backdoor.is_active = False
            self.logger.info(f"Soft closed backdoor: {backdoor.name}")
        else:
            # Hard close - remove completely
            del self.backdoors[backdoor_id]
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("DELETE FROM crawler_backdoors WHERE id = ?", (backdoor_id,))
                await db.commit()
            self.logger.info(f"Hard closed backdoor: {backdoor.name}")
            return True
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE crawler_backdoors SET is_active = ? WHERE id = ?",
                (0, backdoor_id)
            )
            await db.commit()
        
        return True
    
    async def _load_backdoors(self):
        """Load existing backdoors from database"""
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT * FROM crawler_backdoors") as cursor:
                rows = await cursor.fetchall()
        
        for row in rows:
            backdoor = CrawlerBackdoor(
                id=row[0],
                name=row[1],
                endpoint=row[2],
                is_active=bool(row[3]),
                last_accessed=datetime.fromisoformat(row[4]) if row[4] else datetime.now(),
                access_count=row[5],
                purpose=row[6],
                security_level=row[7]
            )
            self.backdoors[backdoor.id] = backdoor
        
        self.logger.info(f"Loaded {len(self.backdoors)} backdoors")

# GraphQL Schema Definitions
if GRAPHQL_AVAILABLE:
    class KnowledgeEntryType(ObjectType):
        id = String()
        title = String()
        content = String()
        category = String()
        source_type = String()
        source_url = String()
        confidence = String()
        relevance_score = String()
        created_at = String()
        updated_at = String()
        tags = GrapheneList(String)
        
        def resolve_created_at(self, info):
            return self.created_at.isoformat()
        
        def resolve_updated_at(self, info):
            return self.updated_at.isoformat()
    
    class BackdoorType(ObjectType):
        id = String()
        name = String()
        endpoint = String()
        is_active = String()
        access_count = String()
        purpose = String()
        security_level = String()
    
    class Query(ObjectType):
        knowledge_entries = GrapheneList(
            KnowledgeEntryType,
            query=String(required=True),
            category=String(),
            limit=String(default_value="10")
        )
        knowledge_entry = Field(KnowledgeEntryType, id=String(required=True))
        backdoors = GrapheneList(BackdoorType)
        
        async def resolve_knowledge_entries(self, info, query, category=None, limit="10"):
            kb = info.context.get('knowledge_base')
            if not kb:
                return []
            
            cat = KnowledgeCategory(category) if category else None
            entries = await kb.search_entries(query, cat, int(limit))
            return entries
        
        async def resolve_knowledge_entry(self, info, id):
            kb = info.context.get('knowledge_base')
            if not kb:
                return None
            return await kb.get_entry_by_id(id)
        
        async def resolve_backdoors(self, info):
            kb = info.context.get('knowledge_base')
            if not kb:
                return []
            return list(kb.backdoors.values())
    
    class AddKnowledgeEntry(Mutation):
        class Arguments:
            title = String(required=True)
            content = String(required=True)
            category = String(required=True)
            source_type = String(required=True)
            source_url = String()
            confidence = String(default_value="0.8")
            tags = GrapheneList(String)
        
        entry = Field(KnowledgeEntryType)
        
        async def mutate(self, info, title, content, category, source_type, 
                        source_url=None, confidence="0.8", tags=None):
            kb = info.context.get('knowledge_base')
            if not kb:
                return AddKnowledgeEntry(entry=None)
            
            entry_id = await kb.add_entry(
                title=title,
                content=content,
                category=KnowledgeCategory(category),
                source_type=SourceType(source_type),
                source_url=source_url,
                confidence=float(confidence),
                tags=tags or []
            )
            
            entry = await kb.get_entry_by_id(entry_id)
            return AddKnowledgeEntry(entry=entry)
    
    class Mutations(ObjectType):
        add_knowledge_entry = AddKnowledgeEntry.Field()
    
    # Create GraphQL Schema
    knowledge_schema = Schema(query=Query, mutation=Mutations)

else:
    knowledge_schema = None

# Global knowledge base instance
_knowledge_base = None

async def get_knowledge_base() -> KnowledgeBase:
    """Get the global knowledge base instance"""
    global _knowledge_base
    if _knowledge_base is None:
        _knowledge_base = KnowledgeBase()
        await _knowledge_base.initialize()
    return _knowledge_base
