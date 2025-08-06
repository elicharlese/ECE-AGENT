#!/usr/bin/env python3
"""
Legal MCP Client for AGENT
Provides legal research, compliance checking, and regulatory guidance
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from .base_mcp_client import BaseMCPClient

class LegalMCPClient(BaseMCPClient):
    """MCP client for legal and compliance tools"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("legal", config)
        
        # Legal-specific configuration
        self.supported_jurisdictions = config.get("jurisdictions", [
            "US", "EU", "UK", "CA", "AU", "SG", "HK", "JP"
        ])
        self.compliance_areas = config.get("compliance_areas", [
            "securities", "privacy", "aml", "kyc", "tax", "employment", "contracts"
        ])
        self.legal_databases = config.get("databases", [
            "westlaw", "lexis", "bloomberg_law", "practical_law"
        ])
        self.risk_assessment = config.get("risk_assessment", True)
        
        # Tool categories
        self.available_tools = {
            "legal_research": [],
            "compliance_check": [],
            "contract_analysis": [],
            "risk_assessment": [],
            "regulatory_updates": [],
            "document_review": [],
            "litigation_support": []
        }
        
        # Compliance cache
        self.compliance_cache = {}
        
    async def register_tools(self):
        """Register legal-specific tools"""
        try:
            # Get available tools from the server
            tools = await self.get_tools()
            
            # Categorize tools
            for tool in tools:
                tool_name = tool.get("name", "").lower()
                
                if any(term in tool_name for term in ["research", "search", "lookup", "find"]):
                    self.available_tools["legal_research"].append(tool)
                elif any(term in tool_name for term in ["compliance", "regulation", "rule"]):
                    self.available_tools["compliance_check"].append(tool)
                elif any(term in tool_name for term in ["contract", "agreement", "clause"]):
                    self.available_tools["contract_analysis"].append(tool)
                elif any(term in tool_name for term in ["risk", "assessment", "evaluation"]):
                    self.available_tools["risk_assessment"].append(tool)
                elif any(term in tool_name for term in ["update", "alert", "notification"]):
                    self.available_tools["regulatory_updates"].append(tool)
                elif any(term in tool_name for term in ["document", "review", "analysis"]):
                    self.available_tools["document_review"].append(tool)
                elif any(term in tool_name for term in ["litigation", "discovery", "evidence"]):
                    self.available_tools["litigation_support"].append(tool)
            
            self.logger.info(f"Registered {len(tools)} legal tools")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to register legal tools: {e}")
            return False
    
    async def legal_research(self, query: str, jurisdiction: str = "US", 
                           databases: List[str] = None, max_results: int = 10) -> Dict:
        """Perform legal research"""
        try:
            if databases is None:
                databases = self.legal_databases[:2]  # Use top 2 databases
            
            result = await self.call_tool("legal_researcher", {
                "query": query,
                "jurisdiction": jurisdiction,
                "databases": databases,
                "max_results": max_results,
                "include_citations": True,
                "include_summaries": True,
                "relevance_threshold": 0.7
            })
            
            return {
                "success": True,
                "research_results": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Legal research failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def compliance_check(self, activity: str, jurisdiction: str, 
                             compliance_area: str = "securities") -> Dict:
        """Check compliance requirements for an activity"""
        try:
            cache_key = f"{activity}_{jurisdiction}_{compliance_area}"
            
            # Check cache first (compliance rules don't change frequently)
            if cache_key in self.compliance_cache:
                cached_result = self.compliance_cache[cache_key]
                cached_result["from_cache"] = True
                return cached_result
            
            result = await self.call_tool("compliance_checker", {
                "activity": activity,
                "jurisdiction": jurisdiction,
                "compliance_area": compliance_area,
                "include_requirements": True,
                "include_penalties": True,
                "check_exemptions": True
            })
            
            response = {
                "success": True,
                "compliance_info": result,
                "from_cache": False,
                "timestamp": datetime.now().isoformat()
            }
            
            # Cache the result
            self.compliance_cache[cache_key] = response
            
            return response
            
        except Exception as e:
            self.logger.error(f"Compliance check failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_contract(self, contract_text: str, contract_type: str = "general") -> Dict:
        """Analyze a contract for legal issues"""
        try:
            result = await self.call_tool("contract_analyzer", {
                "contract_text": contract_text,
                "contract_type": contract_type,
                "check_clauses": True,
                "identify_risks": True,
                "suggest_improvements": True,
                "jurisdiction": "US"  # Default to US
            })
            
            return {
                "success": True,
                "contract_analysis": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Contract analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def assess_legal_risk(self, scenario: str, business_type: str, 
                              jurisdiction: str = "US") -> Dict:
        """Assess legal risk for a business scenario"""
        try:
            result = await self.call_tool("risk_assessor", {
                "scenario": scenario,
                "business_type": business_type,
                "jurisdiction": jurisdiction,
                "risk_categories": [
                    "regulatory", "contractual", "liability", "intellectual_property"
                ],
                "include_mitigation": True,
                "risk_level_scale": "1-10"
            })
            
            return {
                "success": True,
                "risk_assessment": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Legal risk assessment failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_regulatory_updates(self, area: str, jurisdiction: str = "US", 
                                   days_back: int = 30) -> Dict:
        """Get recent regulatory updates"""
        try:
            result = await self.call_tool("regulatory_monitor", {
                "compliance_area": area,
                "jurisdiction": jurisdiction,
                "date_range": days_back,
                "include_impact_analysis": True,
                "priority_filter": "medium",
                "format": "summary"
            })
            
            return {
                "success": True,
                "regulatory_updates": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get regulatory updates: {e}")
            return {"success": False, "error": str(e)}
    
    async def review_document(self, document: str, review_type: str = "comprehensive") -> Dict:
        """Review a legal document"""
        try:
            result = await self.call_tool("document_reviewer", {
                "document": document,
                "review_type": review_type,
                "check_items": [
                    "legal_accuracy", "completeness", "clarity", "risk_factors"
                ],
                "suggest_edits": True,
                "flag_issues": True
            })
            
            return {
                "success": True,
                "document_review": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Document review failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def litigation_support(self, case_type: str, documents: List[str], 
                               discovery_request: str = None) -> Dict:
        """Provide litigation support services"""
        try:
            result = await self.call_tool("litigation_assistant", {
                "case_type": case_type,
                "documents": documents,
                "discovery_request": discovery_request,
                "analyze_relevance": True,
                "extract_key_facts": True,
                "identify_evidence": True
            })
            
            return {
                "success": True,
                "litigation_analysis": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Litigation support failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def check_intellectual_property(self, content: str, ip_type: str = "trademark") -> Dict:
        """Check intellectual property issues"""
        try:
            result = await self.call_tool("ip_checker", {
                "content": content,
                "ip_type": ip_type,
                "check_existing": True,
                "check_infringement": True,
                "suggest_alternatives": True,
                "jurisdiction": "US"
            })
            
            return {
                "success": True,
                "ip_analysis": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"IP check failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_legal_template(self, template_type: str, parameters: Dict) -> Dict:
        """Generate a legal document template"""
        try:
            result = await self.call_tool("template_generator", {
                "template_type": template_type,
                "parameters": parameters,
                "jurisdiction": parameters.get("jurisdiction", "US"),
                "include_instructions": True,
                "format": "docx"
            })
            
            return {
                "success": True,
                "template": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Template generation failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_training_data(self) -> Dict:
        """Get training data for AGENT learning"""
        try:
            training_data = {
                "domain": "legal",
                "tools_used": [],
                "legal_precedents": [],
                "compliance_patterns": [],
                "risk_factors": [],
                "best_practices": []
            }
            
            # Collect data from recent operations
            for category, tools in self.available_tools.items():
                training_data["tools_used"].extend([
                    {
                        "category": category,
                        "tool_name": tool.get("name"),
                        "description": tool.get("description"),
                        "usage_count": 0  # Would track actual usage
                    }
                    for tool in tools
                ])
            
            # Add legal best practices
            training_data["best_practices"].extend([
                {
                    "area": "contract_review",
                    "practice": "Always check for liability limitations and indemnification clauses"
                },
                {
                    "area": "compliance",
                    "practice": "Regular monitoring of regulatory changes is essential"
                },
                {
                    "area": "risk_assessment", 
                    "practice": "Consider both legal and business risks in any analysis"
                },
                {
                    "area": "documentation",
                    "practice": "Maintain comprehensive records for audit trails"
                }
            ])
            
            # Add compliance patterns for different jurisdictions
            for jurisdiction in self.supported_jurisdictions:
                training_data["compliance_patterns"].append({
                    "jurisdiction": jurisdiction,
                    "key_areas": ["securities", "privacy", "aml"],
                    "regulatory_bodies": self._get_regulatory_bodies(jurisdiction)
                })
            
            return {
                "success": True,
                "data": training_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get training data: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_regulatory_bodies(self, jurisdiction: str) -> List[str]:
        """Get relevant regulatory bodies for a jurisdiction"""
        bodies_map = {
            "US": ["SEC", "CFTC", "FinCEN", "FDIC", "FTC"],
            "EU": ["ESMA", "EBA", "EIOPA", "ECB"],
            "UK": ["FCA", "PRA", "ICO"],
            "CA": ["CSA", "OSFI", "FINTRAC"],
            "AU": ["ASIC", "APRA", "ACCC"],
            "SG": ["MAS"],
            "HK": ["HKMA", "SFC"],
            "JP": ["FSA", "JFSA"]
        }
        return bodies_map.get(jurisdiction, [])
    
    def get_capabilities(self) -> Dict:
        """Get legal client capabilities"""
        return {
            "client_type": "legal",
            "supported_jurisdictions": self.supported_jurisdictions,
            "compliance_areas": self.compliance_areas,
            "legal_databases": self.legal_databases,
            "capabilities": [
                "Legal research and analysis",
                "Compliance checking",
                "Contract analysis",
                "Legal risk assessment",
                "Regulatory monitoring",
                "Document review",
                "Litigation support",
                "IP analysis",
                "Template generation"
            ],
            "tool_categories": list(self.available_tools.keys()),
            "features": {
                "multi_jurisdiction": True,
                "real_time_updates": True,
                "risk_assessment": self.risk_assessment,
                "compliance_monitoring": True,
                "document_ai": True
            }
        }
    
    async def health_check(self) -> bool:
        """Perform legal client health check"""
        try:
            # Basic connection check
            if not await super().health_check():
                return False
            
            # Test a simple legal research query
            test_result = await self.legal_research("test query", "US", max_results=1)
            
            return test_result.get("success", False)
            
        except Exception as e:
            self.logger.error(f"Legal client health check failed: {e}")
            return False
