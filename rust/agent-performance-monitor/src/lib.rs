use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::time::timeout;
use futures::future::join_all;
use sysinfo::System;
use anyhow::Result;
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub timestamp: String,
    pub endpoint: String,
    pub response_time_ms: f64,
    pub status_code: u16,
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSummary {
    pub endpoint: String,
    pub total_requests: usize,
    pub successful_requests: usize,
    pub failed_requests: usize,
    pub success_rate_percent: f64,
    pub response_times: ResponseTimeStats,
    pub error_distribution: HashMap<String, usize>,
    pub test_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseTimeStats {
    pub min_ms: f64,
    pub max_ms: f64,
    pub mean_ms: f64,
    pub median_ms: f64,
    pub p95_ms: f64,
    pub p99_ms: f64,
    pub stddev_ms: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemPerformance {
    pub timestamp: String,
    pub cpu_usage_percent: f32,
    pub memory_usage_percent: f32,
    pub memory_available_gb: f64,
    pub load_average: Vec<f64>,
    pub process_count: usize,
    pub thread_count: usize,
    pub network_io: NetworkIO,
    pub disk_io: DiskIO,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkIO {
    pub bytes_received_per_sec: u64,
    pub bytes_sent_per_sec: u64,
    pub packets_received_per_sec: u64,
    pub packets_sent_per_sec: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskIO {
    pub read_bytes_per_sec: u64,
    pub write_bytes_per_sec: u64,
    pub read_ops_per_sec: u64,
    pub write_ops_per_sec: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceAlert {
    pub alert_type: String,
    pub severity: String,
    pub message: String,
    pub timestamp: String,
    pub metric_value: f64,
    pub threshold: f64,
    pub endpoint: Option<String>,
}

pub struct PerformanceMonitorCore {
    system: System,
    client: reqwest::Client,
    baseline_metrics: Option<SystemPerformance>,
}

impl PerformanceMonitorCore {
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();
        
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            system,
            client,
            baseline_metrics: None,
        }
    }

    /// Perform high-performance concurrent endpoint testing
    pub async fn benchmark_endpoint(&self, url: &str, concurrent_requests: usize, total_requests: usize) -> Result<PerformanceSummary> {
        let start_time = Instant::now();
        info!("Starting performance benchmark for {} with {} concurrent requests", url, concurrent_requests);

        let mut all_metrics = Vec::new();
        let requests_per_batch = total_requests / concurrent_requests;
        let remaining_requests = total_requests % concurrent_requests;

        // Execute requests in batches to control concurrency
        for batch in 0..concurrent_requests {
            let batch_size = if batch < remaining_requests {
                requests_per_batch + 1
            } else {
                requests_per_batch
            };

            let batch_tasks: Vec<_> = (0..batch_size).map(|_| {
                let url = url.to_string();
                let client = self.client.clone();
                async move {
                    self.measure_single_request(&client, &url).await
                }
            }).collect();

            let batch_results = join_all(batch_tasks).await;
            all_metrics.extend(batch_results);
        }

        let test_duration = start_time.elapsed().as_millis() as u64;
        let summary = self.calculate_performance_summary(url, all_metrics, test_duration)?;

        info!("Performance benchmark completed: {:.2}% success rate, {:.1}ms avg response time", 
              summary.success_rate_percent, summary.response_times.mean_ms);

        Ok(summary)
    }

    async fn measure_single_request(&self, client: &reqwest::Client, url: &str) -> PerformanceMetrics {
        let start_time = Instant::now();
        let timestamp = chrono::Utc::now().to_rfc3339();

        match timeout(Duration::from_secs(15), client.get(url).send()).await {
            Ok(Ok(response)) => {
                let response_time = start_time.elapsed().as_millis() as f64;
                let status_code = response.status().as_u16();
                let success = response.status().is_success();

                PerformanceMetrics {
                    timestamp,
                    endpoint: url.to_string(),
                    response_time_ms: response_time,
                    status_code,
                    success,
                    error: if success { None } else { Some(format!("HTTP {}", status_code)) },
                }
            }
            Ok(Err(e)) => {
                let response_time = start_time.elapsed().as_millis() as f64;
                PerformanceMetrics {
                    timestamp,
                    endpoint: url.to_string(),
                    response_time_ms: response_time,
                    status_code: 0,
                    success: false,
                    error: Some(e.to_string()),
                }
            }
            Err(_) => {
                let response_time = start_time.elapsed().as_millis() as f64;
                PerformanceMetrics {
                    timestamp,
                    endpoint: url.to_string(),
                    response_time_ms: response_time,
                    status_code: 0,
                    success: false,
                    error: Some("Request timeout".to_string()),
                }
            }
        }
    }

    fn calculate_performance_summary(&self, endpoint: &str, metrics: Vec<PerformanceMetrics>, duration_ms: u64) -> Result<PerformanceSummary> {
        let total_requests = metrics.len();
        let successful_requests = metrics.iter().filter(|m| m.success).count();
        let failed_requests = total_requests - successful_requests;
        let success_rate = (successful_requests as f64 / total_requests as f64) * 100.0;

        // Calculate response time statistics for successful requests
        let successful_times: Vec<f64> = metrics.iter()
            .filter(|m| m.success)
            .map(|m| m.response_time_ms)
            .collect();

        let response_times = if successful_times.is_empty() {
            ResponseTimeStats {
                min_ms: 0.0,
                max_ms: 0.0,
                mean_ms: 0.0,
                median_ms: 0.0,
                p95_ms: 0.0,
                p99_ms: 0.0,
                stddev_ms: 0.0,
            }
        } else {
            let mut sorted_times = successful_times.clone();
            sorted_times.sort_by(|a, b| a.partial_cmp(b).unwrap());

            let min = sorted_times[0];
            let max = sorted_times[sorted_times.len() - 1];
            let mean = sorted_times.iter().sum::<f64>() / sorted_times.len() as f64;
            let median = if sorted_times.len() % 2 == 0 {
                (sorted_times[sorted_times.len() / 2 - 1] + sorted_times[sorted_times.len() / 2]) / 2.0
            } else {
                sorted_times[sorted_times.len() / 2]
            };

            let p95_idx = ((sorted_times.len() as f64) * 0.95) as usize;
            let p99_idx = ((sorted_times.len() as f64) * 0.99) as usize;
            let p95 = sorted_times.get(p95_idx.saturating_sub(1)).copied().unwrap_or(max);
            let p99 = sorted_times.get(p99_idx.saturating_sub(1)).copied().unwrap_or(max);

            let variance = sorted_times.iter()
                .map(|x| (x - mean).powi(2))
                .sum::<f64>() / sorted_times.len() as f64;
            let stddev = variance.sqrt();

            ResponseTimeStats {
                min_ms: min,
                max_ms: max,
                mean_ms: mean,
                median_ms: median,
                p95_ms: p95,
                p99_ms: p99,
                stddev_ms: stddev,
            }
        };

        // Calculate error distribution
        let mut error_distribution = HashMap::new();
        for metric in &metrics {
            if let Some(error) = &metric.error {
                *error_distribution.entry(error.clone()).or_insert(0) += 1;
            }
        }

        Ok(PerformanceSummary {
            endpoint: endpoint.to_string(),
            total_requests,
            successful_requests,
            failed_requests,
            success_rate_percent: success_rate,
            response_times,
            error_distribution,
            test_duration_ms: duration_ms,
        })
    }

    /// Get comprehensive system performance metrics
    pub fn get_system_performance(&mut self) -> Result<SystemPerformance> {
        self.system.refresh_all();

    let cpu_usage = self.system.global_cpu_info().cpu_usage();
        let memory = self.system.total_memory();
        let used_memory = self.system.used_memory();
        let available_memory = memory - used_memory;

        // Calculate load average (simplified)
        let load_average = vec![
            cpu_usage as f64 / 100.0,
            cpu_usage as f64 / 100.0,
            cpu_usage as f64 / 100.0,
        ];

        let process_count = self.system.processes().len();
        let thread_count = self.system.processes().values()
            .map(|_p| 1) // Simplified thread count
            .sum();

        // Network and disk I/O (simplified for demo)
        let network_io = NetworkIO {
            bytes_received_per_sec: 0, // Would need historical data
            bytes_sent_per_sec: 0,
            packets_received_per_sec: 0,
            packets_sent_per_sec: 0,
        };

        let disk_io = DiskIO {
            read_bytes_per_sec: 0, // Would need historical data
            write_bytes_per_sec: 0,
            read_ops_per_sec: 0,
            write_ops_per_sec: 0,
        };

        Ok(SystemPerformance {
            timestamp: chrono::Utc::now().to_rfc3339(),
            cpu_usage_percent: cpu_usage,
            memory_usage_percent: (used_memory as f32 / memory as f32) * 100.0,
            memory_available_gb: available_memory as f64 / (1024.0 * 1024.0 * 1024.0),
            load_average,
            process_count,
            thread_count,
            network_io,
            disk_io,
        })
    }

    /// Detect performance anomalies
    pub fn detect_performance_alerts(&self, current: &SystemPerformance, thresholds: &PerformanceThresholds) -> Vec<PerformanceAlert> {
        let mut alerts = Vec::new();
        let timestamp = chrono::Utc::now().to_rfc3339();

        // CPU usage alert
        if current.cpu_usage_percent > thresholds.cpu_usage_percent {
            alerts.push(PerformanceAlert {
                alert_type: "high_cpu_usage".to_string(),
                severity: if current.cpu_usage_percent > 90.0 { "critical" } else { "warning" }.to_string(),
                message: format!("High CPU usage: {:.1}%", current.cpu_usage_percent),
                timestamp: timestamp.clone(),
                metric_value: current.cpu_usage_percent as f64,
                threshold: thresholds.cpu_usage_percent as f64,
                endpoint: None,
            });
        }

        // Memory usage alert
        if current.memory_usage_percent > thresholds.memory_usage_percent {
            alerts.push(PerformanceAlert {
                alert_type: "high_memory_usage".to_string(),
                severity: if current.memory_usage_percent > 95.0 { "critical" } else { "warning" }.to_string(),
                message: format!("High memory usage: {:.1}%", current.memory_usage_percent),
                timestamp: timestamp.clone(),
                metric_value: current.memory_usage_percent as f64,
                threshold: thresholds.memory_usage_percent as f64,
                endpoint: None,
            });
        }

        // Process count alert
        if current.process_count > thresholds.max_processes {
            alerts.push(PerformanceAlert {
                alert_type: "high_process_count".to_string(),
                severity: "warning".to_string(),
                message: format!("High process count: {}", current.process_count),
                timestamp: timestamp.clone(),
                metric_value: current.process_count as f64,
                threshold: thresholds.max_processes as f64,
                endpoint: None,
            });
        }

        alerts
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceThresholds {
    pub cpu_usage_percent: f32,
    pub memory_usage_percent: f32,
    pub max_processes: usize,
    pub max_response_time_ms: f64,
    pub min_success_rate_percent: f64,
}

impl Default for PerformanceThresholds {
    fn default() -> Self {
        Self {
            cpu_usage_percent: 80.0,
            memory_usage_percent: 85.0,
            max_processes: 1000,
            max_response_time_ms: 5000.0,
            min_success_rate_percent: 95.0,
        }
    }
}

// Python bindings
#[pymodule]
fn agent_performance_monitor(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyPerformanceMonitor>()?;
    Ok(())
}

#[pyclass]
struct PyPerformanceMonitor {
    core: PerformanceMonitorCore,
    runtime: tokio::runtime::Runtime,
    thresholds: PerformanceThresholds,
}

#[pymethods]
impl PyPerformanceMonitor {
    #[new]
    fn new() -> PyResult<Self> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to create async runtime: {}", e)))?;
        
        Ok(PyPerformanceMonitor {
            core: PerformanceMonitorCore::new(),
            runtime,
            thresholds: PerformanceThresholds::default(),
        })
    }

    fn benchmark_endpoint(&self, url: &str, concurrent_requests: Option<usize>, total_requests: Option<usize>) -> PyResult<String> {
        let concurrent = concurrent_requests.unwrap_or(10);
        let total = total_requests.unwrap_or(100);

        let result = self.runtime.block_on(async {
            self.core.benchmark_endpoint(url, concurrent, total).await
        });

        match result {
            Ok(summary) => serde_json::to_string(&summary)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Benchmark error: {}", e))),
        }
    }

    fn get_system_performance(&mut self) -> PyResult<String> {
        match self.core.get_system_performance() {
            Ok(performance) => serde_json::to_string(&performance)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("System performance error: {}", e))),
        }
    }

    fn detect_performance_alerts(&mut self) -> PyResult<String> {
        match self.core.get_system_performance() {
            Ok(performance) => {
                let alerts = self.core.detect_performance_alerts(&performance, &self.thresholds);
                serde_json::to_string(&alerts)
                    .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e)))
            }
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Performance alerts error: {}", e))),
        }
    }

    fn set_thresholds(&mut self, cpu_percent: Option<f32>, memory_percent: Option<f32>, max_processes: Option<usize>) -> PyResult<()> {
        if let Some(cpu) = cpu_percent {
            self.thresholds.cpu_usage_percent = cpu;
        }
        if let Some(memory) = memory_percent {
            self.thresholds.memory_usage_percent = memory;
        }
        if let Some(processes) = max_processes {
            self.thresholds.max_processes = processes;
        }
        Ok(())
    }
}
