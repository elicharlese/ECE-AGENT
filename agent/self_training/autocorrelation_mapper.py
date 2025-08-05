"""
Autocorrelation Mapper
=====================

Advanced pattern detection and temporal analysis system for identifying
behavioral patterns, feedback loops, and autocorrelations in agent responses.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from collections import defaultdict, deque
from scipy import signal, stats
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

@dataclass
class PatternSignature:
    """Represents a detected pattern with its characteristics"""
    pattern_id: str
    pattern_type: str
    strength: float
    frequency: float
    duration: timedelta
    first_detected: datetime
    last_seen: datetime
    occurrences: int
    metadata: Dict[str, Any]

@dataclass
class AutocorrelationResult:
    """Results from autocorrelation analysis"""
    lag: int
    correlation: float
    significance: float
    pattern_strength: str
    interpretation: str

class AutocorrelationMapper:
    """
    Advanced pattern detection and autocorrelation analysis system
    
    Capabilities:
    - Temporal pattern detection in responses
    - Behavioral autocorrelation analysis
    - Feedback loop identification
    - Response quality pattern mapping
    - Semantic similarity tracking
    - Performance drift detection
    """
    
    def __init__(self, 
                 window_size: int = 100,
                 pattern_threshold: float = 0.7,
                 max_lag: int = 20):
        """
        Initialize autocorrelation mapper
        
        Args:
            window_size: Size of sliding window for analysis
            pattern_threshold: Minimum correlation strength for pattern detection
            max_lag: Maximum lag to analyze for autocorrelations
        """
        self.window_size = window_size
        self.pattern_threshold = pattern_threshold
        self.max_lag = max_lag
        
        # Data storage
        self.interaction_sequence: deque = deque(maxlen=window_size * 2)
        self.response_metrics: deque = deque(maxlen=window_size * 2)
        self.temporal_features: deque = deque(maxlen=window_size * 2)
        
        # Pattern storage
        self.detected_patterns: Dict[str, PatternSignature] = {}
        self.autocorrelation_history: List[AutocorrelationResult] = []
        
        # Analysis tools
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.semantic_vectors: List[np.ndarray] = []
        
        logger.info(f"AutocorrelationMapper initialized with window_size={window_size}")
    
    def add_interaction(self, 
                       user_input: str,
                       model_output: str,
                       response_time: float,
                       user_satisfaction: Optional[float] = None,
                       context: Optional[Dict[str, Any]] = None):
        """
        Add a new interaction for pattern analysis
        
        Args:
            user_input: User's input text
            model_output: Model's response
            response_time: Time taken to generate response
            user_satisfaction: Optional satisfaction rating (0-1)
            context: Additional context information
        """
        timestamp = datetime.now()
        
        # Create interaction record
        interaction = {
            'timestamp': timestamp,
            'user_input': user_input,
            'model_output': model_output,
            'response_time': response_time,
            'user_satisfaction': user_satisfaction,
            'context': context or {}
        }
        
        # Calculate response metrics
        metrics = self._calculate_response_metrics(interaction)
        
        # Extract temporal features
        features = self._extract_temporal_features(interaction)
        
        # Store data
        self.interaction_sequence.append(interaction)
        self.response_metrics.append(metrics)
        self.temporal_features.append(features)
        
        # Update semantic vectors
        self._update_semantic_vectors(model_output)
        
        # Perform pattern detection if we have enough data
        if len(self.interaction_sequence) >= self.window_size:
            self._detect_patterns()
            self._calculate_autocorrelations()
    
    def _calculate_response_metrics(self, interaction: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate various metrics for a response
        
        Args:
            interaction: The interaction data
            
        Returns:
            Dictionary of calculated metrics
        """
        response = interaction['model_output']
        user_input = interaction['user_input']
        
        metrics = {
            'response_length': len(response),
            'response_complexity': self._calculate_complexity(response),
            'response_sentiment': self._calculate_sentiment(response),
            'input_response_ratio': len(response) / max(len(user_input), 1),
            'response_time': interaction['response_time'],
            'word_count': len(response.split()),
            'sentence_count': response.count('.') + response.count('!') + response.count('?'),
            'avg_sentence_length': len(response.split()) / max(response.count('.') + response.count('!') + response.count('?'), 1),
            'question_marks': response.count('?'),
            'exclamation_marks': response.count('!'),
            'code_blocks': response.count('```'),
            'bullet_points': response.count('•') + response.count('-') + response.count('*')
        }
        
        # Add satisfaction if available
        if interaction['user_satisfaction'] is not None:
            metrics['user_satisfaction'] = interaction['user_satisfaction']
        
        return metrics
    
    def _extract_temporal_features(self, interaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract temporal features from interaction
        
        Args:
            interaction: The interaction data
            
        Returns:
            Dictionary of temporal features
        """
        timestamp = interaction['timestamp']
        
        return {
            'hour_of_day': timestamp.hour,
            'day_of_week': timestamp.weekday(),
            'minute_of_hour': timestamp.minute,
            'is_weekend': timestamp.weekday() >= 5,
            'is_business_hours': 9 <= timestamp.hour <= 17,
            'time_since_start': timestamp.timestamp()
        }
    
    def _update_semantic_vectors(self, response: str):
        """
        Update semantic vector representation for the response
        
        Args:
            response: The model response text
        """
        try:
            # For the first response, fit the vectorizer
            if len(self.semantic_vectors) == 0:
                # Initialize with current response
                vector = self.vectorizer.fit_transform([response])
                self.semantic_vectors.append(vector.toarray()[0])
            else:
                # Transform new response using existing vocabulary
                try:
                    vector = self.vectorizer.transform([response])
                    self.semantic_vectors.append(vector.toarray()[0])
                except ValueError:
                    # If vocabulary doesn't cover the response, use zero vector
                    self.semantic_vectors.append(np.zeros(len(self.semantic_vectors[0])))
            
            # Maintain vector history size
            if len(self.semantic_vectors) > self.window_size * 2:
                self.semantic_vectors = self.semantic_vectors[-self.window_size * 2:]
                
        except Exception as e:
            logger.warning(f"Error updating semantic vectors: {e}")
            # Add zero vector as fallback
            if len(self.semantic_vectors) > 0:
                self.semantic_vectors.append(np.zeros(len(self.semantic_vectors[0])))
    
    def _detect_patterns(self):
        """
        Detect patterns in the interaction sequence
        """
        if len(self.response_metrics) < self.window_size:
            return
        
        # Convert metrics to time series for analysis
        recent_metrics = list(self.response_metrics)[-self.window_size:]
        
        # Analyze different metric patterns
        for metric_name in ['response_length', 'response_complexity', 'response_time', 'user_satisfaction']:
            if metric_name in recent_metrics[0]:
                values = [m.get(metric_name, 0) for m in recent_metrics]
                self._analyze_metric_pattern(metric_name, values)
        
        # Analyze semantic similarity patterns
        self._analyze_semantic_patterns()
        
        # Analyze temporal patterns
        self._analyze_temporal_patterns()
    
    def _analyze_metric_pattern(self, metric_name: str, values: List[float]):
        """
        Analyze patterns in a specific metric
        
        Args:
            metric_name: Name of the metric to analyze
            values: Time series of metric values
        """
        if len(values) < 10:
            return
        
        # Remove None values and convert to numpy array
        clean_values = [v for v in values if v is not None]
        if len(clean_values) < 10:
            return
        
        series = np.array(clean_values)
        
        try:
            # Detect trends
            trend_strength = self._detect_trend(series)
            
            # Detect cycles
            cycle_info = self._detect_cycles(series)
            
            # Detect anomalies
            anomaly_count = self._detect_anomalies(series)
            
            # Create pattern signature if significant pattern found
            if abs(trend_strength) > 0.3 or cycle_info['strength'] > 0.5 or anomaly_count > 0.1:
                pattern_id = f"{metric_name}_pattern_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                pattern = PatternSignature(
                    pattern_id=pattern_id,
                    pattern_type=f"{metric_name}_behavioral",
                    strength=max(abs(trend_strength), cycle_info['strength']),
                    frequency=cycle_info.get('frequency', 0),
                    duration=timedelta(minutes=len(values)),
                    first_detected=datetime.now(),
                    last_seen=datetime.now(),
                    occurrences=1,
                    metadata={
                        'metric_name': metric_name,
                        'trend_strength': trend_strength,
                        'cycle_info': cycle_info,
                        'anomaly_rate': anomaly_count,
                        'values_analyzed': len(values)
                    }
                )
                
                self.detected_patterns[pattern_id] = pattern
                logger.info(f"Detected pattern in {metric_name}: {pattern.pattern_type} with strength {pattern.strength:.3f}")
                
        except Exception as e:
            logger.warning(f"Error analyzing metric pattern for {metric_name}: {e}")
    
    def _analyze_semantic_patterns(self):
        """
        Analyze patterns in semantic similarity of responses
        """
        if len(self.semantic_vectors) < 20:
            return
        
        try:
            # Calculate rolling semantic similarity
            recent_vectors = self.semantic_vectors[-self.window_size:]
            similarities = []
            
            for i in range(1, len(recent_vectors)):
                sim = cosine_similarity([recent_vectors[i-1]], [recent_vectors[i]])[0][0]
                similarities.append(sim)
            
            if len(similarities) < 10:
                return
            
            # Analyze similarity patterns
            avg_similarity = np.mean(similarities)
            similarity_trend = self._detect_trend(np.array(similarities))
            
            # Detect if responses are becoming too similar (lack of diversity)
            if avg_similarity > 0.8:
                pattern_id = f"high_similarity_pattern_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                pattern = PatternSignature(
                    pattern_id=pattern_id,
                    pattern_type="semantic_repetition",
                    strength=avg_similarity,
                    frequency=0,
                    duration=timedelta(minutes=len(similarities)),
                    first_detected=datetime.now(),
                    last_seen=datetime.now(),
                    occurrences=1,
                    metadata={
                        'avg_similarity': avg_similarity,
                        'similarity_trend': similarity_trend,
                        'responses_analyzed': len(similarities)
                    }
                )
                
                self.detected_patterns[pattern_id] = pattern
                logger.warning(f"Detected high semantic similarity pattern: {avg_similarity:.3f}")
                
        except Exception as e:
            logger.warning(f"Error analyzing semantic patterns: {e}")
    
    def _analyze_temporal_patterns(self):
        """
        Analyze temporal patterns in interactions
        """
        if len(self.temporal_features) < 20:
            return
        
        try:
            recent_features = list(self.temporal_features)[-self.window_size:]
            
            # Analyze hour-of-day patterns
            hours = [f['hour_of_day'] for f in recent_features]
            hour_distribution = np.bincount(hours, minlength=24) / len(hours)
            
            # Check for strong temporal clustering
            max_hour_freq = np.max(hour_distribution)
            if max_hour_freq > 0.4:  # More than 40% of interactions in one hour
                pattern_id = f"temporal_clustering_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                pattern = PatternSignature(
                    pattern_id=pattern_id,
                    pattern_type="temporal_clustering",
                    strength=max_hour_freq,
                    frequency=1.0,
                    duration=timedelta(hours=1),
                    first_detected=datetime.now(),
                    last_seen=datetime.now(),
                    occurrences=1,
                    metadata={
                        'peak_hour': np.argmax(hour_distribution),
                        'peak_frequency': max_hour_freq,
                        'hour_distribution': hour_distribution.tolist()
                    }
                )
                
                self.detected_patterns[pattern_id] = pattern
                
        except Exception as e:
            logger.warning(f"Error analyzing temporal patterns: {e}")
    
    def _calculate_autocorrelations(self):
        """
        Calculate autocorrelations for various metrics
        """
        if len(self.response_metrics) < self.max_lag * 2:
            return
        
        recent_metrics = list(self.response_metrics)[-self.window_size:]
        
        # Analyze autocorrelations for key metrics
        for metric_name in ['response_length', 'response_time', 'user_satisfaction']:
            if metric_name in recent_metrics[0]:
                values = [m.get(metric_name, 0) for m in recent_metrics if m.get(metric_name) is not None]
                
                if len(values) >= self.max_lag * 2:
                    autocorr_results = self._compute_autocorrelation(values, metric_name)
                    self.autocorrelation_history.extend(autocorr_results)
        
        # Maintain history size
        if len(self.autocorrelation_history) > 1000:
            self.autocorrelation_history = self.autocorrelation_history[-1000:]
    
    def _compute_autocorrelation(self, values: List[float], metric_name: str) -> List[AutocorrelationResult]:
        """
        Compute autocorrelation for a time series
        
        Args:
            values: Time series values
            metric_name: Name of the metric being analyzed
            
        Returns:
            List of autocorrelation results
        """
        try:
            series = np.array(values)
            
            # Normalize the series
            if np.std(series) > 0:
                normalized_series = (series - np.mean(series)) / np.std(series)
            else:
                return []
            
            results = []
            
            # Calculate autocorrelations for different lags
            for lag in range(1, min(self.max_lag, len(values) // 2)):
                # Calculate correlation
                if len(normalized_series) > lag:
                    corr = np.corrcoef(normalized_series[:-lag], normalized_series[lag:])[0, 1]
                    
                    if np.isnan(corr):
                        continue
                    
                    # Calculate significance (simplified)
                    n = len(normalized_series) - lag
                    significance = 1.96 / np.sqrt(n)  # 95% confidence interval
                    
                    # Determine pattern strength
                    if abs(corr) > 0.7:
                        strength = "strong"
                    elif abs(corr) > 0.4:
                        strength = "moderate"
                    elif abs(corr) > 0.2:
                        strength = "weak"
                    else:
                        strength = "negligible"
                    
                    # Interpretation
                    if corr > significance:
                        interpretation = f"Positive autocorrelation at lag {lag} for {metric_name}"
                    elif corr < -significance:
                        interpretation = f"Negative autocorrelation at lag {lag} for {metric_name}"
                    else:
                        interpretation = f"No significant autocorrelation at lag {lag} for {metric_name}"
                    
                    result = AutocorrelationResult(
                        lag=lag,
                        correlation=corr,
                        significance=significance,
                        pattern_strength=strength,
                        interpretation=interpretation
                    )
                    
                    results.append(result)
            
            return results
            
        except Exception as e:
            logger.warning(f"Error computing autocorrelation for {metric_name}: {e}")
            return []
    
    def _detect_trend(self, series: np.ndarray) -> float:
        """
        Detect trend in time series using linear regression
        
        Args:
            series: Time series data
            
        Returns:
            Trend strength (-1 to 1)
        """
        try:
            if len(series) < 3:
                return 0.0
            
            x = np.arange(len(series))
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, series)
            
            # Return correlation coefficient as trend strength
            return r_value
            
        except Exception:
            return 0.0
    
    def _detect_cycles(self, series: np.ndarray) -> Dict[str, Any]:
        """
        Detect cyclical patterns in time series
        
        Args:
            series: Time series data
            
        Returns:
            Dictionary with cycle information
        """
        try:
            if len(series) < 10:
                return {'strength': 0.0, 'frequency': 0}
            
            # Use FFT to detect dominant frequencies
            fft = np.fft.fft(series - np.mean(series))
            freqs = np.fft.fftfreq(len(series))
            
            # Find dominant frequency (excluding DC component)
            magnitudes = np.abs(fft[1:len(fft)//2])
            if len(magnitudes) > 0:
                dominant_freq_idx = np.argmax(magnitudes) + 1
                dominant_freq = freqs[dominant_freq_idx]
                cycle_strength = magnitudes[dominant_freq_idx - 1] / np.sum(magnitudes)
                
                return {
                    'strength': cycle_strength,
                    'frequency': abs(dominant_freq),
                    'period': 1.0 / abs(dominant_freq) if dominant_freq != 0 else 0
                }
            else:
                return {'strength': 0.0, 'frequency': 0}
                
        except Exception:
            return {'strength': 0.0, 'frequency': 0}
    
    def _detect_anomalies(self, series: np.ndarray) -> float:
        """
        Detect anomalies in time series using IQR method
        
        Args:
            series: Time series data
            
        Returns:
            Proportion of anomalous values
        """
        try:
            if len(series) < 4:
                return 0.0
            
            q1, q3 = np.percentile(series, [25, 75])
            iqr = q3 - q1
            
            if iqr == 0:
                return 0.0
            
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            anomalies = (series < lower_bound) | (series > upper_bound)
            return np.sum(anomalies) / len(series)
            
        except Exception:
            return 0.0
    
    def _calculate_complexity(self, text: str) -> float:
        """
        Calculate text complexity score
        
        Args:
            text: Input text
            
        Returns:
            Complexity score (0-1)
        """
        try:
            if not text:
                return 0.0
            
            words = text.split()
            sentences = text.count('.') + text.count('!') + text.count('?')
            
            if len(words) == 0 or sentences == 0:
                return 0.0
            
            # Average word length
            avg_word_length = np.mean([len(word) for word in words])
            
            # Average sentence length
            avg_sentence_length = len(words) / sentences
            
            # Vocabulary diversity (unique words / total words)
            vocab_diversity = len(set(words)) / len(words)
            
            # Normalize and combine metrics
            complexity = (
                min(avg_word_length / 10, 1.0) * 0.3 +
                min(avg_sentence_length / 20, 1.0) * 0.4 +
                vocab_diversity * 0.3
            )
            
            return complexity
            
        except Exception:
            return 0.5
    
    def _calculate_sentiment(self, text: str) -> float:
        """
        Calculate simple sentiment score
        
        Args:
            text: Input text
            
        Returns:
            Sentiment score (-1 to 1)
        """
        try:
            positive_words = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'helpful', 'useful']
            negative_words = ['bad', 'terrible', 'awful', 'horrible', 'useless', 'unhelpful', 'wrong']
            
            words = text.lower().split()
            
            positive_count = sum(1 for word in words if word in positive_words)
            negative_count = sum(1 for word in words if word in negative_words)
            
            if positive_count + negative_count == 0:
                return 0.0
            
            return (positive_count - negative_count) / (positive_count + negative_count)
            
        except Exception:
            return 0.0
    
    def get_pattern_summary(self) -> Dict[str, Any]:
        """
        Get summary of detected patterns
        
        Returns:
            Dictionary with pattern analysis summary
        """
        current_time = datetime.now()
        
        # Group patterns by type
        pattern_types = defaultdict(list)
        for pattern in self.detected_patterns.values():
            pattern_types[pattern.pattern_type].append(pattern)
        
        # Recent autocorrelations
        recent_autocorr = [
            result for result in self.autocorrelation_history
            if abs(result.correlation) > 0.3  # Only significant correlations
        ]
        
        return {
            'total_patterns': len(self.detected_patterns),
            'pattern_types': {
                ptype: {
                    'count': len(patterns),
                    'avg_strength': np.mean([p.strength for p in patterns]),
                    'recent_patterns': [p.pattern_id for p in patterns if (current_time - p.last_seen).total_seconds() < 3600]
                }
                for ptype, patterns in pattern_types.items()
            },
            'significant_autocorrelations': len(recent_autocorr),
            'autocorrelation_summary': [
                {
                    'lag': result.lag,
                    'correlation': result.correlation,
                    'strength': result.pattern_strength,
                    'interpretation': result.interpretation
                }
                for result in recent_autocorr[-10:]  # Last 10 significant results
            ],
            'analysis_window': self.window_size,
            'interactions_analyzed': len(self.interaction_sequence)
        }
    
    def export_data(self) -> Dict[str, Any]:
        """
        Export all pattern detection data
        
        Returns:
            Complete data export
        """
        return {
            'patterns': {
                pid: {
                    'pattern_id': pattern.pattern_id,
                    'pattern_type': pattern.pattern_type,
                    'strength': pattern.strength,
                    'frequency': pattern.frequency,
                    'duration_seconds': pattern.duration.total_seconds(),
                    'first_detected': pattern.first_detected.isoformat(),
                    'last_seen': pattern.last_seen.isoformat(),
                    'occurrences': pattern.occurrences,
                    'metadata': pattern.metadata
                }
                for pid, pattern in self.detected_patterns.items()
            },
            'autocorrelations': [
                {
                    'lag': result.lag,
                    'correlation': result.correlation,
                    'significance': result.significance,
                    'pattern_strength': result.pattern_strength,
                    'interpretation': result.interpretation
                }
                for result in self.autocorrelation_history
            ],
            'summary': self.get_pattern_summary()
        }
    
    def reset(self):
        """Reset all pattern detection data"""
        self.interaction_sequence.clear()
        self.response_metrics.clear()
        self.temporal_features.clear()
        self.detected_patterns.clear()
        self.autocorrelation_history.clear()
        self.semantic_vectors.clear()
        logger.info("AutocorrelationMapper reset completed")
