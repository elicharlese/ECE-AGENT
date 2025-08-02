#!/usr/bin/env python3
"""
Cleanup Agent
Standardizes files/folders, removes temp files, and triggers alerts for manual review if needed.
"""
import os
import logging
from pathlib import Path
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cleanup_agent")

EXCLUDE = {'.git', '__pycache__', 'node_modules', 'venv', '.venv', 'target'}
TEMP_EXTENSIONS = {'.tmp', '.log', '.bak', '.swp', '.pyc'}

class CleanupAgent:
    def __init__(self, root: str = "."):
        self.root = Path(root)
        self.changes: List[str] = []

    def standardize_names(self, path: Path):
        for child in path.iterdir():
            if child.name in EXCLUDE:
                continue
            if child.is_dir():
                self.standardize_names(child)
            else:
                new_name = child.name.replace(' ', '_').lower()
                if new_name != child.name:
                    new_path = child.parent / new_name
                    child.rename(new_path)
                    self.changes.append(f"Renamed {child} -> {new_path}")

    def remove_temp_files(self, path: Path):
        for child in path.iterdir():
            if child.name in EXCLUDE:
                continue
            if child.is_dir():
                self.remove_temp_files(child)
            elif child.suffix in TEMP_EXTENSIONS:
                child.unlink()
                self.changes.append(f"Deleted temp file: {child}")

    def run(self):
        self.standardize_names(self.root)
        self.remove_temp_files(self.root)
        if self.changes:
            logger.info("Cleanup changes:")
            for change in self.changes:
                logger.info(change)
        else:
            logger.info("No changes needed.")
        return self.changes

if __name__ == "__main__":
    agent = CleanupAgent()
    agent.run()
