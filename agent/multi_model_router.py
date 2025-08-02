#!/usr/bin/env python3
"""
Multi-Model AI Router for Enhanced AGENT System v3.0
Intelligently routes queries to the best available AI model based on query type,
complexity, and performance requirements.
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod
import json
import re
from datetime import datetime, timezone

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelType(Enum):
    """Available AI model types"""
    GPT4 = "gpt-4"
    GPT35_TURBO = "gpt-3.5-turbo" 
    CLAUDE3_OPUS = "claude-3-opus"
    CLAUDE3_SONNET = "claude-3-sonnet"
    LOCAL_LLAMA = "llama-local"
    FALLBACK = "fallback-basic"

class QueryType(Enum):
    """Query classification types"""
    CODING = "coding"
    ANALYSIS = "analysis"
    CREATIVE = "creative"
    FACTUAL = "factual"
    COMPLEX_REASONING = "complex-reasoning"
    CONVERSATIONAL = "conversational"
    TECHNICAL = "technical"
    GENERAL = "general"

@dataclass
class ModelConfig:
    """Configuration for an AI model"""
    model_type: ModelType
    name: str
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    max_tokens: int = 4000
    temperature: float = 0.7
    cost_per_token: float = 0.0
    avg_response_time: float = 2.0
    reliability_score: float = 0.95
    specialties: List[QueryType] = field(default_factory=list)
    enabled: bool = True
    
@dataclass
class QueryAnalysis:
    """Analysis results for a query"""
    query_type: QueryType
    complexity_score: float  # 0.0 - 1.0
    estimated_tokens: int
    keywords: List[str]
    confidence: float
    requires_reasoning: bool
    time_sensitive: bool

@dataclass
class ModelResponse:
    """Response from an AI model"""
    content: str
    model_used: ModelType
    response_time: float
    tokens_used: int
    cost: float
    confidence: float
    timestamp: datetime

class AIModelInterface(ABC):
    """Abstract interface for AI models"""
    
    @abstractmethod
    async def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate response from the model"""
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        """Check if the model is currently available"""
        pass

class GPTModel(AIModelInterface):
    """OpenAI GPT model implementation"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.client = None  # Would initialize OpenAI client here
        
    async def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate response using GPT model"""
        try:
            # Simulate API call (replace with actual OpenAI API call)
            await asyncio.sleep(0.5)  # Simulate network latency
            
            # Mock response for demonstration
            return f"GPT-{self.config.model_type.value} response to: {prompt[:50]}..."
            
        except Exception as e:
            logger.error(f"GPT model error: {e}")
            raise
    
    async def is_available(self) -> bool:
        """Check GPT model availability"""
        # Would implement actual health check
        return self.config.enabled

class ClaudeModel(AIModelInterface):
    """Anthropic Claude model implementation"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.client = None  # Would initialize Anthropic client here
        
    async def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate response using Claude model"""
        try:
            # Simulate API call
            await asyncio.sleep(0.7)  # Simulate network latency
            
            # Mock response for demonstration
            return f"Claude-{self.config.model_type.value} response to: {prompt[:50]}..."
            
        except Exception as e:
            logger.error(f"Claude model error: {e}")
            raise
    
    async def is_available(self) -> bool:
        """Check Claude model availability"""
        return self.config.enabled

class LocalLLamaModel(AIModelInterface):
    """Local LLaMA model implementation"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.model = None  # Would load local model here
        
    async def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate response using local LLaMA model"""
        try:
            # Simulate local inference
            await asyncio.sleep(1.5)  # Simulate processing time
            
            # Mock response for demonstration
            return f"Local LLaMA response to: {prompt[:50]}..."
            
        except Exception as e:
            logger.error(f"Local LLaMA error: {e}")
            raise
    
    async def is_available(self) -> bool:
        """Check local model availability"""
        return self.config.enabled and True  # Would check if model is loaded

class FallbackModel(AIModelInterface):
    """Fallback model for when others fail"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        
    async def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate basic fallback response"""
        await asyncio.sleep(0.1)
        return f"I understand you're asking about: {prompt[:100]}... I'm currently operating in fallback mode. Please try again later for a more detailed response."
    
    async def is_available(self) -> bool:
        """Fallback is always available"""
        return True

