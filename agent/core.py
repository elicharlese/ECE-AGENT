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

class AGENTCore:
    """Core AGENT system that coordinates between different domain agents"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.setup_logging()
        
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
            "model_version": "1.0.0"
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
        """Process a query through the appropriate domain agent"""
        try:
            self.metrics["queries_processed"] += 1
            self.metrics["domain_usage"][domain] += 1
            
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
            
            self.metrics["successful_responses"] += 1
            
            return {
                "answer": enhanced_response,
                "domain": domain,
                "confidence": response.get("confidence", 0.8),
                "sources": response.get("sources", []),
                "reasoning": response.get("reasoning", ""),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing query: {e}")
            return {
                "answer": f"I encountered an error processing your {domain} query. Please try again.",
                "domain": domain,
                "confidence": 0.0,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
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
        """Get current AGENT status"""
        return {
            "model_loaded": self.model is not None,
            "model_name": self.model_name,
            "metrics": self.metrics,
            "domains_available": ["developer", "trader", "lawyer"],
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
            
            else:
                return {"error": f"Unknown command: {command}"}
                
        except Exception as e:
            self.logger.error(f"Error executing admin command: {e}")
            return {"error": str(e)}
