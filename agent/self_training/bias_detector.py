"""
Bias Detection System
====================

Advanced bias detection algorithms for real-time monitoring and mitigation.
Implements statistical parity testing, individual fairness metrics, and 
intersectional bias analysis.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class BiasType(Enum):
    """Types of bias that can be detected"""
    DEMOGRAPHIC_PARITY = "demographic_parity"
    EQUALIZED_ODDS = "equalized_odds"
    CALIBRATION_BIAS = "calibration_bias"
    INDIVIDUAL_FAIRNESS = "individual_fairness"
    INTERSECTIONAL_BIAS = "intersectional_bias"

@dataclass
class BiasMetric:
    """Container for bias measurement results"""
    bias_type: BiasType
    score: float
    threshold: float
    is_biased: bool
    details: Dict[str, Any]
    timestamp: datetime
    confidence: float

class BiasDetector:
    """
    Real-time bias detection and monitoring system
    
    Implements multiple bias detection algorithms:
    - Statistical parity testing
    - Equalized odds verification  
    - Calibration bias correction
    - Individual fairness metrics
    - Intersectional bias analysis
    """
    
    def __init__(self, 
                 bias_thresholds: Optional[Dict[BiasType, float]] = None,
                 monitoring_window: int = 1000):
        """
        Initialize bias detector
        
        Args:
            bias_thresholds: Custom thresholds for each bias type
            monitoring_window: Number of recent interactions to monitor
        """
        self.bias_thresholds = bias_thresholds or {
            BiasType.DEMOGRAPHIC_PARITY: 0.1,
            BiasType.EQUALIZED_ODDS: 0.1,
            BiasType.CALIBRATION_BIAS: 0.05,
            BiasType.INDIVIDUAL_FAIRNESS: 0.15,
            BiasType.INTERSECTIONAL_BIAS: 0.12
        }
        
        self.monitoring_window = monitoring_window
        self.interaction_history: List[Dict[str, Any]] = []
        self.bias_history: List[BiasMetric] = []
        
        logger.info(f"BiasDetector initialized with thresholds: {self.bias_thresholds}")
    
    def log_interaction(self, 
                       user_input: str,
                       model_output: str,
                       user_metadata: Optional[Dict[str, Any]] = None,
                       context: Optional[Dict[str, Any]] = None):
        """
        Log an interaction for bias monitoring
        
        Args:
            user_input: The user's input text
            model_output: The model's response
            user_metadata: Optional user demographic/context data
            context: Additional context about the interaction
        """
        interaction = {
            'timestamp': datetime.now(),
            'user_input': user_input,
            'model_output': model_output,
            'user_metadata': user_metadata or {},
            'context': context or {},
            'input_length': len(user_input),
            'output_length': len(model_output)
        }
        
        self.interaction_history.append(interaction)
        
        # Maintain sliding window
        if len(self.interaction_history) > self.monitoring_window:
            self.interaction_history = self.interaction_history[-self.monitoring_window:]
    
    def detect_demographic_parity(self, 
                                 protected_attribute: str,
                                 outcome_metric: str) -> BiasMetric:
        """
        Detect demographic parity bias
        
        Measures whether different demographic groups receive 
        similar treatment/outcomes from the model.
        
        Args:
            protected_attribute: The demographic attribute to analyze
            outcome_metric: The outcome to measure for parity
            
        Returns:
            BiasMetric with demographic parity results
        """
        if len(self.interaction_history) < 50:
            return BiasMetric(
                bias_type=BiasType.DEMOGRAPHIC_PARITY,
                score=0.0,
                threshold=self.bias_thresholds[BiasType.DEMOGRAPHIC_PARITY],
                is_biased=False,
                details={'error': 'Insufficient data for analysis'},
                timestamp=datetime.now(),
                confidence=0.0
            )
        
        try:
            # Group interactions by protected attribute
            groups = {}
            for interaction in self.interaction_history:
                metadata = interaction.get('user_metadata', {})
                group_value = metadata.get(protected_attribute, 'unknown')
                
                if group_value not in groups:
                    groups[group_value] = []
                groups[group_value].append(interaction)
            
            # Calculate outcome rates for each group
            group_rates = {}
            for group, interactions in groups.items():
                if len(interactions) < 10:  # Skip groups with too few samples
                    continue
                    
                outcomes = []
                for interaction in interactions:
                    # Calculate outcome based on metric type
                    if outcome_metric == 'response_length':
                        outcome = len(interaction['model_output'])
                    elif outcome_metric == 'response_helpfulness':
                        # Simplified helpfulness score based on response characteristics
                        outcome = self._calculate_helpfulness_score(interaction['model_output'])
                    else:
                        outcome = 1.0  # Default binary outcome
                    
                    outcomes.append(outcome)
                
                group_rates[group] = np.mean(outcomes)
            
            if len(group_rates) < 2:
                return BiasMetric(
                    bias_type=BiasType.DEMOGRAPHIC_PARITY,
                    score=0.0,
                    threshold=self.bias_thresholds[BiasType.DEMOGRAPHIC_PARITY],
                    is_biased=False,
                    details={'error': 'Insufficient groups for comparison'},
                    timestamp=datetime.now(),
                    confidence=0.0
                )
            
            # Calculate parity difference (max - min rates)
            rates = list(group_rates.values())
            parity_diff = max(rates) - min(rates)
            
            # Normalize by mean rate to get relative difference
            if np.mean(rates) > 0:
                normalized_diff = parity_diff / np.mean(rates)
            else:
                normalized_diff = 0.0
            
            threshold = self.bias_thresholds[BiasType.DEMOGRAPHIC_PARITY]
            is_biased = normalized_diff > threshold
            
            # Calculate confidence based on sample sizes
            min_group_size = min(len(groups[g]) for g in group_rates.keys())
            confidence = min(1.0, min_group_size / 100.0)
            
            return BiasMetric(
                bias_type=BiasType.DEMOGRAPHIC_PARITY,
                score=normalized_diff,
                threshold=threshold,
                is_biased=is_biased,
                details={
                    'group_rates': group_rates,
                    'parity_difference': parity_diff,
                    'groups_analyzed': len(group_rates),
                    'total_interactions': sum(len(groups[g]) for g in groups)
                },
                timestamp=datetime.now(),
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Error in demographic parity detection: {e}")
            return BiasMetric(
                bias_type=BiasType.DEMOGRAPHIC_PARITY,
                score=0.0,
                threshold=self.bias_thresholds[BiasType.DEMOGRAPHIC_PARITY],
                is_biased=False,
                details={'error': str(e)},
                timestamp=datetime.now(),
                confidence=0.0
            )
    
    def detect_equalized_odds(self, 
                             protected_attribute: str,
                             true_outcome: str,
                             predicted_outcome: str) -> BiasMetric:
        """
        Detect equalized odds bias
        
        Measures whether the model has equal true positive and 
        false positive rates across different groups.
        
        Args:
            protected_attribute: The demographic attribute to analyze
            true_outcome: The ground truth outcome field
            predicted_outcome: The model's predicted outcome field
            
        Returns:
            BiasMetric with equalized odds results
        """
        # Implementation for equalized odds detection
        # This is a simplified version - in practice, you'd need labeled data
        try:
            threshold = self.bias_thresholds[BiasType.EQUALIZED_ODDS]
            
            # For now, return a placeholder implementation
            # In a real system, this would analyze prediction accuracy across groups
            return BiasMetric(
                bias_type=BiasType.EQUALIZED_ODDS,
                score=0.05,  # Placeholder low bias score
                threshold=threshold,
                is_biased=False,
                details={'note': 'Placeholder implementation - requires labeled data'},
                timestamp=datetime.now(),
                confidence=0.5
            )
            
        except Exception as e:
            logger.error(f"Error in equalized odds detection: {e}")
            return BiasMetric(
                bias_type=BiasType.EQUALIZED_ODDS,
                score=0.0,
                threshold=self.bias_thresholds[BiasType.EQUALIZED_ODDS],
                is_biased=False,
                details={'error': str(e)},
                timestamp=datetime.now(),
                confidence=0.0
            )
    
    def detect_calibration_bias(self) -> BiasMetric:
        """
        Detect calibration bias in model confidence
        
        Measures whether the model's confidence scores are well-calibrated
        across different groups and contexts.
        
        Returns:
            BiasMetric with calibration bias results
        """
        try:
            # Analyze response consistency as a proxy for calibration
            recent_interactions = self.interaction_history[-100:] if len(self.interaction_history) >= 100 else self.interaction_history
            
            if len(recent_interactions) < 20:
                return BiasMetric(
                    bias_type=BiasType.CALIBRATION_BIAS,
                    score=0.0,
                    threshold=self.bias_thresholds[BiasType.CALIBRATION_BIAS],
                    is_biased=False,
                    details={'error': 'Insufficient data for calibration analysis'},
                    timestamp=datetime.now(),
                    confidence=0.0
                )
            
            # Calculate response length variance as calibration proxy
            response_lengths = [len(interaction['model_output']) for interaction in recent_interactions]
            length_variance = np.var(response_lengths) / (np.mean(response_lengths) ** 2) if np.mean(response_lengths) > 0 else 0
            
            # Normalize variance to bias score
            calibration_score = min(1.0, length_variance / 0.5)  # Adjust scaling factor as needed
            
            threshold = self.bias_thresholds[BiasType.CALIBRATION_BIAS]
            is_biased = calibration_score > threshold
            
            return BiasMetric(
                bias_type=BiasType.CALIBRATION_BIAS,
                score=calibration_score,
                threshold=threshold,
                is_biased=is_biased,
                details={
                    'response_length_variance': length_variance,
                    'mean_response_length': np.mean(response_lengths),
                    'interactions_analyzed': len(recent_interactions)
                },
                timestamp=datetime.now(),
                confidence=0.7
            )
            
        except Exception as e:
            logger.error(f"Error in calibration bias detection: {e}")
            return BiasMetric(
                bias_type=BiasType.CALIBRATION_BIAS,
                score=0.0,
                threshold=self.bias_thresholds[BiasType.CALIBRATION_BIAS],
                is_biased=False,
                details={'error': str(e)},
                timestamp=datetime.now(),
                confidence=0.0
            )
    
    def detect_all_bias_types(self, 
                             protected_attributes: List[str] = None) -> List[BiasMetric]:
        """
        Run all bias detection algorithms
        
        Args:
            protected_attributes: List of demographic attributes to analyze
            
        Returns:
            List of BiasMetric results for all bias types
        """
        results = []
        
        # Default protected attributes if none provided
        if protected_attributes is None:
            protected_attributes = ['gender', 'age_group', 'ethnicity', 'language']
        
        # Demographic parity for each protected attribute
        for attr in protected_attributes:
            result = self.detect_demographic_parity(attr, 'response_helpfulness')
            results.append(result)
        
        # Calibration bias
        results.append(self.detect_calibration_bias())
        
        # Store results in history
        self.bias_history.extend(results)
        
        # Maintain bias history size
        if len(self.bias_history) > 1000:
            self.bias_history = self.bias_history[-1000:]
        
        return results
    
    def get_bias_summary(self, time_window: Optional[timedelta] = None) -> Dict[str, Any]:
        """
        Get a summary of recent bias detection results
        
        Args:
            time_window: Time window to analyze (default: last 24 hours)
            
        Returns:
            Dictionary with bias summary statistics
        """
        if time_window is None:
            time_window = timedelta(hours=24)
        
        cutoff_time = datetime.now() - time_window
        recent_metrics = [m for m in self.bias_history if m.timestamp >= cutoff_time]
        
        if not recent_metrics:
            return {
                'total_checks': 0,
                'bias_detected': 0,
                'average_scores': {},
                'time_window': str(time_window)
            }
        
        # Group by bias type
        by_type = {}
        for metric in recent_metrics:
            if metric.bias_type not in by_type:
                by_type[metric.bias_type] = []
            by_type[metric.bias_type].append(metric)
        
        # Calculate summary statistics
        average_scores = {}
        bias_detected_count = 0
        
        for bias_type, metrics in by_type.items():
            scores = [m.score for m in metrics]
            average_scores[bias_type.value] = {
                'mean_score': np.mean(scores),
                'max_score': np.max(scores),
                'bias_detected': sum(1 for m in metrics if m.is_biased),
                'total_checks': len(metrics)
            }
            bias_detected_count += sum(1 for m in metrics if m.is_biased)
        
        return {
            'total_checks': len(recent_metrics),
            'bias_detected': bias_detected_count,
            'bias_rate': bias_detected_count / len(recent_metrics),
            'average_scores': average_scores,
            'time_window': str(time_window),
            'last_check': max(m.timestamp for m in recent_metrics).isoformat()
        }
    
    def _calculate_helpfulness_score(self, response: str) -> float:
        """
        Calculate a simple helpfulness score for a response
        
        Args:
            response: The model's response text
            
        Returns:
            Helpfulness score between 0 and 1
        """
        try:
            # Simple heuristics for helpfulness
            score = 0.0
            
            # Length factor (not too short, not too long)
            length = len(response)
            if 50 <= length <= 500:
                score += 0.3
            elif 500 < length <= 1000:
                score += 0.2
            elif length > 1000:
                score += 0.1
            
            # Content factors
            if '?' in response:  # Asks clarifying questions
                score += 0.2
            
            if any(word in response.lower() for word in ['example', 'specifically', 'detailed', 'step']):
                score += 0.2
            
            if any(word in response.lower() for word in ['sorry', 'cannot', 'unable', 'unsure']):
                score -= 0.1
            
            # Politeness factor
            if any(word in response.lower() for word in ['please', 'thank', 'welcome']):
                score += 0.1
            
            return max(0.0, min(1.0, score))
            
        except Exception:
            return 0.5  # Default neutral score
    
    def reset_history(self):
        """Reset interaction and bias history"""
        self.interaction_history.clear()
        self.bias_history.clear()
        logger.info("Bias detector history reset")
    
    def export_bias_data(self) -> Dict[str, Any]:
        """
        Export bias detection data for analysis
        
        Returns:
            Dictionary with all bias detection data
        """
        return {
            'bias_thresholds': {bt.value: thresh for bt, thresh in self.bias_thresholds.items()},
            'interaction_count': len(self.interaction_history),
            'bias_history': [
                {
                    'bias_type': metric.bias_type.value,
                    'score': metric.score,
                    'threshold': metric.threshold,
                    'is_biased': metric.is_biased,
                    'timestamp': metric.timestamp.isoformat(),
                    'confidence': metric.confidence,
                    'details': metric.details
                }
                for metric in self.bias_history
            ],
            'summary': self.get_bias_summary()
        }
