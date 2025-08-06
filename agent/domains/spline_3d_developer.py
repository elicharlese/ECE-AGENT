"""
Spline 3D Developer Domain Specialist for AGENT
Handles 3D immersive experience development using Spline
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import base64
from dataclasses import dataclass
from enum import Enum

from ..base_classes import EnhancedAgentBase, Tool, Memory, ReasoningType
from ..multi_model_router import multi_model_router, ModelType, QueryType


class SplineElementType(Enum):
    """Types of 3D elements in Spline"""
    PRIMITIVE = "primitive"
    MODEL = "model"
    LIGHT = "light"
    CAMERA = "camera"
    MATERIAL = "material"
    ANIMATION = "animation"
    INTERACTION = "interaction"
    ENVIRONMENT = "environment"


@dataclass
class SplineScene:
    """Represents a complete Spline 3D scene"""
    name: str
    elements: List[Dict[str, Any]]
    lighting: Dict[str, Any]
    camera_settings: Dict[str, Any]
    animations: List[Dict[str, Any]]
    interactions: List[Dict[str, Any]]
    materials: List[Dict[str, Any]]
    environment: Dict[str, Any]
    metadata: Dict[str, Any]


class Spline3DDeveloper(EnhancedAgentBase):
    """
    Domain specialist for Spline 3D development
    Capable of creating immersive 3D experiences from notes and screenshots
    """
    
    def __init__(self):
        super().__init__(domain="spline_3d")
        self.domain_name = "Spline 3D Development"
        self.expertise_areas = [
            "3D Scene Creation",
            "Interactive 3D Elements",
            "Animation Sequences",
            "Material Design",
            "Lighting Setup",
            "Camera Management",
            "WebGL Integration",
            "Performance Optimization"
        ]
        
        # Spline-specific knowledge base
        self.spline_knowledge = {
            "primitives": {
                "cube": {"properties": ["size", "position", "rotation", "material"]},
                "sphere": {"properties": ["radius", "position", "rotation", "material"]},
                "cylinder": {"properties": ["height", "radius", "position", "rotation", "material"]}
            },
            "lighting": {
                "directional": {"properties": ["direction", "intensity", "color", "shadows"]},
                "point": {"properties": ["position", "intensity", "color", "range", "decay"]},
                "ambient": {"properties": ["intensity", "color"]}
            },
            "materials": {
                "basic": {"properties": ["color", "opacity", "wireframe"]},
                "standard": {"properties": ["color", "metalness", "roughness", "opacity"]},
                "emissive": {"properties": ["color", "intensity", "opacity"]}
            }
        }
        
        # Training data from course notes
        self.training_notes = []
        self.screenshot_analysis = []
        
        # Initialize tools dictionary
        self.tools = {}
        
        self.setup_tools()
    
    def setup_domain_knowledge(self):
        """Setup domain-specific knowledge for Spline 3D development"""
        pass
    
    def setup_domain_tools(self):
        """Setup domain-specific tools for Spline 3D development"""
        pass
    
    def setup_tools(self):
        """Setup Spline-specific development tools"""
        tools = [
            Tool(
                name="analyze_spline_screenshot",
                description="Analyze a screenshot to extract Spline 3D scene information",
                function=self.analyze_screenshot,
                parameters={
                    "image_data": "Base64 encoded image data",
                    "context": "Additional context about the screenshot"
                },
                required_params=["image_data"]
            ),
            Tool(
                name="generate_spline_scene",
                description="Generate a complete Spline 3D scene from description",
                function=self.generate_scene,
                parameters={
                    "description": "Description of the desired 3D scene",
                    "style": "Visual style (modern, minimalist, futuristic, etc.)",
                    "purpose": "Purpose of the scene (showcase, game, visualization, etc.)",
                    "interactive": "Whether the scene should be interactive"
                },
                required_params=["description"]
            ),
            Tool(
                name="create_spline_animation",
                description="Create animation sequences for Spline elements",
                function=self.create_animation,
                parameters={
                    "element_type": "Type of element to animate",
                    "animation_type": "Type of animation (transform, material, camera, etc.)",
                    "duration": "Animation duration in seconds",
                    "properties": "Properties to animate"
                },
                required_params=["element_type", "animation_type"]
            ),
            Tool(
                name="export_spline_code",
                description="Export Spline scene as web-ready code",
                function=self.export_code,
                parameters={
                    "scene": "Scene data to export",
                    "format": "Export format (react, vanilla, vue, etc.)",
                    "include_interactions": "Whether to include interactive elements"
                },
                required_params=["scene"]
            )
        ]
        
        for tool in tools:
            self.tools[tool.name] = tool
    
    async def process_course_notes(self, notes: str, context: str = "") -> Dict[str, Any]:
        """Process course notes to extract Spline development knowledge"""
        try:
            prompt = f"""
            Analyze these Spline 3D development course notes and extract key concepts:
            
            Notes: {notes}
            Context: {context}
            
            Extract:
            1. New 3D concepts or techniques
            2. Spline-specific features or tools
            3. Best practices for 3D development
            4. Performance optimization tips
            5. User experience guidelines
            
            Format as structured JSON with categories.
            """
            
            response = await multi_model_router.route_query(
                prompt, QueryType.ANALYSIS, ModelType.CLAUDE
            )
            
            extracted_knowledge = json.loads(response.get("content", "{}"))
            
            # Store in training notes
            self.training_notes.append({
                "timestamp": datetime.now(),
                "notes": notes,
                "context": context,
                "extracted_knowledge": extracted_knowledge
            })
            
            # Update knowledge base
            self._update_knowledge_base(extracted_knowledge)
            
            return {
                "success": True,
                "extracted_concepts": len(extracted_knowledge.get("concepts", [])),
                "new_techniques": extracted_knowledge.get("techniques", []),
                "best_practices": extracted_knowledge.get("best_practices", [])
            }
            
        except Exception as e:
            logging.error(f"Error processing course notes: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def analyze_screenshot(self, image_data: str, context: str = "") -> Dict[str, Any]:
        """Analyze a screenshot to extract 3D scene information"""
        try:
            prompt = f"""
            Analyze this Spline 3D screenshot and extract detailed information:
            
            Context: {context}
            
            Identify and describe:
            1. 3D objects and their properties (position, scale, rotation)
            2. Materials and textures used
            3. Lighting setup (type, direction, intensity)
            4. Camera angle and perspective
            5. Animation elements (if visible)
            6. Interactive elements
            7. Overall composition and design principles
            
            Provide specific technical details that could be used to recreate this scene.
            """
            
            response = await multi_model_router.route_query(
                prompt, QueryType.VISION, ModelType.CLAUDE,
                image_data=image_data
            )
            
            analysis = json.loads(response.get("content", "{}"))
            
            # Store screenshot analysis
            self.screenshot_analysis.append({
                "timestamp": datetime.now(),
                "context": context,
                "analysis": analysis,
                "image_hash": hash(image_data)
            })
            
            return {
                "success": True,
                "scene_elements": analysis.get("objects", []),
                "lighting": analysis.get("lighting", {}),
                "materials": analysis.get("materials", []),
                "camera": analysis.get("camera", {}),
                "recommendations": analysis.get("recommendations", [])
            }
            
        except Exception as e:
            logging.error(f"Error analyzing screenshot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_scene(self, description: str, style: str = "modern", 
                           purpose: str = "showcase", interactive: bool = True) -> Dict[str, Any]:
        """Generate a complete Spline 3D scene from description"""
        try:
            prompt = f"""
            Create a detailed Spline 3D scene specification based on:
            
            Description: {description}
            Style: {style}
            Purpose: {purpose}
            Interactive: {interactive}
            
            Generate a complete scene with:
            1. 3D objects with specific properties (position, rotation, scale, material)
            2. Lighting setup (types, positions, colors, intensities)
            3. Camera configuration (position, target, field of view)
            4. Materials and textures
            5. Animation sequences (if applicable)
            6. Interactive elements (if requested)
            
            Use Spline-specific terminology and provide exact values.
            Format as structured JSON that can be imported into Spline.
            """
            
            response = await multi_model_router.route_query(
                prompt, QueryType.CREATIVE, ModelType.CLAUDE
            )
            
            scene_data = json.loads(response.get("content", "{}"))
            
            # Create SplineScene object
            scene = SplineScene(
                name=scene_data.get("name", "Generated Scene"),
                elements=scene_data.get("elements", []),
                lighting=scene_data.get("lighting", {}),
                camera_settings=scene_data.get("camera", {}),
                animations=scene_data.get("animations", []),
                interactions=scene_data.get("interactions", []),
                materials=scene_data.get("materials", []),
                environment=scene_data.get("environment", {}),
                metadata={
                    "generated_at": datetime.now().isoformat(),
                    "style": style,
                    "purpose": purpose,
                    "interactive": interactive
                }
            )
            
            return {
                "success": True,
                "scene": scene,
                "spline_json": self._convert_to_spline_format(scene),
                "web_code": await self.export_code(scene, "react"),
                "optimization_tips": scene_data.get("optimization", [])
            }
            
        except Exception as e:
            logging.error(f"Error generating scene: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def create_animation(self, element_type: str, animation_type: str, 
                             duration: float = 2.0, properties: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create animation sequences for Spline elements"""
        try:
            if properties is None:
                properties = {}
            
            prompt = f"""
            Create a Spline animation for:
            Element Type: {element_type}
            Animation Type: {animation_type}
            Duration: {duration} seconds
            Properties: {properties}
            
            Generate keyframes with:
            1. Start state (0% - 0s)
            2. End state (100% - {duration}s)
            3. Easing curves for smooth motion
            
            Format as Spline-compatible animation data.
            """
            
            response = await multi_model_router.route_query(
                prompt, QueryType.TECHNICAL, ModelType.CLAUDE
            )
            
            animation_data = json.loads(response.get("content", "{}"))
            
            return {
                "success": True,
                "animation": animation_data,
                "duration": duration,
                "keyframes": animation_data.get("keyframes", []),
                "easing": animation_data.get("easing", "ease-in-out")
            }
            
        except Exception as e:
            logging.error(f"Error creating animation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def export_code(self, scene: SplineScene, format: str = "react", 
                         include_interactions: bool = True) -> Dict[str, Any]:
        """Export Spline scene as web-ready code"""
        try:
            if format == "react":
                code = self._generate_react_code(scene, include_interactions)
            elif format == "vanilla":
                code = self._generate_vanilla_code(scene, include_interactions)
            else:
                raise ValueError(f"Unsupported export format: {format}")
            
            return {
                "success": True,
                "format": format,
                "code": code,
                "dependencies": self._get_dependencies(format),
                "setup_instructions": self._get_setup_instructions(format)
            }
            
        except Exception as e:
            logging.error(f"Error exporting code: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _update_knowledge_base(self, extracted_knowledge: Dict[str, Any]):
        """Update the Spline knowledge base with new information"""
        for category, items in extracted_knowledge.items():
            if category not in self.spline_knowledge:
                self.spline_knowledge[category] = {}
            
            if isinstance(items, dict):
                self.spline_knowledge[category].update(items)
    
    def _convert_to_spline_format(self, scene: SplineScene) -> Dict[str, Any]:
        """Convert scene data to Spline-compatible format"""
        return {
            "version": "1.0",
            "scene": {
                "name": scene.name,
                "objects": scene.elements,
                "lighting": scene.lighting,
                "camera": scene.camera_settings,
                "materials": scene.materials,
                "animations": scene.animations,
                "interactions": scene.interactions,
                "environment": scene.environment
            },
            "metadata": scene.metadata
        }
    
    def _generate_react_code(self, scene: SplineScene, include_interactions: bool) -> str:
        """Generate React component code for Spline scene"""
        return f"""
import React, {{ useRef, useEffect }} from 'react';
import {{ Canvas }} from '@react-three/fiber';
import {{ OrbitControls }} from '@react-three/drei';

const SplineScene = () => {{
  const sceneRef = useRef();

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        ref={{sceneRef}}
        camera={{{{ 
          position: {scene.camera_settings.get('position', [0, 0, 5])},
          fov: {scene.camera_settings.get('fov', 45)}
        }}}}
      >
        <ambientLight intensity={scene.lighting.get('ambient', {}).get('intensity', 0.5)} />
        <directionalLight 
          position={scene.lighting.get('main', {}).get('position', [10, 10, 5])} 
          intensity={scene.lighting.get('main', {}).get('intensity', 1)}
        />
        
        {{/* 3D Elements */}}
        {json.dumps(scene.elements)}.map((element, index) => (
          <mesh key={{index}} position={{element.position}} rotation={{element.rotation}}>
            <boxGeometry args={{element.scale}} />
            <meshStandardMaterial color={{element.material?.color || '#ffffff'}} />
          </mesh>
        ))
        
        <OrbitControls />
      </Canvas>
    </div>
  );
}};

export default SplineScene;
"""
    
    def _generate_vanilla_code(self, scene: SplineScene, include_interactions: bool) -> str:
        """Generate vanilla JavaScript code for Spline scene"""
        return f"""
// Vanilla JavaScript Spline Scene
class SplineScene {{
  constructor(container) {{
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.init();
  }}
  
  init() {{
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      {scene.camera_settings.get('fov', 45)},
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Set camera position
    this.camera.position.set(...{scene.camera_settings.get('position', [0, 0, 5])});
    
    // Start render loop
    this.animate();
  }}
  
  animate() {{
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }}
}}
"""
    
    def _get_dependencies(self, format: str) -> List[str]:
        """Get required dependencies for the export format"""
        if format == "react":
            return ["@react-three/fiber", "@react-three/drei", "three"]
        elif format == "vanilla":
            return ["three"]
        return []
    
    def _get_setup_instructions(self, format: str) -> str:
        """Get setup instructions for the export format"""
        if format == "react":
            return "npm install @react-three/fiber @react-three/drei three"
        elif format == "vanilla":
            return "npm install three"
        return ""
