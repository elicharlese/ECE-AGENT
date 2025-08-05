"""
Pattern Analyzer
================

Advanced pattern analysis system for detecting behavioral patterns,
quality trends, and optimization opportunities in agent responses.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
from collections import defaultdict, Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from scipy import stats
from textstat import flesch_reading_ease, flesch_kincaid_grade

logger = logging.getLogger(__name__)

class PatternType(Enum):
    """Types of patterns that can be detected"""
    QUALITY_TREND = "quality_trend"
    RESPONSE_STYLE = "response_style"
    TOPIC_CLUSTERING = "topic_clustering"
    TEMPORAL_BEHAVIOR = "temporal_behavior"
    USER_INTERACTION = "user_interaction"
    COMPLEXITY_PATTERN = "complexity_pattern"

@dataclass
class QualityMetrics:
    """Container for response quality metrics"""
    readability_score: float
    coherence_score: float
    relevance_score: float
    completeness_score: float
    helpfulness_score: float
    overall_quality: float
    timestamp: datetime

@dataclass
class PatternAnalysis:
    """Results from pattern analysis"""
    pattern_type: PatternType
    description: str
    confidence: float
    impact_score: float
    recommendations: List[str]
    supporting_data: Dict[str, Any]
    detected_at: datetime

class PatternAnalyzer:
    """
    Advanced pattern analysis system for agent behavior optimization
    
    Capabilities:
    - Quality trend analysis
    - Response style pattern detection
    - Topic clustering and analysis
    - Temporal behavior patterns
    - User interaction patterns
    - Complexity and readability analysis
    """
    
    def __init__(self, 
                 analysis_window: int = 200,
                 min_pattern_confidence: float = 0.6):
        """
        Initialize pattern analyzer
        
        Args:
            analysis_window: Number of interactions to analyze
            min_pattern_confidence: Minimum confidence for pattern detection
        """
        self.analysis_window = analysis_window
        self.min_pattern_confidence = min_pattern_confidence
        
        # Data storage
        self.interactions: List[Dict[str, Any]] = []
        self.quality_metrics: List[QualityMetrics] = []
        self.detected_patterns: List[PatternAnalysis] = []
        
        # Analysis tools
        self.topic_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.style_vectorizer = CountVectorizer(max_features=50, analyzer='char', ngram_range=(2, 4))
        
        # Pattern tracking
        self.pattern_cache: Dict[str, Any] = {}
        self.last_analysis: Optional[datetime] = None
        
        logger.info(f"PatternAnalyzer initialized with window={analysis_window}")
    
    def add_interaction(self,
                       user_input: str,
                       model_output: str,
                       response_time: float,
                       user_satisfaction: Optional[float] = None,
                       context: Optional[Dict[str, Any]] = None):
        """
        Add interaction for pattern analysis
        
        Args:
            user_input: User's input text
            model_output: Model's response
            response_time: Time taken to generate response
            user_satisfaction: Optional satisfaction rating
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
        
        # Calculate quality metrics
        quality = self._calculate_quality_metrics(interaction)
        
        # Store data
        self.interactions.append(interaction)
        self.quality_metrics.append(quality)
        
        # Maintain window size
        if len(self.interactions) > self.analysis_window * 2:
            self.interactions = self.interactions[-self.analysis_window:]
            self.quality_metrics = self.quality_metrics[-self.analysis_window:]
        
        # Trigger analysis if enough data
        if len(self.interactions) >= 20 and (
            self.last_analysis is None or 
            (timestamp - self.last_analysis).total_seconds() > 300  # 5 minutes
        ):
            self._perform_analysis()
            self.last_analysis = timestamp
    
    def _calculate_quality_metrics(self, interaction: Dict[str, Any]) -> QualityMetrics:
        """
        Calculate comprehensive quality metrics for a response
        
        Args:
            interaction: The interaction data
            
        Returns:
            QualityMetrics object
        """
        response = interaction['model_output']
        user_input = interaction['user_input']
        
        # Readability metrics
        readability = self._calculate_readability(response)
        
        # Coherence analysis
        coherence = self._calculate_coherence(response)
        
        # Relevance to user input
        relevance = self._calculate_relevance(user_input, response)
        
        # Completeness assessment
        completeness = self._calculate_completeness(user_input, response)
        
        # Helpfulness indicators
        helpfulness = self._calculate_helpfulness(response, interaction.get('user_satisfaction'))
        
        # Overall quality score
        overall = (readability * 0.15 + coherence * 0.25 + relevance * 0.25 + 
                  completeness * 0.20 + helpfulness * 0.15)
        
        return QualityMetrics(
            readability_score=readability,
            coherence_score=coherence,
            relevance_score=relevance,
            completeness_score=completeness,
            helpfulness_score=helpfulness,
            overall_quality=overall,
            timestamp=interaction['timestamp']
        )
    
    def _calculate_readability(self, text: str) -> float:
        """
        Calculate readability score
        
        Args:
            text: Input text
            
        Returns:
            Readability score (0-1)
        """
        try:
            if len(text.strip()) < 10:
                return 0.5
            
            # Flesch reading ease (0-100, higher is more readable)
            flesch_score = flesch_reading_ease(text)
            
            # Normalize to 0-1 (100 -> 1, 0 -> 0)
            normalized_score = max(0, min(1, flesch_score / 100))
            
            return normalized_score
            
        except Exception:
            return 0.5
    
    def _calculate_coherence(self, text: str) -> float:
        """
        Calculate coherence score based on structure and flow
        
        Args:
            text: Input text
            
        Returns:
            Coherence score (0-1)
        """
        try:
            if len(text.strip()) < 10:
                return 0.5
            
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if len(sentences) < 2:
                return 0.7  # Single sentence responses can be coherent
            
            coherence_score = 0.0
            
            # Check for transition words/phrases
            transition_words = ['however', 'therefore', 'furthermore', 'moreover', 'additionally',
                              'consequently', 'meanwhile', 'also', 'next', 'then', 'finally',
                              'in addition', 'for example', 'in contrast', 'similarly']
            
            transition_count = sum(1 for word in transition_words if word in text.lower())
            transition_ratio = min(1.0, transition_count / max(1, len(sentences) - 1))
            coherence_score += transition_ratio * 0.3
            
            # Check sentence length variation (good coherence has variety)
            sentence_lengths = [len(s.split()) for s in sentences]
            if len(sentence_lengths) > 1:
                length_variance = np.var(sentence_lengths) / max(1, np.mean(sentence_lengths))
                length_score = min(1.0, length_variance / 2.0)  # Normalize variance
                coherence_score += length_score * 0.2
            
            # Check for logical structure (lists, numbered points, etc.)
            structure_indicators = ['first', 'second', 'third', '1.', '2.', '3.', '•', '-']
            structure_count = sum(1 for indicator in structure_indicators if indicator in text.lower())
            structure_score = min(1.0, structure_count / len(sentences))
            coherence_score += structure_score * 0.2
            
            # Base coherence (if no major issues detected)
            coherence_score += 0.3
            
            return min(1.0, coherence_score)
            
        except Exception:
            return 0.5
    
    def _calculate_relevance(self, user_input: str, response: str) -> float:
        """
        Calculate relevance of response to user input
        
        Args:
            user_input: User's question/input
            response: Model's response
            
        Returns:
            Relevance score (0-1)
        """
        try:
            if not user_input.strip() or not response.strip():
                return 0.5
            
            # Keyword overlap analysis
            user_words = set(re.findall(r'\b\w+\b', user_input.lower()))
            response_words = set(re.findall(r'\b\w+\b', response.lower()))
            
            # Remove common stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
            user_keywords = user_words - stop_words
            response_keywords = response_words - stop_words
            
            if len(user_keywords) == 0:
                return 0.7  # Default for very short inputs
            
            # Calculate keyword overlap
            overlap = len(user_keywords.intersection(response_keywords))
            keyword_relevance = overlap / len(user_keywords)
            
            # Check for direct question answering
            question_indicators = ['what', 'how', 'why', 'when', 'where', 'who', 'which']
            has_question = any(indicator in user_input.lower() for indicator in question_indicators)
            
            answer_indicators = ['because', 'due to', 'the answer', 'the reason', 'you can', 'here is', 'this is']
            has_answer_structure = any(indicator in response.lower() for indicator in answer_indicators)
            
            question_answer_bonus = 0.2 if has_question and has_answer_structure else 0.0
            
            # Final relevance score
            relevance = min(1.0, keyword_relevance * 0.8 + question_answer_bonus + 0.2)
            
            return relevance
            
        except Exception:
            return 0.5
    
    def _calculate_completeness(self, user_input: str, response: str) -> float:
        """
        Calculate completeness of response
        
        Args:
            user_input: User's question/input
            response: Model's response
            
        Returns:
            Completeness score (0-1)
        """
        try:
            if not response.strip():
                return 0.0
            
            response_length = len(response.strip())
            user_length = len(user_input.strip())
            
            # Length-based completeness (more comprehensive responses for complex questions)
            if user_length > 100:  # Complex question
                length_score = min(1.0, response_length / 500)
            elif user_length > 50:  # Medium question
                length_score = min(1.0, response_length / 300)
            else:  # Simple question
                length_score = min(1.0, response_length / 150)
            
            # Check for examples, explanations
            detail_indicators = ['example', 'for instance', 'such as', 'specifically', 'detail', 'explain']
            detail_count = sum(1 for indicator in detail_indicators if indicator in response.lower())
            detail_score = min(1.0, detail_count * 0.2)
            
            # Check for structured information
            structure_indicators = ['steps:', 'process:', 'method:', 'approach:', 'solution:']
            structure_count = sum(1 for indicator in structure_indicators if indicator in response.lower())
            structure_score = min(1.0, structure_count * 0.3)
            
            # Combine scores
            completeness = length_score * 0.5 + detail_score * 0.3 + structure_score * 0.2
            
            return min(1.0, completeness)
            
        except Exception:
            return 0.5
    
    def _calculate_helpfulness(self, response: str, user_satisfaction: Optional[float] = None) -> float:
        """
        Calculate helpfulness score
        
        Args:
            response: Model's response
            user_satisfaction: Optional user satisfaction rating
            
        Returns:
            Helpfulness score (0-1)
        """
        try:
            if user_satisfaction is not None:
                return user_satisfaction
            
            # Analyze response for helpfulness indicators
            helpful_indicators = [
                'here is', 'here are', 'you can', 'try this', 'consider', 'suggest',
                'recommend', 'help you', 'solution', 'answer', 'explain', 'guide'
            ]
            
            unhelpful_indicators = [
                'sorry', 'cannot', 'unable', 'don\'t know', 'not sure', 'unclear',
                'impossible', 'can\'t help', 'no information'
            ]
            
            helpful_count = sum(1 for indicator in helpful_indicators if indicator in response.lower())
            unhelpful_count = sum(1 for indicator in unhelpful_indicators if indicator in response.lower())
            
            # Calculate base helpfulness
            helpfulness = 0.5  # Neutral baseline
            
            # Adjust based on indicators
            helpfulness += helpful_count * 0.1
            helpfulness -= unhelpful_count * 0.15
            
            # Check for actionable content
            action_words = ['click', 'download', 'install', 'run', 'execute', 'follow', 'use']
            action_count = sum(1 for word in action_words if word in response.lower())
            helpfulness += min(0.2, action_count * 0.05)
            
            return max(0.0, min(1.0, helpfulness))
            
        except Exception:
            return 0.5
    
    def _perform_analysis(self):
        """Perform comprehensive pattern analysis"""
        if len(self.interactions) < 10:
            return
        
        try:
            # Analyze different pattern types
            self._analyze_quality_trends()
            self._analyze_response_styles()
            self._analyze_topic_clusters()
            self._analyze_temporal_behavior()
            self._analyze_complexity_patterns()
            
            # Clean up old patterns
            cutoff_time = datetime.now() - timedelta(hours=24)
            self.detected_patterns = [
                p for p in self.detected_patterns 
                if p.detected_at >= cutoff_time
            ]
            
        except Exception as e:
            logger.error(f"Error in pattern analysis: {e}")
    
    def _analyze_quality_trends(self):
        """Analyze trends in response quality over time"""
        if len(self.quality_metrics) < 20:
            return
        
        try:
            recent_metrics = self.quality_metrics[-50:] if len(self.quality_metrics) >= 50 else self.quality_metrics
            
            # Extract quality scores over time
            overall_scores = [m.overall_quality for m in recent_metrics]
            readability_scores = [m.readability_score for m in recent_metrics]
            coherence_scores = [m.coherence_score for m in recent_metrics]
            
            # Calculate trends
            overall_trend = self._calculate_trend(overall_scores)
            readability_trend = self._calculate_trend(readability_scores)
            coherence_trend = self._calculate_trend(coherence_scores)
            
            # Detect significant trends
            if abs(overall_trend) > 0.1:
                trend_direction = "improving" if overall_trend > 0 else "declining"
                
                recommendations = []
                if overall_trend < -0.1:
                    recommendations.extend([
                        "Review recent response generation parameters",
                        "Analyze user feedback patterns",
                        "Consider adjusting quality optimization weights"
                    ])
                
                pattern = PatternAnalysis(
                    pattern_type=PatternType.QUALITY_TREND,
                    description=f"Overall response quality {trend_direction} with trend slope {overall_trend:.3f}",
                    confidence=min(1.0, abs(overall_trend) * 5),
                    impact_score=abs(overall_trend),
                    recommendations=recommendations,
                    supporting_data={
                        'overall_trend': overall_trend,
                        'readability_trend': readability_trend,
                        'coherence_trend': coherence_trend,
                        'current_avg_quality': np.mean(overall_scores[-10:]),
                        'samples_analyzed': len(overall_scores)
                    },
                    detected_at=datetime.now()
                )
                
                self.detected_patterns.append(pattern)
                
        except Exception as e:
            logger.warning(f"Error analyzing quality trends: {e}")
    
    def _analyze_response_styles(self):
        """Analyze patterns in response style and structure"""
        if len(self.interactions) < 20:
            return
        
        try:
            recent_responses = [i['model_output'] for i in self.interactions[-30:]]
            
            # Analyze style characteristics
            avg_length = np.mean([len(r) for r in recent_responses])
            length_variance = np.var([len(r) for r in recent_responses])
            
            # Sentence structure analysis
            avg_sentences = np.mean([r.count('.') + r.count('!') + r.count('?') for r in recent_responses])
            
            # Formality analysis
            formal_indicators = ['furthermore', 'however', 'therefore', 'consequently', 'nevertheless']
            informal_indicators = ['yeah', 'okay', 'sure', 'cool', 'awesome', 'great']
            
            formality_scores = []
            for response in recent_responses:
                formal_count = sum(1 for word in formal_indicators if word in response.lower())
                informal_count = sum(1 for word in informal_indicators if word in response.lower())
                formality = (formal_count - informal_count) / max(1, len(response.split()) / 50)
                formality_scores.append(formality)
            
            avg_formality = np.mean(formality_scores)
            
            # Detect style patterns
            if length_variance / max(1, avg_length) > 0.5:  # High length variance
                pattern = PatternAnalysis(
                    pattern_type=PatternType.RESPONSE_STYLE,
                    description="High variance in response lengths detected",
                    confidence=0.7,
                    impact_score=0.3,
                    recommendations=[
                        "Consider standardizing response length guidelines",
                        "Review context-appropriate response sizing"
                    ],
                    supporting_data={
                        'avg_length': avg_length,
                        'length_variance': length_variance,
                        'coefficient_variation': length_variance / max(1, avg_length)
                    },
                    detected_at=datetime.now()
                )
                self.detected_patterns.append(pattern)
            
            if abs(avg_formality) > 0.5:
                formality_type = "formal" if avg_formality > 0 else "informal"
                pattern = PatternAnalysis(
                    pattern_type=PatternType.RESPONSE_STYLE,
                    description=f"Consistent {formality_type} response style detected",
                    confidence=min(1.0, abs(avg_formality)),
                    impact_score=0.2,
                    recommendations=[
                        f"Consider adjusting formality level based on context",
                        f"Review if {formality_type} style suits all user interactions"
                    ],
                    supporting_data={
                        'avg_formality': avg_formality,
                        'formality_scores': formality_scores[-10:]
                    },
                    detected_at=datetime.now()
                )
                self.detected_patterns.append(pattern)
                
        except Exception as e:
            logger.warning(f"Error analyzing response styles: {e}")
    
    def _analyze_topic_clusters(self):
        """Analyze topic clustering in user interactions"""
        if len(self.interactions) < 30:
            return
        
        try:
            recent_inputs = [i['user_input'] for i in self.interactions[-50:]]
            
            # Vectorize user inputs
            if len(recent_inputs) < 5:
                return
                
            # Clean and prepare texts
            clean_inputs = [text for text in recent_inputs if len(text.strip()) > 10]
            if len(clean_inputs) < 5:
                return
            
            # Fit vectorizer and get topics
            tfidf_matrix = self.topic_vectorizer.fit_transform(clean_inputs)
            
            if tfidf_matrix.shape[0] < 3:
                return
            
            # Cluster topics
            n_clusters = min(5, len(clean_inputs) // 3)
            if n_clusters >= 2:
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                clusters = kmeans.fit_predict(tfidf_matrix)
                
                # Analyze cluster distribution
                cluster_counts = Counter(clusters)
                dominant_cluster = max(cluster_counts.values())
                cluster_concentration = dominant_cluster / len(clusters)
                
                if cluster_concentration > 0.6:  # High concentration in one topic
                    # Get top terms for dominant cluster
                    dominant_cluster_id = max(cluster_counts, key=cluster_counts.get)
                    feature_names = self.topic_vectorizer.get_feature_names_out()
                    
                    # Get centroid terms
                    centroid = kmeans.cluster_centers_[dominant_cluster_id]
                    top_indices = centroid.argsort()[-10:][::-1]
                    top_terms = [feature_names[i] for i in top_indices]
                    
                    pattern = PatternAnalysis(
                        pattern_type=PatternType.TOPIC_CLUSTERING,
                        description=f"High concentration ({cluster_concentration:.2f}) in topic cluster",
                        confidence=cluster_concentration,
                        impact_score=0.4,
                        recommendations=[
                            "Consider expanding knowledge base for diverse topics",
                            "Monitor for topic bias in training data",
                            "Ensure balanced coverage across domains"
                        ],
                        supporting_data={
                            'cluster_concentration': cluster_concentration,
                            'dominant_topics': top_terms[:5],
                            'cluster_distribution': dict(cluster_counts),
                            'total_clusters': n_clusters
                        },
                        detected_at=datetime.now()
                    )
                    self.detected_patterns.append(pattern)
                    
        except Exception as e:
            logger.warning(f"Error analyzing topic clusters: {e}")
    
    def _analyze_temporal_behavior(self):
        """Analyze temporal patterns in agent behavior"""
        if len(self.interactions) < 20:
            return
        
        try:
            recent_interactions = self.interactions[-100:] if len(self.interactions) >= 100 else self.interactions
            
            # Extract temporal features
            timestamps = [i['timestamp'] for i in recent_interactions]
            response_times = [i['response_time'] for i in recent_interactions]
            quality_scores = [self.quality_metrics[idx].overall_quality 
                            for idx in range(len(self.quality_metrics))
                            if idx >= len(self.quality_metrics) - len(recent_interactions)]
            
            # Analyze response time patterns
            if len(response_times) >= 10:
                time_trend = self._calculate_trend(response_times)
                
                if abs(time_trend) > 0.1:
                    trend_direction = "increasing" if time_trend > 0 else "decreasing"
                    
                    pattern = PatternAnalysis(
                        pattern_type=PatternType.TEMPORAL_BEHAVIOR,
                        description=f"Response time {trend_direction} trend detected",
                        confidence=min(1.0, abs(time_trend) * 3),
                        impact_score=abs(time_trend) * 0.5,
                        recommendations=[
                            "Monitor system performance and load",
                            "Review inference optimization settings",
                            "Check for resource constraints"
                        ] if time_trend > 0 else [
                            "Good optimization trend detected",
                            "Monitor to ensure quality isn't compromised"
                        ],
                        supporting_data={
                            'time_trend': time_trend,
                            'avg_response_time': np.mean(response_times),
                            'time_variance': np.var(response_times)
                        },
                        detected_at=datetime.now()
                    )
                    self.detected_patterns.append(pattern)
            
            # Analyze quality vs time correlation
            if len(quality_scores) >= 10 and len(response_times) == len(quality_scores):
                correlation = np.corrcoef(response_times, quality_scores)[0, 1]
                
                if abs(correlation) > 0.5:
                    correlation_type = "positive" if correlation > 0 else "negative"
                    
                    pattern = PatternAnalysis(
                        pattern_type=PatternType.TEMPORAL_BEHAVIOR,
                        description=f"Strong {correlation_type} correlation between response time and quality",
                        confidence=abs(correlation),
                        impact_score=abs(correlation) * 0.6,
                        recommendations=[
                            "Optimize speed-quality trade-off parameters",
                            "Consider dynamic timeout adjustments",
                            "Review quality vs efficiency metrics"
                        ],
                        supporting_data={
                            'time_quality_correlation': correlation,
                            'avg_quality': np.mean(quality_scores),
                            'avg_time': np.mean(response_times)
                        },
                        detected_at=datetime.now()
                    )
                    self.detected_patterns.append(pattern)
                    
        except Exception as e:
            logger.warning(f"Error analyzing temporal behavior: {e}")
    
    def _analyze_complexity_patterns(self):
        """Analyze patterns in response complexity and readability"""
        if len(self.quality_metrics) < 20:
            return
        
        try:
            recent_metrics = self.quality_metrics[-30:]
            
            readability_scores = [m.readability_score for m in recent_metrics]
            coherence_scores = [m.coherence_score for m in recent_metrics]
            
            # Analyze readability trends
            readability_trend = self._calculate_trend(readability_scores)
            avg_readability = np.mean(readability_scores)
            
            # Check for complexity issues
            if avg_readability < 0.4:  # Low readability
                pattern = PatternAnalysis(
                    pattern_type=PatternType.COMPLEXITY_PATTERN,
                    description=f"Low readability detected (avg: {avg_readability:.3f})",
                    confidence=1.0 - avg_readability,
                    impact_score=0.7,
                    recommendations=[
                        "Simplify sentence structure and vocabulary",
                        "Use shorter sentences and paragraphs",
                        "Avoid technical jargon when possible",
                        "Include explanations for complex terms"
                    ],
                    supporting_data={
                        'avg_readability': avg_readability,
                        'readability_trend': readability_trend,
                        'low_readability_ratio': sum(1 for r in readability_scores if r < 0.5) / len(readability_scores)
                    },
                    detected_at=datetime.now()
                )
                self.detected_patterns.append(pattern)
            
            # Analyze coherence patterns
            coherence_trend = self._calculate_trend(coherence_scores)
            avg_coherence = np.mean(coherence_scores)
            
            if avg_coherence < 0.5:  # Low coherence
                pattern = PatternAnalysis(
                    pattern_type=PatternType.COMPLEXITY_PATTERN,
                    description=f"Low coherence detected (avg: {avg_coherence:.3f})",
                    confidence=1.0 - avg_coherence,
                    impact_score=0.6,
                    recommendations=[
                        "Improve logical flow between sentences",
                        "Use transition words and phrases",
                        "Structure responses with clear organization",
                        "Ensure topic consistency throughout response"
                    ],
                    supporting_data={
                        'avg_coherence': avg_coherence,
                        'coherence_trend': coherence_trend,
                        'low_coherence_ratio': sum(1 for c in coherence_scores if c < 0.5) / len(coherence_scores)
                    },
                    detected_at=datetime.now()
                )
                self.detected_patterns.append(pattern)
                
        except Exception as e:
            logger.warning(f"Error analyzing complexity patterns: {e}")
    
    def _calculate_trend(self, values: List[float]) -> float:
        """
        Calculate trend slope for a series of values
        
        Args:
            values: List of numeric values
            
        Returns:
            Trend slope (positive = increasing, negative = decreasing)
        """
        try:
            if len(values) < 3:
                return 0.0
            
            x = np.arange(len(values))
            slope, _, r_value, _, _ = stats.linregress(x, values)
            
            # Weight by correlation strength
            return slope * abs(r_value)
            
        except Exception:
            return 0.0
    
    def get_analysis_summary(self) -> Dict[str, Any]:
        """
        Get summary of pattern analysis results
        
        Returns:
            Dictionary with analysis summary
        """
        if not self.quality_metrics:
            return {
                'total_interactions': 0,
                'quality_score': 0.5,
                'patterns_detected': 0,
                'analysis_status': 'insufficient_data'
            }
        
        # Calculate current quality metrics
        recent_quality = self.quality_metrics[-20:] if len(self.quality_metrics) >= 20 else self.quality_metrics
        
        avg_quality = np.mean([m.overall_quality for m in recent_quality])
        avg_readability = np.mean([m.readability_score for m in recent_quality])
        avg_coherence = np.mean([m.coherence_score for m in recent_quality])
        avg_relevance = np.mean([m.relevance_score for m in recent_quality])
        avg_completeness = np.mean([m.completeness_score for m in recent_quality])
        avg_helpfulness = np.mean([m.helpfulness_score for m in recent_quality])
        
        # Categorize recent patterns
        recent_patterns = [p for p in self.detected_patterns 
                          if (datetime.now() - p.detected_at).total_seconds() < 3600]  # Last hour
        
        pattern_categories = defaultdict(int)
        high_impact_patterns = []
        
        for pattern in recent_patterns:
            pattern_categories[pattern.pattern_type.value] += 1
            if pattern.impact_score > 0.5:
                high_impact_patterns.append({
                    'type': pattern.pattern_type.value,
                    'description': pattern.description,
                    'impact': pattern.impact_score,
                    'confidence': pattern.confidence
                })
        
        return {
            'total_interactions': len(self.interactions),
            'quality_score': avg_quality,
            'quality_breakdown': {
                'readability': avg_readability,
                'coherence': avg_coherence,
                'relevance': avg_relevance,
                'completeness': avg_completeness,
                'helpfulness': avg_helpfulness
            },
            'patterns_detected': len(recent_patterns),
            'pattern_categories': dict(pattern_categories),
            'high_impact_patterns': high_impact_patterns,
            'analysis_window': self.analysis_window,
            'last_analysis': self.last_analysis.isoformat() if self.last_analysis else None,
            'analysis_status': 'active'
        }
    
    def get_recommendations(self) -> List[Dict[str, Any]]:
        """
        Get prioritized recommendations based on pattern analysis
        
        Returns:
            List of recommendations with priorities
        """
        recommendations = []
        
        # Get recent high-impact patterns
        recent_patterns = [p for p in self.detected_patterns 
                          if (datetime.now() - p.detected_at).total_seconds() < 7200]  # Last 2 hours
        
        high_impact_patterns = [p for p in recent_patterns if p.impact_score > 0.4]
        high_impact_patterns.sort(key=lambda x: x.impact_score, reverse=True)
        
        for pattern in high_impact_patterns[:5]:  # Top 5 recommendations
            for i, rec in enumerate(pattern.recommendations):
                recommendations.append({
                    'recommendation': rec,
                    'priority': pattern.impact_score * pattern.confidence,
                    'category': pattern.pattern_type.value,
                    'supporting_pattern': pattern.description,
                    'confidence': pattern.confidence,
                    'rank': len(recommendations) + 1
                })
        
        # Sort by priority
        recommendations.sort(key=lambda x: x['priority'], reverse=True)
        
        return recommendations[:10]  # Top 10 recommendations
    
    def export_analysis_data(self) -> Dict[str, Any]:
        """
        Export all pattern analysis data
        
        Returns:
            Complete analysis data export
        """
        return {
            'config': {
                'analysis_window': self.analysis_window,
                'min_pattern_confidence': self.min_pattern_confidence
            },
            'quality_metrics': [
                {
                    'readability_score': m.readability_score,
                    'coherence_score': m.coherence_score,
                    'relevance_score': m.relevance_score,
                    'completeness_score': m.completeness_score,
                    'helpfulness_score': m.helpfulness_score,
                    'overall_quality': m.overall_quality,
                    'timestamp': m.timestamp.isoformat()
                }
                for m in self.quality_metrics
            ],
            'detected_patterns': [
                {
                    'pattern_type': p.pattern_type.value,
                    'description': p.description,
                    'confidence': p.confidence,
                    'impact_score': p.impact_score,
                    'recommendations': p.recommendations,
                    'supporting_data': p.supporting_data,
                    'detected_at': p.detected_at.isoformat()
                }
                for p in self.detected_patterns
            ],
            'analysis_summary': self.get_analysis_summary(),
            'recommendations': self.get_recommendations()
        }
    
    def reset(self):
        """Reset all analysis data"""
        self.interactions.clear()
        self.quality_metrics.clear()
        self.detected_patterns.clear()
        self.pattern_cache.clear()
        self.last_analysis = None
        logger.info("PatternAnalyzer reset completed")
