"""
FreeDataCollector - Interaction Logging and Training Data Export
Collects, analyzes, and exports interaction data for continuous learning
"""

import json
import csv
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict
import os
import uuid

from memory.vector_store import FreeVectorStore
from agents.modes import FreeAgentModes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class InteractionRecord:
    """Represents a single user-agent interaction"""
    interaction_id: str
    conversation_id: str
    user_id: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Input data
    user_input: str = ""
    agent_mode: str = "smart_assistant"
    context_metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Processing data
    reasoning_trace: List[Dict[str, Any]] = field(default_factory=list)
    examples_retrieved: int = 0
    tools_used: List[str] = field(default_factory=list)
    processing_time: float = 0.0
    
    # Output data
    agent_response: str = ""
    response_quality_score: Optional[float] = None
    user_feedback_score: Optional[float] = None
    
    # Metadata
    error_occurred: bool = False
    error_message: Optional[str] = None
    model_version: str = "llama3.1:8b"
    session_metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "interaction_id": self.interaction_id,
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
            "user_input": self.user_input,
            "agent_mode": self.agent_mode,
            "context_metadata": self.context_metadata,
            "reasoning_trace": self.reasoning_trace,
            "examples_retrieved": self.examples_retrieved,
            "tools_used": self.tools_used,
            "processing_time": self.processing_time,
            "agent_response": self.agent_response,
            "response_quality_score": self.response_quality_score,
            "user_feedback_score": self.user_feedback_score,
            "error_occurred": self.error_occurred,
            "error_message": self.error_message,
            "model_version": self.model_version,
            "session_metadata": self.session_metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'InteractionRecord':
        """Create from dictionary"""
        return cls(
            interaction_id=data["interaction_id"],
            conversation_id=data["conversation_id"],
            user_id=data.get("user_id"),
            timestamp=datetime.fromisoformat(data["timestamp"]),
            user_input=data["user_input"],
            agent_mode=data["agent_mode"],
            context_metadata=data["context_metadata"],
            reasoning_trace=data["reasoning_trace"],
            examples_retrieved=data["examples_retrieved"],
            tools_used=data["tools_used"],
            processing_time=data["processing_time"],
            agent_response=data["agent_response"],
            response_quality_score=data.get("response_quality_score"),
            user_feedback_score=data.get("user_feedback_score"),
            error_occurred=data["error_occurred"],
            error_message=data.get("error_message"),
            model_version=data["model_version"],
            session_metadata=data["session_metadata"]
        )
    
    def is_high_quality(self) -> bool:
        """Determine if this interaction is high quality for training"""
        if self.error_occurred:
            return False
        
        # Must have both quality scores and they must be good
        if self.response_quality_score is None or self.user_feedback_score is None:
            return False
        
        # Both scores must be above 4.0
        return self.response_quality_score >= 4.0 and self.user_feedback_score >= 4.0
    
    def get_training_format(self) -> Dict[str, str]:
        """Format for training data export"""
        # Combine context and user input
        context_str = ""
        if self.context_metadata:
            context_str = f"Context: {json.dumps(self.context_metadata)}\n"
        
        # Format reasoning trace
        reasoning_str = ""
        if self.reasoning_trace:
            reasoning_steps = []
            for i, step in enumerate(self.reasoning_trace):
                reasoning_steps.append(f"Step {i+1}: {step.get('reasoning', '')}")
            reasoning_str = f"Reasoning: {' | '.join(reasoning_steps)}\n"
        
        # Create training example
        return {
            "instruction": f"You are an AI assistant in {self.agent_mode.replace('_', ' ')} mode. {context_str}Respond to the following user input:",
            "input": self.user_input,
            "output": f"{reasoning_str}Response: {self.agent_response}"
        }


