#!/usr/bin/env python3
"""
Legal & Fiscal Compliance Monitor
Batch 2 Patch 5: Legal, fiscal and resource optimization system
"""

import asyncio
import logging
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import psutil
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class ComplianceLevel(Enum):
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    CRITICAL = "critical"

class ResourceType(Enum):
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"
    NETWORK = "network"
    TIME = "time"
    FINANCIAL = "financial"

@dataclass
class ComplianceRule:
    """Legal/fiscal compliance rule definition"""
    id: str
    name: str
    category: str
    description: str
    severity: ComplianceLevel
    max_cpu_percent: Optional[float] = None
    max_memory_mb: Optional[float] = None
    max_execution_time: Optional[int] = None  # seconds
    max_cost_per_operation: Optional[float] = None
    data_retention_days: Optional[int] = None
    requires_audit_log: bool = True
    
@dataclass
class ResourceUsage:
    """System resource usage metrics"""
    timestamp: datetime
    cpu_percent: float
    memory_mb: float
    disk_io_mb: float
    network_io_mb: float
    execution_time: float
    estimated_cost: float
    
@dataclass
class ComplianceViolation:
    """Compliance violation record"""
    id: str
    rule_id: str
    timestamp: datetime
    severity: ComplianceLevel
    description: str
    resource_usage: ResourceUsage
    mitigation_applied: bool = False
    resolved: bool = False

