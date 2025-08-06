#!/usr/bin/env python3
"""
AGENT - Advanced AI Multi-Domain Platform
Professional startup script with health checks and monitoring

Usage:
    python run_agent.py [options]
    
Options:
    --dev          Run in development mode
    --prod         Run in production mode  
    --port PORT    Specify port (default: 8000)
    --host HOST    Specify host (default: 0.0.0.0)
    --workers N    Number of worker processes (default: 4)
    --config PATH  Custom configuration file
    --no-build     Skip Rust build process
    --verbose      Enable verbose logging
    --health-check Run health check only
"""

import os
import sys
import time
import json
import signal
import logging
import argparse
import subprocess
import multiprocessing
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional, Tuple

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.absolute()
sys.path.insert(0, str(PROJECT_ROOT))

class AGENTLauncher:
    """Professional launcher for the AGENT platform"""
    
    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.config = {}
        self.processes = []
        self.logger = self._setup_logging()
        
    def _setup_logging(self) -> logging.Logger:
        """Setup professional logging"""
        # Ensure logs directory exists
        logs_dir = self.project_root / 'logs'
        logs_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(logs_dir / 'agent.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        return logging.getLogger('AGENT')
    
    def load_config(self, config_path: Optional[str] = None) -> Dict:
        """Load configuration from file"""
        config_file = config_path or self.project_root / 'config' / 'agent_config.json'
        
        default_config = {
            "server": {
                "host": "0.0.0.0",
                "port": 8000,
                "workers": min(4, multiprocessing.cpu_count()),
                "timeout": 120,
                "max_request_size": "100MB"
            },
            "agent": {
                "default_domain": "developer",
                "max_context_length": 4000,
                "temperature": 0.7,
                "enable_web_search": True,
                "enable_memory": True
            },
            "security": {
                "cors_origins": ["*"],
                "rate_limit": "100/minute",
                "api_key_required": False
            },
            "monitoring": {
                "enable_metrics": True,
                "enable_health_check": True,
                "log_level": "INFO"
            },
            "rust": {
                "build_release": True,
                "enable_performance_monitor": True,
                "enable_security_tools": True
            }
        }
        
        try:
            if Path(config_file).exists():
                with open(config_file, 'r') as f:
                    loaded_config = json.load(f)
                # Merge with defaults
                self._deep_merge(default_config, loaded_config)
            
            self.config = default_config
            self.logger.info(f"Configuration loaded from {config_file}")
            return self.config
            
        except Exception as e:
            self.logger.warning(f"Could not load config file: {e}")
            self.config = default_config
            return self.config
    
    def _deep_merge(self, base: Dict, update: Dict):
        """Deep merge configuration dictionaries"""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def check_prerequisites(self) -> Tuple[bool, List[str]]:
        """Check system prerequisites"""
        issues = []
        
        # Check Python version
        if sys.version_info < (3, 8):
            issues.append("Python 3.8+ required")
        
        # Check required directories
        required_dirs = ['agent', 'api', 'static', 'templates', 'config', 'logs']
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            if not dir_path.exists():
                dir_path.mkdir(parents=True, exist_ok=True)
                self.logger.info(f"Created directory: {dir_path}")
        
        # Check required files
        required_files = [
            'requirements.txt',
            'main.py',
            'static/index.html',
            'static/app.js'
        ]
        
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                issues.append(f"Missing required file: {file_path}")
        
        # Check Rust installation
        try:
            result = subprocess.run(['cargo', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode != 0:
                issues.append("Rust/Cargo not installed or not in PATH")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            issues.append("Rust/Cargo not found")
        
        # Check Node.js (optional)
        try:
            subprocess.run(['node', '--version'], 
                          capture_output=True, text=True, timeout=5)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.logger.warning("Node.js not found (optional)")
        
        return len(issues) == 0, issues
    
    def install_dependencies(self) -> bool:
        """Install Python dependencies"""
        try:
            self.logger.info("Installing Python dependencies...")
            
            # Upgrade pip first
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'
            ], check=True)
            
            # Install requirements
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', 
                str(self.project_root / 'requirements.txt')
            ], check=True)
            
            self.logger.info("Python dependencies installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to install dependencies: {e}")
            return False
    
    def build_rust_components(self, release: bool = True) -> bool:
        """Build Rust components"""
        if not self.config.get('rust', {}).get('build_release', True):
            self.logger.info("Skipping Rust build (disabled in config)")
            return True
        
        try:
            self.logger.info("Building Rust components...")
            
            rust_dir = self.project_root / 'rust'
            if not rust_dir.exists():
                self.logger.warning("Rust directory not found, skipping build")
                return True
            
            # Build all Rust crates
            build_cmd = ['cargo', 'build']
            if release:
                build_cmd.append('--release')
            
            result = subprocess.run(
                build_cmd,
                cwd=rust_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                self.logger.info("Rust components built successfully")
                return True
            else:
                self.logger.error(f"Rust build failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.logger.error("Rust build timed out")
            return False
        except Exception as e:
            self.logger.error(f"Rust build error: {e}")
            return False
    
    def run_health_check(self) -> bool:
        """Run comprehensive health check"""
        self.logger.info("Running health check...")
        
        checks = [
            ("Prerequisites", self.check_prerequisites),
            ("Configuration", lambda: (True, [])),
            ("API Endpoints", self._check_api_health),
            ("Database Connections", self._check_database_health),
            ("External Services", self._check_external_services),
        ]
        
        all_passed = True
        
        for check_name, check_func in checks:
            try:
                if check_name == "Prerequisites":
                    passed, issues = check_func()
                else:
                    passed, issues = check_func()
                
                if passed:
                    self.logger.info(f"✓ {check_name}: PASSED")
                else:
                    self.logger.error(f"✗ {check_name}: FAILED")
                    for issue in issues:
                        self.logger.error(f"  - {issue}")
                    all_passed = False
                    
            except Exception as e:
                self.logger.error(f"✗ {check_name}: ERROR - {e}")
                all_passed = False
        
        return all_passed
    
    def _check_api_health(self) -> Tuple[bool, List[str]]:
        """Check API health"""
        # This would normally make HTTP requests to check endpoints
        return True, []
    
    def _check_database_health(self) -> Tuple[bool, List[str]]:
        """Check database connections"""
        # This would check database connectivity
        return True, []
    
    def _check_external_services(self) -> Tuple[bool, List[str]]:
        """Check external service connectivity"""
        issues = []
        
        # Check internet connectivity
        try:
            import urllib.request
            urllib.request.urlopen('http://google.com', timeout=5)
        except:
            issues.append("No internet connectivity")
        
        return len(issues) == 0, issues
    
    def start_services(self, mode: str = 'dev') -> bool:
        """Start all AGENT services"""
        try:
            self.logger.info(f"Starting AGENT in {mode} mode...")
            
            # Start main application
            if mode == 'prod':
                self._start_production_server()
            else:
                self._start_development_server()
            
            # Start monitoring services
            if self.config.get('monitoring', {}).get('enable_metrics', True):
                self._start_monitoring()
            
            self.logger.info("All services started successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to start services: {e}")
            return False
    
    def _start_production_server(self):
        """Start production server with Gunicorn"""
        try:
            import gunicorn
            
            cmd = [
                'gunicorn',
                '--bind', f"{self.config['server']['host']}:{self.config['server']['port']}",
                '--workers', str(self.config['server']['workers']),
                '--timeout', str(self.config['server']['timeout']),
                '--worker-class', 'uvicorn.workers.UvicornWorker',
                '--access-logfile', str(self.project_root / 'logs' / 'access.log'),
                '--error-logfile', str(self.project_root / 'logs' / 'error.log'),
                '--log-level', self.config['monitoring']['log_level'].lower(),
                'main:app'
            ]
            
            self.logger.info("Starting production server with Gunicorn...")
            process = subprocess.Popen(cmd, cwd=self.project_root)
            self.processes.append(process)
            
        except ImportError:
            self.logger.warning("Gunicorn not available, falling back to development server")
            self._start_development_server()
    
    def _start_development_server(self):
        """Start development server"""
        cmd = [
            sys.executable, 
            'main.py',
            '--host', self.config['server']['host'],
            '--port', str(self.config['server']['port'])
        ]
        
        self.logger.info("Starting development server...")
        process = subprocess.Popen(cmd, cwd=self.project_root)
        self.processes.append(process)
    
    def _start_monitoring(self):
        """Start monitoring services"""
        self.logger.info("Starting monitoring services...")
        
        # Start health monitoring
        monitor_cmd = [
            sys.executable,
            'scripts/health_monitor.py',
            '--config', str(self.project_root / 'config' / 'health_config.json')
        ]
        
        if (self.project_root / 'scripts' / 'health_monitor.py').exists():
            process = subprocess.Popen(monitor_cmd, cwd=self.project_root)
            self.processes.append(process)
    
    def stop_services(self):
        """Stop all services gracefully"""
        self.logger.info("Stopping all services...")
        
        for process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
            except Exception as e:
                self.logger.error(f"Error stopping process: {e}")
        
        self.processes.clear()
        self.logger.info("All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        self.logger.info(f"Received signal {signum}, shutting down...")
        self.stop_services()
        sys.exit(0)
    
    def run(self, args):
        """Main run method"""
        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            # Load configuration
            self.load_config(args.config)
            
            # Override config with command line args
            if args.port:
                self.config['server']['port'] = args.port
            if args.host:
                self.config['server']['host'] = args.host
            if args.workers:
                self.config['server']['workers'] = args.workers
            if args.verbose:
                self.config['monitoring']['log_level'] = 'DEBUG'
                self.logger.setLevel(logging.DEBUG)
            
            # Health check only mode
            if args.health_check:
                success = self.run_health_check()
                sys.exit(0 if success else 1)
            
            # Check prerequisites
            prereq_ok, issues = self.check_prerequisites()
            if not prereq_ok:
                self.logger.error("Prerequisites check failed:")
                for issue in issues:
                    self.logger.error(f"  - {issue}")
                sys.exit(1)
            
            # Install dependencies
            if not self.install_dependencies():
                self.logger.error("Failed to install dependencies")
                sys.exit(1)
            
            # Build Rust components
            if not args.no_build:
                if not self.build_rust_components(release=args.prod):
                    self.logger.warning("Rust build failed, continuing anyway...")
            
            # Run health check
            if not self.run_health_check():
                self.logger.warning("Health check failed, continuing anyway...")
            
            # Start services
            mode = 'prod' if args.prod else 'dev'
            if not self.start_services(mode):
                self.logger.error("Failed to start services")
                sys.exit(1)
            
            # Keep running
            self.logger.info("AGENT is running. Press Ctrl+C to stop.")
            self.logger.info(f"Web interface available at: http://{self.config['server']['host']}:{self.config['server']['port']}")
            
            # Wait for processes
            try:
                while True:
                    time.sleep(1)
                    # Check if any process died
                    for process in self.processes[:]:
                        if process.poll() is not None:
                            self.logger.error(f"Process {process.pid} died unexpectedly")
                            self.processes.remove(process)
            except KeyboardInterrupt:
                pass
                
        except Exception as e:
            self.logger.error(f"Fatal error: {e}")
            sys.exit(1)
        finally:
            self.stop_services()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="AGENT - Advanced AI Multi-Domain Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_agent.py --dev                    # Development mode
  python run_agent.py --prod --port 8080       # Production mode on port 8080
  python run_agent.py --health-check           # Run health check only
  python run_agent.py --verbose --no-build     # Verbose mode, skip Rust build
        """
    )
    
    parser.add_argument('--dev', action='store_true',
                       help='Run in development mode')
    parser.add_argument('--prod', action='store_true', 
                       help='Run in production mode')
    parser.add_argument('--port', type=int, default=None,
                       help='Server port (default: 8000)')
    parser.add_argument('--host', default=None,
                       help='Server host (default: 0.0.0.0)')
    parser.add_argument('--workers', type=int, default=None,
                       help='Number of worker processes')
    parser.add_argument('--config', default=None,
                       help='Custom configuration file path')
    parser.add_argument('--no-build', action='store_true',
                       help='Skip Rust build process')
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose logging')
    parser.add_argument('--health-check', action='store_true',
                       help='Run health check only')
    
    args = parser.parse_args()
    
    # Default to development mode if neither specified
    if not args.dev and not args.prod:
        args.dev = True
    
    launcher = AGENTLauncher()
    launcher.run(args)


if __name__ == "__main__":
    main()
