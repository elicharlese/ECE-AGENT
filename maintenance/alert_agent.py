#!/usr/bin/env python3
"""
Alert Agent
Sends alerts (stdout/log) when a monitoring or cleanup agent detects an incident.
"""
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alert_agent")

class AlertAgent:
    def __init__(self):
        self.last_alert = None

    def send_alert(self, message: str, severity: str = "warning"):
        alert = {
            "timestamp": datetime.now().isoformat(),
            "severity": severity,
            "message": message
        }
        logger.warning(f"ALERT: {alert}")
        self.last_alert = alert
        return alert

if __name__ == "__main__":
    agent = AlertAgent()
    agent.send_alert("Test alert from AlertAgent.")
