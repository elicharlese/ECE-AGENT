import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from ..base_classes import EnhancedAgentBase, Tool

class DeveloperAgent(EnhancedAgentBase):
    """AI Agent specialized in software development tasks"""
    
    def __init__(self):
        super().__init__("developer")
        self.knowledge_base = {
            "languages": ["python", "javascript", "typescript", "java", "c++", "go", "rust", "php"],
            "frameworks": ["react", "vue", "angular", "django", "flask", "fastapi", "express", "spring"],
            "tools": ["git", "docker", "kubernetes", "jenkins", "github actions", "aws", "azure", "gcp"],
            "patterns": ["mvc", "mvvm", "microservices", "serverless", "rest", "graphql", "websockets"]
        }
        
    def setup_domain_tools(self):
        """Setup developer-specific tools"""
        # Code analysis tool
        self.tool_registry.register_tool(
            name="code_analyzer",
            description="Analyze code for quality, bugs, and improvements",
            function=self._analyze_code,
            parameters={"code": "str", "language": "str"},
            required_params=["code"]
        )
        
        # Git operations tool
        self.tool_registry.register_tool(
            name="git_helper",
            description="Help with git commands and workflows",
            function=self._git_helper,
            parameters={"operation": "str", "context": "str"},
            required_params=["operation"]
        )
        
        # Documentation generator
        self.tool_registry.register_tool(
            name="doc_generator",
            description="Generate documentation for code",
            function=self._generate_docs,
            parameters={"code": "str", "format": "str"},
            required_params=["code"]
        )
    
    def setup_domain_knowledge(self):
        """Setup developer-specific knowledge"""
        # This would load from a knowledge base in production
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
        
        # Add developer-specific enhancements
        if enhanced_result.get("confidence", 0) < 0.7:
            # Try domain-specific processing as fallback
            fallback_result = await self._legacy_process(query, web_context)
            enhanced_result["answer"] = fallback_result.get("answer", enhanced_result["answer"])
            enhanced_result["confidence"] = max(enhanced_result.get("confidence", 0), fallback_result.get("confidence", 0))
        
        return enhanced_result
    
    async def _legacy_process(self, query: str, web_context: List[Dict] = None) -> Dict[str, Any]:
        """Process developer-related queries"""
        try:
            query_lower = query.lower()
            
            # Analyze query type
            query_type = self._analyze_query_type(query_lower)
            
            # Generate response based on query type
            if query_type == "code_review":
                response = await self._handle_code_review(query, web_context)
            elif query_type == "debugging":
                response = await self._handle_debugging(query, web_context)
            elif query_type == "architecture":
                response = await self._handle_architecture(query, web_context)
            elif query_type == "best_practices":
                response = await self._handle_best_practices(query, web_context)
            elif query_type == "implementation":
                response = await self._handle_implementation(query, web_context)
            else:
                response = await self._handle_general_dev(query, web_context)
            
            return response
            
        except Exception as e:
            self.logger.error(f"Error in developer agent: {e}")
            return {
                "answer": "I encountered an error processing your development query. Please provide more details.",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _analyze_query_type(self, query: str) -> str:
        """Analyze the type of development query"""
        if any(word in query for word in ["review", "code review", "feedback"]):
            return "code_review"
        elif any(word in query for word in ["bug", "error", "debug", "fix", "issue"]):
            return "debugging"
        elif any(word in query for word in ["architecture", "design", "structure", "pattern"]):
            return "architecture"
        elif any(word in query for word in ["best practice", "convention", "standard"]):
            return "best_practices"
        elif any(word in query for word in ["implement", "build", "create", "develop"]):
            return "implementation"
        else:
            return "general"
    
    async def _handle_code_review(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle code review requests"""
        code_blocks = re.findall(r'```[\s\S]*?```', query)
        
        analysis = []
        if code_blocks:
            for code in code_blocks:
                analysis.append(self._analyze_code_quality(code))
        
        suggestions = [
            "Follow consistent naming conventions",
            "Add proper error handling", 
            "Include comprehensive documentation",
            "Write unit tests for critical functions",
            "Consider performance implications",
            "Ensure security best practices"
        ]
        
        web_insights = ""
        if web_context:
            web_insights = f"\n\nBased on current industry practices: {web_context[0].get('content', '')[:200]}..."
        
        return {
            "answer": f"Code Review Analysis:\n\n" + 
                     "\n".join([f"• {item}" for item in analysis]) +
                     f"\n\nRecommendations:\n" +
                     "\n".join([f"• {item}" for item in suggestions]) +
                     web_insights,
            "confidence": 0.85,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Performed code analysis and provided industry-standard recommendations"
        }
    
    async def _handle_debugging(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle debugging requests"""
        debugging_steps = [
            "1. Reproduce the issue consistently",
            "2. Check error logs and stack traces", 
            "3. Use debugging tools (debugger, print statements)",
            "4. Isolate the problem area",
            "5. Test potential solutions incrementally"
        ]
        
        return {
            "answer": f"Debugging Approach:\n\n" + "\n".join(debugging_steps) +
                     f"\n\nFor your specific issue: {query}\n" +
                     "I recommend starting with step 1 and working systematically through each step.",
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied systematic debugging methodology"
        }
    
    async def _handle_architecture(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle architecture design queries"""
        patterns = {
            "microservices": "Break down into small, independent services",
            "mvc": "Separate concerns into Model, View, Controller",
            "serverless": "Use cloud functions for scalable, event-driven architecture",
            "rest": "Design stateless, resource-based API endpoints"
        }
        
        relevant_patterns = [p for p in patterns.keys() if p in query.lower()]
        
        response = "Architecture Recommendations:\n\n"
        if relevant_patterns:
            for pattern in relevant_patterns:
                response += f"• {pattern.upper()}: {patterns[pattern]}\n"
        else:
            response += "• Consider your scalability requirements\n"
            response += "• Plan for maintainability and testability\n"
            response += "• Choose appropriate design patterns\n"
        
        return {
            "answer": response,
            "confidence": 0.8,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied architectural design principles"
        }
    
    async def _handle_best_practices(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle best practices queries"""
        practices = [
            "Write clean, readable code with meaningful names",
            "Follow SOLID principles for object-oriented design",
            "Implement comprehensive error handling",
            "Write automated tests (unit, integration, e2e)",
            "Use version control effectively with meaningful commits",
            "Document your code and APIs thoroughly",
            "Perform regular code reviews",
            "Keep dependencies up to date and secure"
        ]
        
        return {
            "answer": "Development Best Practices:\n\n" + "\n".join([f"• {p}" for p in practices]),
            "confidence": 0.9,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided industry-standard development best practices"
        }
    
    async def _handle_implementation(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle implementation requests"""
        return {
            "answer": f"Implementation guidance for: {query}\n\n" +
                     "1. Break down the problem into smaller components\n" +
                     "2. Choose appropriate technologies and frameworks\n" +
                     "3. Create a development plan with milestones\n" +
                     "4. Start with a minimal viable implementation\n" +
                     "5. Iterate and improve based on feedback\n" +
                     "6. Add comprehensive testing\n" +
                     "7. Document the implementation",
            "confidence": 0.75,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Applied systematic implementation methodology"
        }
    
    async def _handle_general_dev(self, query: str, web_context: List[Dict]) -> Dict[str, Any]:
        """Handle general development queries"""
        return {
            "answer": f"As a developer AI, I can help with:\n\n" +
                     "• Code review and optimization\n" +
                     "• Debugging and troubleshooting\n" +
                     "• Architecture and design patterns\n" +
                     "• Best practices and conventions\n" +
                     "• Implementation guidance\n" +
                     "• Technology recommendations\n\n" +
                     f"For your query: {query}\n" +
                     "Please provide more specific details so I can give you targeted assistance.",
            "confidence": 0.6,
            "sources": [item.get("url", "") for item in web_context] if web_context else [],
            "reasoning": "Provided general development assistance overview"
        }
    
    def _analyze_code_quality(self, code: str) -> str:
        """Basic code quality analysis"""
        issues = []
        if len(code.split('\n')) > 50:
            issues.append("Function/class may be too long")
        if 'TODO' in code or 'FIXME' in code:
            issues.append("Contains TODO/FIXME comments")
        if not re.search(r'def \w+\(.*\):', code) and 'function' in code:
            issues.append("Consider adding proper function definitions")
        
        return "Code appears well-structured" if not issues else "; ".join(issues)
    
    async def _analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code for quality and issues"""
        issues = []
        suggestions = []
        
        # Basic code analysis
        lines = code.split('\n')
        if len(lines) > 100:
            issues.append("Function/class may be too long (>100 lines)")
        
        if 'TODO' in code or 'FIXME' in code:
            issues.append("Contains TODO/FIXME comments")
        
        if language.lower() == "python":
            if not re.search(r'def \w+\(.*\):', code) and 'function' in code.lower():
                issues.append("Consider proper function definitions")
            
            suggestions.extend([
                "Follow PEP 8 style guidelines",
                "Add type hints for better code clarity",
                "Include docstrings for functions and classes"
            ])
        
        return {
            "issues": issues,
            "suggestions": suggestions,
            "complexity_score": min(len(lines) / 10, 10),
            "language": language
        }
    
    async def _git_helper(self, operation: str, context: str = "") -> Dict[str, Any]:
        """Help with git operations"""
        git_commands = {
            "commit": "git add . && git commit -m 'Your commit message'",
            "branch": "git checkout -b new-branch-name",
            "merge": "git checkout main && git merge feature-branch",
            "push": "git push origin branch-name",
            "pull": "git pull origin main",
            "status": "git status",
            "log": "git log --oneline -10"
        }
        
        command = git_commands.get(operation.lower())
        if command:
            return {
                "command": command,
                "description": f"Git command for {operation}",
                "best_practices": [
                    "Always review changes before committing",
                    "Write clear, descriptive commit messages",
                    "Test your code before pushing"
                ]
            }
        else:
            return {
                "error": f"Unknown git operation: {operation}",
                "available_operations": list(git_commands.keys())
            }
    
    async def _generate_docs(self, code: str, format: str = "markdown") -> Dict[str, Any]:
        """Generate documentation for code"""
        # Extract function/class names
        functions = re.findall(r'def (\w+)\(.*\):', code)
        classes = re.findall(r'class (\w+).*:', code)
        
        if format.lower() == "markdown":
            doc = "# Code Documentation\n\n"
            
            if classes:
                doc += "## Classes\n\n"
                for cls in classes:
                    doc += f"### {cls}\n\nDescription of {cls} class.\n\n"
            
            if functions:
                doc += "## Functions\n\n"
                for func in functions:
                    doc += f"### {func}()\n\nDescription of {func} function.\n\n"
        else:
            doc = f"Documentation for code with {len(functions)} functions and {len(classes)} classes"
        
        return {
            "documentation": doc,
            "format": format,
            "functions_found": functions,
            "classes_found": classes
        }
    
    async def generate_proactive_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate developer-specific proactive suggestions"""
        suggestions = []
        
        if "code" in query.lower():
            suggestions.append("Would you like me to analyze this code for potential improvements?")
            suggestions.append("I can help generate documentation for this code.")
        
        if "bug" in query.lower() or "error" in query.lower():
            suggestions.append("Consider implementing comprehensive error handling.")
            suggestions.append("Would you like me to suggest debugging strategies?")
        
        if "architecture" in query.lower():
            suggestions.append("I can help design a scalable system architecture.")
            suggestions.append("Consider exploring microservices or serverless patterns.")
        
        return suggestions[:3]
    
    async def update_knowledge(self):
        """Update knowledge base with latest development trends"""
        # This would typically fetch from APIs or databases
        self.logger.info("Developer knowledge base updated")
        return True
