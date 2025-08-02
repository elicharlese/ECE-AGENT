import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from ..base_classes import EnhancedAgentBase

class DataEngineerAgent(EnhancedAgentBase):
    """AI Agent specialized in data engineering and analytics"""
    
    def __init__(self):
        super().__init__("data-engineer")
        self.knowledge_base = {
            "technologies": ["spark", "hadoop", "kafka", "airflow", "dbt", "snowflake", "redshift"],
            "databases": ["postgresql", "mongodb", "cassandra", "redis", "elasticsearch"],
            "tools": ["pandas", "numpy", "jupyter", "tableau", "power_bi", "grafana"],
            "cloud_platforms": ["aws", "gcp", "azure", "databricks"],
            "concepts": ["etl", "elt", "data_lake", "data_warehouse", "streaming", "batch_processing"]
        }
        
    def setup_domain_tools(self):
        """Setup data engineering specific tools"""
        # Data pipeline analyzer
        self.tool_registry.register_tool(
            name="analyze_pipeline",
            description="Analyze data pipeline architecture and performance",
            function=self._analyze_pipeline,
            parameters={"pipeline_config": "dict", "performance_metrics": "dict"},
            required_params=["pipeline_config"]
        )
        
        # Data quality checker
        self.tool_registry.register_tool(
            name="check_data_quality",
            description="Assess data quality and suggest improvements",
            function=self._check_data_quality,
            parameters={"dataset_info": "dict", "quality_rules": "list"},
            required_params=["dataset_info"]
        )
        
        # Query optimizer
        self.tool_registry.register_tool(
            name="optimize_query",
            description="Optimize database queries for better performance",
            function=self._optimize_query,
            parameters={"query": "str", "database_type": "str", "schema_info": "dict"},
            required_params=["query", "database_type"]
        )
    
    def setup_domain_knowledge(self):
        """Setup data engineering specific knowledge"""
        pass
    
    async def process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process data engineering queries"""
        context = {
            "web_context": web_context or [],
            "domain": self.domain,
            "query": query
        }
        
        enhanced_result = await self.process_enhanced(query, context)
        
        if enhanced_result.get("confidence", 0) < 0.7:
            fallback_result = await self._legacy_process(query, web_context)
            enhanced_result["answer"] = fallback_result.get("answer", enhanced_result["answer"])
            enhanced_result["confidence"] = max(enhanced_result.get("confidence", 0), fallback_result.get("confidence", 0))
        
        return enhanced_result
    
    async def _legacy_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process data engineering queries"""
        try:
            query_lower = query.lower()
            query_type = self._analyze_query_type(query_lower)
            
            if query_type == "pipeline":
                response = await self._handle_pipeline_query(query, web_context)
            elif query_type == "data_quality":
                response = await self._handle_data_quality_query(query, web_context)
            elif query_type == "database":
                response = await self._handle_database_query(query, web_context)
            elif query_type == "streaming":
                response = await self._handle_streaming_query(query, web_context)
            elif query_type == "analytics":
                response = await self._handle_analytics_query(query, web_context)
            else:
                response = await self._handle_general_data_engineering(query, web_context)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in data engineer agent: {e}")
            return {
                "answer": "I encountered an error processing your data engineering query.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_query_type(self, query: str) -> str:
        """Analyze the type of data engineering query"""
        if any(word in query for word in ["pipeline", "etl", "elt", "airflow", "workflow"]):
            return "pipeline"
        elif any(word in query for word in ["quality", "validation", "cleansing", "profiling"]):
            return "data_quality"
        elif any(word in query for word in ["database", "sql", "query", "optimize", "performance"]):
            return "database"
        elif any(word in query for word in ["streaming", "kafka", "real-time", "event"]):
            return "streaming"
        elif any(word in query for word in ["analytics", "dashboard", "visualization", "reporting"]):
            return "analytics"
        else:
            return "general"
    
    async def _handle_pipeline_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle data pipeline related queries"""
        pipeline_best_practices = [
            "Design for idempotency and fault tolerance",
            "Implement proper error handling and retry mechanisms",
            "Use schema validation and evolution strategies",
            "Monitor pipeline performance and data freshness",
            "Implement data lineage and metadata management",
            "Use appropriate partitioning and bucketing strategies"
        ]
        
        tools_recommendations = [
            "Apache Airflow for workflow orchestration",
            "dbt for data transformation and testing",
            "Apache Spark for large-scale data processing",
            "Apache Kafka for real-time data streaming",
            "Great Expectations for data validation"
        ]
        
        return {
            "answer": f"Data Pipeline Engineering:\n\n" +
                     "Best Practices:\n" + "\n".join([f"• {p}" for p in pipeline_best_practices]) +
                     f"\n\nRecommended Tools:\n" + "\n".join([f"• {t}" for t in tools_recommendations]) +
                     f"\n\nFor your pipeline requirements: {query}\n" +
                     "Consider scalability, maintainability, and monitoring from the design phase.",
            "confidence": 0.87,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied data pipeline engineering best practices"
        }
    
    async def _handle_data_quality_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle data quality related queries"""
        quality_dimensions = [
            "Accuracy: Data correctly represents reality",
            "Completeness: All required data is present",
            "Consistency: Data is uniform across systems",
            "Timeliness: Data is available when needed",
            "Validity: Data conforms to defined formats",
            "Uniqueness: No duplicate records exist"
        ]
        
        quality_tools = [
            "Great Expectations for data validation",
            "Apache Atlas for data governance",
            "Talend Data Quality for profiling",
            "Pandas Profiling for exploratory analysis",
            "Monte Carlo for data observability"
        ]
        
        return {
            "answer": f"Data Quality Management:\n\n" +
                     "Quality Dimensions:\n" + "\n".join([f"• {d}" for d in quality_dimensions]) +
                     f"\n\nQuality Tools:\n" + "\n".join([f"• {t}" for t in quality_tools]) +
                     f"\n\nFor your data quality concern: {query}\n" +
                     "Implement continuous monitoring and automated quality checks.",
            "confidence": 0.84,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied data quality management principles"
        }
    
    async def _handle_database_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle database related queries"""
        optimization_techniques = [
            "Index optimization for query performance",
            "Query plan analysis and tuning",
            "Partitioning for large tables",
            "Connection pooling and caching",
            "Database normalization vs denormalization",
            "Statistics updates and maintenance"
        ]
        
        return {
            "answer": f"Database Optimization:\n\n" +
                     "Optimization Techniques:\n" + "\n".join([f"• {t}" for t in optimization_techniques]) +
                     f"\n\nFor your database query: {query}\n" +
                     "Analyze execution plans and identify bottlenecks first.",
            "confidence": 0.82,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied database optimization techniques"
        }
    
    async def _handle_streaming_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle streaming data queries"""
        streaming_concepts = [
            "Event-driven architecture design",
            "Stream processing vs batch processing",
            "Windowing strategies for aggregations",
            "Handling late-arriving data",
            "Backpressure and flow control",
            "Exactly-once processing guarantees"
        ]
        
        streaming_stack = [
            "Apache Kafka for message streaming",
            "Apache Flink for stream processing",
            "Kafka Streams for lightweight processing",
            "Apache Pulsar as Kafka alternative",
            "Redis Streams for simple use cases"
        ]
        
        return {
            "answer": f"Streaming Data Engineering:\n\n" +
                     "Key Concepts:\n" + "\n".join([f"• {c}" for c in streaming_concepts]) +
                     f"\n\nStreaming Technologies:\n" + "\n".join([f"• {s}" for s in streaming_stack]) +
                     f"\n\nFor your streaming requirement: {query}\n" +
                     "Consider latency requirements and consistency guarantees.",
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied streaming data engineering principles"
        }
    
    async def _handle_analytics_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle analytics and visualization queries"""
        analytics_approaches = [
            "Dimensional modeling for analytics",
            "OLAP cube design and optimization",
            "Real-time vs batch analytics trade-offs",
            "Self-service analytics enablement",
            "Data mart vs data warehouse strategies",
            "Metric standardization and governance"
        ]
        
        viz_tools = [
            "Tableau for business intelligence",
            "Grafana for operational dashboards",
            "Apache Superset for open-source BI",
            "Jupyter notebooks for ad-hoc analysis",
            "Streamlit for data apps"
        ]
        
        return {
            "answer": f"Analytics Engineering:\n\n" +
                     "Analytics Approaches:\n" + "\n".join([f"• {a}" for a in analytics_approaches]) +
                     f"\n\nVisualization Tools:\n" + "\n".join([f"• {v}" for v in viz_tools]) +
                     f"\n\nFor your analytics need: {query}\n" +
                     "Focus on user experience and performance optimization.",
            "confidence": 0.83,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied analytics engineering best practices"
        }
    
    async def _handle_general_data_engineering(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle general data engineering queries"""
        return {
            "answer": f"Data Engineering Capabilities:\n\n" +
                     "I can help with:\n" +
                     "• Data pipeline design and optimization\n" +
                     "• Data quality management and monitoring\n" +
                     "• Database performance tuning\n" +
                     "• Streaming data architecture\n" +
                     "• Analytics and visualization strategies\n" +
                     "• Cloud data platform recommendations\n" +
                     "• ETL/ELT process optimization\n\n" +
                     f"For your question: {query}\n" +
                     "Please provide more specific details about your data engineering challenge.",
            "confidence": 0.6,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided general data engineering assistance"
        }
    
    async def _analyze_pipeline(self, pipeline_config: dict, performance_metrics: dict = None) -> Dict[str, Any]:
        """Analyze data pipeline configuration"""
        analysis = {
            "pipeline_name": pipeline_config.get("name", "Unknown"),
            "architecture_score": 0.8,
            "bottlenecks": [],
            "recommendations": [],
            "estimated_improvement": "15-25%"
        }
        
        # Simulate pipeline analysis
        if "batch_size" in pipeline_config:
            if pipeline_config["batch_size"] > 10000:
                analysis["bottlenecks"].append("Large batch size may cause memory issues")
                analysis["recommendations"].append("Consider reducing batch size or implementing micro-batching")
        
        if performance_metrics:
            if performance_metrics.get("avg_processing_time", 0) > 300:
                analysis["bottlenecks"].append("High processing time detected")
                analysis["recommendations"].append("Implement parallel processing or optimize transformations")
        
        return analysis
    
    async def _check_data_quality(self, dataset_info: dict, quality_rules: list = None) -> Dict[str, Any]:
        """Check data quality metrics"""
        quality_report = {
            "dataset": dataset_info.get("name", "Unknown"),
            "overall_score": 0.75,
            "quality_metrics": {
                "completeness": 0.85,
                "accuracy": 0.70,
                "consistency": 0.80,
                "timeliness": 0.65
            },
            "issues_found": [],
            "recommendations": []
        }
        
        # Simulate quality checks
        if dataset_info.get("null_percentage", 0) > 0.1:
            quality_report["issues_found"].append("High percentage of null values")
            quality_report["recommendations"].append("Implement data imputation or collection improvements")
        
        return quality_report
    
    async def _optimize_query(self, query: str, database_type: str, schema_info: dict = None) -> Dict[str, Any]:
        """Optimize database query"""
        optimization = {
            "original_query": query,
            "database_type": database_type,
            "optimized_query": query,  # Would be optimized version
            "improvements": [],
            "estimated_performance_gain": "20-40%"
        }
        
        # Simulate query optimization
        if "SELECT *" in query.upper():
            optimization["improvements"].append("Replace SELECT * with specific column names")
        
        if "WHERE" not in query.upper() and "SELECT" in query.upper():
            optimization["improvements"].append("Consider adding WHERE clause to filter data")
        
        if "ORDER BY" in query.upper() and "LIMIT" not in query.upper():
            optimization["improvements"].append("Add LIMIT clause when using ORDER BY")
        
        return optimization
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate data engineering specific suggestions"""
        suggestions = []
        
        if "pipeline" in query.lower():
            suggestions.append("Would you like me to review your pipeline architecture?")
            suggestions.append("I can help you implement data quality checks.")
        
        if "performance" in query.lower() or "slow" in query.lower():
            suggestions.append("Consider analyzing your query execution plans.")
            suggestions.append("I can suggest indexing strategies for better performance.")
        
        if "data" in query.lower() and "quality" in query.lower():
            suggestions.append("Implement automated data quality monitoring.")
            suggestions.append("Consider using Great Expectations for data validation.")
        
        return suggestions[:3]
    
    async def update_knowledge(self):
        """Update data engineering knowledge base"""
        self.logger.info("Data engineer knowledge base updated")
        return True
