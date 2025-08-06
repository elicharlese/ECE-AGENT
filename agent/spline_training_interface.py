"""
Spline Training Interface for AGENT
Handles processing of course notes and screenshots to train AGENT in Spline 3D development
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import base64
import os
from pathlib import Path

from .domains.spline_3d_developer import Spline3DDeveloper, SplineScene
from .enhanced_agent import EnhancedAgent


class SplineTrainingInterface:
    """
    Interface for training AGENT with Spline 3D development capabilities
    Processes course notes, screenshots, and creates immersive 3D experiences
    """
    
    def __init__(self, agent: EnhancedAgent):
        self.agent = agent
        self.spline_developer = Spline3DDeveloper()
        self.training_data_path = Path("training_data/spline")
        self.training_data_path.mkdir(parents=True, exist_ok=True)
        
        # Training session tracking
        self.current_session = {
            "session_id": None,
            "start_time": None,
            "notes_processed": 0,
            "screenshots_analyzed": 0,
            "scenes_generated": 0,
            "concepts_learned": []
        }
        
        # Knowledge accumulation
        self.accumulated_knowledge = {
            "concepts": {},
            "techniques": [],
            "best_practices": [],
            "common_patterns": [],
            "performance_tips": []
        }
        
        self.setup_training_tools()
    
    def setup_training_tools(self):
        """Setup training-specific tools for the agent"""
        # Add Spline training tools to the agent's tool registry
        training_tools = [
            {
                "name": "process_spline_notes",
                "description": "Process Spline course notes to extract knowledge",
                "function": self.process_course_notes,
                "parameters": {
                    "notes": "Course notes text",
                    "lesson_title": "Title of the lesson",
                    "context": "Additional context about the lesson"
                },
                "required_params": ["notes"]
            },
            {
                "name": "analyze_spline_screenshot",
                "description": "Analyze Spline screenshot to understand 3D scenes",
                "function": self.analyze_screenshot,
                "parameters": {
                    "image_path": "Path to screenshot image",
                    "description": "Description of what the screenshot shows",
                    "lesson_context": "Context from the lesson"
                },
                "required_params": ["image_path"]
            },
            {
                "name": "generate_3d_scene",
                "description": "Generate a 3D scene based on learned concepts",
                "function": self.generate_scene_from_learning,
                "parameters": {
                    "scene_description": "Description of desired scene",
                    "apply_concepts": "List of concepts to apply",
                    "style": "Visual style preference"
                },
                "required_params": ["scene_description"]
            },
            {
                "name": "start_training_session",
                "description": "Start a new Spline training session",
                "function": self.start_training_session,
                "parameters": {
                    "session_name": "Name for the training session",
                    "course_module": "Course module being studied"
                },
                "required_params": ["session_name"]
            },
            {
                "name": "get_training_progress",
                "description": "Get current training progress and learned concepts",
                "function": self.get_training_progress,
                "parameters": {},
                "required_params": []
            }
        ]
        
        # Register tools with the agent
        for tool_config in training_tools:
            self.agent.tool_registry.register_tool(
                name=tool_config["name"],
                description=tool_config["description"],
                function=tool_config["function"],
                parameters=tool_config["parameters"],
                required_params=tool_config["required_params"]
            )
    
    async def start_training_session(self, session_name: str, course_module: str = "") -> Dict[str, Any]:
        """Start a new training session"""
        session_id = f"spline_training_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.current_session = {
            "session_id": session_id,
            "session_name": session_name,
            "course_module": course_module,
            "start_time": datetime.now(),
            "notes_processed": 0,
            "screenshots_analyzed": 0,
            "scenes_generated": 0,
            "concepts_learned": []
        }
        
        # Store session info
        await self.agent.memory_manager.store_memory(
            content=f"Started Spline 3D training session: {session_name}",
            context=f"Course module: {course_module}",
            importance=0.8,
            tags=["spline", "training", "3d", "session_start"]
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "message": f"Started training session: {session_name}",
            "ready_for": ["course_notes", "screenshots", "scene_generation"]
        }
    
    async def process_course_notes(self, notes: str, lesson_title: str = "", context: str = "") -> Dict[str, Any]:
        """Process course notes and extract Spline knowledge"""
        try:
            # Use the Spline developer to process notes
            result = await self.spline_developer.process_course_notes(notes, context)
            
            if result["success"]:
                # Update session tracking
                self.current_session["notes_processed"] += 1
                self.current_session["concepts_learned"].extend(
                    result.get("new_techniques", [])
                )
                
                # Accumulate knowledge
                self._accumulate_knowledge(result)
                
                # Store in agent memory
                await self.agent.memory_manager.store_memory(
                    content=f"Processed Spline lesson: {lesson_title}",
                    context=f"Extracted {result['extracted_concepts']} concepts. Notes: {notes[:200]}...",
                    importance=0.7,
                    tags=["spline", "course_notes", "learning", lesson_title.lower().replace(" ", "_")]
                )
                
                # Save training data
                await self._save_training_data("notes", {
                    "lesson_title": lesson_title,
                    "notes": notes,
                    "context": context,
                    "extracted_knowledge": result,
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    "success": True,
                    "concepts_learned": result["extracted_concepts"],
                    "new_techniques": result["new_techniques"],
                    "session_progress": self._get_session_summary(),
                    "ready_for_application": True
                }
            else:
                return result
                
        except Exception as e:
            logging.error(f"Error processing course notes: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def analyze_screenshot(self, image_path: str, description: str = "", lesson_context: str = "") -> Dict[str, Any]:
        """Analyze a screenshot to understand 3D scene composition"""
        try:
            # Read and encode image
            if not os.path.exists(image_path):
                return {"success": False, "error": f"Image not found: {image_path}"}
            
            with open(image_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode()
            
            # Use Spline developer to analyze screenshot
            context = f"Description: {description}. Lesson context: {lesson_context}"
            result = await self.spline_developer.analyze_screenshot(image_data, context)
            
            if result["success"]:
                # Update session tracking
                self.current_session["screenshots_analyzed"] += 1
                
                # Store analysis in memory
                await self.agent.memory_manager.store_memory(
                    content=f"Analyzed Spline screenshot: {description}",
                    context=f"Scene elements: {len(result['scene_elements'])}, Lighting: {result['lighting']}, Camera: {result['camera']}",
                    importance=0.8,
                    tags=["spline", "screenshot", "scene_analysis", "visual_learning"]
                )
                
                # Save training data
                await self._save_training_data("screenshots", {
                    "image_path": image_path,
                    "description": description,
                    "lesson_context": lesson_context,
                    "analysis": result,
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    "success": True,
                    "scene_elements": result["scene_elements"],
                    "lighting_setup": result["lighting"],
                    "camera_settings": result["camera"],
                    "materials_identified": result["materials"],
                    "recommendations": result["recommendations"],
                    "can_recreate": True,
                    "session_progress": self._get_session_summary()
                }
            else:
                return result
                
        except Exception as e:
            logging.error(f"Error analyzing screenshot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_scene_from_learning(self, scene_description: str, apply_concepts: List[str] = None, style: str = "modern") -> Dict[str, Any]:
        """Generate a 3D scene applying learned concepts"""
        try:
            if apply_concepts is None:
                apply_concepts = []
            
            # Enhance description with learned concepts
            enhanced_description = self._enhance_description_with_learning(scene_description, apply_concepts)
            
            # Generate scene using Spline developer
            result = await self.spline_developer.generate_scene(
                description=enhanced_description,
                style=style,
                purpose="learning_application",
                interactive=True
            )
            
            if result["success"]:
                # Update session tracking
                self.current_session["scenes_generated"] += 1
                
                # Store generated scene in memory
                await self.agent.memory_manager.store_memory(
                    content=f"Generated Spline 3D scene: {scene_description}",
                    context=f"Applied concepts: {apply_concepts}. Style: {style}",
                    importance=0.9,
                    tags=["spline", "scene_generation", "3d", "creative_output"]
                )
                
                # Save training data
                await self._save_training_data("generated_scenes", {
                    "original_description": scene_description,
                    "enhanced_description": enhanced_description,
                    "applied_concepts": apply_concepts,
                    "style": style,
                    "scene_data": result["scene"],
                    "web_code": result["web_code"],
                    "timestamp": datetime.now().isoformat()
                })
                
                return {
                    "success": True,
                    "scene": result["scene"],
                    "spline_json": result["spline_json"],
                    "web_code": result["web_code"],
                    "applied_concepts": apply_concepts,
                    "optimization_tips": result["optimization_tips"],
                    "session_progress": self._get_session_summary(),
                    "ready_for_export": True
                }
            else:
                return result
                
        except Exception as e:
            logging.error(f"Error generating scene: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_training_progress(self) -> Dict[str, Any]:
        """Get current training progress and capabilities"""
        return {
            "current_session": self.current_session,
            "accumulated_knowledge": self.accumulated_knowledge,
            "capabilities": {
                "can_process_notes": True,
                "can_analyze_screenshots": True,
                "can_generate_scenes": True,
                "can_create_animations": True,
                "can_export_code": True,
                "supported_formats": ["react", "vanilla", "vue"],
                "scene_types": ["product_showcase", "interactive_gallery", "data_visualization", "game_environment"]
            },
            "training_stats": {
                "total_notes_processed": self.current_session["notes_processed"],
                "total_screenshots_analyzed": self.current_session["screenshots_analyzed"],
                "total_scenes_generated": self.current_session["scenes_generated"],
                "concepts_learned": len(self.current_session["concepts_learned"]),
                "knowledge_categories": len(self.accumulated_knowledge["concepts"])
            }
        }
    
    def _accumulate_knowledge(self, extraction_result: Dict[str, Any]):
        """Accumulate knowledge from processing results"""
        if "new_techniques" in extraction_result:
            self.accumulated_knowledge["techniques"].extend(extraction_result["new_techniques"])
        
        if "best_practices" in extraction_result:
            self.accumulated_knowledge["best_practices"].extend(extraction_result["best_practices"])
    
    def _enhance_description_with_learning(self, description: str, apply_concepts: List[str]) -> str:
        """Enhance scene description with learned concepts"""
        enhanced = description
        
        # Add learned techniques
        if self.accumulated_knowledge["techniques"]:
            relevant_techniques = [t for t in self.accumulated_knowledge["techniques"] if any(concept.lower() in t.lower() for concept in apply_concepts)]
            if relevant_techniques:
                enhanced += f"\n\nApply these learned techniques: {', '.join(relevant_techniques[:3])}"
        
        # Add best practices
        if self.accumulated_knowledge["best_practices"]:
            enhanced += f"\n\nFollow best practices for 3D scene creation and performance optimization."
        
        return enhanced
    
    def _get_session_summary(self) -> Dict[str, Any]:
        """Get current session summary"""
        if self.current_session["start_time"]:
            duration = datetime.now() - self.current_session["start_time"]
            duration_minutes = duration.total_seconds() / 60
        else:
            duration_minutes = 0
        
        return {
            "session_id": self.current_session["session_id"],
            "duration_minutes": round(duration_minutes, 2),
            "notes_processed": self.current_session["notes_processed"],
            "screenshots_analyzed": self.current_session["screenshots_analyzed"],
            "scenes_generated": self.current_session["scenes_generated"],
            "concepts_learned": len(self.current_session["concepts_learned"])
        }
    
    async def _save_training_data(self, data_type: str, data: Dict[str, Any]):
        """Save training data to disk"""
        try:
            data_dir = self.training_data_path / data_type
            data_dir.mkdir(exist_ok=True)
            
            filename = f"{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = data_dir / filename
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2, default=str)
                
        except Exception as e:
            logging.error(f"Error saving training data: {str(e)}")


# Integration function for enhanced agent
async def integrate_spline_training(agent: EnhancedAgent) -> SplineTrainingInterface:
    """Integrate Spline training capabilities into an enhanced agent"""
    training_interface = SplineTrainingInterface(agent)
    
    # Store integration in agent memory
    await agent.memory_manager.store_memory(
        content="Integrated Spline 3D development training capabilities",
        context="Can now process course notes, analyze screenshots, and generate 3D scenes",
        importance=0.9,
        tags=["spline", "3d", "training", "capability_upgrade"]
    )
    
    return training_interface
