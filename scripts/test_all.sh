#!/bin/bash

# Test runner for AGENT application

echo "Starting AGENT comprehensive test suite..."

echo "Activating virtual environment..."
source venv/bin/activate

echo "Running all tests..."
python scripts/run_all_tests.py

echo "Test suite completed."
