"""
High-performance Python integration layer using optimized Rust components.
This module provides Python wrappers for Rust-powered performance enhancements.
"""

import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
import time

try:
    # Import Rust modules (these will be available after building)
    import agent_core_utils
    import agent_container_orchestrator  
    import agent_security_tools
    import agent_performance_monitor
    RUST_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Rust modules not available: {e}. Falling back to Python implementations.")
    RUST_AVAILABLE = False

@dataclass
class PerformanceMetrics:
    """Performance metrics for monitoring system performance"""
    timestamp: float
    operation: str
    duration_ms: float
    memory_mb: float
    cpu_percent: float
    success: bool
    error_message: Optional[str] = None

class FastCacheManager:
    """High-performance cache manager with Rust backend"""
    
    def __init__(self, rust_cache=None):
        self.rust_cache = rust_cache
        self.fallback_cache = {}
    
    def set(self, key: str, value: str, ttl: int = 3600):
        """Set a cache value with TTL"""
        if self.rust_cache:
            try:
                # PyFastCache.insert() only takes key and value
                return self.rust_cache.insert(key, value)
            except Exception as e:
                logging.warning(f"Rust cache set failed, using fallback: {e}")
                
        # Fallback to Python dict
        self.fallback_cache[key] = (value, time.time() + ttl)
    
    def get(self, key: str) -> str:
        """Get a cache value"""
        if self.rust_cache:
            try:
                return self.rust_cache.get(key)
            except Exception as e:
                logging.warning(f"Rust cache get failed, using fallback: {e}")
                
        # Fallback to Python dict
        if key in self.fallback_cache:
            value, expires = self.fallback_cache[key]
            if time.time() < expires:
                return value
            else:
                del self.fallback_cache[key]
        return None
    
    def remove(self, key: str):
        """Remove a cache entry"""
        if self.rust_cache:
            try:
                return self.rust_cache.remove(key)
            except Exception:
                pass
                
        # Fallback
        if key in self.fallback_cache:
            del self.fallback_cache[key]
    
    def clear(self):
        """Clear all cache entries"""
        if self.rust_cache:
            try:
                return self.rust_cache.clear()
            except Exception:
                pass
                
        # Fallback - clear Python dict
        self.fallback_cache.clear()
    
    def cleanup(self):
        """Clean up expired entries"""
        if self.rust_cache:
            try:
                return self.rust_cache.cleanup_expired()
            except Exception:
                pass
                
        # Fallback cleanup
        current_time = time.time()
        expired_keys = [k for k, (_, expires) in self.fallback_cache.items() if current_time >= expires]
        for key in expired_keys:
            del self.fallback_cache[key]

