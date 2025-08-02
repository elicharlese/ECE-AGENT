#!/usr/bin/env python3
"""
Performance Monitor Module
Real-time system performance monitoring and metrics collection
"""

import psutil
import time
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System performance metrics data structure"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_total_mb: float
    disk_io_read: int
    disk_io_write: int
    network_bytes_sent: int
    network_bytes_recv: int
    active_processes: int
    load_average: List[float]

class PerformanceMonitor:
    """Advanced system performance monitoring"""
    
    def __init__(self, collection_interval: int = 5):
        """
        Initialize performance monitor
        
        Args:
            collection_interval: Seconds between metric collections
        """
        self.collection_interval = collection_interval
        self.metrics_history: List[SystemMetrics] = []
        self.max_history_size = 1000
        self.monitoring = False
        self.monitor_task = None
        
        logger.info("🔍 Performance Monitor initialized")
    
    async def start_monitoring(self) -> None:
        """Start continuous performance monitoring"""
        if self.monitoring:
            logger.warning("⚠️  Performance monitoring already active")
            return
        
        self.monitoring = True
        self.monitor_task = asyncio.create_task(self._monitor_loop())
        logger.info("✅ Performance monitoring started")
    
    async def stop_monitoring(self) -> None:
        """Stop performance monitoring"""
        if not self.monitoring:
            return
        
        self.monitoring = False
        if self.monitor_task:
            self.monitor_task.cancel()
            try:
                await self.monitor_task
            except asyncio.CancelledError:
                pass
        
        logger.info("⏹️  Performance monitoring stopped")
    
    async def _monitor_loop(self) -> None:
        """Main monitoring loop"""
        try:
            while self.monitoring:
                metrics = await self._collect_metrics()
                self.metrics_history.append(metrics)
                
                # Limit history size
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history = self.metrics_history[-self.max_history_size:]
                
                await asyncio.sleep(self.collection_interval)
        
        except asyncio.CancelledError:
            logger.info("📊 Performance monitoring loop cancelled")
        except Exception as e:
            logger.error(f"❌ Error in performance monitoring loop: {e}")
    
    async def _collect_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_total_mb = memory.total / (1024 * 1024)
            
            # Disk I/O metrics
            disk_io = psutil.disk_io_counters()
            disk_io_read = disk_io.read_bytes if disk_io else 0
            disk_io_write = disk_io.write_bytes if disk_io else 0
            
            # Network metrics
            network_io = psutil.net_io_counters()
            network_bytes_sent = network_io.bytes_sent if network_io else 0
            network_bytes_recv = network_io.bytes_recv if network_io else 0
            
            # Process count
            active_processes = len(psutil.pids())
            
            # Load average (Unix-like systems)
            try:
                load_average = list(psutil.getloadavg())
            except AttributeError:
                # Windows doesn't have load average
                load_average = [0.0, 0.0, 0.0]
            
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_mb=memory_used_mb,
                memory_total_mb=memory_total_mb,
                disk_io_read=disk_io_read,
                disk_io_write=disk_io_write,
                network_bytes_sent=network_bytes_sent,
                network_bytes_recv=network_bytes_recv,
                active_processes=active_processes,
                load_average=load_average
            )
        
        except Exception as e:
            logger.error(f"❌ Error collecting metrics: {e}")
            # Return zero metrics on error
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=0.0,
                memory_percent=0.0,
                memory_used_mb=0.0,
                memory_total_mb=0.0,
                disk_io_read=0,
                disk_io_write=0,
                network_bytes_sent=0,
                network_bytes_recv=0,
                active_processes=0,
                load_average=[0.0, 0.0, 0.0]
            )
    
    async def get_current_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        metrics = await self._collect_metrics()
        return asdict(metrics)
    
    async def get_metrics_summary(self, minutes: int = 10) -> Dict[str, Any]:
        """Get performance summary for the last N minutes"""
        if not self.metrics_history:
            return {"error": "No metrics history available"}
        
        # Filter metrics from last N minutes
        cutoff_time = datetime.now(timezone.utc).timestamp() - (minutes * 60)
        recent_metrics = [
            m for m in self.metrics_history 
            if m.timestamp.timestamp() > cutoff_time
        ]
        
        if not recent_metrics:
            return {"error": f"No metrics available for last {minutes} minutes"}
        
        # Calculate averages
        avg_cpu = sum(m.cpu_percent for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m.memory_percent for m in recent_metrics) / len(recent_metrics)
        max_cpu = max(m.cpu_percent for m in recent_metrics)
        max_memory = max(m.memory_percent for m in recent_metrics)
        
        return {
            "period_minutes": minutes,
            "samples_count": len(recent_metrics),
            "average_cpu_percent": round(avg_cpu, 2),
            "average_memory_percent": round(avg_memory, 2),
            "max_cpu_percent": round(max_cpu, 2),
            "max_memory_percent": round(max_memory, 2),
            "current_metrics": asdict(recent_metrics[-1]) if recent_metrics else None
        }
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        try:
            current_metrics = await self.get_current_metrics()
            summary = await self.get_metrics_summary(5)  # Last 5 minutes
            
            # Determine system health
            health_status = "healthy"
            alerts = []
            
            if current_metrics['cpu_percent'] > 80:
                health_status = "warning"
                alerts.append("High CPU usage detected")
            
            if current_metrics['memory_percent'] > 85:
                health_status = "critical" if health_status != "critical" else health_status
                alerts.append("High memory usage detected")
            
            return {
                "status": health_status,
                "monitoring_active": self.monitoring,
                "current_metrics": current_metrics,
                "summary": summary,
                "alerts": alerts,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        except Exception as e:
            logger.error(f"❌ Error getting system status: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def get_metrics_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent metrics history"""
        recent_metrics = self.metrics_history[-limit:] if self.metrics_history else []
        return [asdict(metrics) for metrics in recent_metrics]
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        await self.stop_monitoring()
        self.metrics_history.clear()
        logger.info("🧹 Performance Monitor cleaned up")

# Global performance monitor instance
_global_monitor = None

async def get_performance_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance"""
    global _global_monitor
    if _global_monitor is None:
        _global_monitor = PerformanceMonitor()
        await _global_monitor.start_monitoring()
    return _global_monitor

async def cleanup_performance_monitor():
    """Cleanup global performance monitor"""
    global _global_monitor
    if _global_monitor:
        await _global_monitor.cleanup()
        _global_monitor = None
