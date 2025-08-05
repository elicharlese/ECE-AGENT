"""
Self Trainer
============

Core self-training system that orchestrates continuous learning, 
bias mitigation, and performance optimization.
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
import json
import pickle
from pathlib import Path

from .bias_detector import BiasDetector, BiasType, BiasMetric
from .autocorrelation_mapper import AutocorrelationMapper, PatternSignature
from .pattern_analyzer import PatternAnalyzer
from .performance_monitor import PerformanceMonitor

logger = logging.getLogger(__name__)

class TrainingMode(Enum):
    """Training modes for the self-trainer"""
    CONTINUOUS = "continuous"
    BATCH = "batch"
    TRIGGERED = "triggered"
    MANUAL = "manual"

class AdaptationStrategy(Enum):
    """Strategies for adapting to detected patterns"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    CUSTOM = "custom"

@dataclass
class TrainingObjective:
    """Represents a training objective with metrics and targets"""
    name: str
    metric_name: str
    target_value: float
    current_value: float = 0.0
    weight: float = 1.0
    tolerance: float = 0.05
    history: List[float] = field(default_factory=list)
    last_updated: Optional[datetime] = None

@dataclass
class AdaptationAction:
    """Represents an adaptation action to be taken"""
    action_type: str
    target_component: str
    parameters: Dict[str, Any]
    priority: float
    expected_impact: float
    rationale: str
    timestamp: datetime