class FastStringProcessor:
    """High-performance string processor with Rust backend"""
    
    def __init__(self, rust_processor=None):
        self.rust_processor = rust_processor
    
    def parallel_process(self, strings: List[str], operation: str = "uppercase") -> List[str]:
        """Process strings in parallel"""
        if self.rust_processor:
            try:
                return self.rust_processor.parallel_process_strings(strings, operation)
            except Exception as e:
                logging.warning(f"Rust string processing failed: {e}")
        
        # Fallback to Python processing
        if operation == "uppercase":
            return [s.upper() for s in strings]
        elif operation == "lowercase":
            return [s.lower() for s in strings]
        else:
            return strings
        
    def extract_keywords(self, text: str, min_length: int = 3, count: int = 10) -> List[str]:
        """Extract keywords from text"""
        if self.rust_processor:
            try:
                return self.rust_processor.extract_keywords(text, count)
            except Exception as e:
                logging.warning(f"Rust keyword extraction failed: {e}")
        
        # Simple fallback - extract words longer than min_length
        import re
        words = re.findall(r'\b\w+\b', text.lower())
        filtered_words = [w for w in words if len(w) >= min_length]
        # Return unique words, sorted by frequency
        from collections import Counter
        word_counts = Counter(filtered_words)
        return [word for word, _ in word_counts.most_common(count)]
    
    def fast_hash(self, text: str) -> str:
        """Generate fast hash of text"""
        if self.rust_processor:
            try:
                return self.rust_processor.fast_hash(text)
            except Exception as e:
                logging.warning(f"Rust hash generation failed: {e}")
        
        # Fallback to Python hash
        import hashlib
        return hashlib.md5(text.encode()).hexdigest()
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity"""
        if self.rust_processor:
            try:
                return self.rust_processor.similarity(text1, text2)
            except Exception as e:
                logging.warning(f"Rust similarity calculation failed: {e}")
        
        # Simple Jaccard similarity fallback
        set1 = set(text1.lower().split())
        set2 = set(text2.lower().split())
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

class RustIntegrationManager:
    """
    Main integration manager for Rust-powered components.
    Provides high-level Python interface to optimized Rust implementations.
    """
    
    def __init__(self, enable_metrics: bool = True):
        self.enable_metrics = enable_metrics
        self.metrics: List[PerformanceMetrics] = []
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Initialize Rust components if available
        if RUST_AVAILABLE:
            self._init_rust_components()
        else:
            self._init_fallback_components()
    
    def _init_rust_components(self):
        """Initialize Rust components if available"""
        try:
            # Core utilities
            import agent_core_utils
            self.cache_manager = agent_core_utils.PyFastCache()
            self.string_processor = agent_core_utils.PyStringUtils()
            self.http_client = agent_core_utils.PyFastHttpClient()
            self.text_processor = agent_core_utils.PyTextProcessor()
            self.task_queue = agent_core_utils.PyTaskQueue()
            
            # Container orchestrator
            import agent_container_orchestrator
            self.container_orchestrator = agent_container_orchestrator.PyContainerOrchestrator()
            
            # Security tools
            import agent_security_tools
            self.security_scanner = agent_security_tools.PySecurityTools()
            
            # Performance monitor
            import agent_performance_monitor
            self.performance_monitor = agent_performance_monitor.PyPerformanceMonitor()
            
            self.rust_available = True
            logging.info("Rust components initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Rust components: {e}")
            self._init_fallback_components()
    
    def _init_fallback_components(self):
        """Initialize Python fallback components"""
        try:
            from .base_classes import EnhancedAgentBase
            
            # Create a simple fallback agent instance
            class SimpleFallbackAgent(EnhancedAgentBase):
                def setup_domain_tools(self):
                    pass
                def setup_domain_knowledge(self):
                    pass
            
            self.fallback_agent = SimpleFallbackAgent("general")
        except ImportError as e:
            print(f"Warning: Could not import enhanced agent: {e}")
            self.fallback_agent = None
        
        # Fallback to Python implementations
        self.cache = {}  # Simple dict cache
        self.string_utils = None
        self.http_client = None
        self.text_processor = None
        self.task_queue = []
        self.container_orchestrator = None
        self.security_scanner = None
        self.performance_monitor = None
        self.rust_available = False
        
        try:
            from .container_orchestrator import ContainerOrchestrator
            self.container_orchestrator = ContainerOrchestrator()
        except ImportError as e:
            print(f"Warning: Could not import container orchestrator: {e}")
            
        try:
            from .security_tools import SecurityTools
            self.security_scanner = SecurityTools()
        except ImportError as e:
            print(f"Warning: Could not import security tools: {e}")
    
    def get_cache_manager(self) -> FastCacheManager:
        """Get the cache manager (Rust or fallback)"""
        if self.rust_available and hasattr(self, 'cache_manager'):
            return FastCacheManager(self.cache_manager)
        else:
            return FastCacheManager(None)
    
    def get_string_processor(self):
        """Get the string processor"""
        if self.rust_available and hasattr(self, 'string_processor'):
            return FastStringProcessor(self.string_processor)
        else:
            return FastStringProcessor(None)
    
    def get_http_client(self):
        """Get the HTTP client"""
        return getattr(self, 'http_client', None)
    
    def get_text_processor(self):
        """Get the text processor"""
        return getattr(self, 'text_processor', None)
    
    def get_container_orchestrator(self):
        """Get the container orchestrator"""
        return getattr(self, 'container_orchestrator', None)
    
    def get_security_scanner(self):
        """Get the security scanner"""
        return getattr(self, 'security_scanner', None)
    
    def get_performance_monitor(self):
        """Get the performance monitor"""
        return getattr(self, 'performance_monitor', None)
    
    def record_metrics(self, operation: str, start_time: float, success: bool, error_message: str = None):
        """Record performance metrics"""
        if not self.enable_metrics:
            return
            
        metrics = PerformanceMetrics(
            timestamp=time.time(),
            operation=operation,
            duration_ms=(time.time() - start_time) * 1000,
            memory_mb=self._get_memory_usage(),
            cpu_percent=self._get_cpu_usage(),
            success=success,
            error_message=error_message
        )
        self.metrics.append(metrics)
        
        # Keep only last 1000 metrics
        if len(self.metrics) > 1000:
            self.metrics = self.metrics[-1000:]
    
    def _get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        try:
            import psutil
            process = psutil.Process()
            return process.memory_info().rss / 1024 / 1024
        except:
            return 0.0
    
    def _get_cpu_usage(self) -> float:
        """Get current CPU usage percentage"""
        try:
            import psutil
            return psutil.cpu_percent()
        except:
            return 0.0

# Global instance
_integration_manager = None

def get_integration_manager() -> RustIntegrationManager:
    """Get the global integration manager instance"""
    global _integration_manager
    if _integration_manager is None:
        _integration_manager = RustIntegrationManager()
    return _integration_manager

def get_cache_manager() -> FastCacheManager:
    """Get the global cache manager"""
    return get_integration_manager().get_cache_manager()

def get_string_processor() -> FastStringProcessor:
    """Get the global string processor"""
    return get_integration_manager().get_string_processor()

def get_performance_metrics() -> List[PerformanceMetrics]:
    """Get performance metrics from the integration manager"""
    return get_integration_manager().metrics

def is_rust_available() -> bool:
    """Check if Rust components are available"""
    return RUST_AVAILABLE
