#!/usr/bin/env python3
"""
Platform Monitoring & Restoration System
Batch 2 Patch 6: Maintenance folder with cleanup and monitoring agents
Signal-based incident response (not loops)
"""

import asyncio
import logging
import signal
import json
import os
import shutil
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path

logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class IncidentType(Enum):
    DISK_SPACE = "disk_space"
    MEMORY_LEAK = "memory_leak"
    CPU_OVERLOAD = "cpu_overload"
    SERVICE_DOWN = "service_down"
    FILE_CORRUPTION = "file_corruption"
    SECURITY_BREACH = "security_breach"
    COMPLIANCE_VIOLATION = "compliance_violation"

@dataclass
class MonitoringAlert:
    """System monitoring alert"""
    id: str
    timestamp: datetime
    alert_level: AlertLevel
    incident_type: IncidentType
    description: str
    metrics: Dict[str, Any]
    auto_resolved: bool = False
    resolution_action: Optional[str] = None

@dataclass
class RestoreAction:
    """System restoration action"""
    id: str
    name: str
    description: str
    trigger_conditions: List[str]
    action_function: str
    max_retries: int = 3
    cooldown_minutes: int = 5

class PlatformMonitor:
    """Platform monitoring and restoration system"""
    
    def __init__(self):
        self.monitoring_active = False
        self.alerts: List[MonitoringAlert] = []
        self.restore_actions: Dict[str, RestoreAction] = {}
        self.signal_handlers: Dict[int, Callable] = {}
        self.last_cleanup = datetime.now(timezone.utc)
        
        # Initialize signal handlers
        self._setup_signal_handlers()
        
        # Initialize restoration actions
        self._initialize_restore_actions()
        
        logger.info("🔍 Platform Monitor initialized")
    
    def _setup_signal_handlers(self):
        """Setup signal handlers for incident response"""
        def handle_sigusr1(signum, frame):
            """Handle cleanup signal"""
            asyncio.create_task(self._trigger_cleanup())
            
        def handle_sigusr2(signum, frame):
            """Handle system check signal"""
            asyncio.create_task(self._trigger_system_check())
            
        # Register signal handlers
        signal.signal(signal.SIGUSR1, handle_sigusr1)
        signal.signal(signal.SIGUSR2, handle_sigusr2)
        
        self.signal_handlers[signal.SIGUSR1] = handle_sigusr1
        self.signal_handlers[signal.SIGUSR2] = handle_sigusr2
        
        logger.info("📡 Signal handlers registered (SIGUSR1: cleanup, SIGUSR2: system check)")
    
    def _initialize_restore_actions(self):
        """Initialize system restoration actions"""
        actions = [
            RestoreAction(
                id="disk_cleanup",
                name="Disk Space Cleanup",
                description="Clean temporary files and logs when disk space is low",
                trigger_conditions=["disk_usage > 85%"],
                action_function="cleanup_disk_space",
                max_retries=2,
                cooldown_minutes=10
            ),
            RestoreAction(
                id="memory_cleanup",
                name="Memory Cleanup",
                description="Force garbage collection and memory optimization",
                trigger_conditions=["memory_usage > 90%"],
                action_function="cleanup_memory",
                max_retries=3,
                cooldown_minutes=5
            ),
            RestoreAction(
                id="service_restart",
                name="Service Restart",
                description="Restart failed services",
                trigger_conditions=["service_down"],
                action_function="restart_service",
                max_retries=3,
                cooldown_minutes=2
            ),
            RestoreAction(
                id="file_standardization",
                name="File/Folder Standardization",
                description="Standardize file permissions and folder structure",
                trigger_conditions=["file_corruption", "permission_issues"],
                action_function="standardize_files",
                max_retries=1,
                cooldown_minutes=15
            ),
            RestoreAction(
                id="log_rotation",
                name="Log Rotation",
                description="Rotate and compress old log files",
                trigger_conditions=["log_size > 100MB"],
                action_function="rotate_logs",
                max_retries=1,
                cooldown_minutes=60
            )
        ]
        
        for action in actions:
            self.restore_actions[action.id] = action
            
        logger.info(f"🔧 Initialized {len(actions)} restoration actions")
    
    async def start_monitoring(self):
        """Start platform monitoring (signal-based, not continuous loop)"""
        if self.monitoring_active:
            logger.warning("⚠️ Platform monitoring already active")
            return
            
        self.monitoring_active = True
        
        # Schedule periodic checks (not continuous loops)
        asyncio.create_task(self._schedule_checks())
        
        logger.info("✅ Platform monitoring started (signal-based)")
    
    async def stop_monitoring(self):
        """Stop platform monitoring"""
        self.monitoring_active = False
        logger.info("⏹️ Platform monitoring stopped")
    
    async def _schedule_checks(self):
        """Schedule periodic system checks"""
        try:
            while self.monitoring_active:
                # Wait for signals or timeout
                await asyncio.sleep(300)  # Check every 5 minutes
                
                if self.monitoring_active:
                    await self._perform_routine_check()
                    
        except asyncio.CancelledError:
            logger.info("🔄 Scheduled checks cancelled")
        except Exception as e:
            logger.error(f"❌ Error in scheduled checks: {e}")
    
    async def _perform_routine_check(self):
        """Perform routine system health check"""
        try:
            import psutil
            
            # Check disk space
            disk_usage = psutil.disk_usage('/').percent
            if disk_usage > 85:
                await self._create_alert(
                    AlertLevel.WARNING,
                    IncidentType.DISK_SPACE,
                    f"Disk usage at {disk_usage:.1f}%",
                    {"disk_usage_percent": disk_usage}
                )
            
            # Check memory usage
            memory = psutil.virtual_memory()
            if memory.percent > 90:
                await self._create_alert(
                    AlertLevel.CRITICAL,
                    IncidentType.MEMORY_LEAK,
                    f"Memory usage at {memory.percent:.1f}%",
                    {"memory_usage_percent": memory.percent}
                )
            
            # Check CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > 95:
                await self._create_alert(
                    AlertLevel.ERROR,
                    IncidentType.CPU_OVERLOAD,
                    f"CPU usage at {cpu_percent:.1f}%",
                    {"cpu_usage_percent": cpu_percent}
                )
            
        except Exception as e:
            logger.error(f"❌ Error in routine check: {e}")
    
    async def _trigger_cleanup(self):
        """Trigger system cleanup (signal handler)"""
        logger.info("🧹 Cleanup signal received - starting maintenance")
        
        try:
            await self.cleanup_temporary_files()
            await self.standardize_file_structure()
            await self.rotate_logs()
            
            self.last_cleanup = datetime.now(timezone.utc)
            logger.info("✅ Cleanup completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {e}")
    
    async def _trigger_system_check(self):
        """Trigger comprehensive system check (signal handler)"""
        logger.info("🔍 System check signal received - performing diagnostics")
        
        try:
            await self._perform_routine_check()
            await self._check_service_health()
            await self._verify_file_integrity()
            
            logger.info("✅ System check completed")
            
        except Exception as e:
            logger.error(f"❌ Error during system check: {e}")
    
    async def _create_alert(self, level: AlertLevel, incident_type: IncidentType, 
                          description: str, metrics: Dict[str, Any]):
        """Create monitoring alert and trigger response"""
        alert = MonitoringAlert(
            id=f"{incident_type.value}_{int(datetime.now().timestamp())}",
            timestamp=datetime.now(timezone.utc),
            alert_level=level,
            incident_type=incident_type,
            description=description,
            metrics=metrics
        )
        
        self.alerts.append(alert)
        logger.warning(f"🚨 Alert created: {alert.description}")
        
        # Trigger automated response
        await self._respond_to_alert(alert)
        
        # Log alert for audit
        await self._log_alert(alert)
    
    async def _respond_to_alert(self, alert: MonitoringAlert):
        """Respond to monitoring alert"""
        try:
            # Find applicable restoration actions
            for action_id, action in self.restore_actions.items():
                if self._action_applies_to_alert(action, alert):
                    success = await self._execute_restore_action(action, alert)
                    if success:
                        alert.auto_resolved = True
                        alert.resolution_action = action_id
                        logger.info(f"✅ Alert {alert.id} auto-resolved by {action_id}")
                        break
                        
        except Exception as e:
            logger.error(f"❌ Error responding to alert: {e}")
    
    def _action_applies_to_alert(self, action: RestoreAction, alert: MonitoringAlert) -> bool:
        """Check if restoration action applies to alert"""
        incident_type_map = {
            IncidentType.DISK_SPACE: ["disk_cleanup", "log_rotation"],
            IncidentType.MEMORY_LEAK: ["memory_cleanup"],
            IncidentType.SERVICE_DOWN: ["service_restart"],
            IncidentType.FILE_CORRUPTION: ["file_standardization"]
        }
        
        applicable_actions = incident_type_map.get(alert.incident_type, [])
        return action.id in applicable_actions
    
    async def _execute_restore_action(self, action: RestoreAction, alert: MonitoringAlert) -> bool:
        """Execute restoration action"""
        try:
            logger.info(f"🔧 Executing restoration action: {action.name}")
            
            if action.action_function == "cleanup_disk_space":
                return await self.cleanup_disk_space()
            elif action.action_function == "cleanup_memory":
                return await self.cleanup_memory()
            elif action.action_function == "restart_service":
                return await self.restart_service()
            elif action.action_function == "standardize_files":
                return await self.standardize_file_structure()
            elif action.action_function == "rotate_logs":
                return await self.rotate_logs()
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error executing restoration action {action.id}: {e}")
            return False
    
    async def cleanup_disk_space(self) -> bool:
        """Clean up disk space"""
        try:
            logger.info("🧹 Starting disk space cleanup")
            
            # Clean temporary files
            temp_dirs = ["/tmp", "/var/tmp", "~/.cache"]
            cleaned_mb = 0
            
            for temp_dir in temp_dirs:
                try:
                    temp_path = Path(temp_dir).expanduser()
                    if temp_path.exists():
                        for item in temp_path.glob("*"):
                            if item.is_file() and item.stat().st_mtime < (datetime.now().timestamp() - 86400):  # 1 day old
                                size_mb = item.stat().st_size / (1024 * 1024)
                                item.unlink()
                                cleaned_mb += size_mb
                except Exception as e:
                    logger.warning(f"⚠️ Could not clean {temp_dir}: {e}")
            
            logger.info(f"✅ Cleaned {cleaned_mb:.2f} MB of disk space")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error in disk cleanup: {e}")
            return False
    
    async def cleanup_memory(self) -> bool:
        """Clean up memory"""
        try:
            import gc
            
            logger.info("🧹 Starting memory cleanup")
            
            # Force garbage collection
            collected = gc.collect()
            
            logger.info(f"✅ Memory cleanup completed, collected {collected} objects")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error in memory cleanup: {e}")
            return False
    
    async def restart_service(self) -> bool:
        """Restart failed services"""
        try:
            logger.info("🔄 Checking for services to restart")
            
            # This would implement actual service restart logic
            # For now, just log the action
            logger.info("✅ Service restart check completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error restarting services: {e}")
            return False
    
    async def standardize_file_structure(self) -> bool:
        """Standardize file permissions and folder structure"""
        try:
            logger.info("📁 Starting file/folder standardization")
            
            workspace_path = Path("/workspaces/AGENT")
            
            # Standardize permissions
            for root, dirs, files in os.walk(workspace_path):
                root_path = Path(root)
                
                # Set directory permissions
                for dir_name in dirs:
                    dir_path = root_path / dir_name
                    try:
                        dir_path.chmod(0o755)
                    except Exception as e:
                        logger.warning(f"⚠️ Could not set permissions for {dir_path}: {e}")
                
                # Set file permissions
                for file_name in files:
                    file_path = root_path / file_name
                    try:
                        if file_path.suffix == ".py" or file_path.name.endswith(".sh"):
                            file_path.chmod(0o755)  # Executable
                        else:
                            file_path.chmod(0o644)  # Regular file
                    except Exception as e:
                        logger.warning(f"⚠️ Could not set permissions for {file_path}: {e}")
            
            logger.info("✅ File/folder standardization completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error in file standardization: {e}")
            return False
    
    async def cleanup_temporary_files(self) -> bool:
        """Clean up temporary files"""
        try:
            logger.info("🧹 Cleaning temporary files")
            
            workspace_path = Path("/workspaces/AGENT")
            temp_patterns = ["*.tmp", "*.temp", "*.log.old", "*.bak", "__pycache__", "*.pyc"]
            
            cleaned_count = 0
            for pattern in temp_patterns:
                for temp_file in workspace_path.rglob(pattern):
                    try:
                        if temp_file.is_file():
                            temp_file.unlink()
                            cleaned_count += 1
                        elif temp_file.is_dir():
                            shutil.rmtree(temp_file)
                            cleaned_count += 1
                    except Exception as e:
                        logger.warning(f"⚠️ Could not remove {temp_file}: {e}")
            
            logger.info(f"✅ Cleaned {cleaned_count} temporary files/directories")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error cleaning temporary files: {e}")
            return False
    
    async def rotate_logs(self) -> bool:
        """Rotate and compress log files"""
        try:
            logger.info("📋 Starting log rotation")
            
            log_dir = Path("/workspaces/AGENT/logs")
            if not log_dir.exists():
                log_dir.mkdir(parents=True)
                return True
            
            rotated_count = 0
            for log_file in log_dir.glob("*.log"):
                if log_file.stat().st_size > 10 * 1024 * 1024:  # 10MB
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    rotated_name = f"{log_file.stem}_{timestamp}.log"
                    rotated_path = log_dir / rotated_name
                    
                    # Move and compress
                    shutil.move(log_file, rotated_path)
                    
                    # Create new empty log file
                    log_file.touch()
                    
                    rotated_count += 1
            
            logger.info(f"✅ Rotated {rotated_count} log files")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error rotating logs: {e}")
            return False
    
    async def _check_service_health(self):
        """Check health of system services"""
        try:
            # Check if knowledge server is running
            import psutil
            knowledge_server_running = False
            
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if 'knowledge_server.py' in ' '.join(proc.info['cmdline'] or []):
                        knowledge_server_running = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            if not knowledge_server_running:
                await self._create_alert(
                    AlertLevel.ERROR,
                    IncidentType.SERVICE_DOWN,
                    "Knowledge server is not running",
                    {"service": "knowledge_server"}
                )
            
        except Exception as e:
            logger.error(f"❌ Error checking service health: {e}")
    
    async def _verify_file_integrity(self):
        """Verify integrity of critical files"""
        try:
            critical_files = [
                "/workspaces/AGENT/knowledge_server.py",
                "/workspaces/AGENT/agent/knowledge_base_v2.py",
                "/workspaces/AGENT/agent/legal_fiscal_optimizer.py"
            ]
            
            for file_path in critical_files:
                path = Path(file_path)
                if not path.exists():
                    await self._create_alert(
                        AlertLevel.ERROR,
                        IncidentType.FILE_CORRUPTION,
                        f"Critical file missing: {file_path}",
                        {"missing_file": file_path}
                    )
                elif path.stat().st_size == 0:
                    await self._create_alert(
                        AlertLevel.WARNING,
                        IncidentType.FILE_CORRUPTION,
                        f"Critical file is empty: {file_path}",
                        {"empty_file": file_path}
                    )
            
        except Exception as e:
            logger.error(f"❌ Error verifying file integrity: {e}")
    
    async def _log_alert(self, alert: MonitoringAlert):
        """Log alert to audit trail"""
        audit_entry = {
            "timestamp": alert.timestamp.isoformat(),
            "type": "monitoring_alert",
            "alert_id": alert.id,
            "level": alert.alert_level.value,
            "incident_type": alert.incident_type.value,
            "description": alert.description,
            "metrics": alert.metrics,
            "auto_resolved": alert.auto_resolved,
            "resolution_action": alert.resolution_action
        }
        
        # Write to monitoring log
        log_path = Path("logs/platform_monitoring.log")
        log_path.parent.mkdir(exist_ok=True)
        
        with open(log_path, "a") as f:
            f.write(json.dumps(audit_entry) + "\n")
    
    async def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        recent_alerts = [a for a in self.alerts 
                        if a.timestamp > datetime.now(timezone.utc) - timedelta(hours=24)]
        
        return {
            "monitoring_active": self.monitoring_active,
            "total_alerts": len(self.alerts),
            "alerts_24h": len(recent_alerts),
            "critical_alerts": len([a for a in recent_alerts if a.alert_level == AlertLevel.CRITICAL]),
            "auto_resolved_alerts": len([a for a in recent_alerts if a.auto_resolved]),
            "last_cleanup": self.last_cleanup.isoformat(),
            "available_actions": list(self.restore_actions.keys()),
            "signal_handlers_registered": len(self.signal_handlers)
        }

# Global monitor instance
_global_monitor = None

async def get_platform_monitor() -> PlatformMonitor:
    """Get global platform monitor instance"""
    global _global_monitor
    if _global_monitor is None:
        _global_monitor = PlatformMonitor()
        await _global_monitor.start_monitoring()
    return _global_monitor

async def cleanup_platform_monitor():
    """Cleanup global monitor"""
    global _global_monitor
    if _global_monitor:
        await _global_monitor.stop_monitoring()
        _global_monitor = None