class SelfTrainer:
    """
    Advanced self-training system for continuous agent improvement
    
    Features:
    - Real-time bias detection and mitigation
    - Pattern-based learning adaptation
    - Performance optimization
    - Automated hyperparameter tuning
    - Quality assurance and validation
    - Rollback capabilities for failed adaptations
    """
    
    def __init__(self,
                 training_mode: TrainingMode = TrainingMode.CONTINUOUS,
                 adaptation_strategy: AdaptationStrategy = AdaptationStrategy.MODERATE,
                 learning_rate: float = 0.01,
                 adaptation_threshold: float = 0.1,
                 save_path: Optional[str] = None):
        """
        Initialize self-trainer
        
        Args:
            training_mode: How training should be triggered
            adaptation_strategy: How aggressive adaptations should be
            learning_rate: Base learning rate for adaptations
            adaptation_threshold: Minimum change threshold for adaptations
            save_path: Path to save training state
        """
        self.training_mode = training_mode
        self.adaptation_strategy = adaptation_strategy
        self.learning_rate = learning_rate
        self.adaptation_threshold = adaptation_threshold
        self.save_path = Path(save_path) if save_path else Path("./self_training_state")
        
        # Core components
        self.bias_detector = BiasDetector()
        self.autocorr_mapper = AutocorrelationMapper()
        self.pattern_analyzer = PatternAnalyzer()
        self.performance_monitor = PerformanceMonitor()
        
        # Training state
        self.training_objectives: Dict[str, TrainingObjective] = {}
        self.adaptation_history: List[AdaptationAction] = []
        self.current_adaptations: Dict[str, Any] = {}
        self.training_session_id: str = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Performance tracking
        self.baseline_metrics: Dict[str, float] = {}
        self.current_metrics: Dict[str, float] = {}
        self.improvement_targets: Dict[str, float] = {}
        
        # Safety and validation
        self.adaptation_lock = asyncio.Lock()
        self.validation_queue: List[Dict[str, Any]] = []
        self.rollback_stack: List[Dict[str, Any]] = []
        self.max_rollback_depth = 10
        
        # Initialize default objectives
        self._initialize_default_objectives()
        
        logger.info(f"SelfTrainer initialized with mode={training_mode}, strategy={adaptation_strategy}")
    
    def _initialize_default_objectives(self):
        """Initialize default training objectives"""
        default_objectives = [
            TrainingObjective(
                name="bias_minimization",
                metric_name="avg_bias_score",
                target_value=0.05,
                weight=1.5
            ),
            TrainingObjective(
                name="response_quality",
                metric_name="avg_response_quality",
                target_value=0.85,
                weight=1.0
            ),
            TrainingObjective(
                name="response_consistency",
                metric_name="response_variance",
                target_value=0.15,
                weight=0.8
            ),
            TrainingObjective(
                name="user_satisfaction",
                metric_name="avg_user_satisfaction",
                target_value=0.9,
                weight=1.2
            ),
            TrainingObjective(
                name="response_time",
                metric_name="avg_response_time",
                target_value=2.0,
                weight=0.6
            )
        ]
        
        for obj in default_objectives:
            self.training_objectives[obj.name] = obj
    
    async def process_interaction(self,
                                user_input: str,
                                model_output: str,
                                response_time: float,
                                user_metadata: Optional[Dict[str, Any]] = None,
                                user_satisfaction: Optional[float] = None,
                                context: Optional[Dict[str, Any]] = None):
        """
        Process a new interaction for training
        
        Args:
            user_input: User's input text
            model_output: Model's response
            response_time: Time taken to generate response
            user_metadata: User demographic/context data
            user_satisfaction: Optional satisfaction rating
            context: Additional context information
        """
        try:
            # Log interaction with all components
            self.bias_detector.log_interaction(
                user_input, model_output, user_metadata, context
            )
            
            self.autocorr_mapper.add_interaction(
                user_input, model_output, response_time, user_satisfaction, context
            )
            
            self.pattern_analyzer.add_interaction(
                user_input, model_output, response_time, user_satisfaction, context
            )
            
            self.performance_monitor.log_interaction(
                user_input, model_output, response_time, user_satisfaction, context
            )
            
            # Update current metrics
            await self._update_current_metrics()
            
            # Check if training should be triggered
            if await self._should_trigger_training():
                await self._execute_training_cycle()
                
        except Exception as e:
            logger.error(f"Error processing interaction: {e}")
    
    async def _update_current_metrics(self):
        """Update current performance metrics"""
        try:
            # Get bias metrics
            bias_results = self.bias_detector.detect_all_bias_types()
            if bias_results:
                avg_bias = np.mean([result.score for result in bias_results])
                self.current_metrics['avg_bias_score'] = avg_bias
            
            # Get performance metrics
            perf_summary = self.performance_monitor.get_performance_summary()
            self.current_metrics.update({
                'avg_response_time': perf_summary.get('avg_response_time', 0),
                'avg_user_satisfaction': perf_summary.get('avg_user_satisfaction', 0),
                'response_variance': perf_summary.get('response_variance', 0)
            })
            
            # Get pattern metrics
            pattern_summary = self.pattern_analyzer.get_analysis_summary()
            quality_score = pattern_summary.get('quality_score', 0.5)
            self.current_metrics['avg_response_quality'] = quality_score
            
            # Update objective histories
            for obj_name, objective in self.training_objectives.items():
                if objective.metric_name in self.current_metrics:
                    current_value = self.current_metrics[objective.metric_name]
                    objective.current_value = current_value
                    objective.history.append(current_value)
                    objective.last_updated = datetime.now()
                    
                    # Maintain history size
                    if len(objective.history) > 100:
                        objective.history = objective.history[-100:]
                        
        except Exception as e:
            logger.error(f"Error updating metrics: {e}")
    
    async def _should_trigger_training(self) -> bool:
        """
        Determine if training should be triggered
        
        Returns:
            True if training should be triggered
        """
        if self.training_mode == TrainingMode.MANUAL:
            return False
        
        if self.training_mode == TrainingMode.CONTINUOUS:
            # Check if any objective is significantly off target
            for objective in self.training_objectives.values():
                if len(objective.history) >= 5:
                    deviation = abs(objective.current_value - objective.target_value)
                    if deviation > objective.tolerance:
                        logger.info(f"Training triggered by objective {objective.name}: deviation={deviation:.3f}")
                        return True
        
        elif self.training_mode == TrainingMode.BATCH:
            # Check if enough interactions have been processed
            interaction_count = len(self.bias_detector.interaction_history)
            if interaction_count % 100 == 0 and interaction_count > 0:
                return True
        
        elif self.training_mode == TrainingMode.TRIGGERED:
            # Check for specific trigger conditions
            bias_results = self.bias_detector.detect_all_bias_types()
            if any(result.is_biased for result in bias_results):
                logger.info("Training triggered by bias detection")
                return True
            
            # Check for performance degradation
            if 'avg_response_quality' in self.current_metrics:
                if self.current_metrics['avg_response_quality'] < 0.6:
                    logger.info("Training triggered by quality degradation")
                    return True
        
        return False
    
    async def _execute_training_cycle(self):
        """Execute a complete training cycle"""
        async with self.adaptation_lock:
            try:
                logger.info(f"Starting training cycle {self.training_session_id}")
                
                # Analyze current state
                analysis_results = await self._analyze_current_state()
                
                # Generate adaptation actions
                actions = await self._generate_adaptation_actions(analysis_results)
                
                # Validate and prioritize actions
                validated_actions = await self._validate_actions(actions)
                
                # Execute actions
                if validated_actions:
                    await self._execute_actions(validated_actions)
                    
                    # Monitor results
                    await self._monitor_adaptation_results()
                
                logger.info(f"Training cycle completed with {len(validated_actions)} actions")
                
            except Exception as e:
                logger.error(f"Error in training cycle: {e}")
                await self._handle_training_error(e)
    
    async def _analyze_current_state(self) -> Dict[str, Any]:
        """
        Analyze current agent state and performance
        
        Returns:
            Dictionary with analysis results
        """
        analysis = {
            'timestamp': datetime.now(),
            'metrics': self.current_metrics.copy(),
            'objectives_status': {},
            'bias_analysis': {},
            'pattern_analysis': {},
            'performance_analysis': {}
        }
        
        # Analyze objectives
        for name, objective in self.training_objectives.items():
            if len(objective.history) >= 3:
                recent_trend = np.mean(objective.history[-3:]) - np.mean(objective.history[-6:-3]) if len(objective.history) >= 6 else 0
                analysis['objectives_status'][name] = {
                    'current_value': objective.current_value,
                    'target_value': objective.target_value,
                    'deviation': abs(objective.current_value - objective.target_value),
                    'within_tolerance': abs(objective.current_value - objective.target_value) <= objective.tolerance,
                    'trend': recent_trend,
                    'priority': objective.weight * abs(objective.current_value - objective.target_value)
                }
        
        # Get component analyses
        analysis['bias_analysis'] = self.bias_detector.get_bias_summary()
        analysis['pattern_analysis'] = self.autocorr_mapper.get_pattern_summary()
        analysis['performance_analysis'] = self.performance_monitor.get_performance_summary()
        
        return analysis
    
    async def _generate_adaptation_actions(self, analysis: Dict[str, Any]) -> List[AdaptationAction]:
        """
        Generate adaptation actions based on analysis
        
        Args:
            analysis: Current state analysis
            
        Returns:
            List of potential adaptation actions
        """
        actions = []
        
        try:
            # Bias mitigation actions
            bias_analysis = analysis.get('bias_analysis', {})
            if bias_analysis.get('bias_detected', 0) > 0:
                actions.append(AdaptationAction(
                    action_type="bias_mitigation",
                    target_component="response_generation",
                    parameters={
                        'bias_penalty_weight': min(1.0, self.current_adaptations.get('bias_penalty_weight', 0.1) + 0.1),
                        'fairness_constraint': True
                    },
                    priority=0.9,
                    expected_impact=0.3,
                    rationale=f"Bias detected in {bias_analysis.get('bias_detected')} cases",
                    timestamp=datetime.now()
                ))
            
            # Response quality improvements
            quality_obj = analysis['objectives_status'].get('response_quality', {})
            if not quality_obj.get('within_tolerance', True):
                learning_adjustment = self.learning_rate * quality_obj.get('priority', 1.0)
                actions.append(AdaptationAction(
                    action_type="quality_enhancement",
                    target_component="response_generation",
                    parameters={
                        'quality_weight': min(2.0, self.current_adaptations.get('quality_weight', 1.0) + learning_adjustment),
                        'complexity_threshold': max(0.3, self.current_adaptations.get('complexity_threshold', 0.5) - 0.1)
                    },
                    priority=quality_obj.get('priority', 0.5),
                    expected_impact=learning_adjustment,
                    rationale=f"Quality below target: {quality_obj.get('current_value', 0):.3f} vs {quality_obj.get('target_value', 0):.3f}",
                    timestamp=datetime.now()
                ))
            
            # Response time optimization
            time_obj = analysis['objectives_status'].get('response_time', {})
            if not time_obj.get('within_tolerance', True) and time_obj.get('current_value', 0) > time_obj.get('target_value', 0):
                actions.append(AdaptationAction(
                    action_type="speed_optimization",
                    target_component="inference",
                    parameters={
                        'max_tokens': max(100, self.current_adaptations.get('max_tokens', 500) - 50),
                        'temperature': max(0.1, self.current_adaptations.get('temperature', 0.7) - 0.1)
                    },
                    priority=time_obj.get('priority', 0.3),
                    expected_impact=0.2,
                    rationale=f"Response time too high: {time_obj.get('current_value', 0):.3f}s",
                    timestamp=datetime.now()
                ))
            
            # Pattern-based adaptations
            pattern_analysis = analysis.get('pattern_analysis', {})
            significant_patterns = pattern_analysis.get('pattern_types', {})
            
            for pattern_type, pattern_info in significant_patterns.items():
                if pattern_info.get('avg_strength', 0) > 0.7:
                    if pattern_type == "semantic_repetition":
                        actions.append(AdaptationAction(
                            action_type="diversity_enhancement",
                            target_component="response_generation",
                            parameters={
                                'diversity_penalty': min(1.0, self.current_adaptations.get('diversity_penalty', 0.0) + 0.2),
                                'repetition_threshold': max(0.3, self.current_adaptations.get('repetition_threshold', 0.8) - 0.1)
                            },
                            priority=0.6,
                            expected_impact=0.25,
                            rationale=f"High semantic repetition detected in responses",
                            timestamp=datetime.now()
                        ))
            
            # Sort actions by priority
            actions.sort(key=lambda x: x.priority, reverse=True)
            
            return actions
            
        except Exception as e:
            logger.error(f"Error generating adaptation actions: {e}")
            return []
    
    async def _validate_actions(self, actions: List[AdaptationAction]) -> List[AdaptationAction]:
        """
        Validate adaptation actions before execution
        
        Args:
            actions: List of proposed actions
            
        Returns:
            List of validated actions
        """
        validated = []
        
        for action in actions:
            try:
                # Check if action is safe
                if await self._is_action_safe(action):
                    # Check if action conflicts with recent adaptations
                    if not await self._conflicts_with_recent_adaptations(action):
                        # Check adaptation strategy constraints
                        if await self._meets_strategy_constraints(action):
                            validated.append(action)
                        else:
                            logger.info(f"Action {action.action_type} rejected by strategy constraints")
                    else:
                        logger.info(f"Action {action.action_type} conflicts with recent adaptations")
                else:
                    logger.warning(f"Action {action.action_type} deemed unsafe")
                    
            except Exception as e:
                logger.error(f"Error validating action {action.action_type}: {e}")
        
        return validated
    
    async def _is_action_safe(self, action: AdaptationAction) -> bool:
        """
        Check if an adaptation action is safe to execute
        
        Args:
            action: The action to validate
            
        Returns:
            True if action is safe
        """
        # Parameter boundary checks
        params = action.parameters
        
        if action.action_type == "bias_mitigation":
            if params.get('bias_penalty_weight', 0) > 1.5:
                return False
        
        elif action.action_type == "speed_optimization":
            if params.get('max_tokens', 0) < 50:
                return False
            if params.get('temperature', 0) < 0.05:
                return False
        
        elif action.action_type == "quality_enhancement":
            if params.get('quality_weight', 0) > 3.0:
                return False
        
        # Check expected impact is reasonable
        if action.expected_impact > 0.8:  # Suspiciously high impact
            return False
        
        return True
    
    async def _conflicts_with_recent_adaptations(self, action: AdaptationAction) -> bool:
        """
        Check if action conflicts with recent adaptations
        
        Args:
            action: The action to check
            
        Returns:
            True if there's a conflict
        """
        # Check recent adaptation history
        recent_cutoff = datetime.now() - timedelta(minutes=30)
        recent_actions = [a for a in self.adaptation_history if a.timestamp >= recent_cutoff]
        
        # Check for opposite actions
        opposite_actions = {
            "bias_mitigation": ["speed_optimization"],
            "speed_optimization": ["quality_enhancement", "bias_mitigation"],
            "quality_enhancement": ["speed_optimization"]
        }
        
        conflicting_types = opposite_actions.get(action.action_type, [])
        
        for recent_action in recent_actions:
            if recent_action.action_type in conflicting_types:
                return True
        
        return False
    
    async def _meets_strategy_constraints(self, action: AdaptationAction) -> bool:
        """
        Check if action meets adaptation strategy constraints
        
        Args:
            action: The action to check
            
        Returns:
            True if action meets strategy constraints
        """
        if self.adaptation_strategy == AdaptationStrategy.CONSERVATIVE:
            # Conservative: small changes only
            return action.expected_impact <= 0.2
        
        elif self.adaptation_strategy == AdaptationStrategy.MODERATE:
            # Moderate: medium changes allowed
            return action.expected_impact <= 0.5
        
        elif self.adaptation_strategy == AdaptationStrategy.AGGRESSIVE:
            # Aggressive: large changes allowed
            return action.expected_impact <= 0.8
        
        return True  # Custom strategy allows all
    
    async def _execute_actions(self, actions: List[AdaptationAction]):
        """
        Execute validated adaptation actions
        
        Args:
            actions: List of actions to execute
        """
        # Save current state for potential rollback
        await self._save_rollback_point()
        
        executed_actions = []
        
        for action in actions:
            try:
                logger.info(f"Executing action: {action.action_type} on {action.target_component}")
                
                # Apply the adaptation
                await self._apply_adaptation(action)
                
                # Record the action
                self.adaptation_history.append(action)
                executed_actions.append(action)
                
                # Update current adaptations
                for param_name, param_value in action.parameters.items():
                    self.current_adaptations[param_name] = param_value
                
            except Exception as e:
                logger.error(f"Error executing action {action.action_type}: {e}")
                # Consider rollback if critical error
                if action.priority > 0.8:
                    await self._rollback_last_adaptation()
                    break
        
        # Maintain adaptation history size
        if len(self.adaptation_history) > 1000:
            self.adaptation_history = self.adaptation_history[-1000:]
        
        logger.info(f"Executed {len(executed_actions)} actions successfully")
    
    async def _apply_adaptation(self, action: AdaptationAction):
        """
        Apply a specific adaptation action
        
        Args:
            action: The action to apply
        """
        # This is where you would integrate with the actual model/system
        # For now, we just simulate the adaptation
        
        if action.action_type == "bias_mitigation":
            # In real implementation, this would adjust model weights or inference parameters
            logger.info(f"Applied bias mitigation with penalty weight {action.parameters.get('bias_penalty_weight')}")
        
        elif action.action_type == "quality_enhancement":
            # In real implementation, this would adjust quality optimization parameters
            logger.info(f"Applied quality enhancement with weight {action.parameters.get('quality_weight')}")
        
        elif action.action_type == "speed_optimization":
            # In real implementation, this would adjust inference parameters
            logger.info(f"Applied speed optimization with max_tokens {action.parameters.get('max_tokens')}")
        
        elif action.action_type == "diversity_enhancement":
            # In real implementation, this would adjust diversity constraints
            logger.info(f"Applied diversity enhancement with penalty {action.parameters.get('diversity_penalty')}")
    
    async def _monitor_adaptation_results(self):
        """Monitor the results of recent adaptations"""
        # Wait a bit for adaptations to take effect
        await asyncio.sleep(1)
        
        # This would involve measuring performance after adaptations
        # and determining if they were successful
        logger.info("Monitoring adaptation results...")
    
    async def _save_rollback_point(self):
        """Save current state for potential rollback"""
        rollback_data = {
            'timestamp': datetime.now(),
            'current_adaptations': self.current_adaptations.copy(),
            'current_metrics': self.current_metrics.copy()
        }
        
        self.rollback_stack.append(rollback_data)
        
        # Maintain rollback stack size
        if len(self.rollback_stack) > self.max_rollback_depth:
            self.rollback_stack = self.rollback_stack[-self.max_rollback_depth:]
    
    async def _rollback_last_adaptation(self):
        """Rollback to the last saved state"""
        if self.rollback_stack:
            rollback_data = self.rollback_stack.pop()
            self.current_adaptations = rollback_data['current_adaptations']
            logger.warning(f"Rolled back to state from {rollback_data['timestamp']}")
        else:
            logger.error("No rollback point available")
    
    async def _handle_training_error(self, error: Exception):
        """Handle errors during training"""
        logger.error(f"Training error: {error}")
        
        # Try to rollback if possible
        if self.rollback_stack:
            await self._rollback_last_adaptation()
    
    def get_training_status(self) -> Dict[str, Any]:
        """
        Get current training status and metrics
        
        Returns:
            Dictionary with training status information
        """
        recent_actions = [
            {
                'action_type': action.action_type,
                'target_component': action.target_component,
                'priority': action.priority,
                'expected_impact': action.expected_impact,
                'timestamp': action.timestamp.isoformat()
            }
            for action in self.adaptation_history[-10:]
        ]
        
        objectives_status = {}
        for name, objective in self.training_objectives.items():
            objectives_status[name] = {
                'current_value': objective.current_value,
                'target_value': objective.target_value,
                'within_tolerance': abs(objective.current_value - objective.target_value) <= objective.tolerance,
                'progress': len(objective.history)
            }
        
        return {
            'training_session_id': self.training_session_id,
            'training_mode': self.training_mode.value,
            'adaptation_strategy': self.adaptation_strategy.value,
            'current_metrics': self.current_metrics,
            'objectives_status': objectives_status,
            'recent_adaptations': recent_actions,
            'current_adaptations': self.current_adaptations,
            'rollback_points_available': len(self.rollback_stack)
        }
    
    def export_training_data(self) -> Dict[str, Any]:
        """Export all training data for analysis"""
        return {
            'training_config': {
                'training_mode': self.training_mode.value,
                'adaptation_strategy': self.adaptation_strategy.value,
                'learning_rate': self.learning_rate,
                'adaptation_threshold': self.adaptation_threshold
            },
            'objectives': {
                name: {
                    'name': obj.name,
                    'metric_name': obj.metric_name,
                    'target_value': obj.target_value,
                    'current_value': obj.current_value,
                    'weight': obj.weight,
                    'tolerance': obj.tolerance,
                    'history': obj.history
                }
                for name, obj in self.training_objectives.items()
            },
            'adaptation_history': [
                {
                    'action_type': action.action_type,
                    'target_component': action.target_component,
                    'parameters': action.parameters,
                    'priority': action.priority,
                    'expected_impact': action.expected_impact,
                    'rationale': action.rationale,
                    'timestamp': action.timestamp.isoformat()
                }
                for action in self.adaptation_history
            ],
            'current_state': self.get_training_status(),
            'component_data': {
                'bias_detector': self.bias_detector.export_bias_data(),
                'autocorr_mapper': self.autocorr_mapper.export_data(),
                'pattern_analyzer': self.pattern_analyzer.export_analysis_data(),
                'performance_monitor': self.performance_monitor.export_performance_data()
            }
        }
    
    async def save_state(self, filepath: Optional[str] = None):
        """Save training state to file"""
        save_path = Path(filepath) if filepath else self.save_path
        save_path.mkdir(parents=True, exist_ok=True)
        
        state_file = save_path / f"training_state_{self.training_session_id}.json"
        
        try:
            with open(state_file, 'w') as f:
                json.dump(self.export_training_data(), f, indent=2, default=str)
            
            logger.info(f"Training state saved to {state_file}")
            
        except Exception as e:
            logger.error(f"Error saving training state: {e}")
    
    async def load_state(self, filepath: str):
        """Load training state from file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Restore configuration
            config = data.get('training_config', {})
            self.training_mode = TrainingMode(config.get('training_mode', 'continuous'))
            self.adaptation_strategy = AdaptationStrategy(config.get('adaptation_strategy', 'moderate'))
            self.learning_rate = config.get('learning_rate', 0.01)
            self.adaptation_threshold = config.get('adaptation_threshold', 0.1)
            
            # Restore objectives
            objectives_data = data.get('objectives', {})
            for name, obj_data in objectives_data.items():
                objective = TrainingObjective(
                    name=obj_data['name'],
                    metric_name=obj_data['metric_name'],
                    target_value=obj_data['target_value'],
                    current_value=obj_data['current_value'],
                    weight=obj_data['weight'],
                    tolerance=obj_data['tolerance'],
                    history=obj_data['history']
                )
                self.training_objectives[name] = objective
            
            logger.info(f"Training state loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading training state: {e}")
    
    async def manual_adapt(self, action_type: str, parameters: Dict[str, Any], rationale: str = "Manual adaptation"):
        """
        Manually trigger an adaptation
        
        Args:
            action_type: Type of adaptation to perform
            parameters: Parameters for the adaptation
            rationale: Reason for the manual adaptation
        """
        action = AdaptationAction(
            action_type=action_type,
            target_component="manual",
            parameters=parameters,
            priority=1.0,
            expected_impact=0.5,
            rationale=rationale,
            timestamp=datetime.now()
        )
        
        if await self._is_action_safe(action):
            await self._execute_actions([action])
            logger.info(f"Manual adaptation executed: {action_type}")
        else:
            logger.warning(f"Manual adaptation rejected as unsafe: {action_type}")
    
    def reset_training(self):
        """Reset all training data and state"""
        self.bias_detector.reset_history()
        self.autocorr_mapper.reset()
        self.pattern_analyzer.reset()
        self.performance_monitor.reset()
        
        self.adaptation_history.clear()
        self.current_adaptations.clear()
        self.rollback_stack.clear()
        self.current_metrics.clear()
        
        # Reset objectives
        for objective in self.training_objectives.values():
            objective.current_value = 0.0
            objective.history.clear()
            objective.last_updated = None
        
        self.training_session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        logger.info("Training system reset completed")
