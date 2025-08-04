"""
Video Training API Integration for AGENT System
Adds video processing endpoints to the main FastAPI application
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import asyncio
import logging
import os

# Import video training components (with fallbacks)
try:
    from agent.video_training import VideoTrainingAgent
    VIDEO_TRAINING_AVAILABLE = True
except ImportError:
    VIDEO_TRAINING_AVAILABLE = False
    VideoTrainingAgent = None

logger = logging.getLogger(__name__)

# Pydantic models for request/response
class VideoAnalysisRequest(BaseModel):
    url: HttpUrl
    prompt: Optional[str] = "Analyze this video and provide a comprehensive summary"
    analyzer: Optional[str] = "gemini"  # gemini, openai, or auto

class VideoTrainingRequest(BaseModel):
    urls: List[HttpUrl]
    training_prompt: Optional[str] = None
    mode: Optional[str] = "general"  # AGENT mode to train for

class VideoAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    frame_count: Optional[int] = None
    analyzer_used: Optional[str] = None

class VideoTrainingResponse(BaseModel):
    success: bool
    processed_videos: int
    successful_analyses: int
    training_summary: Optional[str] = None
    error: Optional[str] = None

# Create router for video endpoints
video_router = APIRouter(prefix="/video", tags=["video"])

# Global video training agent instance
_video_agent: Optional[VideoTrainingAgent] = None

def get_video_agent() -> VideoTrainingAgent:
    """Get or create video training agent instance"""
    global _video_agent
    
    if not VIDEO_TRAINING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video training is not available. Please install video dependencies."
        )
    
    if _video_agent is None:
        config = {
            'google_api_key': os.getenv('GOOGLE_API_KEY'),
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
        }
        _video_agent = VideoTrainingAgent(config)
    
    return _video_agent

@video_router.get("/status")
async def video_status():
    """Check video training system status"""
    return {
        "video_training_available": VIDEO_TRAINING_AVAILABLE,
        "dependencies_installed": VIDEO_TRAINING_AVAILABLE,
        "supported_analyzers": ["gemini", "openai"] if VIDEO_TRAINING_AVAILABLE else [],
        "supported_sources": ["youtube", "web_videos"] if VIDEO_TRAINING_AVAILABLE else []
    }

@video_router.post("/analyze", response_model=VideoAnalysisResponse)
async def analyze_video(request: VideoAnalysisRequest):
    """Analyze a single video from URL"""
    try:
        agent = get_video_agent()
        
        result = await agent.process_video_url(
            url=str(request.url),
            prompt=request.prompt,
            analyzer=request.analyzer
        )
        
        if result.get('success'):
            return VideoAnalysisResponse(
                success=True,
                analysis=result.get('analysis'),
                metadata=result.get('metadata'),
                frame_count=result.get('frame_count'),
                analyzer_used=result.get('analyzer_used')
            )
        else:
            return VideoAnalysisResponse(
                success=False,
                error=result.get('error', 'Unknown error occurred')
            )
    
    except Exception as e:
        logger.error(f"Error analyzing video: {e}")
        return VideoAnalysisResponse(
            success=False,
            error=str(e)
        )

@video_router.post("/train", response_model=VideoTrainingResponse)
async def train_from_videos(request: VideoTrainingRequest, background_tasks: BackgroundTasks):
    """Train AGENT using multiple videos (background task)"""
    try:
        agent = get_video_agent()
        
        # Convert URLs to strings
        urls = [str(url) for url in request.urls]
        
        # Run training in background
        result = await agent.train_from_videos(
            video_urls=urls,
            training_prompt=request.training_prompt
        )
        
        # Generate training summary
        successful_count = result.get('successful_analyses', 0)
        total_count = result.get('processed_videos', 0)
        
        summary = f"Processed {total_count} videos, {successful_count} successful analyses."
        if successful_count > 0:
            summary += f" Generated training data for {request.mode} mode."
        
        return VideoTrainingResponse(
            success=successful_count > 0,
            processed_videos=total_count,
            successful_analyses=successful_count,
            training_summary=summary
        )
    
    except Exception as e:
        logger.error(f"Error training from videos: {e}")
        return VideoTrainingResponse(
            success=False,
            processed_videos=0,
            successful_analyses=0,
            error=str(e)
        )

@video_router.get("/examples")
async def get_video_examples():
    """Get example video URLs and prompts for testing"""
    return {
        "programming_tutorials": [
            {
                "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                "title": "Python Tutorial",
                "prompt": "Extract the key programming concepts and code examples from this tutorial"
            }
        ],
        "educational_content": [
            {
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "title": "Educational Video",
                "prompt": "Summarize the main educational points and learning objectives"
            }
        ],
        "suggested_prompts": [
            "What are the key learning points in this video?",
            "Extract code examples and explain their functionality",
            "Summarize this video for a beginner audience",
            "What problems does this video solve?",
            "Convert the video content into a step-by-step guide"
        ]
    }

@video_router.post("/quick-analyze")
async def quick_video_analysis(url: str, prompt: str = None):
    """Quick video analysis endpoint for simple use cases"""
    try:
        if not VIDEO_TRAINING_AVAILABLE:
            return {
                "success": False,
                "error": "Video training not available",
                "fallback_response": "Video analysis requires additional dependencies. Please install video training packages."
            }
        
        agent = get_video_agent()
        
        result = await agent.process_video_url(
            url=url,
            prompt=prompt or "Provide a brief summary of this video"
        )
        
        return {
            "success": result.get('success', False),
            "summary": result.get('analysis') if result.get('success') else None,
            "error": result.get('error') if not result.get('success') else None
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Integration function for main API
def add_video_routes(app):
    """Add video routes to the main FastAPI app"""
    app.include_router(video_router)
    
    # Add video capability info to main endpoints
    @app.get("/capabilities")
    async def get_capabilities():
        return {
            "video_training": VIDEO_TRAINING_AVAILABLE,
            "video_analyzers": ["gemini", "openai"] if VIDEO_TRAINING_AVAILABLE else [],
            "video_sources": ["youtube", "web_videos"] if VIDEO_TRAINING_AVAILABLE else [],
            "multimodal_support": VIDEO_TRAINING_AVAILABLE
        }

# Example usage for testing
if __name__ == "__main__":
    import uvicorn
    from fastapi import FastAPI
    
    # Create test app
    app = FastAPI(title="Video Training API Test")
    add_video_routes(app)
    
    # Run test server
    uvicorn.run(app, host="0.0.0.0", port=8001)