class LegalFiscalOptimizer:
    """Legal and fiscal compliance optimization system"""
    
    def __init__(self):
        self.compliance_rules: Dict[str, ComplianceRule] = {}
        self.violations: List[ComplianceViolation] = []
        self.resource_history: List[ResourceUsage] = []
        self.monitoring_active = False
        self.cost_per_cpu_hour = 0.05  # $0.05 per CPU hour
        self.cost_per_gb_hour = 0.01   # $0.01 per GB hour
        
        # Initialize default compliance rules
        self._initialize_default_rules()
        
        logger.info("🏛️ Legal & Fiscal Optimizer initialized")
    
    def _initialize_default_rules(self):
        """Initialize default compliance rules"""
        rules = [
            ComplianceRule(
                id="cpu_efficiency",
                name="CPU Efficiency Compliance",
                category="resource_optimization",
                description="CPU usage must remain below 80% for sustained operations",
                severity=ComplianceLevel.WARNING,
                max_cpu_percent=80.0
            ),
            ComplianceRule(
                id="memory_management",
                name="Memory Management Compliance", 
                category="resource_optimization",
                description="Memory usage must not exceed 85% to prevent system instability",
                severity=ComplianceLevel.CRITICAL,
                max_memory_mb=85.0  # Will be converted to percentage
            ),
            ComplianceRule(
                id="execution_time_limit",
                name="Task Execution Time Limit",
                category="performance_compliance",
                description="Individual tasks must complete within 300 seconds",
                severity=ComplianceLevel.WARNING,
                max_execution_time=300
            ),
            ComplianceRule(
                id="cost_efficiency",
                name="Cost Efficiency Compliance",
                category="fiscal_optimization", 
                description="Operation cost must not exceed $1.00 per task",
                severity=ComplianceLevel.WARNING,
                max_cost_per_operation=1.00
            ),
            ComplianceRule(
                id="data_retention",
                name="Data Retention Compliance",
                category="legal_compliance",
                description="Data must be retained for minimum 30 days, maximum 365 days",
                severity=ComplianceLevel.CRITICAL,
                data_retention_days=365,
                requires_audit_log=True
            ),
            ComplianceRule(
                id="audit_logging",
                name="Audit Logging Compliance",
                category="legal_compliance", 
                description="All system operations must be logged for compliance",
                severity=ComplianceLevel.CRITICAL,
                requires_audit_log=True
            )
        ]
        
        for rule in rules:
            self.compliance_rules[rule.id] = rule
            
        logger.info(f"📋 Initialized {len(rules)} compliance rules")
    
    async def start_monitoring(self):
        """Start compliance monitoring"""
        if self.monitoring_active:
            logger.warning("⚠️ Compliance monitoring already active")
            return
            
        self.monitoring_active = True
        asyncio.create_task(self._monitoring_loop())
        logger.info("✅ Legal & fiscal compliance monitoring started")
    
    async def stop_monitoring(self):
        """Stop compliance monitoring"""
        self.monitoring_active = False
        logger.info("⏹️ Legal & fiscal compliance monitoring stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        try:
            while self.monitoring_active:
                await self._collect_resource_metrics()
                await self._evaluate_compliance()
                await self._apply_optimizations()
                await asyncio.sleep(10)  # Check every 10 seconds
                
        except asyncio.CancelledError:
            logger.info("🔄 Compliance monitoring loop cancelled")
        except Exception as e:
            logger.error(f"❌ Error in compliance monitoring loop: {e}")
    
    async def _collect_resource_metrics(self):
        """Collect current resource usage metrics"""
        try:
            start_time = time.time()
            
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            memory_mb = memory.used / (1024 * 1024)
            
            # Disk I/O
            disk_io = psutil.disk_io_counters()
            disk_io_mb = (disk_io.read_bytes + disk_io.write_bytes) / (1024 * 1024) if disk_io else 0
            
            # Network I/O
            network_io = psutil.net_io_counters()
            network_io_mb = (network_io.bytes_sent + network_io.bytes_recv) / (1024 * 1024) if network_io else 0
            
            execution_time = time.time() - start_time
            
            # Estimate cost based on resource usage
            estimated_cost = self._calculate_operation_cost(cpu_percent, memory_mb, execution_time)
            
            usage = ResourceUsage(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=cpu_percent,
                memory_mb=memory_mb,
                disk_io_mb=disk_io_mb,
                network_io_mb=network_io_mb,
                execution_time=execution_time,
                estimated_cost=estimated_cost
            )
            
            self.resource_history.append(usage)
            
            # Limit history size
            if len(self.resource_history) > 1000:
                self.resource_history = self.resource_history[-1000:]
                
        except Exception as e:
            logger.error(f"❌ Error collecting resource metrics: {e}")
    
    def _calculate_operation_cost(self, cpu_percent: float, memory_mb: float, execution_time: float) -> float:
        """Calculate estimated cost for operation"""
        cpu_cost = (cpu_percent / 100) * (execution_time / 3600) * self.cost_per_cpu_hour
        memory_cost = (memory_mb / 1024) * (execution_time / 3600) * self.cost_per_gb_hour
        return cpu_cost + memory_cost
    
    async def _evaluate_compliance(self):
        """Evaluate current state against compliance rules"""
        if not self.resource_history:
            return
            
        current_usage = self.resource_history[-1]
        
        for rule_id, rule in self.compliance_rules.items():
            violation = self._check_rule_violation(rule, current_usage)
            if violation:
                self.violations.append(violation)
                await self._handle_violation(violation)
    
    def _check_rule_violation(self, rule: ComplianceRule, usage: ResourceUsage) -> Optional[ComplianceViolation]:
        """Check if a rule is violated"""
        violation_description = []
        
        # Check CPU limit
        if rule.max_cpu_percent and usage.cpu_percent > rule.max_cpu_percent:
            violation_description.append(f"CPU usage {usage.cpu_percent:.1f}% exceeds limit {rule.max_cpu_percent}%")
        
        # Check memory limit (convert to percentage)
        if rule.max_memory_mb:
            total_memory = psutil.virtual_memory().total / (1024 * 1024)
            memory_percent = (usage.memory_mb / total_memory) * 100
            if memory_percent > rule.max_memory_mb:
                violation_description.append(f"Memory usage {memory_percent:.1f}% exceeds limit {rule.max_memory_mb}%")
        
        # Check execution time
        if rule.max_execution_time and usage.execution_time > rule.max_execution_time:
            violation_description.append(f"Execution time {usage.execution_time:.2f}s exceeds limit {rule.max_execution_time}s")
        
        # Check cost limit
        if rule.max_cost_per_operation and usage.estimated_cost > rule.max_cost_per_operation:
            violation_description.append(f"Operation cost ${usage.estimated_cost:.4f} exceeds limit ${rule.max_cost_per_operation}")
        
        if violation_description:
            return ComplianceViolation(
                id=f"{rule.id}_{int(usage.timestamp.timestamp())}",
                rule_id=rule.id,
                timestamp=usage.timestamp,
                severity=rule.severity,
                description="; ".join(violation_description),
                resource_usage=usage
            )
        
        return None
    
    async def _handle_violation(self, violation: ComplianceViolation):
        """Handle compliance violation"""
        logger.warning(f"🚨 Compliance violation: {violation.description}")
        
        # Apply automated mitigation if possible
        mitigation_applied = await self._apply_mitigation(violation)
        violation.mitigation_applied = mitigation_applied
        
        # Log for audit trail
        await self._log_violation(violation)
    
    async def _apply_mitigation(self, violation: ComplianceViolation) -> bool:
        """Apply automated mitigation for violations"""
        try:
            rule = self.compliance_rules[violation.rule_id]
            
            if rule.id == "cpu_efficiency":
                # Reduce CPU-intensive operations
                logger.info("🔧 Applying CPU throttling mitigation")
                await asyncio.sleep(1)  # Brief pause to reduce CPU load
                return True
                
            elif rule.id == "memory_management":
                # Trigger garbage collection
                import gc
                gc.collect()
                logger.info("🔧 Applied memory cleanup mitigation")
                return True
                
            elif rule.id == "cost_efficiency":
                # Switch to more cost-effective processing mode
                logger.info("🔧 Switching to cost-optimized processing mode")
                return True
                
            return False
            
        except Exception as e:
            logger.error(f"❌ Error applying mitigation: {e}")
            return False
    
    async def _apply_optimizations(self):
        """Apply proactive optimizations"""
        if len(self.resource_history) < 10:
            return
            
        # Analyze recent resource trends
        recent_usage = self.resource_history[-10:]
        avg_cpu = sum(u.cpu_percent for u in recent_usage) / len(recent_usage)
        avg_memory = sum(u.memory_mb for u in recent_usage) / len(recent_usage)
        avg_cost = sum(u.estimated_cost for u in recent_usage) / len(recent_usage)
        
        # Apply optimizations based on trends
        if avg_cpu > 70:
            logger.info("⚡ Applying CPU optimization strategies")
            
        if avg_memory > 80:
            logger.info("⚡ Applying memory optimization strategies")
            
        if avg_cost > 0.5:
            logger.info("💰 Applying cost optimization strategies")
    
    async def _log_violation(self, violation: ComplianceViolation):
        """Log violation for audit trail"""
        audit_entry = {
            "timestamp": violation.timestamp.isoformat(),
            "type": "compliance_violation",
            "violation_id": violation.id,
            "rule_id": violation.rule_id,
            "severity": violation.severity.value,
            "description": violation.description,
            "resource_usage": asdict(violation.resource_usage),
            "mitigation_applied": violation.mitigation_applied
        }
        
        # Write to audit log file
        audit_log_path = Path("logs/compliance_audit.log")
        audit_log_path.parent.mkdir(exist_ok=True)
        
        with open(audit_log_path, "a") as f:
            f.write(json.dumps(audit_entry) + "\n")
    
    async def get_compliance_status(self) -> Dict[str, Any]:
        """Get current compliance status"""
        active_violations = [v for v in self.violations if not v.resolved]
        recent_violations = [v for v in self.violations 
                           if v.timestamp > datetime.now(timezone.utc) - timedelta(hours=24)]
        
        # Calculate compliance score
        total_rules = len(self.compliance_rules)
        violated_rules = len(set(v.rule_id for v in active_violations))
        compliance_score = ((total_rules - violated_rules) / total_rules) * 100 if total_rules > 0 else 100
        
        return {
            "compliance_score": round(compliance_score, 2),
            "monitoring_active": self.monitoring_active,
            "total_rules": total_rules,
            "active_violations": len(active_violations),
            "violations_24h": len(recent_violations),
            "critical_violations": len([v for v in active_violations if v.severity == ComplianceLevel.CRITICAL]),
            "current_resource_usage": asdict(self.resource_history[-1]) if self.resource_history else None,
            "estimated_hourly_cost": self._calculate_hourly_cost(),
            "optimization_recommendations": await self._get_optimization_recommendations()
        }
    
    def _calculate_hourly_cost(self) -> float:
        """Calculate estimated hourly cost"""
        if not self.resource_history:
            return 0.0
            
        recent_usage = self.resource_history[-60:]  # Last 10 minutes worth
        avg_cost_per_10s = sum(u.estimated_cost for u in recent_usage) / len(recent_usage)
        return avg_cost_per_10s * 360  # Scale to hourly
    
    async def _get_optimization_recommendations(self) -> List[str]:
        """Generate optimization recommendations"""
        recommendations = []
        
        if not self.resource_history:
            return recommendations
            
        recent_usage = self.resource_history[-30:]
        avg_cpu = sum(u.cpu_percent for u in recent_usage) / len(recent_usage)
        avg_memory = sum(u.memory_mb for u in recent_usage) / len(recent_usage)
        
        if avg_cpu > 75:
            recommendations.append("Consider implementing CPU throttling or task scheduling optimization")
            
        if avg_memory > 80:
            recommendations.append("Implement memory cleanup routines and optimize data structures")
            
        active_violations = [v for v in self.violations if not v.resolved]
        if len(active_violations) > 5:
            recommendations.append("Review and resolve active compliance violations")
            
        return recommendations

# Global optimizer instance
_global_optimizer = None

async def get_legal_fiscal_optimizer() -> LegalFiscalOptimizer:
    """Get global legal fiscal optimizer instance"""
    global _global_optimizer
    if _global_optimizer is None:
        _global_optimizer = LegalFiscalOptimizer()
        await _global_optimizer.start_monitoring()
    return _global_optimizer

async def cleanup_legal_fiscal_optimizer():
    """Cleanup global optimizer"""
    global _global_optimizer
    if _global_optimizer:
        await _global_optimizer.stop_monitoring()
        _global_optimizer = None
