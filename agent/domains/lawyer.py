import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from ..base_classes import EnhancedAgentBase, Tool

class LawyerAgent(EnhancedAgentBase):
    """AI Agent specialized in legal analysis and guidance"""
    
    def __init__(self):
        super().__init__("lawyer")
        self.knowledge_base = {
            "practice_areas": ["contract law", "corporate law", "intellectual property", "employment law", 
                             "real estate", "family law", "criminal law", "tax law", "immigration"],
            "document_types": ["contracts", "agreements", "terms of service", "privacy policies", 
                             "employment contracts", "leases", "wills", "patents", "trademarks"],
            "jurisdictions": ["federal", "state", "international", "common law", "civil law"],
            "legal_concepts": ["liability", "negligence", "breach of contract", "due diligence", 
                             "compliance", "intellectual property rights", "fiduciary duty"]
        }
        
    def setup_domain_tools(self):
        """Setup lawyer-specific tools"""
        # Contract analyzer
        self.tool_registry.register_tool(
            name="contract_analyzer",
            description="Analyze contracts for risks and compliance",
            function=self._analyze_contract,
            parameters={"contract_text": "str", "contract_type": "str"},
            required_params=["contract_text"]
        )
        
        # Legal research tool
        self.tool_registry.register_tool(
            name="legal_researcher",
            description="Research legal precedents and statutes",
            function=self._legal_research,
            parameters={"topic": "str", "jurisdiction": "str"},
            required_params=["topic"]
        )
        
        # Smart contract generator
        self.tool_registry.register_tool(
            name="smart_contract_generator",
            description="Generate blockchain smart contracts",
            function=self._generate_smart_contract,
            parameters={"contract_type": "str", "parameters": "dict"},
            required_params=["contract_type"]
        )
    
    def setup_domain_knowledge(self):
        """Setup lawyer-specific knowledge"""
        # Load legal databases, case law, etc.
        pass
    
    async def process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process with enhanced agentic capabilities"""
        context = {
            "web_context": web_context or [],
            "domain": self.domain,
            "query": query
        }
        
        # Use enhanced processing
        enhanced_result = await self.process_enhanced(query, context)
        
        # Add lawyer-specific enhancements
        if enhanced_result.get("confidence", 0) < 0.7:
            fallback_result = await self._legacy_process(query, web_context)
            enhanced_result["answer"] = fallback_result.get("answer", enhanced_result["answer"])
            enhanced_result["confidence"] = max(enhanced_result.get("confidence", 0), fallback_result.get("confidence", 0))
        
        return enhanced_result
    
    async def _legacy_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process legal-related queries"""
        try:
            query_lower = query.lower()
            
            # Analyze query type
            query_type = self._analyze_query_type(query_lower)
            
            # Generate response based on query type
            if query_type == "contract_review":
                response = await self._handle_contract_review(query, web_context)
            elif query_type == "legal_research":
                response = await self._handle_legal_research(query, web_context)
            elif query_type == "compliance":
                response = await self._handle_compliance(query, web_context)
            elif query_type == "intellectual_property":
                response = await self._handle_ip(query, web_context)
            elif query_type == "business_law":
                response = await self._handle_business_law(query, web_context)
            else:
                response = await self._handle_general_legal(query, web_context)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in lawyer agent: {e}")
            return {
                "answer": "I encountered an error processing your legal query. Please provide more details.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_query_type(self, query: str) -> str:
        """Analyze the type of legal query"""
        if any(word in query for word in ["contract", "agreement", "terms", "clause"]):
            return "contract_review"
        elif any(word in query for word in ["research", "case law", "statute", "regulation", "precedent"]):
            return "legal_research"
        elif any(word in query for word in ["compliance", "regulation", "policy", "gdpr", "hipaa"]):
            return "compliance"
        elif any(word in query for word in ["patent", "trademark", "copyright", "intellectual property", "ip"]):
            return "intellectual_property"
        elif any(word in query for word in ["business", "corporate", "llc", "incorporation", "partnership"]):
            return "business_law"
        else:
            return "general"
    
    async def _handle_contract_review(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle contract review and analysis"""
        review_checklist = [
            "Identify all parties and their obligations",
            "Review payment terms and schedules",
            "Check termination and cancellation clauses",
            "Examine liability and indemnification provisions",
            "Verify dispute resolution mechanisms",
            "Assess intellectual property rights",
            "Review confidentiality and non-disclosure terms",
            "Check compliance with applicable laws"
        ]
        
        red_flags = [
            "Unlimited liability exposure",
            "Automatic renewal without notice",
            "Broad indemnification clauses",
            "Unclear termination rights",
            "Excessive penalties or damages",
            "Ambiguous scope of work"
        ]
        
        web_insights = ""
        if web_context:
            web_insights = f"\n\nCurrent Legal Developments:\n{web_context[0].get('content', '')[:200]}..."
        
        return {
            "answer": f"Contract Review Framework:\n\n" +
                     "Key Areas to Review:\n" +
                     "\n".join([f"• {item}" for item in review_checklist]) +
                     "\n\nCommon Red Flags:\n" +
                     "\n".join([f"• {flag}" for flag in red_flags]) +
                     web_insights +
                     "\n\n⚖️ Disclaimer: This is general information, not legal advice. Consult a qualified attorney.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied standard contract review methodology"
        }
    
    async def _handle_legal_research(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle legal research requests"""
        research_steps = [
            "1. Identify the specific legal issue or question",
            "2. Determine applicable jurisdiction and laws",
            "3. Search for relevant statutes and regulations",
            "4. Review case law and precedents",
            "5. Analyze secondary sources and commentary",
            "6. Synthesize findings and identify key principles",
            "7. Consider recent developments and trends"
        ]
        
        research_sources = [
            "Federal and state statutes",
            "Court decisions and case law",
            "Administrative regulations",
            "Legal encyclopedias and treatises",
            "Law review articles",
            "Bar association publications"
        ]
        
        return {
            "answer": f"Legal Research Methodology:\n\n" +
                     "Research Process:\n" +
                     "\n".join(research_steps) +
                     "\n\nKey Sources to Consult:\n" +
                     "\n".join([f"• {source}" for source in research_sources]) +
                     f"\n\nFor your specific query: {query}\n" +
                     "Focus on the most recent and authoritative sources in your jurisdiction.\n\n" +
                     "⚖️ Always verify information with current legal databases.",
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied systematic legal research methodology"
        }
    
    async def _handle_compliance(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle compliance and regulatory queries"""
        compliance_frameworks = {
            "gdpr": "General Data Protection Regulation - EU privacy law",
            "hipaa": "Health Insurance Portability and Accountability Act - US healthcare privacy",
            "sox": "Sarbanes-Oxley Act - US corporate financial reporting",
            "pci": "Payment Card Industry Data Security Standard",
            "iso27001": "International information security management standard"
        }
        
        compliance_steps = [
            "Identify applicable regulations and standards",
            "Conduct gap analysis of current practices",
            "Develop compliance policies and procedures",
            "Implement necessary controls and safeguards",
            "Train staff on compliance requirements",
            "Monitor and audit compliance regularly",
            "Maintain documentation and records"
        ]
        
        relevant_frameworks = [fw for fw in compliance_frameworks.keys() if fw in query.lower()]
        
        response = "Compliance Management Approach:\n\n"
        if relevant_frameworks:
            for framework in relevant_frameworks:
                response += f"• {framework.upper()}: {compliance_frameworks[framework]}\n"
            response += "\n"
        
        response += "General Compliance Steps:\n"
        response += "\n".join([f"{i+1}. {step}" for i, step in enumerate(compliance_steps)])
        response += "\n\n⚖️ Compliance requirements vary by jurisdiction and industry."
        
        return {
            "answer": response,
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied comprehensive compliance management framework"
        }
    
    async def _handle_ip(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle intellectual property queries"""
        ip_types = {
            "patent": "Protects inventions and processes (20 years)",
            "trademark": "Protects brand names and logos (renewable)",
            "copyright": "Protects creative works (life + 70 years)",
            "trade secret": "Protects confidential business information"
        }
        
        ip_considerations = [
            "Conduct thorough prior art searches",
            "Ensure proper documentation and records",
            "File applications in appropriate jurisdictions",
            "Maintain confidentiality during development",
            "Consider international protection strategies",
            "Monitor for potential infringement",
            "Develop IP licensing strategies"
        ]
        
        return {
            "answer": f"Intellectual Property Overview:\n\n" +
                     "Types of IP Protection:\n" +
                     "\n".join([f"• {name.title()}: {desc}" for name, desc in ip_types.items()]) +
                     "\n\nKey Considerations:\n" +
                     "\n".join([f"• {consideration}" for consideration in ip_considerations]) +
                     "\n\n⚖️ IP law is complex and jurisdiction-specific. Consult an IP attorney.",
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided comprehensive IP protection guidance"
        }
    
    async def _handle_business_law(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle business law queries"""
        business_structures = {
            "llc": "Limited Liability Company - flexible structure with liability protection",
            "corporation": "Separate legal entity with shareholders and formal structure",
            "partnership": "Shared ownership and responsibility between partners",
            "sole proprietorship": "Single owner with unlimited personal liability"
        }
        
        business_considerations = [
            "Choose appropriate business structure",
            "Obtain necessary licenses and permits",
            "Draft comprehensive operating agreements",
            "Establish proper corporate governance",
            "Maintain adequate insurance coverage",
            "Comply with employment laws",
            "Protect intellectual property assets",
            "Plan for tax optimization"
        ]
        
        return {
            "answer": f"Business Law Guidance:\n\n" +
                     "Common Business Structures:\n" +
                     "\n".join([f"• {name.upper()}: {desc}" for name, desc in business_structures.items()]) +
                     "\n\nKey Business Considerations:\n" +
                     "\n".join([f"• {consideration}" for consideration in business_considerations]) +
                     "\n\n⚖️ Business law varies by state and industry. Consult a business attorney.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied business law fundamentals and best practices"
        }
    
    async def _handle_general_legal(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle general legal queries"""
        return {
            "answer": f"As a legal AI, I can help with:\n\n" +
                     "• Contract review and analysis\n" +
                     "• Legal research and case law\n" +
                     "• Compliance and regulatory guidance\n" +
                     "• Intellectual property protection\n" +
                     "• Business law and corporate structure\n" +
                     "• Legal document drafting assistance\n" +
                     "• Risk assessment and mitigation\n\n" +
                     f"For your query: {query}\n" +
                     "Please provide more specific details for targeted legal guidance.\n\n" +
                     "⚖️ IMPORTANT: This is general information only, not legal advice. " +
                     "Always consult with a qualified attorney for specific legal matters.",
            "confidence": 0.6,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided general legal assistance overview with appropriate disclaimers"
        }
    
    async def _analyze_contract(self, contract_text: str, contract_type: str = "general") -> Dict[str, Any]:
        """Analyze contract for risks and compliance issues"""
        risks = []
        recommendations = []
        
        # Basic contract analysis
        if "unlimited liability" in contract_text.lower():
            risks.append("Unlimited liability exposure detected")
        
        if "automatic renewal" in contract_text.lower() and "notice" not in contract_text.lower():
            risks.append("Automatic renewal without proper notice period")
        
        if "indemnification" in contract_text.lower():
            risks.append("Broad indemnification clause - review scope")
        
        if "termination" not in contract_text.lower():
            risks.append("No clear termination clause identified")
        
        # Contract-specific analysis
        if contract_type.lower() == "employment":
            if "non-compete" in contract_text.lower():
                recommendations.append("Review non-compete clause for enforceability")
            if "confidentiality" not in contract_text.lower():
                recommendations.append("Consider adding confidentiality provisions")
        
        return {
            "contract_type": contract_type,
            "risks_identified": risks,
            "recommendations": recommendations,
            "compliance_score": max(0, 100 - len(risks) * 15),
            "requires_review": len(risks) > 2
        }
    
    async def _legal_research(self, topic: str, jurisdiction: str = "federal") -> Dict[str, Any]:
        """Research legal precedents and statutes"""
        # Simulated legal research (in production, would use legal databases)
        research_areas = {
            "contract law": {
                "key_cases": ["Carlill v Carbolic Smoke Ball Co", "Hadley v Baxendale"],
                "statutes": ["Uniform Commercial Code", "Statute of Frauds"],
                "principles": ["Offer and acceptance", "Consideration", "Capacity"]
            },
            "intellectual property": {
                "key_cases": ["Diamond v Chakrabarty", "Alice Corp v CLS Bank"],
                "statutes": ["Patent Act", "Copyright Act", "Lanham Act"],
                "principles": ["Novelty", "Non-obviousness", "Fair use"]
            },
            "corporate law": {
                "key_cases": ["Dodge v Ford Motor Co", "Business Judgment Rule cases"],
                "statutes": ["Delaware General Corporation Law", "Sarbanes-Oxley Act"],
                "principles": ["Fiduciary duty", "Business judgment rule", "Shareholder rights"]
            }
        }
        
        topic_key = next((key for key in research_areas.keys() if key in topic.lower()), "general")
        
        if topic_key in research_areas:
            research_data = research_areas[topic_key]
            return {
                "topic": topic,
                "jurisdiction": jurisdiction,
                "key_cases": research_data["key_cases"],
                "relevant_statutes": research_data["statutes"],
                "legal_principles": research_data["principles"],
                "research_summary": f"Research on {topic} in {jurisdiction} jurisdiction"
            }
        else:
            return {
                "topic": topic,
                "jurisdiction": jurisdiction,
                "research_summary": f"General legal research required for {topic}",
                "recommendation": "Consult specialized legal databases for comprehensive research"
            }
    
    async def _generate_smart_contract(self, contract_type: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate blockchain smart contract code"""
        parameters = parameters or {}
        
        if contract_type.lower() == "escrow":
            contract_code = '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public amount;
    bool public fundsReleased;
    
    constructor(address _seller, address _arbiter) payable {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }
    
    function releaseFunds() external {
        require(msg.sender == buyer || msg.sender == arbiter, "Unauthorized");
        require(!fundsReleased, "Funds already released");
        fundsReleased = true;
        payable(seller).transfer(amount);
    }
    
    function refund() external {
        require(msg.sender == arbiter, "Only arbiter can refund");
        require(!fundsReleased, "Funds already released");
        fundsReleased = true;
        payable(buyer).transfer(amount);
    }
}'''
        elif contract_type.lower() == "token":
            contract_code = '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
}'''
        else:
            contract_code = "// Contract type not supported yet"
        
        return {
            "contract_type": contract_type,
            "solidity_code": contract_code,
            "parameters_used": parameters,
            "deployment_notes": "Review and test thoroughly before mainnet deployment",
            "legal_considerations": [
                "Ensure compliance with local regulations",
                "Consider audit requirements",
                "Review gas optimization",
                "Implement proper access controls"
            ]
        }
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate lawyer-specific proactive suggestions"""
        suggestions = []
        
        if "contract" in query.lower():
            suggestions.append("Would you like me to analyze this contract for potential risks?")
            suggestions.append("I can help generate a smart contract version if applicable.")
        
        if "legal" in query.lower() or "law" in query.lower():
            suggestions.append("I can research relevant case law and precedents.")
            suggestions.append("Consider consulting with a licensed attorney for formal legal advice.")
        
        if "blockchain" in query.lower() or "smart contract" in query.lower():
            suggestions.append("I can generate Solidity smart contract code for your use case.")
            suggestions.append("Remember to consider regulatory compliance for blockchain applications.")
        
        return suggestions[:3]
    
    async def update_knowledge(self):
        """Update knowledge base with latest legal developments"""
        # This would typically fetch from legal databases and news sources
        self.logger.info("Lawyer knowledge base updated")
        return True
