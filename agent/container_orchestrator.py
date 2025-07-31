import asyncio
import json
import logging
import os
import yaml
from typing import Dict, List, Optional, Any
from datetime import datetime
import subprocess
import tempfile

class ContainerOrchestrator:
    """Fast container deployment and template management system"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.templates_dir = "templates"
        self.containers_dir = "containers"
        self.setup_directories()
        self.create_templates()
    
    def setup_directories(self):
        """Create necessary directories"""
        os.makedirs(self.templates_dir, exist_ok=True)
        os.makedirs(self.containers_dir, exist_ok=True)
    
    def create_templates(self):
        """Create container templates for different work types"""
        templates = {
            "cybersec-lab": {
                "name": "Cybersecurity Lab Environment",
                "description": "Complete cybersecurity testing environment with tools",
                "dockerfile": self._get_cybersec_dockerfile(),
                "docker_compose": self._get_cybersec_compose(),
                "tools": ["nmap", "metasploit", "burpsuite", "wireshark", "john", "hashcat"]
            },
            "dev-environment": {
                "name": "Development Environment", 
                "description": "Full-stack development environment",
                "dockerfile": self._get_dev_dockerfile(),
                "docker_compose": self._get_dev_compose(),
                "tools": ["nodejs", "python", "git", "docker", "vscode-server"]
            },
            "data-science": {
                "name": "Data Science Environment",
                "description": "Python data science and ML environment", 
                "dockerfile": self._get_datascience_dockerfile(),
                "docker_compose": self._get_datascience_compose(),
                "tools": ["jupyter", "pandas", "scikit-learn", "tensorflow", "pytorch"]
            }
        }
        
        for template_name, template_data in templates.items():
            template_path = os.path.join(self.templates_dir, f"{template_name}.json")
            with open(template_path, 'w') as f:
                json.dump(template_data, f, indent=2)
    
    def _get_cybersec_dockerfile(self) -> str:
        return """FROM kalilinux/kali-rolling:latest
RUN apt-get update && apt-get install -y nmap metasploit-framework wireshark john hashcat python3 python3-pip git curl wget vim
RUN pip3 install scapy requests beautifulsoup4 pwntools
WORKDIR /workspace
EXPOSE 8080 4444 8000
CMD ["/bin/bash"]"""
    
    def _get_cybersec_compose(self) -> str:
        return """version: '3.8'
services:
  cybersec-lab:
    build: .
    container_name: cybersec-lab
    ports:
      - "8080:8080"
      - "4444:4444"
    volumes:
      - ./workspace:/workspace
    networks:
      - cybersec-net
networks:
  cybersec-net:
    driver: bridge"""
    
    def _get_dev_dockerfile(self) -> str:
        return """FROM ubuntu:22.04
RUN apt-get update && apt-get install -y nodejs npm python3 python3-pip git curl wget vim
RUN npm install -g @angular/cli create-react-app
RUN pip3 install fastapi uvicorn django flask
WORKDIR /workspace
EXPOSE 3000 8000 5000
CMD ["/bin/bash"]"""
    
    def _get_dev_compose(self) -> str:
        return """version: '3.8'
services:
  dev-env:
    build: .
    container_name: dev-environment
    ports:
      - "3000:3000"
      - "8000:8000"
      - "5000:5000"
    volumes:
      - ./workspace:/workspace
    networks:
      - dev-net
networks:
  dev-net:
    driver: bridge"""
    
    def _get_datascience_dockerfile(self) -> str:
        return """FROM jupyter/scipy-notebook:latest
RUN pip install tensorflow pytorch scikit-learn pandas numpy matplotlib seaborn plotly
WORKDIR /workspace
EXPOSE 8888
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--allow-root"]"""
    
    def _get_datascience_compose(self) -> str:
        return """version: '3.8'
services:
  data-science:
    build: .
    container_name: data-science-env
    ports:
      - "8888:8888"
    volumes:
      - ./workspace:/workspace
    networks:
      - ds-net
networks:
  ds-net:
    driver: bridge"""
    
    async def deploy_template(self, template_name: str, container_name: str = None) -> Dict[str, Any]:
        """Deploy a container from template"""
        try:
            template_path = os.path.join(self.templates_dir, f"{template_name}.json")
            if not os.path.exists(template_path):
                return {"error": f"Template {template_name} not found"}
            
            with open(template_path, 'r') as f:
                template = json.load(f)
            
            # Create container directory
            container_name = container_name or f"{template_name}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            container_dir = os.path.join(self.containers_dir, container_name)
            os.makedirs(container_dir, exist_ok=True)
            
            # Write Dockerfile
            dockerfile_path = os.path.join(container_dir, "Dockerfile")
            with open(dockerfile_path, 'w') as f:
                f.write(template["dockerfile"])
            
            # Write docker-compose.yml
            compose_path = os.path.join(container_dir, "docker-compose.yml")
            with open(compose_path, 'w') as f:
                f.write(template["docker_compose"])
            
            # Build and start container
            result = await self._run_docker_compose(container_dir, "up -d --build")
            
            return {
                "success": True,
                "container_name": container_name,
                "template": template_name,
                "directory": container_dir,
                "status": "deployed",
                "build_result": result
            }
            
        except Exception as e:
            self.logger.error(f"Error deploying template: {e}")
            return {"error": str(e)}
    
    async def _run_docker_compose(self, directory: str, command: str) -> str:
        """Run docker-compose command"""
        try:
            process = await asyncio.create_subprocess_shell(
                f"cd {directory} && docker-compose {command}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return stdout.decode()
            else:
                return f"Error: {stderr.decode()}"
                
        except Exception as e:
            return f"Command execution error: {e}"
    
    async def list_templates(self) -> List[Dict[str, Any]]:
        """List available templates"""
        templates = []
        for filename in os.listdir(self.templates_dir):
            if filename.endswith('.json'):
                template_path = os.path.join(self.templates_dir, filename)
                with open(template_path, 'r') as f:
                    template = json.load(f)
                    templates.append({
                        "id": filename.replace('.json', ''),
                        "name": template["name"],
                        "description": template["description"],
                        "tools": template["tools"]
                    })
        return templates
    
    async def list_containers(self) -> List[Dict[str, Any]]:
        """List deployed containers"""
        containers = []
        if os.path.exists(self.containers_dir):
            for container_name in os.listdir(self.containers_dir):
                container_dir = os.path.join(self.containers_dir, container_name)
                if os.path.isdir(container_dir):
                    # Get container status
                    status_result = await self._run_docker_compose(container_dir, "ps")
                    containers.append({
                        "name": container_name,
                        "directory": container_dir,
                        "status": "running" if "Up" in status_result else "stopped"
                    })
        return containers
    
    async def stop_container(self, container_name: str) -> Dict[str, Any]:
        """Stop a container"""
        container_dir = os.path.join(self.containers_dir, container_name)
        if not os.path.exists(container_dir):
            return {"error": f"Container {container_name} not found"}
        
        result = await self._run_docker_compose(container_dir, "down")
        return {"success": True, "result": result}
    
    async def start_container(self, container_name: str) -> Dict[str, Any]:
        """Start a container"""
        container_dir = os.path.join(self.containers_dir, container_name)
        if not os.path.exists(container_dir):
            return {"error": f"Container {container_name} not found"}
        
        result = await self._run_docker_compose(container_dir, "up -d")
        return {"success": True, "result": result}