class QueryAnalyzer:
    """Analyzes queries to determine optimal routing"""
    
    def __init__(self):
        self.coding_keywords = {
            'code', 'programming', 'function', 'algorithm', 'debug', 'python', 
            'javascript', 'java', 'rust', 'api', 'database', 'sql', 'framework'
        }
        self.creative_keywords = {
            'story', 'creative', 'write', 'poem', 'imagine', 'design', 'art',
            'brainstorm', 'idea', 'innovative', 'original'
        }
        self.analysis_keywords = {
            'analyze', 'compare', 'evaluate', 'assessment', 'study', 'research',
            'data', 'trends', 'statistics', 'insights', 'conclusion'
        }
        self.technical_keywords = {
            'technical', 'engineering', 'system', 'architecture', 'deployment',
            'scalability', 'performance', 'optimization', 'infrastructure'
        }
    
    async def analyze_query(self, query: str) -> QueryAnalysis:
        """Analyze query to determine routing strategy"""
        query_lower = query.lower()
        words = re.findall(r'\b\w+\b', query_lower)
        
        # Determine query type
        query_type = self._classify_query_type(query_lower, words)
        
        # Calculate complexity score
        complexity_score = self._calculate_complexity(query, words)
        
        # Estimate token count (rough approximation)
        estimated_tokens = len(words) * 1.3  # Approximate token count
        
        # Extract keywords
        keywords = self._extract_keywords(words)
        
        # Determine if reasoning is required
        requires_reasoning = self._requires_reasoning(query_lower)
        
        # Check if time sensitive
        time_sensitive = self._is_time_sensitive(query_lower)
        
        # Calculate confidence
        confidence = min(0.95, 0.6 + (len(keywords) * 0.05))
        
        return QueryAnalysis(
            query_type=query_type,
            complexity_score=complexity_score,
            estimated_tokens=int(estimated_tokens),
            keywords=keywords,
            confidence=confidence,
            requires_reasoning=requires_reasoning,
            time_sensitive=time_sensitive
        )
    
    def _classify_query_type(self, query: str, words: List[str]) -> QueryType:
        """Classify the query type"""
        word_set = set(words)
        
        if word_set & self.coding_keywords:
            return QueryType.CODING
        elif word_set & self.creative_keywords:
            return QueryType.CREATIVE
        elif word_set & self.analysis_keywords:
            return QueryType.ANALYSIS
        elif word_set & self.technical_keywords:
            return QueryType.TECHNICAL
        elif any(word in query for word in ['why', 'how', 'explain', 'reason']):
            return QueryType.COMPLEX_REASONING
        elif any(word in query for word in ['what', 'when', 'where', 'who']):
            return QueryType.FACTUAL
        elif any(word in query for word in ['hello', 'hi', 'thanks', 'please']):
            return QueryType.CONVERSATIONAL
        else:
            return QueryType.GENERAL
    
    def _calculate_complexity(self, query: str, words: List[str]) -> float:
        """Calculate query complexity score (0.0 - 1.0)"""
        base_score = 0.2
        
        # Length factor
        length_factor = min(0.3, len(words) / 100)
        
        # Question complexity
        question_words = ['why', 'how', 'explain', 'analyze', 'compare']
        question_factor = 0.2 * sum(1 for word in question_words if word in query.lower())
        
        # Technical complexity
        technical_indicators = ['algorithm', 'optimization', 'architecture', 'system']
        tech_factor = 0.3 * sum(1 for word in technical_indicators if word in query.lower())
        
        return min(1.0, base_score + length_factor + question_factor + tech_factor)
    
    def _extract_keywords(self, words: List[str]) -> List[str]:
        """Extract relevant keywords from the query"""
        all_keywords = (self.coding_keywords | self.creative_keywords | 
                       self.analysis_keywords | self.technical_keywords)
        
        return [word for word in words if word in all_keywords][:10]
    
    def _requires_reasoning(self, query: str) -> bool:
        """Check if query requires complex reasoning"""
        reasoning_indicators = [
            'why', 'how', 'explain', 'reason', 'because', 'analyze',
            'compare', 'evaluate', 'assess', 'determine', 'solve'
        ]
        return any(indicator in query for indicator in reasoning_indicators)
    
    def _is_time_sensitive(self, query: str) -> bool:
        """Check if query is time sensitive"""
        time_indicators = [
            'urgent', 'quickly', 'fast', 'immediate', 'now', 'asap',
            'deadline', 'time', 'soon'
        ]
        return any(indicator in query for indicator in time_indicators)

