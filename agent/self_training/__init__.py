"""
Self-Training Agent Architecture with Bias Mitigation
====================================================

This module implements cutting-edge self-training capabilities for AGENT with 
advanced bias mitigation and autocorrelation mapping to prevent unnatural 
pattern formations.

Components:
- BiasDetector: Real-time bias detection and monitoring
- AutocorrelationMapper: Pattern analysis and anomaly detection
- SelfTrainer: Meta-learning and recursive improvement
- PatternAnalyzer: Temporal dependency and cyclic pattern detection
- PerformanceMonitor: Quality tracking and degradation alerts
"""

from .bias_detector import BiasDetector
from .autocorrelation_mapper import AutocorrelationMapper
from .self_trainer import SelfTrainer
from .pattern_analyzer import PatternAnalyzer
from .performance_monitor import PerformanceMonitor

__all__ = [
    'BiasDetector',
    'AutocorrelationMapper', 
    'SelfTrainer',
    'PatternAnalyzer',
    'PerformanceMonitor'
]

__version__ = "1.0.0"
