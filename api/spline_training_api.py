"""
API endpoints for Spline 3D training functionality
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import base64
import tempfile
import os

from ..agent.enhanced_agent import EnhancedAgent
from ..agent.spline_training_interface import SplineTrainingInterface, integrate_spline_training

# Request models
class StartTrainingRequest(BaseModel):
    session_name: str
    course_module: Optional[str] = ""

class ProcessNotesRequest(BaseModel):
    notes: str
    lesson_title: Optional[str] = ""
    context: Optional[str] = ""

class GenerateSceneRequest(BaseModel):
    scene_description: str
    apply_concepts: Optional[List[str]] = []
    style: Optional[str] = "modern"

# Global training interface instance
training_interface: Optional[SplineTrainingInterface] = None

# Router setup
router = APIRouter(prefix="/api/agent/spline", tags=["spline-training"])

async def get_training_interface() -> SplineTrainingInterface:
    """Get or create the training interface"""
    global training_interface
    if training_interface is None:
        # Initialize enhanced agent
        agent = EnhancedAgent()
        training_interface = await integrate_spline_training(agent)
    return training_interface

@router.post("/start-training")
async def start_training_session(request: StartTrainingRequest):
    """Start a new Spline training session"""
    try:
        interface = await get_training_interface()
        result = await interface.start_training_session(
            session_name=request.session_name,
            course_module=request.course_module
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-notes")
async def process_course_notes(request: ProcessNotesRequest):
    """Process Spline course notes"""
    try:
        interface = await get_training_interface()
        result = await interface.process_course_notes(
            notes=request.notes,
            lesson_title=request.lesson_title,
            context=request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-screenshot")
async def analyze_screenshot(
    screenshot: UploadFile = File(...),
    description: str = Form(""),
    lesson_context: str = Form("")
):
    """Analyze a Spline screenshot"""
    try:
        interface = await get_training_interface()
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            content = await screenshot.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            result = await interface.analyze_screenshot(
                image_path=temp_file_path,
                description=description,
                lesson_context=lesson_context
            )
            return result
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-scene")
async def generate_scene(request: GenerateSceneRequest):
    """Generate a 3D scene from description"""
    try:
        interface = await get_training_interface()
        result = await interface.generate_scene_from_learning(
            scene_description=request.scene_description,
            apply_concepts=request.apply_concepts,
            style=request.style
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/training-progress")
async def get_training_progress():
    """Get current training progress"""
    try:
        interface = await get_training_interface()
        result = await interface.get_training_progress()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_spline_capabilities():
    """Get Spline development capabilities"""
    return {
        "domain": "Spline 3D Development",
        "capabilities": [
            "Process course notes and extract 3D concepts",
            "Analyze screenshots to understand scene composition",
            "Generate complete 3D scenes from descriptions",
            "Create animation sequences",
            "Export scenes as web-ready code",
            "Optimize performance for different platforms",
            "Apply learned concepts to new projects"
        ],
        "supported_formats": ["React", "Vanilla JS", "Vue"],
        "scene_types": [
            "Product Showcase",
            "Interactive Gallery", 
            "Data Visualization",
            "Game Environment",
            "Architectural Walkthrough"
        ],
        "training_features": [
            "Course note processing",
            "Screenshot analysis",
            "Concept extraction",
            "Knowledge accumulation",
            "Progressive learning"
        ]
    }
