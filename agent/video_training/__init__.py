"""
Video Training Module for AGENT System
Implements modern video processing and multimodal AI training capabilities
"""

import os
import asyncio
import logging
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse
import tempfile
import json

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoDownloader:
    """Handles downloading videos from web URLs using yt-dlp"""
    
    def __init__(self):
        if not yt_dlp:
            raise ImportError("yt-dlp is required for video downloading. Install with: pip install yt-dlp")
    
    async def download_video(self, url: str, output_dir: str = None) -> Dict[str, Any]:
        """Download video from URL and return metadata"""
        if not output_dir:
            output_dir = tempfile.mkdtemp()
        
        ydl_opts = {
            'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
            'format': 'best[height<=720]',  # Optimize for processing
            'extract_flat': False,
            'writeinfojson': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract info without downloading first
                info = ydl.extract_info(url, download=False)
                
                # Download the video
                ydl.download([url])
                
                return {
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'description': info.get('description', ''),
                    'uploader': info.get('uploader', 'Unknown'),
                    'upload_date': info.get('upload_date', ''),
                    'view_count': info.get('view_count', 0),
                    'output_dir': output_dir,
                    'filename': ydl.prepare_filename(info)
                }
        except Exception as e:
            logger.error(f"Error downloading video from {url}: {e}")
            raise


class VideoProcessor:
    """Handles video frame extraction and preprocessing"""
    
    def __init__(self):
        if not cv2:
            raise ImportError("OpenCV is required for video processing. Install with: pip install opencv-python")
    
    def extract_frames(self, video_path: str, strategy: str = 'uniform', max_frames: int = 30) -> List[np.ndarray]:
        """Extract frames from video using different sampling strategies"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        
        frames = []
        
        if strategy == 'uniform':
            # Extract frames uniformly across the video
            frame_indices = np.linspace(0, total_frames - 1, min(max_frames, total_frames), dtype=int)
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    # Resize frame for processing efficiency
                    frame = cv2.resize(frame, (224, 224))
                    frames.append(frame)
        
        elif strategy == 'keyframes':
            # Extract keyframes (scene changes)
            prev_frame = None
            frame_idx = 0
            threshold = 0.3  # Adjust based on sensitivity
            
            while len(frames) < max_frames and frame_idx < total_frames:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                if prev_frame is not None:
                    # Calculate frame difference
                    diff = cv2.absdiff(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY),
                                     cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY))
                    diff_score = np.mean(diff) / 255.0
                    
                    if diff_score > threshold:
                        frame = cv2.resize(frame, (224, 224))
                        frames.append(frame)
                
                prev_frame = frame
                frame_idx += int(fps)  # Skip 1 second
        
        cap.release()
        logger.info(f"Extracted {len(frames)} frames using {strategy} strategy")
        return frames
    
    def frames_to_base64(self, frames: List[np.ndarray]) -> List[str]:
        """Convert frames to base64 for API transmission"""
        import base64
        
        base64_frames = []
        for frame in frames:
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            base64_frames.append(frame_base64)
        
        return base64_frames


class GeminiVideoAnalyzer:
    """Google Gemini Pro Vision integration for video analysis"""
    
    def __init__(self, api_key: str = None):
        if not genai:
            raise ImportError("Google GenerativeAI is required. Install with: pip install google-generativeai")
        
        if not api_key:
            api_key = os.getenv('GOOGLE_API_KEY')
        
        if not api_key:
            raise ValueError("Google API key is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro-vision')
    
    async def analyze_video_frames(self, frames: List[str], prompt: str = "Analyze this video") -> str:
        """Analyze video frames using Gemini Pro Vision"""
        try:
            # Gemini can handle multiple images in a single request
            parts = [prompt]
            
            for frame_b64 in frames[:10]:  # Limit to first 10 frames for API efficiency
                parts.append({
                    "mime_type": "image/jpeg",
                    "data": frame_b64
                })
            
            response = self.model.generate_content(parts)
            return response.text
        
        except Exception as e:
            logger.error(f"Error analyzing video with Gemini: {e}")
            raise


class OpenAIVideoAnalyzer:
    """OpenAI GPT-4V integration for video analysis"""
    
    def __init__(self, api_key: str = None):
        if not OpenAI:
            raise ImportError("OpenAI is required. Install with: pip install openai")
        
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')
        
        self.client = OpenAI(api_key=api_key)
    
    async def analyze_video_frames(self, frames: List[str], prompt: str = "Analyze this video") -> str:
        """Analyze video frames using GPT-4V"""
        try:
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        *[
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{frame}"}
                            }
                            for frame in frames[:10]  # Limit frames for API efficiency
                        ]
                    ]
                }
            ]
            
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=messages,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            logger.error(f"Error analyzing video with OpenAI: {e}")
            raise


class VideoTrainingAgent:
    """Main video training agent that orchestrates the pipeline"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.downloader = VideoDownloader()
        self.processor = VideoProcessor()
        
        # Initialize available analyzers
        self.analyzers = {}
        
        try:
            if self.config.get('google_api_key'):
                self.analyzers['gemini'] = GeminiVideoAnalyzer(self.config['google_api_key'])
        except Exception:
            pass
        
        try:
            if self.config.get('openai_api_key'):
                self.analyzers['openai'] = OpenAIVideoAnalyzer(self.config['openai_api_key'])
        except Exception:
            pass
        
        if not self.analyzers:
            logger.warning("No video analyzers available. Please configure API keys.")
    
    async def process_video_url(self, url: str, prompt: str = "Analyze this video", 
                               analyzer: str = 'gemini') -> Dict[str, Any]:
        """Complete pipeline: download, process, and analyze video from URL"""
        
        try:
            # Download video
            logger.info(f"Downloading video from: {url}")
            metadata = await self.downloader.download_video(url)
            
            # Extract frames
            logger.info("Extracting frames...")
            frames = self.processor.extract_frames(metadata['filename'])
            
            if not frames:
                raise ValueError("No frames extracted from video")
            
            # Convert to base64
            frames_b64 = self.processor.frames_to_base64(frames)
            
            # Analyze with selected model
            if analyzer not in self.analyzers:
                analyzer = list(self.analyzers.keys())[0] if self.analyzers else None
            
            if not analyzer:
                raise ValueError("No analyzers available")
            
            logger.info(f"Analyzing video with {analyzer}...")
            analysis = await self.analyzers[analyzer].analyze_video_frames(frames_b64, prompt)
            
            return {
                'metadata': metadata,
                'analysis': analysis,
                'frame_count': len(frames),
                'analyzer_used': analyzer,
                'success': True
            }
        
        except Exception as e:
            logger.error(f"Error processing video: {e}")
            return {
                'error': str(e),
                'success': False
            }
        
        finally:
            # Cleanup temporary files
            if 'metadata' in locals() and metadata.get('output_dir'):
                import shutil
                try:
                    shutil.rmtree(metadata['output_dir'])
                except Exception:
                    pass
    
    async def train_from_videos(self, video_urls: List[str], training_prompt: str = None) -> Dict[str, Any]:
        """Train or fine-tune models using multiple videos"""
        results = []
        
        for url in video_urls:
            prompt = training_prompt or f"Extract key learning points from this video: {url}"
            result = await self.process_video_url(url, prompt)
            results.append(result)
        
        # Aggregate results for training
        successful_analyses = [r for r in results if r.get('success')]
        
        return {
            'processed_videos': len(results),
            'successful_analyses': len(successful_analyses),
            'results': results,
            'training_data': [r['analysis'] for r in successful_analyses]
        }


# Example usage and testing
async def test_video_training():
    """Test the video training system"""
    config = {
        'google_api_key': os.getenv('GOOGLE_API_KEY'),
        'openai_api_key': os.getenv('OPENAI_API_KEY')
    }
    
    agent = VideoTrainingAgent(config)
    
    # Test with a sample YouTube video (replace with actual URL)
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Example URL
    
    result = await agent.process_video_url(
        url=test_url,
        prompt="What is the main topic of this video? Provide a detailed summary."
    )
    
    print("Video Analysis Result:")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    # Run test if executed directly
    asyncio.run(test_video_training())
