#!/usr/bin/env python3
"""
Platform Monitoring Agent
Monitors system health, resource usage, and triggers alerts or restoration actions.
"""
import os
import time
import logging
import psutil
from datetime import datetime
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("monitor_agent")

class MonitorAgent:
    def __init__(self, cpu_threshold=85, mem_threshold=90, disk_threshold=90):
        self.cpu_threshold = cpu_threshold
        self.mem_threshold = mem_threshold
        self.disk_threshold = disk_threshold
        self.last_alert = None

    def get_system_metrics(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.now().isoformat(),
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "active_procs": len(psutil.pids()),
        }

    def check_alerts(self, metrics: Dict[str, Any]) -> Dict[str, str]:
        alerts = {}
        if metrics["cpu_percent"] > self.cpu_threshold:
            alerts["cpu"] = f"High CPU usage: {metrics['cpu_percent']}%"
        if metrics["memory_percent"] > self.mem_threshold:
            alerts["memory"] = f"High Memory usage: {metrics['memory_percent']}%"
        if metrics["disk_percent"] > self.disk_threshold:
            alerts["disk"] = f"High Disk usage: {metrics['disk_percent']}%"
        return alerts

    def run_once(self) -> Dict[str, Any]:
        metrics = self.get_system_metrics()
        alerts = self.check_alerts(metrics)
        if alerts:
            logger.warning(f"ALERT: {alerts}")
            self.last_alert = {"time": metrics["timestamp"], "alerts": alerts}
        else:
            logger.info(f"System healthy: {metrics}")
        return {"metrics": metrics, "alerts": alerts}

if __name__ == "__main__":
    agent = MonitorAgent()
    result = agent.run_once()
    print(result)
