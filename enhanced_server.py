#!/usr/bin/env python3
"""
Enhanced Server - Legacy Runner
-
-This file previously started a separate FastAPI application focused on the EnhancedAgent.
-It is maintained here for compatibility but should be consolidated with main.py.
-"""
-
 """DEPRECATED: enhanced_server.py

This module is retained only for backward compatibility. The application is now
unified under main.py. Prefer running: uvicorn main:app
"""

import logging
import os

import uvicorn

logger = logging.getLogger(__name__)

try:
    # Import the unified FastAPI application
    from main import app as unified_app  # type: ignore
    app = unified_app
    logger.warning("DEPRECATION: enhanced_server.py is deprecated. Use `uvicorn main:app` instead.")
except Exception as e:  # pragma: no cover - fallback path
    # Import FastAPI lazily to avoid dependency when main import works
    from fastapi import FastAPI  # type: ignore

    app = FastAPI()

    @app.get("/__deprecated_enhanced_server__")
    async def deprecated_notice():
        return {
            "error": "Failed to import unified app from main.py",
            "detail": str(e),
            "action": "Run `uvicorn main:app` (preferred).",
        }

    logger.error(
        "DEPRECATION WRAPPER: Could not import main:app. Serving fallback endpoint. Error: %s",
        str(e),
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("enhanced_server:app", host="0.0.0.0", port=port, reload=bool(os.environ.get("RELOAD", "")))
