# Advanced Model Management System for AGENT
import json
import os
import pickle
import hashlib
import datetime
from typing import Dict, List, Optional, Any
import shutil
import asyncio
from pathlib import Path

class ModelVersionManager:
    def __init__(self, models_dir: str = "models", archive_dir: str = "model_archive"):
        self.models_dir = Path(models_dir)
        self.archive_dir = Path(archive_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.archive_dir.mkdir(exist_ok=True)
        
        self.version_history = self.load_version_history()
        self.current_models = {}
        self.training_benchmarks = {}
        
    def load_version_history(self) -> Dict[str, List[Dict]]:
        """Load model version history"""
        history_file = self.models_dir / "version_history.json"
        if history_file.exists():
            with open(history_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_version_history(self):
        """Save model version history"""
        history_file = self.models_dir / "version_history.json"
        with open(history_file, 'w') as f:
            json.dump(self.version_history, f, indent=2)
    
    def generate_model_hash(self, model_data: Any) -> str:
        """Generate unique hash for model"""
        if hasattr(model_data, 'state_dict'):
            # PyTorch model
            model_str = str(model_data.state_dict())
        elif hasattr(model_data, 'get_weights'):
            # TensorFlow/Keras model
            model_str = str(model_data.get_weights())
        else:
            # Generic model data
            model_str = str(model_data)
        
        return hashlib.sha256(model_str.encode()).hexdigest()[:16]
    
    def create_version(self, domain: str, model_data: Any, training_metadata: Dict) -> str:
        """Create new model version"""
        timestamp = datetime.datetime.now().isoformat()
        model_hash = self.generate_model_hash(model_data)
        version_id = f"{domain}_v{len(self.version_history.get(domain, [])) + 1}_{model_hash}"
        
        # Prepare version metadata
        version_info = {
            "version_id": version_id,
            "domain": domain,
            "timestamp": timestamp,
            "model_hash": model_hash,
            "training_metadata": training_metadata,
            "performance_metrics": training_metadata.get("metrics", {}),
            "training_data_size": training_metadata.get("data_size", 0),
            "epochs": training_metadata.get("epochs", 0),
            "status": "active"
        }
        
        # Save model data
        model_path = self.models_dir / f"{version_id}.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        # Update version history
        if domain not in self.version_history:
            self.version_history[domain] = []
        
        # Archive previous active version
        for version in self.version_history[domain]:
            if version.get("status") == "active":
                version["status"] = "archived"
                self.archive_model_version(version["version_id"])
        
        self.version_history[domain].append(version_info)
        self.save_version_history()
        
        print(f"Created model version {version_id} for domain {domain}")
        return version_id
    
    def archive_model_version(self, version_id: str):
        """Archive a model version"""
        model_path = self.models_dir / f"{version_id}.pkl"
        if model_path.exists():
            archive_path = self.archive_dir / f"{version_id}.pkl"
            shutil.move(str(model_path), str(archive_path))
            print(f"Archived model version {version_id}")
    
    def load_model_version(self, version_id: str) -> Optional[Any]:
        """Load specific model version"""
        model_path = self.models_dir / f"{version_id}.pkl"
        archive_path = self.archive_dir / f"{version_id}.pkl"
        
        if model_path.exists():
            with open(model_path, 'rb') as f:
                return pickle.load(f)
        elif archive_path.exists():
            with open(archive_path, 'rb') as f:
                return pickle.load(f)
        return None
    
    def get_active_version(self, domain: str) -> Optional[str]:
        """Get active version ID for domain"""
        if domain not in self.version_history:
            return None
        
        for version in reversed(self.version_history[domain]):
            if version.get("status") == "active":
                return version["version_id"]
        return None
    
    def benchmark_model(self, domain: str, version_id: str, test_data: Dict) -> Dict:
        """Benchmark model performance"""
        model = self.load_model_version(version_id)
        if not model:
            return {"error": "Model version not found"}
        
        # Simulate model benchmarking
        benchmark_results = {
            "version_id": version_id,
            "domain": domain,
            "timestamp": datetime.datetime.now().isoformat(),
            "accuracy": 0.85 + (hash(version_id) % 15) / 100,  # Simulated
            "precision": 0.82 + (hash(version_id) % 18) / 100,
            "recall": 0.80 + (hash(version_id) % 20) / 100,
            "f1_score": 0.83 + (hash(version_id) % 17) / 100,
            "inference_time_ms": 50 + (hash(version_id) % 50),
            "memory_usage_mb": 100 + (hash(version_id) % 200),
            "test_data_size": len(test_data.get("samples", [])),
            "comparison_baseline": "gpt-3.5-turbo"
        }
        
        # Store benchmark results
        self.training_benchmarks[version_id] = benchmark_results
        self.save_benchmarks()
        
        return benchmark_results
    
    def save_benchmarks(self):
        """Save benchmark results"""
        benchmark_file = self.models_dir / "benchmarks.json"
        with open(benchmark_file, 'w') as f:
            json.dump(self.training_benchmarks, f, indent=2)
    
    def load_benchmarks(self):
        """Load benchmark results"""
        benchmark_file = self.models_dir / "benchmarks.json"
        if benchmark_file.exists():
            with open(benchmark_file, 'r') as f:
                self.training_benchmarks = json.load(f)
    
    def get_model_lineage(self, domain: str) -> List[Dict]:
        """Get complete model evolution lineage"""
        return self.version_history.get(domain, [])
    
    def rollback_to_version(self, domain: str, version_id: str) -> bool:
        """Rollback to specific model version"""
        if domain not in self.version_history:
            return False
        
        # Find the target version
        target_version = None
        for version in self.version_history[domain]:
            if version["version_id"] == version_id:
                target_version = version
                break
        
        if not target_version:
            return False
        
        # Deactivate current active version
        for version in self.version_history[domain]:
            if version.get("status") == "active":
                version["status"] = "archived"
        
        # Activate target version
        target_version["status"] = "active"
        target_version["rollback_timestamp"] = datetime.datetime.now().isoformat()
        
        # Move model file back from archive if needed
        archive_path = self.archive_dir / f"{version_id}.pkl"
        model_path = self.models_dir / f"{version_id}.pkl"
        
        if archive_path.exists() and not model_path.exists():
            shutil.copy(str(archive_path), str(model_path))
        
        self.save_version_history()
        print(f"Rolled back {domain} to version {version_id}")
        return True
    
    def get_performance_comparison(self, domain: str) -> Dict:
        """Compare performance across model versions"""
        versions = self.version_history.get(domain, [])
        if not versions:
            return {"error": "No versions found for domain"}
        
        comparison = {
            "domain": domain,
            "total_versions": len(versions),
            "versions": [],
            "best_performing": None,
            "latest_active": None
        }
        
        best_score = 0
        
        for version in versions:
            version_id = version["version_id"]
            benchmark = self.training_benchmarks.get(version_id, {})
            
            version_summary = {
                "version_id": version_id,
                "timestamp": version["timestamp"],
                "status": version["status"],
                "accuracy": benchmark.get("accuracy", 0),
                "f1_score": benchmark.get("f1_score", 0),
                "inference_time_ms": benchmark.get("inference_time_ms", 0)
            }
            
            comparison["versions"].append(version_summary)
            
            if version["status"] == "active":
                comparison["latest_active"] = version_summary
            
            if benchmark.get("f1_score", 0) > best_score:
                best_score = benchmark.get("f1_score", 0)
                comparison["best_performing"] = version_summary
        
        return comparison
    
    def cleanup_old_versions(self, domain: str, keep_count: int = 5):
        """Clean up old model versions, keeping only recent ones"""
        if domain not in self.version_history:
            return
        
        versions = self.version_history[domain]
        if len(versions) <= keep_count:
            return
        
        # Sort by timestamp and keep most recent
        versions.sort(key=lambda v: v["timestamp"], reverse=True)
        versions_to_remove = versions[keep_count:]
        
        for version in versions_to_remove:
            version_id = version["version_id"]
            
            # Remove model files
            model_path = self.models_dir / f"{version_id}.pkl"
            archive_path = self.archive_dir / f"{version_id}.pkl"
            
            if model_path.exists():
                model_path.unlink()
            if archive_path.exists():
                archive_path.unlink()
            
            # Remove from benchmarks
            if version_id in self.training_benchmarks:
                del self.training_benchmarks[version_id]
        
        # Update version history
        self.version_history[domain] = versions[:keep_count]
        self.save_version_history()
        self.save_benchmarks()
        
        print(f"Cleaned up {len(versions_to_remove)} old versions for {domain}")

# Global model manager instance
model_manager = ModelVersionManager()
