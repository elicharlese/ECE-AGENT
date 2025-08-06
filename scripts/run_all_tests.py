#!/usr/bin/env python3
"""
Main test runner for AGENT application
"""

import sys
import os
import subprocess
import asyncio

def get_project_root():
    """Get the project root directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to reach project root
    return os.path.dirname(current_dir)

def run_test_script(script_name):
    """Run a test script and return the result"""
    project_root = get_project_root()
    script_path = os.path.join(project_root, "scripts", "tests", script_name)
    
    print(f"\n{'='*50}")
    print(f"Running {script_name}...")
    print(f"{'='*50}")
    
    try:
        # Activate virtual environment and run the script with correct PYTHONPATH
        venv_python = os.path.join(project_root, "venv", "bin", "python")
        
        # Set environment variables
        env = os.environ.copy()
        env['PYTHONPATH'] = project_root
        
        if os.path.exists(venv_python):
            result = subprocess.run([venv_python, script_path], 
                                  capture_output=True, text=True, timeout=60, env=env)
        else:
            result = subprocess.run([sys.executable, script_path], 
                                  capture_output=True, text=True, timeout=60, env=env)
        
        if result.returncode == 0:
            print(result.stdout)
            print(f"✅ {script_name} PASSED")
            return True
        else:
            print(result.stdout)
            print(result.stderr)
            print(f"❌ {script_name} FAILED")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"❌ {script_name} TIMED OUT")
        return False
    except Exception as e:
        print(f"❌ {script_name} ERROR: {e}")
        return False

async def run_async_test_script(script_name):
    """Run an async test script and return the result"""
    project_root = get_project_root()
    script_path = os.path.join(project_root, "scripts", "tests", script_name)
    
    print(f"\n{'='*50}")
    print(f"Running {script_name}...")
    print(f"{'='*50}")
    
    try:
        # Activate virtual environment and run the script with correct PYTHONPATH
        venv_python = os.path.join(project_root, "venv", "bin", "python")
        
        # Set environment variables
        env = os.environ.copy()
        env['PYTHONPATH'] = project_root
        
        if os.path.exists(venv_python):
            process = await asyncio.create_subprocess_exec(
                venv_python, script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env
            )
        else:
            process = await asyncio.create_subprocess_exec(
                sys.executable, script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env
            )
        
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=60)
        
        if process.returncode == 0:
            print(stdout.decode())
            print(f"✅ {script_name} PASSED")
            return True
        else:
            print(stdout.decode())
            print(stderr.decode())
            print(f"❌ {script_name} FAILED")
            return False
            
    except asyncio.TimeoutError:
        print(f"❌ {script_name} TIMED OUT")
        return False
    except Exception as e:
        print(f"❌ {script_name} ERROR: {e}")
        return False

def create_test_summary(results):
    """Create a summary of test results"""
    passed = sum(1 for result in results if result)
    total = len(results)
    
    print(f"\n{'='*50}")
    print("TEST SUMMARY")
    print(f"{'='*50}")
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED!")
        return 1

def main():
    """Main function to run all tests"""
    print("Starting AGENT comprehensive test suite...")
    
    # Test scripts that need to be run asynchronously
    async_tests = [
        "test_websocket_chat.py",
        "test_ai_chat.py",
        "test_tools.py",
    ]
    
    # Test scripts that can be run synchronously
    sync_tests = [
        "test_layouts.py",
        "test_admin.py",
    ]
    
    # Run async tests
    async_results = []
    for test in async_tests:
        result = asyncio.run(run_async_test_script(test))
        async_results.append(result)
    
    # Run sync tests
    sync_results = []
    for test in sync_tests:
        result = run_test_script(test)
        sync_results.append(result)
    
    # Combine results
    all_results = async_results + sync_results
    
    # Create summary
    return create_test_summary(all_results)

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
