"""
Security Tools Module for AGENT
Provides port scanning, container building, and network monitoring capabilities
"""

import asyncio
import subprocess
import json
import psutil
import socket
from datetime import datetime
from typing import Dict, List, Optional
import docker
import nmap


class SecurityToolsManager:
    """Manages security tools and operations"""
    
    def __init__(self):
        self.docker_client = None
        self.nm = nmap.PortScanner()
        self.monitoring_active = False
        self.scan_results = {}
        
        try:
            self.docker_client = docker.from_env()
        except Exception as e:
            print(f"Docker not available: {e}")
    
    async def port_scan(self, target: str, port_range: str = "common", scan_type: str = "tcp") -> Dict:
        """Perform port scan on target"""
        try:
            # Define port ranges
            port_ranges = {
                "common": "22,23,25,53,80,110,143,443,993,995,3389,5432,3306",
                "1-1000": "1-1000",
                "1-65535": "1-65535"
            }
            
            ports = port_ranges.get(port_range, port_ranges["common"])
            
            # Perform scan
            scan_args = f"-p {ports}"
            if scan_type == "syn":
                scan_args += " -sS"
            elif scan_type == "udp":
                scan_args += " -sU"
            else:
                scan_args += " -sT"
            
            self.nm.scan(target, arguments=scan_args)
            
            results = {
                "target": target,
                "scan_type": scan_type,
                "timestamp": datetime.now().isoformat(),
                "hosts": {}
            }
            
            for host in self.nm.all_hosts():
                results["hosts"][host] = {
                    "state": self.nm[host].state(),
                    "protocols": {}
                }
                
                for protocol in self.nm[host].all_protocols():
                    ports = self.nm[host][protocol].keys()
                    results["hosts"][host]["protocols"][protocol] = {}
                    
                    for port in ports:
                        port_info = self.nm[host][protocol][port]
                        results["hosts"][host]["protocols"][protocol][port] = {
                            "state": port_info["state"],
                            "name": port_info.get("name", "unknown"),
                            "product": port_info.get("product", ""),
                            "version": port_info.get("version", "")
                        }
            
            self.scan_results[target] = results
            return {"success": True, "results": results}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def build_container(self, container_name: str, base_image: str, tools: List[str]) -> Dict:
        """Build custom security container"""
        if not self.docker_client:
            return {"success": False, "error": "Docker not available"}
        
        try:
            # Generate Dockerfile content
            dockerfile_content = self.generate_dockerfile(base_image, tools)
            
            # Build container
            image, build_logs = self.docker_client.images.build(
                fileobj=dockerfile_content,
                tag=container_name,
                rm=True
            )
            
            # Collect build logs
            logs = []
            for log in build_logs:
                if 'stream' in log:
                    logs.append(log['stream'].strip())
            
            return {
                "success": True,
                "container_name": container_name,
                "image_id": image.id,
                "build_logs": logs
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def generate_dockerfile(self, base_image: str, tools: List[str]) -> str:
        """Generate Dockerfile content for security tools"""
        dockerfile = f"""
FROM {base_image}

# Update system
RUN apt-get update && apt-get upgrade -y

# Install basic tools
RUN apt-get install -y curl wget git vim nano sudo

# Create security user
RUN useradd -m -s /bin/bash security && echo "security:security" | chpasswd && usermod -aG sudo security

"""
        
        # Add tool-specific installations
        tool_commands = {
            "nmap": "RUN apt-get install -y nmap",
            "metasploit": "RUN curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb | bash",
            "burpsuite": "RUN wget -O burpsuite.jar 'https://portswigger.net/burp/releases/download?product=community&type=jar'",
            "wireshark": "RUN apt-get install -y wireshark tshark",
            "john": "RUN apt-get install -y john",
            "hashcat": "RUN apt-get install -y hashcat",
            "aircrack": "RUN apt-get install -y aircrack-ng",
            "sqlmap": "RUN pip3 install sqlmap",
            "nikto": "RUN apt-get install -y nikto",
            "hydra": "RUN apt-get install -y hydra"
        }
        
        for tool in tools:
            if tool in tool_commands:
                dockerfile += tool_commands[tool] + "\n"
        
        dockerfile += """
# Set working directory
WORKDIR /home/security

# Switch to security user
USER security

# Set entrypoint
CMD ["/bin/bash"]
"""
        
        return dockerfile
    
    async def get_system_stats(self) -> Dict:
        """Get real-time system statistics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            return {
                "success": True,
                "stats": {
                    "cpu": {
                        "percent": cpu_percent,
                        "count": psutil.cpu_count()
                    },
                    "memory": {
                        "total": memory.total,
                        "available": memory.available,
                        "percent": memory.percent,
                        "used": memory.used
                    },
                    "disk": {
                        "total": disk.total,
                        "used": disk.used,
                        "free": disk.free,
                        "percent": (disk.used / disk.total) * 100
                    },
                    "network": {
                        "bytes_sent": network.bytes_sent,
                        "bytes_recv": network.bytes_recv,
                        "packets_sent": network.packets_sent,
                        "packets_recv": network.packets_recv
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_network_connections(self) -> Dict:
        """Get active network connections"""
        try:
            connections = []
            for conn in psutil.net_connections(kind='inet'):
                if conn.status == psutil.CONN_ESTABLISHED:
                    connections.append({
                        "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "unknown",
                        "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "unknown",
                        "status": conn.status,
                        "pid": conn.pid,
                        "family": conn.family.name if conn.family else "unknown",
                        "type": conn.type.name if conn.type else "unknown"
                    })
            
            return {
                "success": True,
                "connections": connections,
                "count": len(connections),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def detect_security_threats(self) -> Dict:
        """Detect potential security threats"""
        try:
            threats = []
            
            # Check for suspicious processes
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    if proc.info['cpu_percent'] > 80:
                        threats.append({
                            "type": "high_cpu_usage",
                            "description": f"Process {proc.info['name']} using {proc.info['cpu_percent']}% CPU",
                            "severity": "medium",
                            "timestamp": datetime.now().isoformat()
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Check for unusual network activity
            network_stats = psutil.net_io_counters()
            if hasattr(self, 'prev_network_stats'):
                bytes_sent_diff = network_stats.bytes_sent - self.prev_network_stats.bytes_sent
                bytes_recv_diff = network_stats.bytes_recv - self.prev_network_stats.bytes_recv
                
                # Threshold for unusual activity (10MB in monitoring interval)
                if bytes_sent_diff > 10 * 1024 * 1024 or bytes_recv_diff > 10 * 1024 * 1024:
                    threats.append({
                        "type": "unusual_network_activity",
                        "description": f"High network I/O: {bytes_sent_diff/1024/1024:.1f}MB sent, {bytes_recv_diff/1024/1024:.1f}MB received",
                        "severity": "low",
                        "timestamp": datetime.now().isoformat()
                    })
            
            self.prev_network_stats = network_stats
            
            return {
                "success": True,
                "threats": threats,
                "count": len(threats),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def export_scan_results(self, target: str) -> Dict:
        """Export scan results for a target"""
        try:
            if target in self.scan_results:
                return {
                    "success": True,
                    "data": self.scan_results[target],
                    "format": "json"
                }
            else:
                return {"success": False, "error": "No scan results found for target"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
