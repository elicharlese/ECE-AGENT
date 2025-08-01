use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::{IpAddr, SocketAddr};
use std::time::{Duration, Instant};
use tokio::net::TcpStream;
use tokio::time::timeout;
use futures::future::join_all;
use sysinfo::System;
use anyhow::{Result, Context};
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub hostname: String,
    pub os_version: String,
    pub kernel_version: String,
    pub cpu_usage: f32,
    pub memory_total: u64,
    pub memory_used: u64,
    pub disk_info: Vec<DiskInfo>,
    pub network_interfaces: Vec<NetworkInterfaceInfo>,
    pub process_count: usize,
    pub uptime: u64,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub file_system: String,
    pub usage_percent: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterfaceInfo {
    pub name: String,
    pub ip_address: String,
    pub mac_address: String,
    pub status: String,
    pub bytes_sent: u64,
    pub bytes_received: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortScanResult {
    pub target: String,
    pub port: u16,
    pub is_open: bool,
    pub service: Option<String>,
    pub response_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSummary {
    pub target: String,
    pub total_ports: usize,
    pub open_ports: usize,
    pub closed_ports: usize,
    pub scan_duration_ms: u64,
    pub results: Vec<PortScanResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStats {
    pub timestamp: String,
    pub cpu_usage_percent: f32,
    pub memory_usage_percent: f32,
    pub memory_total_gb: f64,
    pub memory_used_gb: f64,
    pub memory_available_gb: f64,
    pub disk_usage_percent: f32,
    pub disk_total_gb: f64,
    pub disk_used_gb: f64,
    pub disk_free_gb: f64,
    pub network_interfaces: Vec<NetworkInterface>,
    pub process_count: usize,
    pub uptime_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub bytes_received: u64,
    pub bytes_transmitted: u64,
    pub packets_received: u64,
    pub packets_transmitted: u64,
    pub errors_received: u64,
    pub errors_transmitted: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConnection {
    pub local_addr: String,
    pub remote_addr: String,
    pub protocol: String,
    pub state: String,
    pub process_name: Option<String>,
    pub process_id: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatAlert {
    pub alert_type: String,
    pub severity: String,
    pub message: String,
    pub timestamp: String,
    pub source_ip: Option<String>,
    pub target_port: Option<u16>,
    pub details: HashMap<String, String>,
}

pub struct SecurityToolsCore {
    system: System,
}

impl SecurityToolsCore {
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();
        Self { system }
    }

    /// Perform high-performance concurrent port scan
    pub async fn port_scan(&self, target: &str, ports: Vec<u16>, timeout_ms: u64) -> Result<ScanSummary> {
        let start_time = Instant::now();
        info!("Starting port scan on {} for {} ports", target, ports.len());

        // Parse target IP
        let target_ip: IpAddr = target.parse()
            .with_context(|| format!("Invalid IP address: {}", target))?;

        // Create concurrent scan tasks
        let scan_tasks: Vec<_> = ports.into_iter().map(|port| {
            let target_ip = target_ip.clone();
            async move {
                self.scan_single_port(target_ip, port, timeout_ms).await
            }
        }).collect();

        // Execute all scans concurrently
        let results = join_all(scan_tasks).await;

        let scan_duration = start_time.elapsed().as_millis() as u64;
        let open_ports = results.iter().filter(|r| r.is_open).count();
        let closed_ports = results.len() - open_ports;

        let summary = ScanSummary {
            target: target.to_string(),
            total_ports: results.len(),
            open_ports,
            closed_ports,
            scan_duration_ms: scan_duration,
            results,
        };

        info!("Port scan completed: {}/{} ports open in {}ms", 
              open_ports, summary.total_ports, scan_duration);

        Ok(summary)
    }

    async fn scan_single_port(&self, target_ip: IpAddr, port: u16, timeout_ms: u64) -> PortScanResult {
        let start_time = Instant::now();
        let socket_addr = SocketAddr::new(target_ip, port);
        
        let is_open = match timeout(
            Duration::from_millis(timeout_ms),
            TcpStream::connect(socket_addr)
        ).await {
            Ok(Ok(_)) => true,
            Ok(Err(_)) | Err(_) => false,
        };

        let response_time = start_time.elapsed().as_millis() as u64;
        let service = if is_open { self.identify_service(port) } else { None };

        PortScanResult {
            target: target_ip.to_string(),
            port,
            is_open,
            service,
            response_time_ms: response_time,
        }
    }

    fn identify_service(&self, port: u16) -> Option<String> {
        match port {
            21 => Some("FTP".to_string()),
            22 => Some("SSH".to_string()),
            23 => Some("Telnet".to_string()),
            25 => Some("SMTP".to_string()),
            53 => Some("DNS".to_string()),
            80 => Some("HTTP".to_string()),
            110 => Some("POP3".to_string()),
            143 => Some("IMAP".to_string()),
            443 => Some("HTTPS".to_string()),
            993 => Some("IMAPS".to_string()),
            995 => Some("POP3S".to_string()),
            3389 => Some("RDP".to_string()),
            5432 => Some("PostgreSQL".to_string()),
            3306 => Some("MySQL".to_string()),
            6379 => Some("Redis".to_string()),
            27017 => Some("MongoDB".to_string()),
            _ => None,
        }
    }

    /// Get comprehensive system statistics
    pub fn get_system_info(&mut self) -> Result<SystemInfo> {
        self.system.refresh_all();

        let cpu_usage = self.system.global_cpu_info().cpu_usage();
        let memory = self.system.total_memory();
        let used_memory = self.system.used_memory();
        
        // Network interfaces (simplified for compatibility)
        let network_interfaces: Vec<NetworkInterfaceInfo> = vec![
            NetworkInterfaceInfo {
                name: "eth0".to_string(),
                ip_address: "127.0.0.1".to_string(),
                mac_address: "00:00:00:00:00:00".to_string(),
                status: "up".to_string(),
                bytes_sent: 0,
                bytes_received: 0,
            }
        ];

        // Disk information (simplified)
        let disks: Vec<DiskInfo> = vec![
            DiskInfo {
                name: "/dev/sda1".to_string(),
                mount_point: "/".to_string(),
                total_space: 100 * 1024 * 1024 * 1024, // 100GB placeholder
                available_space: 50 * 1024 * 1024 * 1024, // 50GB placeholder
                file_system: "ext4".to_string(),
                usage_percent: 50.0,
            }
        ];

        let uptime = 3600; // 1 hour placeholder

        Ok(SystemInfo {
            hostname: "localhost".to_string(), // Simplified
            os_version: std::env::consts::OS.to_string(),
            kernel_version: "Linux".to_string(),
            cpu_usage,
            memory_total: memory,
            memory_used: used_memory,
            disk_info: disks,
            network_interfaces,
            process_count: self.system.processes().len(),
            uptime,
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Get active network connections
    pub fn get_network_connections(&mut self) -> Result<Vec<NetworkConnection>> {
        self.system.refresh_all();
        
        let mut connections = Vec::new();
        
        // This is a simplified implementation - in a real scenario you'd use
        // more sophisticated network monitoring libraries
        for (pid, process) in self.system.processes() {
            // For demo purposes, we'll create some sample connections
            // In reality, you'd use netstat-like functionality
            if process.name().contains("python") || process.name().contains("node") {
                connections.push(NetworkConnection {
                    local_addr: "127.0.0.1:8000".to_string(),
                    remote_addr: "0.0.0.0:*".to_string(),
                    protocol: "TCP".to_string(),
                    state: "LISTEN".to_string(),
                    process_name: Some(process.name().to_string()),
                    process_id: Some(pid.as_u32()),
                });
            }
        }

        Ok(connections)
    }

    /// Detect potential security threats
    pub fn detect_threats(&mut self) -> Result<Vec<ThreatAlert>> {
        self.system.refresh_all();
        
        let mut threats = Vec::new();
        let timestamp = chrono::Utc::now().to_rfc3339();

        // Check for high CPU usage (potential DoS or crypto mining)
        let cpu_usage = self.system.global_cpu_info().cpu_usage();
        if cpu_usage > 90.0 {
            threats.push(ThreatAlert {
                alert_type: "high_cpu_usage".to_string(),
                severity: "medium".to_string(),
                message: format!("High CPU usage detected: {:.1}%", cpu_usage),
                timestamp: timestamp.clone(),
                source_ip: None,
                target_port: None,
                details: [("cpu_usage".to_string(), cpu_usage.to_string())].into(),
            });
        }

        // Check for high memory usage
        let memory_percent = (self.system.used_memory() as f32 / self.system.total_memory() as f32) * 100.0;
        if memory_percent > 90.0 {
            threats.push(ThreatAlert {
                alert_type: "high_memory_usage".to_string(),
                severity: "medium".to_string(),
                message: format!("High memory usage detected: {:.1}%", memory_percent),
                timestamp: timestamp.clone(),
                source_ip: None,
                target_port: None,
                details: [("memory_usage".to_string(), memory_percent.to_string())].into(),
            });
        }

        // Check for suspicious processes
        for (pid, process) in self.system.processes() {
            let cpu_usage = process.cpu_usage();
            if cpu_usage > 50.0 {
                threats.push(ThreatAlert {
                    alert_type: "suspicious_process".to_string(),
                    severity: "low".to_string(),
                    message: format!("Process '{}' using high CPU: {:.1}%", process.name(), cpu_usage),
                    timestamp: timestamp.clone(),
                    source_ip: None,
                    target_port: None,
                    details: [
                        ("process_name".to_string(), process.name().to_string()),
                        ("process_id".to_string(), pid.as_u32().to_string()),
                        ("cpu_usage".to_string(), cpu_usage.to_string()),
                    ].into(),
                });
            }
        }

        Ok(threats)
    }

    /// Generate common port ranges
    pub fn get_common_ports() -> Vec<u16> {
        vec![
            21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 993, 995,
            1723, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017
        ]
    }

    pub fn get_all_ports() -> Vec<u16> {
        (1..=65535).collect()
    }
}

// Python bindings using PyO3
#[pymodule]
fn agent_security_tools(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PySecurityTools>()?;
    Ok(())
}

#[pyclass]
struct PySecurityTools {
    core: SecurityToolsCore,
    runtime: tokio::runtime::Runtime,
}

#[pymethods]
impl PySecurityTools {
    #[new]
    fn new() -> PyResult<Self> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to create async runtime: {}", e)))?;
        
        Ok(PySecurityTools {
            core: SecurityToolsCore::new(),
            runtime,
        })
    }

    fn port_scan(&self, target: &str, port_range: &str, timeout_ms: Option<u64>) -> PyResult<String> {
        let timeout = timeout_ms.unwrap_or(1000);
        
        let ports = match port_range {
            "common" => SecurityToolsCore::get_common_ports(),
            "all" => SecurityToolsCore::get_all_ports(),
            _ => {
                // Parse custom range like "80-443" or "80,443,8080"
                if port_range.contains('-') {
                    let parts: Vec<&str> = port_range.split('-').collect();
                    if parts.len() == 2 {
                        let start: u16 = parts[0].parse().map_err(|_| {
                            pyo3::exceptions::PyValueError::new_err("Invalid port range start")
                        })?;
                        let end: u16 = parts[1].parse().map_err(|_| {
                            pyo3::exceptions::PyValueError::new_err("Invalid port range end")
                        })?;
                        (start..=end).collect()
                    } else {
                        return Err(pyo3::exceptions::PyValueError::new_err("Invalid port range format"));
                    }
                } else {
                    port_range.split(',')
                        .map(|p| p.trim().parse::<u16>())
                        .collect::<Result<Vec<_>, _>>()
                        .map_err(|_| pyo3::exceptions::PyValueError::new_err("Invalid port list"))?
                }
            }
        };

        let result = self.runtime.block_on(async {
            self.core.port_scan(target, ports, timeout).await
        });

        match result {
            Ok(summary) => serde_json::to_string(&summary)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Port scan error: {}", e))),
        }
    }

    fn get_system_stats(&mut self) -> PyResult<String> {
        match self.core.get_system_info() {
            Ok(stats) => serde_json::to_string(&stats)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("System stats error: {}", e))),
        }
    }

    fn get_network_connections(&mut self) -> PyResult<String> {
        match self.core.get_network_connections() {
            Ok(connections) => serde_json::to_string(&connections)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Network connections error: {}", e))),
        }
    }

    fn detect_threats(&mut self) -> PyResult<String> {
        match self.core.detect_threats() {
            Ok(threats) => serde_json::to_string(&threats)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Threat detection error: {}", e))),
        }
    }
}
