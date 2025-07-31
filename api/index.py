"""
Vercel serverless entry point for AGENT platform
"""

import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# This is the entry point for Vercel
handler = app