@dataclass
class TrainingDataset:
    """Represents a collection of training examples"""
    dataset_id: str
    name: str
    description: str
    created_at: datetime = field(default_factory=datetime.now)
    interactions: List[InteractionRecord] = field(default_factory=list)
    quality_threshold: float = 4.0
    min_interactions: int = 100
    
    def add_interaction(self, interaction: InteractionRecord) -> None:
        """Add interaction to dataset"""
        self.interactions.append(interaction)
    
    def get_training_examples(self) -> List[Dict[str, str]]:
        """Get high-quality training examples"""
        high_quality = [i for i in self.interactions if i.is_high_quality()]
        return [i.get_training_format() for i in high_quality]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get dataset statistics"""
        total_interactions = len(self.interactions)
        high_quality = len([i for i in self.interactions if i.is_high_quality()])
        quality_rate = high_quality / total_interactions if total_interactions > 0 else 0
        
        # Mode distribution
        mode_counts = defaultdict(int)
        for interaction in self.interactions:
            mode_counts[interaction.agent_mode] += 1
        
        # Quality scores distribution
        quality_scores = [i.response_quality_score for i in self.interactions if i.response_quality_score is not None]
        feedback_scores = [i.user_feedback_score for i in self.interactions if i.user_feedback_score is not None]
        
        return {
            "dataset_id": self.dataset_id,
            "name": self.name,
            "total_interactions": total_interactions,
            "high_quality_interactions": high_quality,
            "quality_rate": round(quality_rate, 3),
            "mode_distribution": dict(mode_counts),
            "avg_response_quality": round(sum(quality_scores) / len(quality_scores), 2) if quality_scores else None,
            "avg_user_feedback": round(sum(feedback_scores) / len(feedback_scores), 2) if feedback_scores else None,
            "training_examples_available": len(self.get_training_examples()),
            "ready_for_training": len(self.get_training_examples()) >= self.min_interactions
        }


class FreeDataCollector:
    """
    FreeDataCollector - Comprehensive interaction logging and training data management
    
    Features:
    - Real-time interaction logging
    - Quality assessment and feedback collection
    - Training data export and formatting
    - Performance analytics and insights
    - Automated data quality improvement
    """

    def __init__(
        self,
        vector_store: FreeVectorStore,
        agent_modes: FreeAgentModes,
        data_dir: str = "data/training",
        max_records: int = 10000,
        auto_save_interval: int = 300  # 5 minutes
    ):
        """
        Initialize the data collector

        Args:
            vector_store: FreeVectorStore instance for example storage
            agent_modes: FreeAgentModes instance
            data_dir: Directory to store training data
            max_records: Maximum records to keep in memory
            auto_save_interval: Auto-save interval in seconds
        """
        
        self.vector_store = vector_store
        self.agent_modes = agent_modes
        self.data_dir = data_dir
        self.max_records = max_records
        self.auto_save_interval = auto_save_interval
        
        # Data storage
        self.interactions: List[InteractionRecord] = []
        self.training_datasets: Dict[str, TrainingDataset] = {}
        
        # Analytics
        self.analytics_cache: Dict[str, Any] = {}
        self.last_save_time = datetime.now()
        
        # Create data directory
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Load existing data
        self._load_existing_data()
        
        logger.info(f"FreeDataCollector initialized with data directory: {self.data_dir}")

    def log_interaction(
        self,
        conversation_id: str,
        user_input: str,
        agent_response: str,
        agent_mode: str,
        processing_time: float,
        reasoning_trace: Optional[List[Dict[str, Any]]] = None,
        examples_retrieved: int = 0,
        tools_used: Optional[List[str]] = None,
        user_id: Optional[str] = None,
        context_metadata: Optional[Dict[str, Any]] = None,
        error_occurred: bool = False,
        error_message: Optional[str] = None
    ) -> str:
        """
        Log a user-agent interaction

        Returns:
            Interaction ID for future reference
        """
        
        interaction_id = str(uuid.uuid4())
        
        interaction = InteractionRecord(
            interaction_id=interaction_id,
            conversation_id=conversation_id,
            user_id=user_id,
            user_input=user_input,
            agent_mode=agent_mode,
            agent_response=agent_response,
            processing_time=processing_time,
            reasoning_trace=reasoning_trace or [],
            examples_retrieved=examples_retrieved,
            tools_used=tools_used or [],
            context_metadata=context_metadata or {},
            error_occurred=error_occurred,
            error_message=error_message
        )
        
        self.interactions.append(interaction)
        
        # Maintain size limit
        if len(self.interactions) > self.max_records:
            # Remove oldest records
            remove_count = len(self.interactions) - self.max_records
            self.interactions = self.interactions[remove_count:]
        
        # Auto-save if interval exceeded
        if (datetime.now() - self.last_save_time).total_seconds() > self.auto_save_interval:
            self.save_data()
        
        # Add to vector store if high quality (will be determined later with feedback)
        # For now, we'll add all non-error interactions
        if not error_occurred and len(agent_response.strip()) > 10:
            try:
                self.vector_store.add_example(
                    text=user_input,
                    metadata={
                        "response": agent_response,
                        "mode": agent_mode,
                        "interaction_id": interaction_id,
                        "quality_score": None,  # Will be updated with feedback
                        "tags": f"interaction,{agent_mode}"
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to add example to vector store: {str(e)}")
        
        logger.info(f"Logged interaction: {interaction_id} for conversation: {conversation_id}")
        return interaction_id

    def add_feedback(
        self,
        interaction_id: str,
        user_feedback_score: float,
        response_quality_score: Optional[float] = None
    ) -> bool:
        """
        Add user feedback to an interaction

        Args:
            interaction_id: ID of the interaction
            user_feedback_score: User's rating (1-5)
            response_quality_score: Optional system-estimated quality score

        Returns:
            True if feedback was added successfully
        """
        
        for interaction in self.interactions:
            if interaction.interaction_id == interaction_id:
                interaction.user_feedback_score = user_feedback_score
                if response_quality_score is not None:
                    interaction.response_quality_score = response_quality_score
                
                # Update vector store example if it's high quality
                if interaction.is_high_quality():
                    try:
                        # Note: In a real implementation, you'd need to update the existing example
                        # or remove and re-add it with updated metadata
                        pass
                    except Exception as e:
                        logger.warning(f"Failed to update example quality: {str(e)}")
                
                logger.info(f"Added feedback to interaction: {interaction_id}")
                return True
        
        logger.warning(f"Interaction not found for feedback: {interaction_id}")
        return False

    def create_training_dataset(
        self,
        name: str,
        description: str,
        quality_threshold: float = 4.0,
        min_interactions: int = 100
    ) -> str:
        """
        Create a new training dataset

        Returns:
            Dataset ID
        """
        
        dataset_id = str(uuid.uuid4())
        
        dataset = TrainingDataset(
            dataset_id=dataset_id,
            name=name,
            description=description,
            quality_threshold=quality_threshold,
            min_interactions=min_interactions
        )
        
        # Add existing high-quality interactions
        for interaction in self.interactions:
            if interaction.is_high_quality():
                dataset.add_interaction(interaction)
        
        self.training_datasets[dataset_id] = dataset
        
        logger.info(f"Created training dataset: {dataset_id} ({name})")
        return dataset_id

    def export_training_data(
        self,
        dataset_id: Optional[str] = None,
        format: str = "json",
        output_path: Optional[str] = None
    ) -> str:
        """
        Export training data

        Args:
            dataset_id: Specific dataset to export, or None for all high-quality interactions
            format: Export format ("json", "csv", "jsonl")
            output_path: Custom output path

        Returns:
            Path to exported file
        """
        
        if dataset_id:
            if dataset_id not in self.training_datasets:
                raise ValueError(f"Dataset not found: {dataset_id}")
            dataset = self.training_datasets[dataset_id]
            training_examples = dataset.get_training_examples()
            filename = f"training_dataset_{dataset.name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        else:
            # Export all high-quality interactions
            high_quality_interactions = [i for i in self.interactions if i.is_high_quality()]
            training_examples = [i.get_training_format() for i in high_quality_interactions]
            filename = f"all_training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if output_path:
            filepath = output_path
        else:
            filepath = os.path.join(self.data_dir, f"{filename}.{format}")
        
        if format == "json":
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(training_examples, f, indent=2, ensure_ascii=False)
        
        elif format == "jsonl":
            with open(filepath, 'w', encoding='utf-8') as f:
                for example in training_examples:
                    f.write(json.dumps(example, ensure_ascii=False) + '\n')
        
        elif format == "csv":
            if training_examples:
                with open(filepath, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=training_examples[0].keys())
                    writer.writeheader()
                    writer.writerows(training_examples)
        
        logger.info(f"Exported {len(training_examples)} training examples to: {filepath}")
        return filepath

    def get_analytics(self, refresh: bool = False) -> Dict[str, Any]:
        """
        Get comprehensive analytics about interactions and performance

        Args:
            refresh: Force refresh of cached analytics

        Returns:
            Analytics dictionary
        """
        
        if not refresh and self.analytics_cache:
            cache_age = (datetime.now() - self.analytics_cache.get("generated_at", datetime.min)).total_seconds()
            if cache_age < 300:  # 5 minutes
                return self.analytics_cache
        
        analytics = {
            "generated_at": datetime.now().isoformat(),
            "total_interactions": len(self.interactions),
            "date_range": {
                "oldest": min((i.timestamp for i in self.interactions), default=None),
                "newest": max((i.timestamp for i in self.interactions), default=None)
            }
        }
        
        # Quality statistics
        quality_scores = [i.response_quality_score for i in self.interactions if i.response_quality_score is not None]
        feedback_scores = [i.user_feedback_score for i in self.interactions if i.user_feedback_score is not None]
        
        analytics["quality_stats"] = {
            "avg_response_quality": round(sum(quality_scores) / len(quality_scores), 2) if quality_scores else None,
            "avg_user_feedback": round(sum(feedback_scores) / len(feedback_scores), 2) if feedback_scores else None,
            "high_quality_rate": len([i for i in self.interactions if i.is_high_quality()]) / len(self.interactions) if self.interactions else 0
        }
        
        # Mode distribution
        mode_counts = defaultdict(int)
        mode_quality = defaultdict(list)
        
        for interaction in self.interactions:
            mode_counts[interaction.agent_mode] += 1
            if interaction.response_quality_score is not None:
                mode_quality[interaction.agent_mode].append(interaction.response_quality_score)
        
        analytics["mode_stats"] = {
            mode: {
                "count": count,
                "percentage": count / len(self.interactions) if self.interactions else 0,
                "avg_quality": round(sum(scores) / len(scores), 2) if scores else None
            }
            for mode, count in mode_counts.items()
            for scores in [mode_quality[mode]]
        }
        
        # Error analysis
        error_count = len([i for i in self.interactions if i.error_occurred])
        analytics["error_stats"] = {
            "total_errors": error_count,
            "error_rate": error_count / len(self.interactions) if self.interactions else 0,
            "common_errors": defaultdict(int)
        }
        
        # Performance metrics
        processing_times = [i.processing_time for i in self.interactions if i.processing_time > 0]
        analytics["performance_stats"] = {
            "avg_processing_time": round(sum(processing_times) / len(processing_times), 3) if processing_times else None,
            "min_processing_time": min(processing_times) if processing_times else None,
            "max_processing_time": max(processing_times) if processing_times else None
        }
        
        # Training data readiness
        high_quality_count = len([i for i in self.interactions if i.is_high_quality()])
        analytics["training_readiness"] = {
            "high_quality_interactions": high_quality_count,
            "training_examples_available": high_quality_count,
            "datasets_count": len(self.training_datasets),
            "ready_for_fine_tuning": high_quality_count >= 1000  # Arbitrary threshold
        }
        
        self.analytics_cache = analytics
        return analytics

    def save_data(self) -> None:
        """Save current data to disk"""
        
        try:
            # Save interactions
            interactions_file = os.path.join(self.data_dir, "interactions.jsonl")
            with open(interactions_file, 'w', encoding='utf-8') as f:
                for interaction in self.interactions:
                    f.write(json.dumps(interaction.to_dict(), ensure_ascii=False) + '\n')
            
            # Save training datasets
            datasets_file = os.path.join(self.data_dir, "training_datasets.json")
            datasets_data = {
                dataset_id: {
                    "dataset_id": dataset.dataset_id,
                    "name": dataset.name,
                    "description": dataset.description,
                    "created_at": dataset.created_at.isoformat(),
                    "quality_threshold": dataset.quality_threshold,
                    "min_interactions": dataset.min_interactions,
                    "interaction_ids": [i.interaction_id for i in dataset.interactions]
                }
                for dataset_id, dataset in self.training_datasets.items()
            }
            
            with open(datasets_file, 'w', encoding='utf-8') as f:
                json.dump(datasets_data, f, indent=2, ensure_ascii=False)
            
            self.last_save_time = datetime.now()
            logger.info(f"Data saved to {self.data_dir}")
            
        except Exception as e:
            logger.error(f"Failed to save data: {str(e)}")

    def _load_existing_data(self) -> None:
        """Load existing data from disk"""
        
        try:
            # Load interactions
            interactions_file = os.path.join(self.data_dir, "interactions.jsonl")
            if os.path.exists(interactions_file):
                with open(interactions_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.strip():
                            data = json.loads(line)
                            interaction = InteractionRecord.from_dict(data)
                            self.interactions.append(interaction)
            
            # Load training datasets
            datasets_file = os.path.join(self.data_dir, "training_datasets.json")
            if os.path.exists(datasets_file):
                with open(datasets_file, 'r', encoding='utf-8') as f:
                    datasets_data = json.load(f)
                    
                for dataset_id, dataset_info in datasets_data.items():
                    dataset = TrainingDataset(
                        dataset_id=dataset_info["dataset_id"],
                        name=dataset_info["name"],
                        description=dataset_info["description"],
                        created_at=datetime.fromisoformat(dataset_info["created_at"]),
                        quality_threshold=dataset_info["quality_threshold"],
                        min_interactions=dataset_info["min_interactions"]
                    )
                    
                    # Add interactions to dataset
                    for interaction_id in dataset_info["interaction_ids"]:
                        for interaction in self.interactions:
                            if interaction.interaction_id == interaction_id:
                                dataset.add_interaction(interaction)
                                break
                    
                    self.training_datasets[dataset_id] = dataset
            
            logger.info(f"Loaded {len(self.interactions)} interactions and {len(self.training_datasets)} datasets")
            
        except Exception as e:
            logger.warning(f"Failed to load existing data: {str(e)}")

    def cleanup_old_data(self, days_to_keep: int = 90) -> int:
        """
        Clean up old interaction data

        Args:
            days_to_keep: Number of days of data to keep

        Returns:
            Number of records removed
        """
        
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        original_count = len(self.interactions)
        
        self.interactions = [
            interaction for interaction in self.interactions
            if interaction.timestamp > cutoff_date
        ]
        
        removed_count = original_count - len(self.interactions)
        
        if removed_count > 0:
            logger.info(f"Cleaned up {removed_count} old interactions")
            self.save_data()
        
        return removed_count


# Global instance for easy access
data_collector = None

def get_data_collector(
    vector_store: Optional[FreeVectorStore] = None,
    agent_modes: Optional[FreeAgentModes] = None
) -> FreeDataCollector:
    """Get or create global data collector instance"""
    global data_collector
    
    if data_collector is None:
        if not all([vector_store, agent_modes]):
            raise ValueError("All components must be provided for initial data collector creation")
        
        data_collector = FreeDataCollector(
            vector_store=vector_store,
            agent_modes=agent_modes
        )
    
    return data_collector
