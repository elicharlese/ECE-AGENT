import asyncio
import json
import logging
import pickle
import os
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import threading
from pathlib import Path

from .model_manager import model_manager

class AGENTTrainer:
    """Advanced Training system with model versioning and auto-retraining"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.training_data_dir = Path("training_data")
        self.training_data_dir.mkdir(exist_ok=True)
        
        self.domains = ["developer", "trader", "lawyer", "researcher"]
        self.training_data = {domain: [] for domain in self.domains}
        self.training_stats = {
            "total_sessions": 0,
            "last_training": None,
            "domain_training_counts": {domain: 0 for domain in self.domains},
            "performance_metrics": {},
            "auto_retrain_enabled": True,
            "retrain_threshold": 50,  # New data points before retraining
            "model_versions": {},
            "pending_retrains": set()
        }
        
        self.data_file = "agent_training_data.pkl"
        self.load_training_data()
        self.setup_auto_retrain_monitor()
    
    def setup_auto_retrain_monitor(self):
        """Setup background monitoring for auto-retraining"""
        def monitor_retrain():
            while True:
                try:
                    asyncio.run(self.check_retrain_conditions())
                except Exception as e:
                    self.logger.error(f"Auto-retrain monitor error: {e}")
                threading.Event().wait(300)  # Check every 5 minutes
        
        monitor_thread = threading.Thread(target=monitor_retrain, daemon=True)
        monitor_thread.start()
        self.logger.info("Auto-retrain monitor started")
    
    async def check_retrain_conditions(self):
        """Check if any domain needs retraining"""
        for domain in self.domains:
            if domain in self.training_stats["pending_retrains"]:
                continue
                
            new_data_count = len(self.training_data[domain])
            last_retrain_count = self.training_stats["domain_training_counts"].get(domain, 0)
            
            if new_data_count - last_retrain_count >= self.training_stats["retrain_threshold"]:
                self.logger.info(f"Auto-retraining triggered for {domain} domain")
                self.training_stats["pending_retrains"].add(domain)
                await self.retrain_domain_model(domain)
                self.training_stats["pending_retrains"].discard(domain)
    
    def load_training_data(self):
        """Load existing training data from disk with version tracking"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'rb') as f:
                    data = pickle.load(f)
                    self.training_data = data.get('training_data', {domain: [] for domain in self.domains})
                    self.training_stats = data.get('training_stats', self.training_stats)
                    
            # Load individual domain files for backward compatibility
            for domain in self.domains:
                domain_file = self.training_data_dir / f"{domain}_training.json"
                if domain_file.exists():
                    with open(domain_file, 'r') as f:
                        domain_data = json.load(f)
                        if domain not in self.training_data:
                            self.training_data[domain] = []
                        self.training_data[domain].extend(domain_data)
                        
        except Exception as e:
            self.logger.error(f"Error loading training data: {e}")
            self.training_data = {domain: [] for domain in self.domains}
            
        self.logger.info(f"Loaded training data: {[f'{k}: {len(v)}' for k, v in self.training_data.items()]}")
    
    async def retrain_domain_model(self, domain: str):
        """Retrain model for specific domain with version management"""
        try:
            if domain not in self.domains:
                raise ValueError(f"Invalid domain: {domain}")
            
            domain_data = self.training_data[domain]
            if len(domain_data) < 10:  # Minimum data requirement
                self.logger.warning(f"Insufficient data for {domain} retraining: {len(domain_data)} samples")
                return
            
            self.logger.info(f"Starting retraining for {domain} with {len(domain_data)} samples")
            
            # Simulate advanced model training
            training_metadata = {
                "domain": domain,
                "data_size": len(domain_data),
                "epochs": min(50, len(domain_data) // 5),
                "learning_rate": 0.001,
                "batch_size": 32,
                "timestamp": datetime.now().isoformat(),
                "metrics": {
                    "accuracy": 0.85 + np.random.random() * 0.1,
                    "loss": 0.1 + np.random.random() * 0.05,
                    "validation_accuracy": 0.82 + np.random.random() * 0.08
                }
            }
            
            # Create mock model (in real implementation, this would be actual model training)
            mock_model = {
                "domain": domain,
                "training_data_hash": hash(str(domain_data)),
                "parameters": np.random.random((100, 50)),  # Mock model weights
                "metadata": training_metadata
            }
            
            # Create new model version
            version_id = model_manager.create_version(domain, mock_model, training_metadata)
            
            # Benchmark against previous versions
            benchmark_results = model_manager.benchmark_model(domain, version_id, {"samples": domain_data})
            
            # Update training stats
            self.training_stats["domain_training_counts"][domain] = len(domain_data)
            self.training_stats["last_training"] = datetime.now().isoformat()
            self.training_stats["total_sessions"] += 1
            self.training_stats["model_versions"][domain] = version_id
            self.training_stats["performance_metrics"][domain] = benchmark_results
            
            self.save_training_data()
            
            self.logger.info(f"Successfully retrained {domain} model - Version: {version_id}")
            self.logger.info(f"Benchmark results: {benchmark_results}")
            
            return {
                "success": True,
                "version_id": version_id,
                "benchmark": benchmark_results,
                "training_metadata": training_metadata
            }
            
        except Exception as e:
            self.logger.error(f"Error retraining {domain} model: {e}")
            return {"success": False, "error": str(e)}
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
        """Get current training statistics with model version info"""
        return {
            "training_stats": self.training_stats,
            "data_counts": {domain: len(data) for domain, data in self.training_data.items()},
            "recent_examples": {
                domain: data[-3:] if data else [] 
                for domain, data in self.training_data.items()
            },
            "model_versions": self.training_stats.get("model_versions", {}),
            "monitoring_active": self.monitoring_active
        }
    
    def start_auto_retrain_monitoring(self):
        """Start background monitoring for auto-retraining triggers"""
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.logger.warning("Auto-retrain monitoring already running")
            return
            
        self.logger.info("Starting auto-retrain monitoring")
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        
    def stop_auto_retrain_monitoring(self):
        """Stop background monitoring"""
        self.logger.info("Stopping auto-retrain monitoring")
        self.monitoring_active = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5)
            
    def _monitoring_loop(self):
        """Background monitoring loop for auto-retraining"""
        while self.monitoring_active:
            try:
                for domain in self.domains:
                    if self._should_retrain(domain):
                        self.logger.info(f"Auto-retrain triggered for {domain}")
                        asyncio.run(self.retrain_domain_model(domain))
                        
                # Check every 5 minutes
                time.sleep(300)
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
                
    def _should_retrain(self, domain: str) -> bool:
        """Determine if domain model should be retrained"""
        try:
            domain_data = self.training_data.get(domain, [])
            last_training = self.training_stats.get("last_training")
            domain_count = len(domain_data)
            
            # Check if we have minimum data
            if domain_count < 10:
                return False
                
            # Check data growth threshold
            last_count = self.training_stats["domain_training_counts"].get(domain, 0)
            growth_rate = (domain_count - last_count) / max(last_count, 1)
            
            if growth_rate > 0.3:  # 30% data growth
                return True
                
            # Check time-based retraining (weekly)
            if last_training:
                last_train_time = datetime.fromisoformat(last_training)
                time_diff = datetime.now() - last_train_time
                if time_diff.days >= 7:
                    return True
                    
            return False
            
        except Exception as e:
            self.logger.error(f"Error checking retrain criteria for {domain}: {e}")
            return False
            
    async def get_model_performance(self, domain: str):
        """Get performance metrics for domain model"""
        try:
            performance = self.training_stats["performance_metrics"].get(domain, {})
            version_id = self.training_stats["model_versions"].get(domain)
            
            if version_id:
                version_info = model_manager.get_version_info(domain, version_id)
                performance.update(version_info)
                
            return performance
            
        except Exception as e:
            self.logger.error(f"Error getting performance for {domain}: {e}")
            return {}
            
    async def train_model(self, domain: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train model for specific domain with provided data"""
        try:
            if domain not in self.domains:
                raise ValueError(f"Invalid domain: {domain}")
            
            # Add data to training set
            self.training_data[domain].extend(data)
            self.training_stats["domain_training_counts"][domain] += len(data)
            
            # Trigger retraining
            result = await self.retrain_domain_model(domain)
            
            self.save_training_data()
            
            return {
                "success": True,
                "domain": domain,
                "data_points_added": len(data),
                "retrain_result": result
            }
            
        except Exception as e:
            self.logger.error(f"Error training model for {domain}: {e}")
            return {"success": False, "error": str(e)}
            
    async def rollback_model(self, domain: str, version_id: str = None):
        """Rollback domain model to previous version"""
        try:
            if version_id:
                success = model_manager.rollback_to_version(domain, version_id)
            else:
                success = model_manager.rollback_to_previous(domain)
                
            if success:
                # Update stats to reflect rollback
                current_version = model_manager.get_current_version(domain)
                self.training_stats["model_versions"][domain] = current_version
                self.save_training_data()
                
                self.logger.info(f"Successfully rolled back {domain} model to version {current_version}")
                return {"success": True, "version": current_version}
            else:
                return {"success": False, "error": "Rollback failed"}
                
        except Exception as e:
            self.logger.error(f"Error rolling back {domain} model: {e}")
            return {"success": False, "error": str(e)}
