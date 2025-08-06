t#!/usr/bin/env python3
"""
AGENT Health Monitor
Comprehensive health monitoring system for the AGENT platform
"""

import asyncio
import aiohttp
import psutil
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/health_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HealthMonitor:
    """Comprehensive health monitoring for AGENT platform"""
    
    def __init__(self, config_path: str = "config/health_config.json"):
        self.config = self.load_config(config_path)
        self.base_url = self.config.get("base_url", "http://localhost:8000")
        self.check_interval = self.config.get("check_interval", 60)  # seconds
        self.alert_thresholds = self.config.get("alert_thresholds", {})
        self.notification_config = self.config.get("notifications", {})
        self.health_history = []
        self.alert_cooldown = {}
        
    def load_config(self, config_path: str) -> Dict:
        """Load health monitoring configuration"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {config_path} not found, using defaults")
            return self.get_default_config()
    
    def get_default_config(self) -> Dict:
        """Default health monitoring configuration"""
        return {
            "base_url": "http://localhost:8000",
            "check_interval": 60,
            "alert_thresholds": {
                "response_time_ms": 5000,
                "cpu_percent": 80,
                "memory_percent": 85,
                "disk_percent": 90,
                "error_rate_percent": 5
            },
            "notifications": {
                "email": {
                    "enabled": False,
                    "smtp_server": "smtp.gmail.com",
                    "smtp_port": 587,
                    "username": "",
                    "password": "",
                    "recipients": []
                },
                "webhook": {
                    "enabled": False,
                    "url": "",
                    "headers": {}
                }
            },
            "endpoints_to_check": [
                "/health",
                "/agent/status",
                "/",
                "/knowledge/vulnerabilities",
                "/containers/templates"
            ]
        }
    
    async def check_endpoint_health(self, endpoint: str) -> Dict:
        """Check health of a specific endpoint"""
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}{endpoint}", timeout=10) as response:
                    response_time = (time.time() - start_time) * 1000  # ms
                    
                    return {
                        "endpoint": endpoint,
                        "status_code": response.status,
                        "response_time_ms": response_time,
                        "is_healthy": response.status < 400,
                        "timestamp": datetime.now().isoformat(),
                        "error": None
                    }
                    
        except asyncio.TimeoutError:
            return {
                "endpoint": endpoint,
                "status_code": 0,
                "response_time_ms": (time.time() - start_time) * 1000,
                "is_healthy": False,
                "timestamp": datetime.now().isoformat(),
                "error": "Timeout"
            }
        except Exception as e:
            return {
                "endpoint": endpoint,
                "status_code": 0,
                "response_time_ms": (time.time() - start_time) * 1000,
                "is_healthy": False,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def check_system_resources(self) -> Dict:
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "timestamp": datetime.now().isoformat(),
                "is_healthy": (
                    cpu_percent < self.alert_thresholds.get("cpu_percent", 80) and
                    memory.percent < self.alert_thresholds.get("memory_percent", 85) and
                    disk.percent < self.alert_thresholds.get("disk_percent", 90)
                )
            }
        except Exception as e:
            logger.error(f"Error checking system resources: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "is_healthy": False
            }
    
    async def check_ai_model_health(self) -> Dict:
        """Check AI model responsiveness"""
        try:
            test_query = {
                "query": "Health check test",
                "domain": "developer",
                "use_internet": False
            }
            
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/agent/query",
                    json=test_query,
                    timeout=30
                ) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "ai_model_healthy": data.get("success", False),
                            "response_time_ms": response_time,
                            "timestamp": datetime.now().isoformat(),
                            "is_healthy": data.get("success", False)
                        }
                    else:
                        return {
                            "ai_model_healthy": False,
                            "response_time_ms": response_time,
                            "timestamp": datetime.now().isoformat(),
                            "is_healthy": False,
                            "error": f"HTTP {response.status}"
                        }
                        
        except Exception as e:
            return {
                "ai_model_healthy": False,
                "timestamp": datetime.now().isoformat(),
                "is_healthy": False,
                "error": str(e)
            }
    
    async def perform_comprehensive_health_check(self) -> Dict:
        """Perform comprehensive health check"""
        logger.info("Starting comprehensive health check...")
        
        # Check all endpoints
        endpoint_checks = []
        for endpoint in self.config.get("endpoints_to_check", ["/"]):
            endpoint_checks.append(self.check_endpoint_health(endpoint))
        
        endpoint_results = await asyncio.gather(*endpoint_checks)
        
        # Check system resources
        system_health = self.check_system_resources()
        
        # Check AI model
        ai_health = await self.check_ai_model_health()
        
        # Calculate overall health
        healthy_endpoints = sum(1 for result in endpoint_results if result["is_healthy"])
        total_endpoints = len(endpoint_results)
        endpoint_health_percent = (healthy_endpoints / total_endpoints) * 100 if total_endpoints > 0 else 0
        
        overall_health = {
            "timestamp": datetime.now().isoformat(),
            "overall_healthy": (
                endpoint_health_percent >= 80 and
                system_health.get("is_healthy", False) and
                ai_health.get("is_healthy", False)
            ),
            "endpoint_health": {
                "healthy_count": healthy_endpoints,
                "total_count": total_endpoints,
                "health_percent": endpoint_health_percent,
                "details": endpoint_results
            },
            "system_health": system_health,
            "ai_model_health": ai_health,
            "uptime_seconds": self.get_uptime()
        }
        
        # Store in history
        self.health_history.append(overall_health)
        
        # Keep only last 24 hours of data
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.health_history = [
            h for h in self.health_history 
            if datetime.fromisoformat(h["timestamp"]) > cutoff_time
        ]
        
        # Check for alerts
        await self.check_and_send_alerts(overall_health)
        
        logger.info(f"Health check completed. Overall healthy: {overall_health['overall_healthy']}")
        return overall_health
    
    def get_uptime(self) -> float:
        """Get system uptime in seconds"""
        try:
            return time.time() - psutil.boot_time()
        except:
            return 0
    
    async def check_and_send_alerts(self, health_data: Dict):
        """Check health data and send alerts if needed"""
        alerts = []
        
        # Check endpoint health
        if health_data["endpoint_health"]["health_percent"] < 80:
            alerts.append({
                "type": "endpoint_health",
                "severity": "high",
                "message": f"Endpoint health at {health_data['endpoint_health']['health_percent']:.1f}%"
            })
        
        # Check system resources
        system = health_data["system_health"]
        if system.get("cpu_percent", 0) > self.alert_thresholds.get("cpu_percent", 80):
            alerts.append({
                "type": "high_cpu",
                "severity": "medium",
                "message": f"High CPU usage: {system['cpu_percent']:.1f}%"
            })
        
        if system.get("memory_percent", 0) > self.alert_thresholds.get("memory_percent", 85):
            alerts.append({
                "type": "high_memory",
                "severity": "medium",
                "message": f"High memory usage: {system['memory_percent']:.1f}%"
            })
        
        if system.get("disk_percent", 0) > self.alert_thresholds.get("disk_percent", 90):
            alerts.append({
                "type": "high_disk",
                "severity": "high",
                "message": f"High disk usage: {system['disk_percent']:.1f}%"
            })
        
        # Check AI model health
        if not health_data["ai_model_health"].get("is_healthy", False):
            alerts.append({
                "type": "ai_model_down",
                "severity": "critical",
                "message": "AI model is not responding"
            })
        
        # Send alerts
        for alert in alerts:
            await self.send_alert(alert, health_data)
    
    async def send_alert(self, alert: Dict, health_data: Dict):
        """Send alert notification"""
        alert_key = f"{alert['type']}_{alert['severity']}"
        
        # Check cooldown (don't spam alerts)
        if alert_key in self.alert_cooldown:
            if time.time() - self.alert_cooldown[alert_key] < 300:  # 5 minutes
                return
        
        self.alert_cooldown[alert_key] = time.time()
        
        logger.warning(f"ALERT: {alert['message']}")
        
        # Send email notification
        if self.notification_config.get("email", {}).get("enabled", False):
            await self.send_email_alert(alert, health_data)
        
        # Send webhook notification
        if self.notification_config.get("webhook", {}).get("enabled", False):
            await self.send_webhook_alert(alert, health_data)
    
    async def send_email_alert(self, alert: Dict, health_data: Dict):
        """Send email alert with robust guards; no-op if disabled or misconfigured."""
        email_config = self.notification_config.get("email", {})
        # Early exits
        if not email_config.get("enabled", False):
            return
        recipients = email_config.get("recipients")
        if not recipients or not isinstance(recipients, (list, tuple)):
            logger.warning("Email alerts enabled but 'recipients' not configured; skipping email send")
            return
        try:
            msg = MIMEMultipart()
            msg["From"] = email_config.get("username", "agent@localhost")
            msg["To"] = ", ".join([str(r) for r in recipients])
            subject_sev = str(alert.get("severity", "")).upper()
            msg["Subject"] = f"AGENT Health Alert{(' - ' + subject_sev) if subject_sev else ''}"
+
            endpoint_health = health_data.get("endpoint_health", {}) or {}
            system_health = health_data.get("system_health", {}) or {}
            body_lines = [
                "AGENT Health Alert",
                "",
                f"Alert Type: {alert.get('type')}",
                f"Severity: {alert.get('severity')}",
                f"Message: {alert.get('message')}",
                f"Timestamp: {health_data.get('timestamp', '')}",
                "",
                "System Status:",
                f"- Overall Healthy: {health_data.get('overall_healthy')}",
                f"- Endpoint Health: {endpoint_health.get('health_percent', 'N/A')}%",
                f"- CPU Usage: {system_health.get('cpu_percent', 'N/A')}%",
                f"- Memory Usage: {system_health.get('memory_percent', 'N/A')}%",
                f"- Disk Usage: {system_health.get('disk_percent', 'N/A')}%",
                "",
                "Please check the AGENT platform immediately.",
            ]
            msg.attach(MIMEText("\n".join(body_lines), "plain"))
+
            smtp_server = email_config.get("smtp_server", "localhost")
            smtp_port = int(email_config.get("smtp_port", 25))
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                # TLS if requested
                if email_config.get("use_tls", True):
                    try:
                        server.starttls()
                    except Exception as tls_err:
                        logger.warning(f"SMTP TLS not available or failed: {tls_err}")
                # Login if credentials provided
                if email_config.get("username") and email_config.get("password"):
                    try:
                        server.login(email_config["username"], email_config["password"])
                    except Exception as login_err:
                        logger.warning(f"SMTP login failed (continuing without auth): {login_err}")
                server.send_message(msg)
            logger.info("Email alert sent successfully")
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
    
    async def send_webhook_alert(self, alert: Dict, health_data: Dict):
        """Send webhook alert"""
        try:
            webhook_config = self.notification_config["webhook"]
            
            payload = {
                "alert": alert,
                "health_data": health_data,
                "timestamp": datetime.now().isoformat()
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_config["url"],
                    json=payload,
                    headers=webhook_config.get("headers", {})
                ) as response:
                    if response.status == 200:
                        logger.info("Webhook alert sent successfully")
                    else:
                        logger.error(f"Webhook alert failed: HTTP {response.status}")
                        
        except Exception as e:
            logger.error(f"Failed to send webhook alert: {e}")
    
    def save_health_report(self, health_data: Dict):
        """Save health report to file"""
        try:
            os.makedirs("reports", exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reports/health_report_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(health_data, f, indent=2)
                
            logger.info(f"Health report saved to {filename}")
            
        except Exception as e:
            logger.error(f"Failed to save health report: {e}")
    
    async def run_continuous_monitoring(self):
        """Run continuous health monitoring"""
        logger.info("Starting continuous health monitoring...")
        
        while True:
            try:
                health_data = await self.perform_comprehensive_health_check()
                
                # Save report every hour
                if datetime.now().minute == 0:
                    self.save_health_report(health_data)
                
                # Wait for next check
                await asyncio.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                logger.info("Health monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in health monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

async def main():
    """Main entry point"""
    # Ensure directories exist
    os.makedirs("logs", exist_ok=True)
    os.makedirs("config", exist_ok=True)
    os.makedirs("reports", exist_ok=True)
    
    # Create health monitor
    monitor = HealthMonitor()
    
    # Run single check or continuous monitoring
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        health_data = await monitor.perform_comprehensive_health_check()
        print(json.dumps(health_data, indent=2))
    else:
        await monitor.run_continuous_monitoring()

if __name__ == "__main__":
    asyncio.run(main())
