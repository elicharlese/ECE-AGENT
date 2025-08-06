import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import numpy as np

from .domains.developer import DeveloperAgent
from .domains.trader import TraderAgent
from .domains.lawyer import LawyerAgent
from .rust_integration import (
    get_integration_manager, 
    get_cache_manager, 
    get_string_processor,
    get_performance_metrics,
    RUST_AVAILABLE
)

class AGENTCore:
    """Core AGENT system that coordinates between different domain agents"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.setup_logging()
        
        # Initialize Rust integration for performance optimization  
        self.rust_manager = get_integration_manager()
        self.cache_manager = get_cache_manager()
        self.string_processor = get_string_processor()
        self.http_client = self.rust_manager.get_http_client()
        self.security_scanner = self.rust_manager.get_security_scanner()
        self.container_manager = self.rust_manager.get_container_orchestrator()
        
        # Log Rust availability
        if self.rust_manager.rust_available:
            self.logger.info("High-performance Rust components available and loaded")
        else:
            self.logger.warning("Rust components not available, using Python fallbacks")
        
        # Initialize domain agents
        self.developer_agent = DeveloperAgent()
        self.trader_agent = TraderAgent()
        self.lawyer_agent = LawyerAgent()
        
        # Load base language model
        self.model_name = "microsoft/DialoGPT-medium"
        self.tokenizer = None
        self.model = None
        self.load_base_model()
        
        # Performance metrics
        self.metrics = {
            "queries_processed": 0,
            "successful_responses": 0,
            "domain_usage": {"developer": 0, "trader": 0, "lawyer": 0},
            "last_training": None,
            "model_version": "1.0.0",
            "rust_enabled": RUST_AVAILABLE,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def load_base_model(self):
        """Load the base language model"""
        try:
            self.logger.info(f"Loading model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            
            # Add padding token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
            self.logger.info("Base model loaded successfully")
        except Exception as e:
            self.logger.error(f"Error loading base model: {e}")
            raise
    
    async def process_query(self, query: str, domain: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process a query through the appropriate domain agent with performance optimizations"""
        try:
            self.metrics["queries_processed"] += 1
            self.metrics["domain_usage"][domain] += 1
            
            # Check cache first using optimized Rust cache
            cache_key = self.string_processor.fast_hash(f"{domain}:{query}")
            cached_result = self.cache_manager.get(cache_key)
            if cached_result:
                self.metrics["cache_hits"] += 1
                self.logger.info(f"Cache hit for query: {query[:50]}...")
                return cached_result
            else:
                self.metrics["cache_misses"] += 1
            
            # Extract keywords for better processing using optimized string processing
            keywords = self.string_processor.extract_keywords(query, min_length=3)
            self.logger.info(f"Extracted keywords: {keywords[:5]}")  # Log first 5 keywords
            
            # Route to appropriate domain agent
            if domain == "developer":
                response = await self.developer_agent.process(query, web_context)
            elif domain == "trader":
                response = await self.trader_agent.process(query, web_context)
            elif domain == "lawyer":
                response = await self.lawyer_agent.process(query, web_context)
            else:
                # Use general AI for unknown domains
                response = await self._general_process(query, web_context)
            
            # Enhance response with base model if needed
            enhanced_response = await self._enhance_with_base_model(query, response, domain)
            
            result = {
                "answer": enhanced_response,
                "domain": domain,
                "confidence": response.get("confidence", 0.8),
                "sources": response.get("sources", []),
                "reasoning": response.get("reasoning", ""),
                "keywords": keywords,
                "timestamp": datetime.now().isoformat(),
                "cached": False
            }
            
            # Cache the result for future queries (with 1 hour TTL)
            self.cache_manager.set(cache_key, result, ttl=3600)
            
            self.metrics["successful_responses"] += 1
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing query: {e}")
            return {
                "answer": f"I encountered an error processing your {domain} query. Please try again.",
                "domain": domain,
                "confidence": 0.0,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "cached": False
            }
    
    async def _enhance_with_base_model(self, query: str, domain_response: Dict, domain: str) -> str:
        """Enhance domain response with base language model"""
        try:
            # Create context for the model
            context = f"As an AI {domain}, answering: {query}\n"
            if domain_response.get("reasoning"):
                context += f"Analysis: {domain_response['reasoning']}\n"
            
            # Generate enhanced response
            inputs = self.tokenizer.encode(context, return_tensors="pt", max_length=512, truncation=True)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=inputs.shape[1] + 150,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            enhanced_part = generated_text[len(context):].strip()
            
            # Combine domain response with enhanced text
            base_answer = domain_response.get("answer", "")
            if enhanced_part and len(enhanced_part) > 10:
                return f"{base_answer}\n\n{enhanced_part}"
            else:
                return base_answer
                
        except Exception as e:
            self.logger.error(f"Error enhancing response: {e}")
            return domain_response.get("answer", "I apologize, but I couldn't generate a proper response.")
    
    async def _general_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process general queries not specific to any domain"""
        try:
            # Use web context if available
            context = ""
            if web_context:
                context = "\n".join([item.get("content", "")[:500] for item in web_context[:3]])
            
            # Generate response using base model
            full_query = f"Question: {query}\nContext: {context}\nAnswer:"
            inputs = self.tokenizer.encode(full_query, return_tensors="pt", max_length=512, truncation=True)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=inputs.shape[1] + 200,
                    num_return_sequences=1,
                    temperature=0.8,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            answer = response[len(full_query):].strip()
            
            return {
                "answer": answer if answer else "I need more specific information to help you properly.",
                "confidence": 0.6,
                "sources": [item.get("url", "") for item in web_context] if web_context else [],
                "reasoning": "General AI processing with web context" if web_context else "General AI processing"
            }
            
        except Exception as e:
            self.logger.error(f"Error in general processing: {e}")
            return {
                "answer": "I apologize, but I'm having trouble processing your request right now.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current AGENT status with performance metrics"""
        rust_performance_metrics = get_performance_metrics()
        
        return {
            "model_loaded": self.model is not None,
            "model_name": self.model_name,
            "metrics": self.metrics,
            "domains_available": ["developer", "trader", "lawyer"],
            "rust_enabled": RUST_AVAILABLE,
            "performance_metrics": {
                "total_operations": len(rust_performance_metrics),
                "average_response_time_ms": sum(m.duration_ms for m in rust_performance_metrics[-100:]) / min(len(rust_performance_metrics), 100) if rust_performance_metrics and len(rust_performance_metrics) > 0 else 0,
                "cache_hit_rate": (self.metrics["cache_hits"] / max(self.metrics["cache_hits"] + self.metrics["cache_misses"], 1)) * 100 if (self.metrics["cache_hits"] + self.metrics["cache_misses"]) > 0 else 0,
                "recent_operations": [
                    {
                        "operation": m.operation,
                        "duration_ms": m.duration_ms,
                        "success": m.success,
                        "timestamp": m.timestamp
                    } for m in rust_performance_metrics[-10:]  # Last 10 operations
                ]
            },
            "last_updated": datetime.now().isoformat()
        }
    
    async def execute_admin_command(self, command: str, parameters: Dict = None) -> Dict[str, Any]:
        """Execute administrative commands"""
        try:
            if command == "reload_model":
                self.load_base_model()
                return {"message": "Model reloaded successfully"}
            
            elif command == "get_metrics":
                return {"metrics": self.metrics}
            
            elif command == "reset_metrics":
                self.metrics = {
                    "queries_processed": 0,
                    "successful_responses": 0,
                    "domain_usage": {"developer": 0, "trader": 0, "lawyer": 0},
                    "last_training": None,
                    "model_version": "1.0.0"
                }
                return {"message": "Metrics reset successfully"}
            
            elif command == "update_domain":
                domain = parameters.get("domain")
                if domain == "developer":
                    await self.developer_agent.update_knowledge()
                elif domain == "trader":
                    await self.trader_agent.update_knowledge()
                elif domain == "lawyer":
                    await self.lawyer_agent.update_knowledge()
                return {"message": f"{domain} domain updated successfully"}
            
            elif command == "clear_cache":
                self.cache_manager.clear()
                return {"message": "Cache cleared successfully"}
            
            elif command == "security_scan":
                target = parameters.get("target", "127.0.0.1")
                ports = parameters.get("ports", [22, 80, 443, 8080])
                scan_results = self.security_scanner.scan_ports(target, ports)
                return {
                    "message": "Security scan completed", 
                    "results": scan_results,
                    "target": target
                }
            
            elif command == "deploy_container":
                template_id = parameters.get("template_id", "dev-environment")
                container_name = parameters.get("container_name")
                deployment_result = self.container_manager.deploy_template(template_id, container_name)
                return {
                    "message": "Container deployment initiated",
                    "result": deployment_result
                }
            
            elif command == "list_containers":
                containers = self.container_manager.list_containers()
                return {
                    "message": "Container list retrieved",
                    "containers": containers
                }
            
            elif command == "performance_test":
                # Run a performance test using Rust components
                test_strings = [f"test string {i}" for i in range(1000)]
                
                import time
                start_time = time.time()
                processed = self.string_processor.parallel_process(test_strings, "lowercase")
                process_time = (time.time() - start_time) * 1000
                
                start_time = time.time()
                hashes = [self.string_processor.fast_hash(s) for s in test_strings[:100]]
                hash_time = (time.time() - start_time) * 1000
                
                return {
                    "message": "Performance test completed",
                    "results": {
                        "string_processing_ms": process_time,
                        "hash_generation_ms": hash_time,
                        "processed_strings": len(processed),
                        "generated_hashes": len(hashes),
                        "rust_enabled": RUST_AVAILABLE
                    }
                }
            
            else:
                return {"error": f"Unknown command: {command}"}
                
        except Exception as e:
            self.logger.error(f"Error executing admin command: {e}")
            return {"error": str(e)}
