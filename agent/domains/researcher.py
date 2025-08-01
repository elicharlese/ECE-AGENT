import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from ..enhanced_agent import EnhancedAgentBase

class ResearcherAgent(EnhancedAgentBase):
    """AI Agent specialized in research and intelligence analysis"""
    
    def __init__(self):
        super().__init__("researcher")
        self.knowledge_base = {
            "research_methods": ["osint", "data_analysis", "pattern_recognition", "threat_intelligence"],
            "tools": ["maltego", "shodan", "virustotal", "whois", "nslookup", "google_dorking"],
            "data_sources": ["misp", "otx", "abuse_ch", "urlhaus", "malware_bazaar"],
            "analysis_types": ["behavioral", "static", "dynamic", "network", "forensic"]
        }
        
    def setup_domain_tools(self):
        """Setup researcher-specific tools"""
        # OSINT tool
        self.tool_registry.register_tool(
            name="osint_lookup",
            description="Perform open source intelligence lookup",
            function=self._osint_lookup,
            parameters={"target": "str", "lookup_type": "str"},
            required_params=["target"]
        )
        
        # Threat intelligence tool
        self.tool_registry.register_tool(
            name="threat_intel",
            description="Analyze indicators of compromise and threat intelligence",
            function=self._threat_intel_analysis,
            parameters={"ioc": "str", "ioc_type": "str"},
            required_params=["ioc"]
        )
        
        # Data correlation tool
        self.tool_registry.register_tool(
            name="correlate_data",
            description="Correlate and analyze research data",
            function=self._correlate_data,
            parameters={"data_points": "list", "correlation_type": "str"},
            required_params=["data_points"]
        )
    
    def setup_domain_knowledge(self):
        """Setup researcher-specific knowledge"""
        pass
    
    async def process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process research queries with enhanced capabilities"""
        context = {
            "web_context": web_context or [],
            "domain": self.domain,
            "query": query
        }
        
        # Use enhanced processing
        enhanced_result = await self.process_enhanced(query, context)
        
        # Add researcher-specific enhancements
        if enhanced_result.get("confidence", 0) < 0.7:
            fallback_result = await self._legacy_process(query, web_context)
            enhanced_result["answer"] = fallback_result.get("answer", enhanced_result["answer"])
            enhanced_result["confidence"] = max(enhanced_result.get("confidence", 0), fallback_result.get("confidence", 0))
        
        return enhanced_result
    
    async def _legacy_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process research-related queries"""
        try:
            query_lower = query.lower()
            
            # Analyze query type
            query_type = self._analyze_query_type(query_lower)
            
            if query_type == "osint":
                response = await self._handle_osint_query(query, web_context)
            elif query_type == "threat_intel":
                response = await self._handle_threat_intel_query(query, web_context)
            elif query_type == "data_analysis":
                response = await self._handle_data_analysis_query(query, web_context)
            elif query_type == "investigation":
                response = await self._handle_investigation_query(query, web_context)
            else:
                response = await self._handle_general_research(query, web_context)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in researcher agent: {e}")
            return {
                "answer": "I encountered an error processing your research query. Please provide more details.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_query_type(self, query: str) -> str:
        """Analyze the type of research query"""
        if any(word in query for word in ["osint", "open source", "intelligence", "lookup", "whois"]):
            return "osint"
        elif any(word in query for word in ["threat", "malware", "ioc", "indicator", "apt"]):
            return "threat_intel"
        elif any(word in query for word in ["analyze", "data", "pattern", "correlation", "statistics"]):
            return "data_analysis"
        elif any(word in query for word in ["investigate", "research", "find", "discover", "trace"]):
            return "investigation"
        else:
            return "general"
    
    async def _handle_osint_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle OSINT-related queries"""
        techniques = [
            "Domain/IP reconnaissance using WHOIS and DNS queries",
            "Social media intelligence gathering",
            "Email and phone number validation",
            "Company and person profiling",
            "Digital footprint analysis",
            "Google dorking and search engine optimization"
        ]
        
        tools_recommendation = [
            "Maltego for link analysis and data visualization",
            "Shodan for internet-connected device discovery",
            "theHarvester for email and subdomain enumeration",
            "Recon-ng for comprehensive reconnaissance",
            "SpiderFoot for automated OSINT collection"
        ]
        
        return {
            "answer": f"OSINT Research Approach:\n\n" +
                     "Key Techniques:\n" + "\n".join([f"• {t}" for t in techniques]) +
                     f"\n\nRecommended Tools:\n" + "\n".join([f"• {t}" for t in tools_recommendation]) +
                     f"\n\nFor your specific query: {query}\n" +
                     "I recommend starting with passive reconnaissance and gradually moving to more active techniques.",
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied OSINT methodology and tool recommendations"
        }
    
    async def _handle_threat_intel_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle threat intelligence queries"""
        analysis_steps = [
            "1. Collect and validate indicators of compromise (IOCs)",
            "2. Check threat intelligence feeds and databases",
            "3. Analyze malware samples and behavior patterns",
            "4. Correlate with known threat actor TTPs",
            "5. Assess impact and create threat assessments"
        ]
        
        intel_sources = [
            "MISP (Malware Information Sharing Platform)",
            "AlienVault OTX (Open Threat Exchange)",
            "VirusTotal for file and URL analysis",
            "Hybrid Analysis for dynamic malware analysis",
            "URLhaus and Malware Bazaar for fresh samples"
        ]
        
        return {
            "answer": f"Threat Intelligence Analysis:\n\n" +
                     "Analysis Process:\n" + "\n".join(analysis_steps) +
                     f"\n\nKey Intelligence Sources:\n" + "\n".join([f"• {s}" for s in intel_sources]) +
                     f"\n\nFor threat analysis of: {query}\n" +
                     "Focus on IOC validation and attribution to known threat groups.",
            "confidence": 0.82,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied threat intelligence analysis methodology"
        }
    
    async def _handle_data_analysis_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle data analysis queries"""
        analysis_techniques = [
            "Statistical analysis and correlation",
            "Pattern recognition and anomaly detection",
            "Time series analysis for trend identification",
            "Network analysis and relationship mapping",
            "Machine learning for predictive analytics"
        ]
        
        return {
            "answer": f"Data Analysis Approach:\n\n" +
                     "Techniques:\n" + "\n".join([f"• {t}" for t in analysis_techniques]) +
                     f"\n\nFor your analysis request: {query}\n" +
                     "Consider data quality, sample size, and statistical significance in your analysis.",
            "confidence": 0.78,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied data analysis methodology"
        }
    
    async def _handle_investigation_query(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle investigation queries"""
        investigation_phases = [
            "1. Define scope and objectives",
            "2. Collect and preserve evidence",
            "3. Analyze data and identify patterns",
            "4. Develop hypotheses and test them",
            "5. Document findings and create reports"
        ]
        
        return {
            "answer": f"Investigation Methodology:\n\n" +
                     "Investigation Phases:\n" + "\n".join(investigation_phases) +
                     f"\n\nFor investigating: {query}\n" +
                     "Maintain evidence integrity and follow proper chain of custody procedures.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied digital investigation methodology"
        }
    
    async def _handle_general_research(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle general research queries"""
        return {
            "answer": f"Research Capabilities:\n\n" +
                     "I can assist with:\n" +
                     "• Open Source Intelligence (OSINT) gathering\n" +
                     "• Threat intelligence analysis\n" +
                     "• Data analysis and pattern recognition\n" +
                     "• Digital investigations\n" +
                     "• Indicator of Compromise (IOC) analysis\n" +
                     "• Research methodology and planning\n\n" +
                     f"For your query: {query}\n" +
                     "Please provide more specific details about what you'd like to research.",
            "confidence": 0.6,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided general research assistance overview"
        }
    
    async def _osint_lookup(self, target: str, lookup_type: str = "general") -> Dict[str, Any]:
        """Perform OSINT lookup on target"""
        results = {
            "target": target,
            "lookup_type": lookup_type,
            "findings": []
        }
        
        if lookup_type == "domain":
            results["findings"] = [
                f"Domain registration information for {target}",
                f"DNS records and subdomains",
                f"SSL/TLS certificate details",
                f"Historical data and changes"
            ]
        elif lookup_type == "ip":
            results["findings"] = [
                f"Geolocation and ISP information",
                f"Open ports and services",
                f"Reputation and threat intelligence",
                f"Network range and ownership"
            ]
        else:
            results["findings"] = [
                f"General intelligence gathered on {target}",
                f"Associated entities and relationships",
                f"Public exposure and digital footprint"
            ]
        
        return results
    
    async def _threat_intel_analysis(self, ioc: str, ioc_type: str = "hash") -> Dict[str, Any]:
        """Analyze indicators of compromise"""
        analysis = {
            "ioc": ioc,
            "type": ioc_type,
            "reputation": "unknown",
            "threat_level": "medium",
            "associated_malware": [],
            "recommendations": []
        }
        
        # Simulate threat intel analysis
        if ioc_type == "hash":
            analysis["recommendations"] = [
                "Submit to sandbox for dynamic analysis",
                "Check VirusTotal for detection rates",
                "Search threat intelligence feeds"
            ]
        elif ioc_type == "ip":
            analysis["recommendations"] = [
                "Check IP reputation databases",
                "Analyze network traffic patterns",
                "Block if confirmed malicious"
            ]
        elif ioc_type == "domain":
            analysis["recommendations"] = [
                "Check domain reputation",
                "Analyze DNS records",
                "Monitor for suspicious activity"
            ]
        
        return analysis
    
    async def _correlate_data(self, data_points: List[str], correlation_type: str = "temporal") -> Dict[str, Any]:
        """Correlate research data points"""
        correlation = {
            "data_points": data_points,
            "correlation_type": correlation_type,
            "correlations_found": [],
            "confidence_score": 0.75,
            "patterns": []
        }
        
        # Simulate data correlation
        if len(data_points) >= 2:
            correlation["correlations_found"] = [
                f"Temporal correlation between {data_points[0]} and {data_points[1]}",
                f"Pattern identified in data sequence"
            ]
            correlation["patterns"] = [
                "Recurring time intervals",
                "Geographic clustering",
                "Infrastructure reuse"
            ]
        
        return correlation
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate researcher-specific proactive suggestions"""
        suggestions = []
        
        if "osint" in query.lower():
            suggestions.append("Would you like me to suggest specific OSINT tools for this target?")
            suggestions.append("I can help you create a comprehensive reconnaissance plan.")
        
        if "malware" in query.lower() or "threat" in query.lower():
            suggestions.append("Consider analyzing this through multiple threat intelligence sources.")
            suggestions.append("Would you like me to suggest IoC extraction techniques?")
        
        if "investigate" in query.lower():
            suggestions.append("I can help you develop an investigation timeline.")
            suggestions.append("Consider digital forensics techniques for evidence collection.")
        
        return suggestions[:3]
    
    async def update_knowledge(self):
        """Update research knowledge base"""
        self.logger.info("Researcher knowledge base updated")
        return True
