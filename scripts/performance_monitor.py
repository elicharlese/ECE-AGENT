#!/usr/bin/env python3
"""
AGENT Performance Monitor
Advanced performance monitoring and alerting system
"""

import asyncio
import aiohttp
import psutil
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List
import statistics
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self, base_url: str = "https://agent-ece.vercel.app"):
        self.base_url = base_url
        self.metrics_history = []
        self.alert_thresholds = {
            "response_time_p95": 3000,  # 95th percentile response time in ms
            "error_rate": 5,  # percentage
            "memory_usage": 85,  # percentage
            "cpu_usage": 80  # percentage
        }
        
    async def measure_endpoint_performance(self, endpoint: str, samples: int = 5) -> Dict:
        """Measure performance metrics for an endpoint"""
        response_times = []
        status_codes = []
        errors = []
        
        for i in range(samples):
            start_time = time.time()
            
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.base_url}{endpoint}", timeout=15) as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        status_codes.append(response.status)
                        
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                response_times.append(response_time)
                status_codes.append(0)
                errors.append(str(e))
            
            # Small delay between requests
            if i < samples - 1:
                await asyncio.sleep(0.5)
        
        # Calculate metrics
        successful_requests = sum(1 for code in status_codes if 200 <= code < 400)
        error_rate = ((samples - successful_requests) / samples) * 100
        
        valid_times = [t for t, code in zip(response_times, status_codes) if 200 <= code < 400]
        
        metrics = {
            "endpoint": endpoint,
            "timestamp": datetime.now().isoformat(),
            "samples": samples,
            "successful_requests": successful_requests,
            "error_rate_percent": error_rate,
            "response_times": {
                "min_ms": min(valid_times) if valid_times else 0,
                "max_ms": max(valid_times) if valid_times else 0,
                "avg_ms": statistics.mean(valid_times) if valid_times else 0,
                "median_ms": statistics.median(valid_times) if valid_times else 0,
                "p95_ms": statistics.quantiles(valid_times, n=20)[18] if len(valid_times) >= 20 else (max(valid_times) if valid_times else 0),
                "p99_ms": statistics.quantiles(valid_times, n=100)[98] if len(valid_times) >= 100 else (max(valid_times) if valid_times else 0)
            },
            "status_codes": status_codes,
            "errors": errors
        }
        
        return metrics
    
    def get_system_metrics(self) -> Dict:
        """Get current system performance metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Get network stats if available
            try:
                network = psutil.net_io_counters()
                network_stats = {
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                }
            except:
                network_stats = {}
            
            return {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "memory": {
                    "percent": memory.percent,
                    "available_gb": memory.available / (1024**3),
                    "used_gb": memory.used / (1024**3),
                    "total_gb": memory.total / (1024**3)
                },
                "disk": {
                    "percent": disk.percent,
                    "free_gb": disk.free / (1024**3),
                    "used_gb": disk.used / (1024**3),
                    "total_gb": disk.total / (1024**3)
                },
                "network": network_stats
            }
        except Exception as e:
            logger.error(f"Error getting system metrics: {e}")
            return {"error": str(e), "timestamp": datetime.now().isoformat()}
    
    async def run_comprehensive_performance_test(self) -> Dict:
        """Run comprehensive performance test"""
        logger.info("Starting comprehensive performance test...")
        
        # Test key endpoints
        endpoints_to_test = [
            "/health",
            "/",
            "/agent/status",
            "/knowledge/vulnerabilities",
            "/security/system-stats"
        ]
        
        endpoint_metrics = []
        for endpoint in endpoints_to_test:
            logger.info(f"Testing endpoint: {endpoint}")
            metrics = await self.measure_endpoint_performance(endpoint, samples=10)
            endpoint_metrics.append(metrics)
        
        # Get system metrics
        system_metrics = self.get_system_metrics()
        
        # Calculate overall performance score
        overall_score = self.calculate_performance_score(endpoint_metrics, system_metrics)
        
        performance_report = {
            "timestamp": datetime.now().isoformat(),
            "overall_score": overall_score,
            "endpoint_metrics": endpoint_metrics,
            "system_metrics": system_metrics,
            "alerts": self.check_performance_alerts(endpoint_metrics, system_metrics)
        }
        
        # Store in history
        self.metrics_history.append(performance_report)
        
        # Keep only last 24 hours
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.metrics_history = [
            m for m in self.metrics_history 
            if datetime.fromisoformat(m["timestamp"]) > cutoff_time
        ]
        
        return performance_report
    
    def calculate_performance_score(self, endpoint_metrics: List[Dict], system_metrics: Dict) -> float:
        """Calculate overall performance score (0-100)"""
        score = 100.0
        
        # Deduct points for slow response times
        for metrics in endpoint_metrics:
            avg_time = metrics["response_times"]["avg_ms"]
            if avg_time > 2000:
                score -= min(20, (avg_time - 2000) / 100)
        
        # Deduct points for errors
        for metrics in endpoint_metrics:
            error_rate = metrics["error_rate_percent"]
            score -= error_rate * 2
        
        # Deduct points for high resource usage
        if "cpu" in system_metrics:
            cpu_percent = system_metrics["cpu"]["percent"]
            if cpu_percent > 70:
                score -= (cpu_percent - 70) / 2
        
        if "memory" in system_metrics:
            memory_percent = system_metrics["memory"]["percent"]
            if memory_percent > 80:
                score -= (memory_percent - 80) / 2
        
        return max(0, score)
    
    def check_performance_alerts(self, endpoint_metrics: List[Dict], system_metrics: Dict) -> List[Dict]:
        """Check for performance alerts"""
        alerts = []
        
        # Check endpoint performance
        for metrics in endpoint_metrics:
            if metrics["response_times"]["p95_ms"] > self.alert_thresholds["response_time_p95"]:
                alerts.append({
                    "type": "slow_response",
                    "severity": "medium",
                    "endpoint": metrics["endpoint"],
                    "message": f"95th percentile response time {metrics['response_times']['p95_ms']:.0f}ms exceeds threshold"
                })
            
            if metrics["error_rate_percent"] > self.alert_thresholds["error_rate"]:
                alerts.append({
                    "type": "high_error_rate",
                    "severity": "high",
                    "endpoint": metrics["endpoint"],
                    "message": f"Error rate {metrics['error_rate_percent']:.1f}% exceeds threshold"
                })
        
        # Check system performance
        if "cpu" in system_metrics and system_metrics["cpu"]["percent"] > self.alert_thresholds["cpu_usage"]:
            alerts.append({
                "type": "high_cpu",
                "severity": "medium",
                "message": f"CPU usage {system_metrics['cpu']['percent']:.1f}% exceeds threshold"
            })
        
        if "memory" in system_metrics and system_metrics["memory"]["percent"] > self.alert_thresholds["memory_usage"]:
            alerts.append({
                "type": "high_memory",
                "severity": "medium",
                "message": f"Memory usage {system_metrics['memory']['percent']:.1f}% exceeds threshold"
            })
        
        return alerts
    
    def save_performance_report(self, report: Dict):
        """Save performance report to file"""
        try:
            os.makedirs("reports", exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reports/performance_report_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(report, f, indent=2)
                
            logger.info(f"Performance report saved to {filename}")
            
        except Exception as e:
            logger.error(f"Failed to save performance report: {e}")
    
    def generate_performance_summary(self) -> Dict:
        """Generate performance summary from history"""
        if not self.metrics_history:
            return {"error": "No performance data available"}
        
        recent_reports = self.metrics_history[-10:]  # Last 10 reports
        
        scores = [r["overall_score"] for r in recent_reports]
        
        return {
            "timestamp": datetime.now().isoformat(),
            "reports_analyzed": len(recent_reports),
            "performance_trend": {
                "current_score": scores[-1] if scores else 0,
                "average_score": statistics.mean(scores) if scores else 0,
                "min_score": min(scores) if scores else 0,
                "max_score": max(scores) if scores else 0
            },
            "total_alerts": sum(len(r.get("alerts", [])) for r in recent_reports),
            "alert_types": self.get_alert_type_counts(recent_reports)
        }
    
    def get_alert_type_counts(self, reports: List[Dict]) -> Dict:
        """Get counts of different alert types"""
        alert_counts = {}
        
        for report in reports:
            for alert in report.get("alerts", []):
                alert_type = alert["type"]
                alert_counts[alert_type] = alert_counts.get(alert_type, 0) + 1
        
        return alert_counts

async def main():
    """Main entry point"""
    import sys
    
    url = sys.argv[1] if len(sys.argv) > 1 else "https://agent-ece.vercel.app"
    monitor = PerformanceMonitor(url)
    
    if len(sys.argv) > 2 and sys.argv[2] == "--continuous":
        # Run continuous monitoring
        logger.info("Starting continuous performance monitoring...")
        
        while True:
            try:
                report = await monitor.run_comprehensive_performance_test()
                
                logger.info(f"Performance Score: {report['overall_score']:.1f}/100")
                if report["alerts"]:
                    logger.warning(f"Alerts: {len(report['alerts'])}")
                
                # Save report every hour
                if datetime.now().minute == 0:
                    monitor.save_performance_report(report)
                
                # Wait 10 minutes between tests
                await asyncio.sleep(600)
                
            except KeyboardInterrupt:
                logger.info("Performance monitoring stopped")
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    else:
        # Run single performance test
        report = await monitor.run_comprehensive_performance_test()
        monitor.save_performance_report(report)
        
        print(json.dumps(report, indent=2))
        
        # Show summary if history exists
        summary = monitor.generate_performance_summary()
        print("\nPerformance Summary:")
        print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
