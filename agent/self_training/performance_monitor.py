"""
Performance Monitor
==================

Comprehensive performance monitoring system for tracking agent metrics,
resource usage, and operational efficiency.
"""

import asyncio
import psutil
import time
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
from collections import deque, defaultdict
import threading
import json

logger = logging.getLogger(__name__)

class MetricType(Enum):
    """Types of performance metrics"""
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    RESOURCE_USAGE = "resource_usage"
    ERROR_RATE = "error_rate"
    USER_SATISFACTION = "user_satisfaction"
    QUALITY_SCORE = "quality_score"
    LATENCY = "latency"
    AVAILABILITY = "availability"

class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

@dataclass
class PerformanceMetric:
    """Container for a performance metric"""
    metric_type: MetricType
    value: float
    timestamp: datetime
    context: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

@dataclass
class PerformanceAlert:
    """Performance alert notification"""
    alert_level: AlertLevel
    metric_type: MetricType
    message: str
    current_value: float
    threshold: float
    timestamp: datetime
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ResourceUsage:
    """System resource usage snapshot"""
    cpu_percent: float
    memory_percent: float
    memory_available: float
    disk_usage: float
    network_sent: float
    network_recv: float
    timestamp: datetime

class PerformanceMonitor:
    """
    Comprehensive performance monitoring system
    
    Features:
    - Real-time metric collection
    - Resource usage monitoring
    - Performance trend analysis
    - Alert generation and management
    - Statistical analysis and reporting
    - Performance optimization recommendations
    """
    
    def __init__(self,
                 metric_window: int = 1000,
                 alert_thresholds: Optional[Dict[MetricType, Dict[str, float]]] = None,
                 monitoring_interval: float = 5.0):
        """
        Initialize performance monitor
        
        Args:
            metric_window: Number of metrics to keep in memory
            alert_thresholds: Custom alert thresholds for each metric type
            monitoring_interval: Interval for system monitoring (seconds)
        """
        self.metric_window = metric_window
        self.monitoring_interval = monitoring_interval
        
        # Default alert thresholds
        self.alert_thresholds = alert_thresholds or {
            MetricType.RESPONSE_TIME: {
                'warning': 3.0,
                'critical': 8.0,
                'emergency': 15.0
            },
            MetricType.ERROR_RATE: {
                'warning': 0.05,
                'critical': 0.15,
                'emergency': 0.30
            },
            MetricType.RESOURCE_USAGE: {
                'warning': 70.0,
                'critical': 85.0,
                'emergency': 95.0
            },
            MetricType.USER_SATISFACTION: {
                'warning': 0.7,
                'critical': 0.5,
                'emergency': 0.3
            },
            MetricType.THROUGHPUT: {
                'warning': 0.5,  # requests per second
                'critical': 0.2,
                'emergency': 0.1
            }
        }
        
        # Data storage
        self.metrics: Dict[MetricType, deque] = defaultdict(lambda: deque(maxlen=metric_window))
        self.alerts: deque = deque(maxlen=500)
        self.resource_history: deque = deque(maxlen=200)
        
        # Performance tracking
        self.interaction_count = 0
        self.error_count = 0
        self.start_time = datetime.now()
        self.last_interaction_time: Optional[datetime] = None
        
        # System monitoring
        self.system_monitor_active = False
        self.system_monitor_thread: Optional[threading.Thread] = None
        
        # Statistics cache
        self.stats_cache: Dict[str, Any] = {}
        self.stats_cache_time: Optional[datetime] = None
        self.stats_cache_ttl = timedelta(seconds=30)
        
        logger.info(f"PerformanceMonitor initialized with window={metric_window}")
    
    def start_system_monitoring(self):
        """Start system resource monitoring in background thread"""
        if not self.system_monitor_active:
            self.system_monitor_active = True
            self.system_monitor_thread = threading.Thread(
                target=self._system_monitor_loop,
                daemon=True
            )
            self.system_monitor_thread.start()
            logger.info("System monitoring started")
    
    def stop_system_monitoring(self):
        """Stop system resource monitoring"""
        self.system_monitor_active = False
        if self.system_monitor_thread:
            self.system_monitor_thread.join(timeout=5.0)
        logger.info("System monitoring stopped")
    
    def _system_monitor_loop(self):
        """Background loop for system monitoring"""
        while self.system_monitor_active:
            try:
                self._collect_system_metrics()
                time.sleep(self.monitoring_interval)
            except Exception as e:
                logger.error(f"Error in system monitoring: {e}")
                time.sleep(self.monitoring_interval)
    
    def _collect_system_metrics(self):
        """Collect system resource metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available / (1024**3)  # GB
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # Network usage
            network = psutil.net_io_counters()
            network_sent = network.bytes_sent / (1024**2)  # MB
            network_recv = network.bytes_recv / (1024**2)  # MB
            
            # Create resource usage record
            resource_usage = ResourceUsage(
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_available=memory_available,
                disk_usage=disk_percent,
                network_sent=network_sent,
                network_recv=network_recv,
                timestamp=datetime.now()
            )
            
            self.resource_history.append(resource_usage)
            
            # Add resource metrics
            self.add_metric(MetricType.RESOURCE_USAGE, cpu_percent, {'resource': 'cpu'})
            self.add_metric(MetricType.RESOURCE_USAGE, memory_percent, {'resource': 'memory'})
            self.add_metric(MetricType.RESOURCE_USAGE, disk_percent, {'resource': 'disk'})
            
            # Check for resource alerts
            self._check_resource_alerts(resource_usage)
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
    
    def _check_resource_alerts(self, resource_usage: ResourceUsage):
        """Check for resource usage alerts"""
        thresholds = self.alert_thresholds.get(MetricType.RESOURCE_USAGE, {})
        
        # Check CPU
        if resource_usage.cpu_percent > thresholds.get('emergency', 95):
            self._create_alert(AlertLevel.EMERGENCY, MetricType.RESOURCE_USAGE,
                             f"Critical CPU usage: {resource_usage.cpu_percent:.1f}%",
                             resource_usage.cpu_percent, thresholds['emergency'])
        elif resource_usage.cpu_percent > thresholds.get('critical', 85):
            self._create_alert(AlertLevel.CRITICAL, MetricType.RESOURCE_USAGE,
                             f"High CPU usage: {resource_usage.cpu_percent:.1f}%",
                             resource_usage.cpu_percent, thresholds['critical'])
        elif resource_usage.cpu_percent > thresholds.get('warning', 70):
            self._create_alert(AlertLevel.WARNING, MetricType.RESOURCE_USAGE,
                             f"Elevated CPU usage: {resource_usage.cpu_percent:.1f}%",
                             resource_usage.cpu_percent, thresholds['warning'])
        
        # Check Memory
        if resource_usage.memory_percent > thresholds.get('emergency', 95):
            self._create_alert(AlertLevel.EMERGENCY, MetricType.RESOURCE_USAGE,
                             f"Critical memory usage: {resource_usage.memory_percent:.1f}%",
                             resource_usage.memory_percent, thresholds['emergency'])
        elif resource_usage.memory_percent > thresholds.get('critical', 85):
            self._create_alert(AlertLevel.CRITICAL, MetricType.RESOURCE_USAGE,
                             f"High memory usage: {resource_usage.memory_percent:.1f}%",
                             resource_usage.memory_percent, thresholds['critical'])
    
    def log_interaction(self,
                       user_input: str,
                       model_output: str,
                       response_time: float,
                       user_satisfaction: Optional[float] = None,
                       context: Optional[Dict[str, Any]] = None,
                       error: Optional[str] = None):
        """
        Log an interaction and calculate performance metrics
        
        Args:
            user_input: User's input text
            model_output: Model's response
            response_time: Time taken to generate response
            user_satisfaction: Optional satisfaction rating (0-1)
            context: Additional context information
            error: Error message if interaction failed
        """
        current_time = datetime.now()
        
        # Update counters
        self.interaction_count += 1
        if error:
            self.error_count += 1
        
        # Calculate metrics
        self.add_metric(MetricType.RESPONSE_TIME, response_time, context)
        
        if user_satisfaction is not None:
            self.add_metric(MetricType.USER_SATISFACTION, user_satisfaction, context)
        
        # Calculate throughput
        if self.last_interaction_time:
            time_diff = (current_time - self.last_interaction_time).total_seconds()
            if time_diff > 0:
                throughput = 1.0 / time_diff  # interactions per second
                self.add_metric(MetricType.THROUGHPUT, throughput, context)
        
        self.last_interaction_time = current_time
        
        # Calculate error rate
        error_rate = self.error_count / self.interaction_count
        self.add_metric(MetricType.ERROR_RATE, error_rate, context)
        
        # Calculate quality score based on response characteristics
        quality_score = self._calculate_quality_score(user_input, model_output, response_time)
        self.add_metric(MetricType.QUALITY_SCORE, quality_score, context)
        
        # Check for performance alerts
        self._check_performance_alerts(response_time, user_satisfaction, error_rate)
        
        # Invalidate stats cache
        self.stats_cache_time = None
    
    def add_metric(self, 
                   metric_type: MetricType, 
                   value: float, 
                   context: Optional[Dict[str, Any]] = None,
                   tags: Optional[List[str]] = None):
        """
        Add a performance metric
        
        Args:
            metric_type: Type of metric
            value: Metric value
            context: Additional context
            tags: Optional tags for the metric
        """
        metric = PerformanceMetric(
            metric_type=metric_type,
            value=value,
            timestamp=datetime.now(),
            context=context or {},
            tags=tags or []
        )
        
        self.metrics[metric_type].append(metric)
        
        # Invalidate stats cache
        self.stats_cache_time = None
    
    def _calculate_quality_score(self, user_input: str, model_output: str, response_time: float) -> float:
        """
        Calculate quality score based on response characteristics
        
        Args:
            user_input: User's input
            model_output: Model's response
            response_time: Response time
            
        Returns:
            Quality score (0-1)
        """
        try:
            score = 0.5  # Base score
            
            # Length appropriateness (not too short, not too long)
            response_length = len(model_output)
            input_length = len(user_input)
            
            if input_length > 0:
                length_ratio = response_length / input_length
                if 1.0 <= length_ratio <= 5.0:
                    score += 0.1
                elif 0.5 <= length_ratio <= 10.0:
                    score += 0.05
            
            # Response time factor
            if response_time <= 2.0:
                score += 0.2
            elif response_time <= 5.0:
                score += 0.1
            elif response_time > 10.0:
                score -= 0.1
            
            # Content quality indicators
            if '?' in model_output:  # Clarifying questions
                score += 0.1
            
            helpful_words = ['help', 'assist', 'explain', 'example', 'solution']
            if any(word in model_output.lower() for word in helpful_words):
                score += 0.1
            
            # Negative indicators
            unhelpful_words = ['sorry', 'cannot', 'unable', 'don\'t know']
            if any(word in model_output.lower() for word in unhelpful_words):
                score -= 0.1
            
            return max(0.0, min(1.0, score))
            
        except Exception:
            return 0.5
    
    def _check_performance_alerts(self, response_time: float, user_satisfaction: Optional[float], error_rate: float):
        """Check for performance alerts"""
        # Response time alerts
        rt_thresholds = self.alert_thresholds.get(MetricType.RESPONSE_TIME, {})
        if response_time > rt_thresholds.get('emergency', 15.0):
            self._create_alert(AlertLevel.EMERGENCY, MetricType.RESPONSE_TIME,
                             f"Extremely slow response: {response_time:.2f}s",
                             response_time, rt_thresholds['emergency'])
        elif response_time > rt_thresholds.get('critical', 8.0):
            self._create_alert(AlertLevel.CRITICAL, MetricType.RESPONSE_TIME,
                             f"Slow response time: {response_time:.2f}s",
                             response_time, rt_thresholds['critical'])
        elif response_time > rt_thresholds.get('warning', 3.0):
            self._create_alert(AlertLevel.WARNING, MetricType.RESPONSE_TIME,
                             f"Elevated response time: {response_time:.2f}s",
                             response_time, rt_thresholds['warning'])
        
        # User satisfaction alerts
        if user_satisfaction is not None:
            sat_thresholds = self.alert_thresholds.get(MetricType.USER_SATISFACTION, {})
            if user_satisfaction < sat_thresholds.get('emergency', 0.3):
                self._create_alert(AlertLevel.EMERGENCY, MetricType.USER_SATISFACTION,
                                 f"Very low user satisfaction: {user_satisfaction:.2f}",
                                 user_satisfaction, sat_thresholds['emergency'])
            elif user_satisfaction < sat_thresholds.get('critical', 0.5):
                self._create_alert(AlertLevel.CRITICAL, MetricType.USER_SATISFACTION,
                                 f"Low user satisfaction: {user_satisfaction:.2f}",
                                 user_satisfaction, sat_thresholds['critical'])
        
        # Error rate alerts
        err_thresholds = self.alert_thresholds.get(MetricType.ERROR_RATE, {})
        if error_rate > err_thresholds.get('emergency', 0.30):
            self._create_alert(AlertLevel.EMERGENCY, MetricType.ERROR_RATE,
                             f"Very high error rate: {error_rate:.2%}",
                             error_rate, err_thresholds['emergency'])
        elif error_rate > err_thresholds.get('critical', 0.15):
            self._create_alert(AlertLevel.CRITICAL, MetricType.ERROR_RATE,
                             f"High error rate: {error_rate:.2%}",
                             error_rate, err_thresholds['critical'])
    
    def _create_alert(self, level: AlertLevel, metric_type: MetricType, message: str, 
                      current_value: float, threshold: float, context: Optional[Dict[str, Any]] = None):
        """Create and store a performance alert"""
        alert = PerformanceAlert(
            alert_level=level,
            metric_type=metric_type,
            message=message,
            current_value=current_value,
            threshold=threshold,
            timestamp=datetime.now(),
            context=context or {}
        )
        
        self.alerts.append(alert)
        
        # Log alert
        if level == AlertLevel.EMERGENCY:
            logger.critical(f"EMERGENCY ALERT: {message}")
        elif level == AlertLevel.CRITICAL:
            logger.error(f"CRITICAL ALERT: {message}")
        elif level == AlertLevel.WARNING:
            logger.warning(f"WARNING ALERT: {message}")
        else:
            logger.info(f"INFO ALERT: {message}")
    
    def get_performance_summary(self, time_window: Optional[timedelta] = None) -> Dict[str, Any]:
        """
        Get performance summary
        
        Args:
            time_window: Time window for analysis (default: last hour)
            
        Returns:
            Performance summary dictionary
        """
        # Check cache
        if (self.stats_cache_time and 
            datetime.now() - self.stats_cache_time < self.stats_cache_ttl):
            return self.stats_cache
        
        if time_window is None:
            time_window = timedelta(hours=1)
        
        cutoff_time = datetime.now() - time_window
        
        summary = {
            'uptime_seconds': (datetime.now() - self.start_time).total_seconds(),
            'total_interactions': self.interaction_count,
            'total_errors': self.error_count,
            'overall_error_rate': self.error_count / max(1, self.interaction_count),
            'metrics': {}
        }
        
        # Calculate metrics for each type
        for metric_type, metric_deque in self.metrics.items():
            recent_metrics = [m for m in metric_deque if m.timestamp >= cutoff_time]
            
            if recent_metrics:
                values = [m.value for m in recent_metrics]
                summary['metrics'][metric_type.value] = {
                    'count': len(values),
                    'avg': np.mean(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'std': np.std(values),
                    'median': np.median(values),
                    'p95': np.percentile(values, 95) if len(values) >= 20 else None,
                    'p99': np.percentile(values, 99) if len(values) >= 100 else None
                }
            else:
                summary['metrics'][metric_type.value] = {
                    'count': 0,
                    'avg': 0,
                    'min': 0,
                    'max': 0,
                    'std': 0,
                    'median': 0,
                    'p95': None,
                    'p99': None
                }
        
        # Add specific summary metrics
        if MetricType.RESPONSE_TIME in self.metrics:
            rt_metrics = summary['metrics'][MetricType.RESPONSE_TIME.value]
            summary['avg_response_time'] = rt_metrics['avg']
        
        if MetricType.USER_SATISFACTION in self.metrics:
            sat_metrics = summary['metrics'][MetricType.USER_SATISFACTION.value]
            summary['avg_user_satisfaction'] = sat_metrics['avg']
        
        if MetricType.QUALITY_SCORE in self.metrics:
            qual_metrics = summary['metrics'][MetricType.QUALITY_SCORE.value]
            summary['avg_quality_score'] = qual_metrics['avg']
        
        if MetricType.THROUGHPUT in self.metrics:
            throughput_metrics = summary['metrics'][MetricType.THROUGHPUT.value]
            summary['avg_throughput'] = throughput_metrics['avg']
        
        # Add response variance
        if MetricType.RESPONSE_TIME in self.metrics and len(self.metrics[MetricType.RESPONSE_TIME]) > 1:
            rt_values = [m.value for m in self.metrics[MetricType.RESPONSE_TIME]]
            summary['response_variance'] = np.var(rt_values) / max(1, np.mean(rt_values))
        else:
            summary['response_variance'] = 0
        
        # Recent alerts
        recent_alerts = [alert for alert in self.alerts if alert.timestamp >= cutoff_time]
        summary['recent_alerts'] = len(recent_alerts)
        summary['alert_breakdown'] = {
            level.value: len([a for a in recent_alerts if a.alert_level == level])
            for level in AlertLevel
        }
        
        # System resource summary
        if self.resource_history:
            recent_resources = [r for r in self.resource_history if r.timestamp >= cutoff_time]
            if recent_resources:
                summary['system_resources'] = {
                    'avg_cpu': np.mean([r.cpu_percent for r in recent_resources]),
                    'avg_memory': np.mean([r.memory_percent for r in recent_resources]),
                    'avg_disk': np.mean([r.disk_usage for r in recent_resources]),
                    'available_memory_gb': recent_resources[-1].memory_available
                }
        
        # Cache the result
        self.stats_cache = summary
        self.stats_cache_time = datetime.now()
        
        return summary
    
    def get_performance_trends(self, hours_back: int = 24) -> Dict[str, Any]:
        """
        Get performance trends over time
        
        Args:
            hours_back: Number of hours to analyze
            
        Returns:
            Trend analysis dictionary
        """
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        trends = {}
        
        for metric_type, metric_deque in self.metrics.items():
            recent_metrics = [m for m in metric_deque if m.timestamp >= cutoff_time]
            
            if len(recent_metrics) >= 10:
                values = [m.value for m in recent_metrics]
                timestamps = [m.timestamp for m in recent_metrics]
                
                # Calculate trend slope
                x = np.arange(len(values))
                slope, intercept, r_value, p_value, std_err = np.polyfit(x, values, 1, full=True)[:2] + tuple(np.corrcoef(x, values)[0, 1:2]) + (0, 0)
                
                trends[metric_type.value] = {
                    'slope': slope,
                    'correlation': r_value,
                    'direction': 'improving' if slope < 0 and metric_type in [MetricType.RESPONSE_TIME, MetricType.ERROR_RATE] else 
                               'improving' if slope > 0 and metric_type in [MetricType.USER_SATISFACTION, MetricType.QUALITY_SCORE, MetricType.THROUGHPUT] else
                               'degrading' if abs(slope) > 0.01 else 'stable',
                    'samples': len(values),
                    'time_span_hours': (timestamps[-1] - timestamps[0]).total_seconds() / 3600
                }
        
        return trends
    
    def get_alerts(self, level_filter: Optional[AlertLevel] = None, 
                   hours_back: int = 24) -> List[PerformanceAlert]:
        """
        Get recent alerts
        
        Args:
            level_filter: Filter by alert level
            hours_back: Number of hours to look back
            
        Returns:
            List of matching alerts
        """
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        
        filtered_alerts = [
            alert for alert in self.alerts
            if alert.timestamp >= cutoff_time
        ]
        
        if level_filter:
            filtered_alerts = [
                alert for alert in filtered_alerts
                if alert.alert_level == level_filter
            ]
        
        # Sort by timestamp (newest first)
        filtered_alerts.sort(key=lambda x: x.timestamp, reverse=True)
        
        return filtered_alerts
    
    def get_resource_usage(self, hours_back: int = 1) -> Dict[str, Any]:
        """
        Get system resource usage summary
        
        Args:
            hours_back: Number of hours to analyze
            
        Returns:
            Resource usage summary
        """
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        recent_resources = [r for r in self.resource_history if r.timestamp >= cutoff_time]
        
        if not recent_resources:
            return {'status': 'no_data'}
        
        return {
            'cpu': {
                'current': recent_resources[-1].cpu_percent,
                'avg': np.mean([r.cpu_percent for r in recent_resources]),
                'max': np.max([r.cpu_percent for r in recent_resources]),
                'trend': 'stable'  # Could add trend calculation
            },
            'memory': {
                'current': recent_resources[-1].memory_percent,
                'avg': np.mean([r.memory_percent for r in recent_resources]),
                'max': np.max([r.memory_percent for r in recent_resources]),
                'available_gb': recent_resources[-1].memory_available
            },
            'disk': {
                'current': recent_resources[-1].disk_usage,
                'avg': np.mean([r.disk_usage for r in recent_resources]),
                'max': np.max([r.disk_usage for r in recent_resources])
            },
            'samples': len(recent_resources),
            'monitoring_active': self.system_monitor_active
        }
    
    def export_performance_data(self) -> Dict[str, Any]:
        """
        Export all performance data
        
        Returns:
            Complete performance data export
        """
        return {
            'config': {
                'metric_window': self.metric_window,
                'monitoring_interval': self.monitoring_interval,
                'alert_thresholds': {
                    mt.value: thresholds 
                    for mt, thresholds in self.alert_thresholds.items()
                }
            },
            'summary': self.get_performance_summary(),
            'trends': self.get_performance_trends(),
            'alerts': [
                {
                    'alert_level': alert.alert_level.value,
                    'metric_type': alert.metric_type.value,
                    'message': alert.message,
                    'current_value': alert.current_value,
                    'threshold': alert.threshold,
                    'timestamp': alert.timestamp.isoformat(),
                    'context': alert.context
                }
                for alert in self.alerts
            ],
            'resource_usage': self.get_resource_usage(hours_back=24),
            'uptime': (datetime.now() - self.start_time).total_seconds()
        }
    
    def reset(self):
        """Reset all performance data"""
        for metric_deque in self.metrics.values():
            metric_deque.clear()
        
        self.alerts.clear()
        self.resource_history.clear()
        
        self.interaction_count = 0
        self.error_count = 0
        self.start_time = datetime.now()
        self.last_interaction_time = None
        
        self.stats_cache.clear()
        self.stats_cache_time = None
        
        logger.info("PerformanceMonitor reset completed")
    
    def __del__(self):
        """Cleanup on deletion"""
        self.stop_system_monitoring()
