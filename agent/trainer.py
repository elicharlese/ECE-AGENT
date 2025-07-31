import asyncio
import json
import logging
import pickle
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np

class AGENTTrainer:
    """Training system for continuous AGENT improvement"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.training_data = {
            "developer": [],
            "trader": [],
            "lawyer": []
        }
        self.training_stats = {
            "total_sessions": 0,
            "last_training": None,
            "domain_training_counts": {"developer": 0, "trader": 0, "lawyer": 0},
            "performance_metrics": {}
        }
        self.data_file = "agent_training_data.pkl"
        self.load_training_data()
    
    def load_training_data(self):
        """Load existing training data from disk"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'rb') as f:
                    data = pickle.load(f)
                    self.training_data = data.get('training_data', self.training_data)
                    self.training_stats = data.get('training_stats', self.training_stats)
                self.logger.info("Training data loaded successfully")
        except Exception as e:
            self.logger.error(f"Error loading training data: {e}")
    
    def save_training_data(self):
        """Save training data to disk"""
        try:
            data = {
                'training_data': self.training_data,
                'training_stats': self.training_stats
            }
            with open(self.data_file, 'wb') as f:
                pickle.dump(data, f)
            self.logger.info("Training data saved successfully")
        except Exception as e:
            self.logger.error(f"Error saving training data: {e}")
    
    async def train_on_data(self, domain: str, input_text: str, expected_output: str, feedback: str = None):
        """Add new training data and trigger training"""
        try:
            training_example = {
                "input": input_text,
                "output": expected_output,
                "feedback": feedback,
                "timestamp": datetime.now().isoformat(),
                "quality_score": self._calculate_quality_score(input_text, expected_output, feedback)
            }
            
            self.training_data[domain].append(training_example)
            self.training_stats["domain_training_counts"][domain] += 1
            self.save_training_data()
            
            if len(self.training_data[domain]) % 10 == 0:
                await self._background_training(domain)
            
            self.logger.info(f"Added training data for {domain} domain")
            
        except Exception as e:
            self.logger.error(f"Error in training: {e}")
            raise
    
    def _calculate_quality_score(self, input_text: str, expected_output: str, feedback: str = None) -> float:
        """Calculate quality score for training example"""
        score = 0.5
        
        if len(expected_output) > 100:
            score += 0.1
        if len(input_text.split()) > 10:
            score += 0.1
        
        if feedback:
            if any(word in feedback.lower() for word in ["good", "excellent", "correct", "helpful"]):
                score += 0.2
            elif any(word in feedback.lower() for word in ["bad", "wrong", "incorrect", "unhelpful"]):
                score -= 0.2
        
        return max(0.0, min(1.0, score))
    
    async def _background_training(self, domain: str):
        """Perform background training on accumulated data"""
        try:
            self.logger.info(f"Starting background training for {domain}")
            
            domain_data = self.training_data[domain]
            high_quality_data = [ex for ex in domain_data if ex["quality_score"] > 0.6]
            
            if len(high_quality_data) < 5:
                return
            
            await asyncio.sleep(2)  # Simulate training time
            
            self.training_stats["total_sessions"] += 1
            self.training_stats["last_training"] = datetime.now().isoformat()
            self.training_stats["performance_metrics"][domain] = {
                "examples_used": len(high_quality_data),
                "avg_quality_score": np.mean([ex["quality_score"] for ex in high_quality_data]),
                "last_trained": datetime.now().isoformat()
            }
            
            self.save_training_data()
            self.logger.info(f"Background training completed for {domain}")
            
        except Exception as e:
            self.logger.error(f"Error in background training: {e}")
    
    async def get_training_stats(self) -> Dict[str, Any]:
        """Get current training statistics"""
        return {
            "training_stats": self.training_stats,
            "data_counts": {domain: len(data) for domain, data in self.training_data.items()},
            "recent_examples": {
                domain: data[-3:] if data else [] 
                for domain, data in self.training_data.items()
            }
        }