class MultiModelRouter:
    """Multi-model AI router with intelligent query routing"""
    
    def __init__(self):
        self.models: Dict[ModelType, AIModelInterface] = {}
        self.model_configs: Dict[ModelType, ModelConfig] = {}
        self.query_analyzer = QueryAnalyzer()
        self.performance_history: Dict[ModelType, List[float]] = {}
        self.fallback_model = None
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize all available AI models"""
        # GPT-4 Configuration
        gpt4_config = ModelConfig(
            model_type=ModelType.GPT4,
            name="GPT-4",
            max_tokens=8000,
            temperature=0.7,
            cost_per_token=0.00003,
            avg_response_time=3.0,
            reliability_score=0.98,
            specialties=[QueryType.COMPLEX_REASONING, QueryType.CODING, QueryType.ANALYSIS],
            enabled=True
        )
        
        # GPT-3.5 Configuration
        gpt35_config = ModelConfig(
            model_type=ModelType.GPT35_TURBO,
            name="GPT-3.5 Turbo",
            max_tokens=4000,
            temperature=0.7,
            cost_per_token=0.000002,
            avg_response_time=1.5,
            reliability_score=0.95,
            specialties=[QueryType.CONVERSATIONAL, QueryType.GENERAL, QueryType.FACTUAL],
            enabled=True
        )
        
        # Claude-3 Opus Configuration
        claude_opus_config = ModelConfig(
            model_type=ModelType.CLAUDE3_OPUS,
            name="Claude-3 Opus",
            max_tokens=4000,
            temperature=0.7,
            cost_per_token=0.000015,
            avg_response_time=2.5,
            reliability_score=0.97,
            specialties=[QueryType.CREATIVE, QueryType.ANALYSIS, QueryType.TECHNICAL],
            enabled=True
        )
        
        # Local LLaMA Configuration
        llama_config = ModelConfig(
            model_type=ModelType.LOCAL_LLAMA,
            name="Local LLaMA",
            max_tokens=2000,
            temperature=0.8,
            cost_per_token=0.0,  # Free local model
            avg_response_time=4.0,
            reliability_score=0.90,
            specialties=[QueryType.GENERAL, QueryType.CONVERSATIONAL],
            enabled=True
        )
        
        # Fallback Configuration
        fallback_config = ModelConfig(
            model_type=ModelType.FALLBACK,
            name="Fallback Model",
            max_tokens=500,
            temperature=0.5,
            cost_per_token=0.0,
            avg_response_time=0.5,
            reliability_score=1.0,
            specialties=[],
            enabled=True
        )
        
        # Initialize model instances
        self.models[ModelType.GPT4] = GPTModel(gpt4_config)
        self.models[ModelType.GPT35_TURBO] = GPTModel(gpt35_config)
        self.models[ModelType.CLAUDE3_OPUS] = ClaudeModel(claude_opus_config)
        self.models[ModelType.LOCAL_LLAMA] = LocalLLamaModel(llama_config)
        self.models[ModelType.FALLBACK] = FallbackModel(fallback_config)
        
        # Store configurations
        self.model_configs.update({
            ModelType.GPT4: gpt4_config,
            ModelType.GPT35_TURBO: gpt35_config,
            ModelType.CLAUDE3_OPUS: claude_opus_config,
            ModelType.LOCAL_LLAMA: llama_config,
            ModelType.FALLBACK: fallback_config
        })
        
        # Set fallback model
        self.fallback_model = self.models[ModelType.FALLBACK]
        
        # Initialize performance tracking
        for model_type in self.models.keys():
            self.performance_history[model_type] = []
        
        logger.info("Multi-model AI router initialized with all models")
    
    async def route_query(self, query: str, **kwargs) -> ModelResponse:
        """Route query to the optimal AI model"""
        start_time = time.time()
        
        try:
            # Analyze the query
            analysis = await self.query_analyzer.analyze_query(query)
            logger.info(f"Query analysis: {analysis.query_type.value}, complexity: {analysis.complexity_score:.2f}")
            
            # Select optimal model
            selected_model_type = await self._select_optimal_model(analysis)
            logger.info(f"Selected model: {selected_model_type.value}")
            
            # Generate response
            selected_model = self.models[selected_model_type]
            
            # Check model availability
            if not await selected_model.is_available():
                logger.warning(f"Selected model {selected_model_type.value} unavailable, using fallback")
                selected_model_type = ModelType.FALLBACK
                selected_model = self.fallback_model
            
            # Generate response
            response_start = time.time()
            content = await selected_model.generate_response(query, **kwargs)
            response_time = time.time() - response_start
            
            # Calculate metrics
            config = self.model_configs[selected_model_type]
            tokens_used = len(content.split()) * 1.3  # Rough estimate
            cost = tokens_used * config.cost_per_token
            
            # Update performance history
            self.performance_history[selected_model_type].append(response_time)
            if len(self.performance_history[selected_model_type]) > 100:
                self.performance_history[selected_model_type].pop(0)
            
            # Create response object
            model_response = ModelResponse(
                content=content,
                model_used=selected_model_type,
                response_time=response_time,
                tokens_used=int(tokens_used),
                cost=cost,
                confidence=analysis.confidence,
                timestamp=datetime.now(timezone.utc)
            )
            
            total_time = time.time() - start_time
            logger.info(f"Query completed in {total_time:.2f}s using {selected_model_type.value}")
            
            return model_response
            
        except Exception as e:
            logger.error(f"Error in query routing: {e}")
            
            # Fallback response
            try:
                content = await self.fallback_model.generate_response(query)
                return ModelResponse(
                    content=content,
                    model_used=ModelType.FALLBACK,
                    response_time=0.5,
                    tokens_used=50,
                    cost=0.0,
                    confidence=0.3,
                    timestamp=datetime.now(timezone.utc)
                )
            except Exception as fallback_error:
                logger.error(f"Fallback model also failed: {fallback_error}")
                raise
    
    async def _select_optimal_model(self, analysis: QueryAnalysis) -> ModelType:
        """Select the optimal model based on query analysis"""
        candidates = []
        
        # Score each available model
        for model_type, config in self.model_configs.items():
            if not config.enabled or model_type == ModelType.FALLBACK:
                continue
            
            score = await self._calculate_model_score(model_type, config, analysis)
            candidates.append((model_type, score))
        
        # Sort by score (highest first)
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        if candidates:
            return candidates[0][0]
        else:
            return ModelType.FALLBACK
    
    async def _calculate_model_score(self, model_type: ModelType, 
                                   config: ModelConfig, analysis: QueryAnalysis) -> float:
        """Calculate suitability score for a model"""
        score = 0.0
        
        # Specialty match bonus
        if analysis.query_type in config.specialties:
            score += 0.4
        
        # Reliability score
        score += config.reliability_score * 0.3
        
        # Performance score (inverse of response time)
        performance_score = 1.0 / max(0.1, config.avg_response_time)
        score += performance_score * 0.2
        
        # Cost efficiency (lower cost is better for simple queries)
        if analysis.complexity_score < 0.5:
            cost_efficiency = 1.0 / max(0.001, config.cost_per_token + 0.001)
            score += cost_efficiency * 0.1
        
        # Historical performance
        if model_type in self.performance_history and self.performance_history[model_type]:
            avg_historical_time = sum(self.performance_history[model_type]) / len(self.performance_history[model_type])
            historical_score = 1.0 / max(0.1, avg_historical_time)
            score += historical_score * 0.1
        
        return score
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        status = {}
        
        for model_type, model in self.models.items():
            config = self.model_configs[model_type]
            is_available = await model.is_available()
            
            recent_performance = []
            if model_type in self.performance_history:
                recent_performance = self.performance_history[model_type][-10:]
            
            avg_response_time = sum(recent_performance) / len(recent_performance) if recent_performance else config.avg_response_time
            
            status[model_type.value] = {
                "name": config.name,
                "available": is_available,
                "specialties": [s.value for s in config.specialties],
                "avg_response_time": round(avg_response_time, 2),
                "reliability_score": config.reliability_score,
                "cost_per_token": config.cost_per_token,
                "enabled": config.enabled,
                "recent_queries": len(recent_performance)
            }
        
        return status
    
    def enable_model(self, model_type: ModelType):
        """Enable a specific model"""
        if model_type in self.model_configs:
            self.model_configs[model_type].enabled = True
            logger.info(f"Enabled model: {model_type.value}")
    
    def disable_model(self, model_type: ModelType):
        """Disable a specific model"""
        if model_type in self.model_configs and model_type != ModelType.FALLBACK:
            self.model_configs[model_type].enabled = False
            logger.info(f"Disabled model: {model_type.value}")

# Global router instance
multi_model_router = MultiModelRouter()

async def main():
    """Demo function to test the multi-model router"""
    queries = [
        "Write a Python function to sort a list",
        "Explain quantum computing in simple terms",
        "Create a creative story about AI",
        "What is the capital of France?",
        "How do I optimize database queries?",
        "Write a poem about programming"
    ]
    
    print("🚀 Multi-Model AI Router Demo")
    print("=" * 50)
    
    # Get model status
    status = await multi_model_router.get_model_status()
    print("\n📊 Available Models:")
    for model, info in status.items():
        availability = "✅" if info["available"] else "❌"
        print(f"{availability} {info['name']}: {info['specialties']}")
    
    print("\n🔍 Processing Queries:")
    print("-" * 30)
    
    for i, query in enumerate(queries, 1):
        print(f"\n{i}. Query: {query}")
        
        try:
            response = await multi_model_router.route_query(query)
            print(f"   Model: {response.model_used.value}")
            print(f"   Time: {response.response_time:.2f}s")
            print(f"   Cost: ${response.cost:.6f}")
            print(f"   Confidence: {response.confidence:.2f}")
            print(f"   Response: {response.content[:100]}...")
            
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n✅ Multi-Model Router Demo Complete!")

if __name__ == "__main__":
    asyncio.run(main())
