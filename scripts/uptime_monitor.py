#!/usr/bin/env python3
"""
AGENT Uptime Monitor
Simple uptime monitoring script for continuous health checks
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
import logging
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UptimeMonitor:
    def __init__(self, url: str = "https://agent-ece.vercel.app"):
        self.url = url
        self.check_interval = 30  # seconds
        self.stats = {
            "total_checks": 0,
            "successful_checks": 0,
            "failed_checks": 0,
            "average_response_time": 0,
            "uptime_percentage": 0,
            "last_downtime": None,
            "start_time": datetime.now().isoformat()
        }
        
    async def check_health(self) -> dict:
        """Perform a single health check"""
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.url}/health", timeout=10) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    return {
                        "timestamp": datetime.now().isoformat(),
                        "status_code": response.status,
                        "response_time_ms": response_time,
                        "is_up": response.status == 200,
                        "error": None
                    }
                    
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                "timestamp": datetime.now().isoformat(),
                "status_code": 0,
                "response_time_ms": response_time,
                "is_up": False,
                "error": str(e)
            }
    
    def update_stats(self, check_result: dict):
        """Update uptime statistics"""
        self.stats["total_checks"] += 1
        
        if check_result["is_up"]:
            self.stats["successful_checks"] += 1
        else:
            self.stats["failed_checks"] += 1
            self.stats["last_downtime"] = check_result["timestamp"]
        
        # Calculate uptime percentage
        self.stats["uptime_percentage"] = (
            self.stats["successful_checks"] / self.stats["total_checks"] * 100
        )
        
        # Update average response time
        if check_result["is_up"]:
            current_avg = self.stats["average_response_time"]
            new_time = check_result["response_time_ms"]
            success_count = self.stats["successful_checks"]
            
            self.stats["average_response_time"] = (
                (current_avg * (success_count - 1) + new_time) / success_count
            )
    
    def save_stats(self):
        """Save statistics to file"""
        try:
            os.makedirs("logs", exist_ok=True)
            with open("logs/uptime_stats.json", "w") as f:
                json.dump(self.stats, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save stats: {e}")
    
    async def run_monitoring(self):
        """Run continuous uptime monitoring"""
        logger.info(f"Starting uptime monitoring for {self.url}")
        
        while True:
            try:
                result = await self.check_health()
                self.update_stats(result)
                
                status = "UP" if result["is_up"] else "DOWN"
                logger.info(
                    f"[{result['timestamp']}] {status} - "
                    f"{result['response_time_ms']:.0f}ms - "
                    f"Uptime: {self.stats['uptime_percentage']:.2f}%"
                )
                
                # Save stats every 10 checks
                if self.stats["total_checks"] % 10 == 0:
                    self.save_stats()
                
                await asyncio.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                logger.info("Uptime monitoring stopped")
                self.save_stats()
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)

async def main():
    url = sys.argv[1] if len(sys.argv) > 1 else "https://agent-ece.vercel.app"
    monitor = UptimeMonitor(url)
    await monitor.run_monitoring()

if __name__ == "__main__":
    asyncio.run(main())
