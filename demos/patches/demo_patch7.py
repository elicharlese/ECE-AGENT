#!/usr/bin/env python3
"""
PATCH 7: Spline Designer Training System
Train AGENT to code 3D scenes in Spline with quality generation capabilities
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
from dataclasses import dataclass, asdict

@dataclass
class SplineScene:
    """Represents a Spline 3D scene"""
    id: str
    name: str
    description: str
    objects: List[Dict]
    materials: List[Dict]
    lighting: Dict
    camera: Dict
    animations: List[Dict]
    interactions: List[Dict]
    code: str
    metadata: Dict

@dataclass
class SplineAsset:
    """Represents a 3D asset in Spline"""
    type: str  # mesh, light, camera, material
    name: str
    properties: Dict
    transforms: Dict
    animations: List[Dict]

class SplineCodeGenerator:
    """Generates Spline JavaScript code for 3D scenes"""
    
    def __init__(self):
        self.logger = logging.getLogger("AGENT.SplineGenerator")
        
    def generate_scene_code(self, scene_description: str, style: str = "modern") -> str:
        """Generate Spline scene code from description"""
        try:
            # Parse scene requirements
            requirements = self._parse_scene_description(scene_description)
            
            # Generate base scene structure
            scene_code = self._generate_base_scene()
            
            # Add objects based on requirements
            scene_code += self._generate_objects(requirements["objects"], style)
            
            # Add lighting
            scene_code += self._generate_lighting(requirements["lighting"], style)
            
            # Add materials
            scene_code += self._generate_materials(requirements["materials"], style)
            
            # Add animations
            scene_code += self._generate_animations(requirements["animations"])
            
            # Add interactions
            scene_code += self._generate_interactions(requirements["interactions"])
            
            # Add camera setup
            scene_code += self._generate_camera(requirements["camera"])
            
            return scene_code
            
        except Exception as e:
            self.logger.error(f"Failed to generate scene code: {e}")
            return self._generate_fallback_scene()
    
    def _parse_scene_description(self, description: str) -> Dict:
        """Parse natural language scene description"""
        # AI-powered parsing (simplified for demo)
        requirements = {
            "objects": [],
            "lighting": {"type": "three_point", "intensity": 1.0},
            "materials": [],
            "animations": [],
            "interactions": [],
            "camera": {"type": "perspective", "position": [0, 0, 10]}
        }
        
        description_lower = description.lower()
        
        # Object detection
        if "cube" in description_lower or "box" in description_lower:
            requirements["objects"].append({"type": "cube", "count": 1})
        if "sphere" in description_lower or "ball" in description_lower:
            requirements["objects"].append({"type": "sphere", "count": 1})
        if "cylinder" in description_lower:
            requirements["objects"].append({"type": "cylinder", "count": 1})
        if "plane" in description_lower or "ground" in description_lower:
            requirements["objects"].append({"type": "plane", "count": 1})
        if "text" in description_lower:
            requirements["objects"].append({"type": "text", "content": "AGENT"})
            
        # Animation detection
        if "rotate" in description_lower or "spin" in description_lower or "rotating" in description_lower:
            requirements["animations"].append({"type": "rotation", "axis": "y"})
        if "float" in description_lower or "hover" in description_lower:
            requirements["animations"].append({"type": "float", "amplitude": 0.5})
        if "pulse" in description_lower or "scale" in description_lower:
            requirements["animations"].append({"type": "scale", "factor": 1.2})
            
        # Lighting detection
        if "dark" in description_lower or "moody" in description_lower:
            requirements["lighting"]["intensity"] = 0.6
        if "bright" in description_lower or "sunny" in description_lower:
            requirements["lighting"]["intensity"] = 1.4
        if "neon" in description_lower or "glow" in description_lower:
            requirements["lighting"]["type"] = "neon"
            
        # Interaction detection
        if "click" in description_lower or "interactive" in description_lower:
            requirements["interactions"].append({"type": "click", "action": "scale"})
        if "hover" in description_lower:
            requirements["interactions"].append({"type": "hover", "action": "highlight"})
            
        return requirements
    
    def _generate_base_scene(self) -> str:
        """Generate base Spline scene structure"""
        return '''
// AGENT Generated Spline Scene
import { Application } from '@splinetool/runtime';

// Initialize Spline Application
const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);

// Scene setup
const scene = app.scene;
const camera = app.camera;
const renderer = app.renderer;

// Enable shadows and post-processing
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

'''
    
    def _generate_objects(self, objects: List[Dict], style: str) -> str:
        """Generate 3D objects code"""
        code = "// Generated Objects\n"
        
        for i, obj in enumerate(objects):
            obj_type = obj["type"]
            count = obj.get("count", 1)
            
            if obj_type == "cube":
                code += self._generate_cube_code(f"cube_{i}", style)
            elif obj_type == "sphere":
                code += self._generate_sphere_code(f"sphere_{i}", style)
            elif obj_type == "cylinder":
                code += self._generate_cylinder_code(f"cylinder_{i}", style)
            elif obj_type == "plane":
                code += self._generate_plane_code(f"plane_{i}", style)
            elif obj_type == "text":
                content = obj.get("content", "AGENT")
                code += self._generate_text_code(f"text_{i}", content, style)
                
        return code + "\n"
    
    def _generate_cube_code(self, name: str, style: str) -> str:
        """Generate cube object code"""
        if style == "modern":
            return f'''
// Modern Cube - {name}
const {name}Geometry = new THREE.BoxGeometry(2, 2, 2);
const {name}Material = new THREE.MeshPhysicalMaterial({{
    color: 0x00ff88,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
}});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.position.set(0, 1, 0);
{name}.castShadow = true;
{name}.receiveShadow = true;
scene.add({name});

'''
        else:
            return f'''
// Classic Cube - {name}
const {name}Geometry = new THREE.BoxGeometry(2, 2, 2);
const {name}Material = new THREE.MeshLambertMaterial({{ color: 0x4a90e2 }});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.position.set(0, 1, 0);
scene.add({name});

'''
    
    def _generate_sphere_code(self, name: str, style: str) -> str:
        """Generate sphere object code"""
        if style == "modern":
            return f'''
// Modern Sphere - {name}
const {name}Geometry = new THREE.SphereGeometry(1.5, 32, 32);
const {name}Material = new THREE.MeshPhysicalMaterial({{
    color: 0x00d4ff,
    metalness: 0.3,
    roughness: 0.4,
    transmission: 0.2,
    opacity: 0.9,
    transparent: true
}});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.position.set(3, 1.5, 0);
{name}.castShadow = true;
scene.add({name});

'''
        else:
            return f'''
// Classic Sphere - {name}
const {name}Geometry = new THREE.SphereGeometry(1.5, 32, 32);
const {name}Material = new THREE.MeshLambertMaterial({{ color: 0xff6b6b }});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.position.set(3, 1.5, 0);
scene.add({name});

'''
    
    def _generate_cylinder_code(self, name: str, style: str) -> str:
        """Generate cylinder object code"""
        return f'''
// Cylinder - {name}
const {name}Geometry = new THREE.CylinderGeometry(1, 1, 3, 16);
const {name}Material = new THREE.MeshStandardMaterial({{
    color: 0xffeb3b,
    metalness: 0.5,
    roughness: 0.3
}});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.position.set(-3, 1.5, 0);
{name}.castShadow = true;
scene.add({name});

'''
    
    def _generate_plane_code(self, name: str, style: str) -> str:
        """Generate plane/ground code"""
        return f'''
// Ground Plane - {name}
const {name}Geometry = new THREE.PlaneGeometry(20, 20);
const {name}Material = new THREE.MeshStandardMaterial({{
    color: 0x2c3e50,
    roughness: 0.8,
    metalness: 0.1
}});
const {name} = new THREE.Mesh({name}Geometry, {name}Material);
{name}.rotation.x = -Math.PI / 2;
{name}.receiveShadow = true;
scene.add({name});

'''
    
    def _generate_text_code(self, name: str, content: str, style: str) -> str:
        """Generate 3D text code"""
        return f'''
// 3D Text - {name}
const {name}Loader = new THREE.FontLoader();
{name}Loader.load('/fonts/helvetiker_regular.typeface.json', function(font) {{
    const {name}Geometry = new THREE.TextGeometry('{content}', {{
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    }});
    
    const {name}Material = new THREE.MeshStandardMaterial({{
        color: 0x00ff88,
        metalness: 0.6,
        roughness: 0.2
    }});
    
    const {name} = new THREE.Mesh({name}Geometry, {name}Material);
    {name}.position.set(-2, 4, 0);
    {name}.castShadow = true;
    scene.add({name});
}});

'''
    
    def _generate_lighting(self, lighting_config: Dict, style: str) -> str:
        """Generate lighting setup code"""
        lighting_type = lighting_config.get("type", "three_point")
        intensity = lighting_config.get("intensity", 1.0)
        
        if lighting_type == "neon":
            return f'''
// Neon Lighting Setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);

const neonLight1 = new THREE.PointLight(0x00ff88, {intensity}, 10);
neonLight1.position.set(5, 5, 5);
scene.add(neonLight1);

const neonLight2 = new THREE.PointLight(0x00d4ff, {intensity}, 10);
neonLight2.position.set(-5, 5, -5);
scene.add(neonLight2);

const rimLight = new THREE.DirectionalLight(0xff006b, 0.5);
rimLight.position.set(0, 10, -10);
scene.add(rimLight);

'''
        else:
            return f'''
// Three-Point Lighting Setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, {intensity});
keyLight.position.set(10, 10, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, {intensity * 0.3});
fillLight.position.set(-10, 5, 5);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0x00d4ff, {intensity * 0.5});
backLight.position.set(0, 5, -10);
scene.add(backLight);

'''
    
    def _generate_materials(self, materials: List[Dict], style: str) -> str:
        """Generate material definitions"""
        return '''
// Advanced Materials Library
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8
});

const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 1.0,
    roughness: 0.2
});

const neonMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.8
});

'''
    
    def _generate_animations(self, animations: List[Dict]) -> str:
        """Generate animation code"""
        if not animations:
            return ""
            
        code = "// Animations\nfunction animate() {\n    requestAnimationFrame(animate);\n\n"
        
        for anim in animations:
            anim_type = anim["type"]
            
            if anim_type == "rotation":
                axis = anim.get("axis", "y")
                code += f"    // Rotation animation\n"
                code += f"    scene.children.forEach(child => {{\n"
                code += f"        if (child.isMesh) {{\n"
                code += f"            child.rotation.{axis} += 0.01;\n"
                code += f"        }}\n"
                code += f"    }});\n\n"
                
            elif anim_type == "float":
                amplitude = anim.get("amplitude", 0.5)
                code += f"    // Float animation\n"
                code += f"    const time = Date.now() * 0.001;\n"
                code += f"    scene.children.forEach(child => {{\n"
                code += f"        if (child.isMesh && child.userData.canFloat) {{\n"
                code += f"            child.position.y = Math.sin(time) * {amplitude} + child.userData.originalY;\n"
                code += f"        }}\n"
                code += f"    }});\n\n"
                
            elif anim_type == "scale":
                factor = anim.get("factor", 1.2)
                code += f"    // Scale animation\n"
                code += f"    const scaleTime = Date.now() * 0.002;\n"
                code += f"    const scaleValue = 1 + Math.sin(scaleTime) * 0.1;\n"
                code += f"    scene.children.forEach(child => {{\n"
                code += f"        if (child.isMesh && child.userData.canScale) {{\n"
                code += f"            child.scale.setScalar(scaleValue);\n"
                code += f"        }}\n"
                code += f"    }});\n\n"
        
        code += "    renderer.render(scene, camera);\n}\n\nanimate();\n\n"
        return code
    
    def _generate_interactions(self, interactions: List[Dict]) -> str:
        """Generate interaction code"""
        if not interactions:
            return ""
            
        code = "// Interactions\nconst raycaster = new THREE.Raycaster();\nconst mouse = new THREE.Vector2();\n\n"
        
        for interaction in interactions:
            interaction_type = interaction["type"]
            action = interaction.get("action", "scale")
            
            if interaction_type == "click":
                code += f'''
function onMouseClick(event) {{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {{
        const object = intersects[0].object;
        // {action} action
        if (object.userData.interactive) {{
            object.scale.multiplyScalar(1.2);
            setTimeout(() => {{
                object.scale.divideScalar(1.2);
            }}, 200);
        }}
    }}
}}

canvas.addEventListener('click', onMouseClick);

'''
            
            elif interaction_type == "hover":
                code += f'''
function onMouseMove(event) {{
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    // Reset all objects
    scene.children.forEach(child => {{
        if (child.isMesh && child.userData.interactive) {{
            child.material.emissive.setHex(0x000000);
        }}
    }});
    
    if (intersects.length > 0) {{
        const object = intersects[0].object;
        if (object.userData.interactive) {{
            object.material.emissive.setHex(0x444444);
        }}
    }}
}}

canvas.addEventListener('mousemove', onMouseMove);

'''
        
        return code
    
    def _generate_camera(self, camera_config: Dict) -> str:
        """Generate camera setup code"""
        position = camera_config.get("position", [0, 0, 10])
        
        return f'''
// Camera Setup
camera.position.set({position[0]}, {position[1]}, {position[2]});
camera.lookAt(0, 0, 0);

// Camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 20;

// Update controls in animation loop
function updateControls() {{
    controls.update();
    requestAnimationFrame(updateControls);
}}
updateControls();

'''
    
    def _generate_fallback_scene(self) -> str:
        """Generate a simple fallback scene"""
        return '''
// Fallback AGENT Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
'''

class SplineTrainingDataset:
    """Training dataset for Spline scene generation"""
    
    def __init__(self):
        self.scenes = []
        self.patterns = []
        self.logger = logging.getLogger("AGENT.SplineDataset")
    
    def add_scene_example(self, description: str, code: str, quality_score: float):
        """Add a training example"""
        scene_data = {
            "description": description,
            "code": code,
            "quality_score": quality_score,
            "timestamp": datetime.now().isoformat(),
            "features": self._extract_features(description, code)
        }
        
        self.scenes.append(scene_data)
        self.logger.info(f"Added scene example: {description[:50]}...")
    
    def _extract_features(self, description: str, code: str) -> Dict:
        """Extract features from scene description and code"""
        return {
            "object_count": code.count("new THREE.Mesh"),
            "has_animations": "animate()" in code,
            "has_interactions": "addEventListener" in code,
            "has_lighting": "Light" in code,
            "complexity_score": len(code.split('\n')),
            "style_modern": "MeshPhysicalMaterial" in code,
            "description_length": len(description.split())
        }
    
    def get_training_data(self) -> List[Dict]:
        """Get formatted training data"""
        return self.scenes
    
    def analyze_patterns(self) -> Dict:
        """Analyze patterns in the dataset"""
        if not self.scenes:
            return {}
        
        avg_quality = sum(scene["quality_score"] for scene in self.scenes) / len(self.scenes)
        
        feature_analysis = {}
        for feature in ["object_count", "complexity_score", "description_length"]:
            values = [scene["features"][feature] for scene in self.scenes]
            feature_analysis[feature] = {
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values)
            }
        
        return {
            "total_scenes": len(self.scenes),
            "average_quality": avg_quality,
            "feature_analysis": feature_analysis,
            "high_quality_scenes": len([s for s in self.scenes if s["quality_score"] > 0.8])
        }

class SplineDesignerAgent:
    """Main Spline Designer training agent"""
    
    def __init__(self):
        self.code_generator = SplineCodeGenerator()
        self.dataset = SplineTrainingDataset()
        self.logger = logging.getLogger("AGENT.SplineDesigner")
        
        # Initialize with example scenes
        self._initialize_examples()
    
    def _initialize_examples(self):
        """Initialize with high-quality example scenes"""
        examples = [
            {
                "description": "Create a modern floating cube with smooth rotation and glass material",
                "code": self.code_generator.generate_scene_code("floating rotating cube glass material", "modern"),
                "quality": 0.9
            },
            {
                "description": "Design an interactive sphere that glows when hovered and pulses gently",
                "code": self.code_generator.generate_scene_code("interactive glowing sphere hover pulse", "modern"),
                "quality": 0.85
            },
            {
                "description": "Build a neon-lit cylinder with click interactions in a dark environment",
                "code": self.code_generator.generate_scene_code("neon cylinder click dark environment", "modern"),
                "quality": 0.88
            },
            {
                "description": "Create animated 3D text 'AGENT' with metallic finish and dramatic lighting",
                "code": self.code_generator.generate_scene_code("3D text AGENT metallic dramatic lighting", "modern"),
                "quality": 0.92
            }
        ]
        
        for example in examples:
            self.dataset.add_scene_example(
                example["description"],
                example["code"],
                example["quality"]
            )
    
    async def generate_scene(self, description: str, style: str = "modern") -> Dict:
        """Generate a Spline scene from description"""
        try:
            self.logger.info(f"Generating scene: {description}")
            
            # Generate the code
            scene_code = self.code_generator.generate_scene_code(description, style)
            
            # Create scene metadata
            scene = SplineScene(
                id=f"scene_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                name=description[:50],
                description=description,
                objects=[],  # Would be populated by parsing the code
                materials=[],
                lighting={},
                camera={},
                animations=[],
                interactions=[],
                code=scene_code,
                metadata={
                    "generated_by": "AGENT",
                    "style": style,
                    "timestamp": datetime.now().isoformat(),
                    "version": "patch_7"
                }
            )
            
            # Add to training dataset
            quality_score = self._evaluate_scene_quality(scene_code, description)
            self.dataset.add_scene_example(description, scene_code, quality_score)
            
            return {
                "success": True,
                "scene": asdict(scene),
                "quality_score": quality_score,
                "code_length": len(scene_code.split('\n'))
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate scene: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _evaluate_scene_quality(self, code: str, description: str) -> float:
        """Evaluate the quality of generated scene code"""
        score = 0.0
        
        # Code structure checks
        if "new THREE." in code:
            score += 0.2
        if "animate()" in code:
            score += 0.2
        if "addEventListener" in code:
            score += 0.2
        if "Light" in code:
            score += 0.2
        if "Material" in code:
            score += 0.2
        
        # Complexity bonus
        lines = len(code.split('\n'))
        if lines > 50:
            score += 0.1
        if lines > 100:
            score += 0.1
        
        # Description matching bonus
        desc_words = description.lower().split()
        code_lower = code.lower()
        
        matching_concepts = 0
        for word in desc_words:
            if word in code_lower:
                matching_concepts += 1
        
        match_ratio = matching_concepts / len(desc_words) if desc_words else 0
        score += match_ratio * 0.2
        
        return min(score, 1.0)
    
    async def train_from_feedback(self, scene_id: str, feedback: Dict):
        """Learn from user feedback on generated scenes"""
        try:
            quality_rating = feedback.get("quality_rating", 0.5)  # 0-1 scale
            user_comments = feedback.get("comments", "")
            improvements = feedback.get("suggested_improvements", [])
            
            # Update training data
            for scene in self.dataset.scenes:
                if scene.get("scene_id") == scene_id:
                    scene["user_feedback"] = {
                        "quality_rating": quality_rating,
                        "comments": user_comments,
                        "improvements": improvements,
                        "feedback_timestamp": datetime.now().isoformat()
                    }
                    break
            
            self.logger.info(f"Updated scene {scene_id} with feedback rating: {quality_rating}")
            
            return {"success": True, "message": "Feedback incorporated"}
            
        except Exception as e:
            self.logger.error(f"Failed to process feedback: {e}")
            return {"success": False, "error": str(e)}
    
    def get_training_stats(self) -> Dict:
        """Get training statistics"""
        return {
            "dataset_analysis": self.dataset.analyze_patterns(),
            "total_scenes_generated": len(self.dataset.scenes),
            "average_quality": sum(s["quality_score"] for s in self.dataset.scenes) / max(len(self.dataset.scenes), 1),
            "capabilities": [
                "3D object generation",
                "Material creation",
                "Lighting setup",
                "Animation scripting",
                "Interaction programming",
                "Camera positioning"
            ]
        }
    
    async def get_scene_suggestions(self, partial_description: str) -> List[str]:
        """Get scene suggestions based on partial description"""
        suggestions = [
            "floating geometric shapes with neon lighting",
            "interactive product showcase with smooth animations",
            "abstract art installation with particle effects",
            "architectural visualization with realistic materials",
            "logo animation with dynamic camera movements",
            "game environment with interactive elements",
            "data visualization with 3D charts and graphs",
            "virtual showroom with product configurator"
        ]
        
        # Filter suggestions based on partial description
        if partial_description:
            filtered = [s for s in suggestions if any(word in s for word in partial_description.lower().split())]
            return filtered[:5] if filtered else suggestions[:5]
        
        return suggestions[:5]

# Global Spline Designer instance
spline_designer = SplineDesignerAgent()

async def generate_spline_scene(description: str, style: str = "modern") -> Dict:
    """Public API for scene generation"""
    return await spline_designer.generate_scene(description, style)

async def get_spline_training_stats() -> Dict:
    """Get training statistics"""
    return spline_designer.get_training_stats()

async def provide_spline_feedback(scene_id: str, feedback: Dict) -> Dict:
    """Provide feedback for scene improvement"""
    return await spline_designer.train_from_feedback(scene_id, feedback)

async def get_spline_suggestions(partial: str = "") -> List[str]:
    """Get scene suggestions"""
    return await spline_designer.get_scene_suggestions(partial)
