#!/usr/bin/env python3
"""
AGENT Health Dashboard
Web-based dashboard for monitoring AGENT platform health
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List
import uvicorn

# Import our monitoring modules
from health_monitor import HealthMonitor
from performance_monitor import PerformanceMonitor

app = FastAPI(title="AGENT Health Dashboard", version="1.0.0")

# Global monitors
health_monitor = HealthMonitor()
performance_monitor = PerformanceMonitor()

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    """Serve the health dashboard HTML"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AGENT Health Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
            .metric-label { color: #666; font-size: 0.9em; }
            .status-good { color: #27ae60; }
            .status-warning { color: #f39c12; }
            .status-critical { color: #e74c3c; }
            .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .alerts { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
            .alert-critical { background: #ffebee; border-left: 4px solid #e74c3c; }
            .alert-warning { background: #fff8e1; border-left: 4px solid #f39c12; }
            .alert-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
            .refresh-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
            .refresh-btn:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 AGENT Health Dashboard</h1>
                <p>Real-time monitoring of your AI agent platform</p>
                <button class="refresh-btn" onclick="refreshData()">🔄 Refresh Data</button>
            </div>
            
            <div class="metrics-grid" id="metrics-grid">
                <!-- Metrics will be loaded here -->
            </div>
            
            <div class="chart-container">
                <h3>Response Time Trends</h3>
                <canvas id="responseTimeChart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>System Resource Usage</h3>
                <canvas id="resourceChart" width="400" height="200"></canvas>
            </div>
            
            <div class="alerts" id="alerts">
                <h3>🚨 Active Alerts</h3>
                <!-- Alerts will be loaded here -->
            </div>
        </div>
        
        <script>
            let responseTimeChart, resourceChart;
            
            async function loadHealthData() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    updateMetrics(data);
                    updateCharts(data);
                    updateAlerts(data);
                } catch (error) {
                    console.error('Failed to load health data:', error);
                }
            }
            
            function updateMetrics(data) {
                const grid = document.getElementById('metrics-grid');
                
                const uptime = data.uptime_seconds ? Math.floor(data.uptime_seconds / 3600) : 0;
                const overallStatus = data.overall_healthy ? 'good' : 'critical';
                const endpointHealth = data.endpoint_health ? data.endpoint_health.health_percent : 0;
                const cpuUsage = data.system_health ? data.system_health.cpu_percent : 0;
                const memoryUsage = data.system_health ? data.system_health.memory_percent : 0;
                
                grid.innerHTML = `
                    <div class="metric-card">
                        <div class="metric-label">Overall Status</div>
                        <div class="metric-value status-${overallStatus}">
                            ${data.overall_healthy ? '✅ Healthy' : '❌ Issues'}
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Uptime</div>
                        <div class="metric-value status-good">${uptime}h</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Endpoint Health</div>
                        <div class="metric-value status-${endpointHealth >= 90 ? 'good' : endpointHealth >= 70 ? 'warning' : 'critical'}">
                            ${endpointHealth.toFixed(1)}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">CPU Usage</div>
                        <div class="metric-value status-${cpuUsage < 70 ? 'good' : cpuUsage < 85 ? 'warning' : 'critical'}">
                            ${cpuUsage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Memory Usage</div>
                        <div class="metric-value status-${memoryUsage < 70 ? 'good' : memoryUsage < 85 ? 'warning' : 'critical'}">
                            ${memoryUsage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">AI Model Status</div>
                        <div class="metric-value status-${data.ai_model_health && data.ai_model_health.is_healthy ? 'good' : 'critical'}">
                            ${data.ai_model_health && data.ai_model_health.is_healthy ? '🧠 Active' : '⚠️ Issues'}
                        </div>
                    </div>
                `;
            }
            
            function updateCharts(data) {
                // Response Time Chart
                if (!responseTimeChart) {
                    const ctx = document.getElementById('responseTimeChart').getContext('2d');
                    responseTimeChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: [],
                            datasets: [{
                                label: 'Response Time (ms)',
                                data: [],
                                borderColor: '#3498db',
                                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }
                    });
                }
                
                // Resource Usage Chart
                if (!resourceChart) {
                    const ctx = document.getElementById('resourceChart').getContext('2d');
                    resourceChart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['CPU', 'Memory', 'Available'],
                            datasets: [{
                                data: [0, 0, 100],
                                backgroundColor: ['#e74c3c', '#f39c12', '#27ae60']
                            }]
                        },
                        options: {
                            responsive: true
                        }
                    });
                }
                
                // Update resource chart with current data
                if (data.system_health) {
                    const cpu = data.system_health.cpu_percent || 0;
                    const memory = data.system_health.memory_percent || 0;
                    const available = 100 - Math.max(cpu, memory);
                    
                    resourceChart.data.datasets[0].data = [cpu, memory, available];
                    resourceChart.update();
                }
            }
            
            function updateAlerts(data) {
                const alertsContainer = document.getElementById('alerts');
                const alerts = [];
                
                // Check for various alert conditions
                if (!data.overall_healthy) {
                    alerts.push({ type: 'critical', message: 'System is experiencing issues' });
                }
                
                if (data.endpoint_health && data.endpoint_health.health_percent < 90) {
                    alerts.push({ type: 'warning', message: `Endpoint health at ${data.endpoint_health.health_percent.toFixed(1)}%` });
                }
                
                if (data.system_health) {
                    if (data.system_health.cpu_percent > 80) {
                        alerts.push({ type: 'warning', message: `High CPU usage: ${data.system_health.cpu_percent.toFixed(1)}%` });
                    }
                    if (data.system_health.memory_percent > 85) {
                        alerts.push({ type: 'warning', message: `High memory usage: ${data.system_health.memory_percent.toFixed(1)}%` });
                    }
                }
                
                if (data.ai_model_health && !data.ai_model_health.is_healthy) {
                    alerts.push({ type: 'critical', message: 'AI model is not responding' });
                }
                
                let alertsHTML = '<h3>🚨 Active Alerts</h3>';
                
                if (alerts.length === 0) {
                    alertsHTML += '<div class="alert alert-info">✅ No active alerts - system is healthy</div>';
                } else {
                    alerts.forEach(alert => {
                        alertsHTML += `<div class="alert alert-${alert.type}">${alert.message}</div>`;
                    });
                }
                
                alertsContainer.innerHTML = alertsHTML;
            }
            
            function refreshData() {
                loadHealthData();
            }
            
            // Load data on page load
            loadHealthData();
            
            // Auto-refresh every 30 seconds
            setInterval(loadHealthData, 30000);
        </script>
    </body>
    </html>
    """

@app.get("/api/health")
async def get_health_data():
    """Get current health data"""
    try:
        health_data = await health_monitor.perform_comprehensive_health_check()
        return health_data
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.now().isoformat()}

@app.get("/api/performance")
async def get_performance_data():
    """Get current performance data"""
    try:
        performance_data = await performance_monitor.run_comprehensive_performance_test()
        return performance_data
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.now().isoformat()}

@app.get("/api/uptime")
async def get_uptime_stats():
    """Get uptime statistics"""
    try:
        if os.path.exists("logs/uptime_stats.json"):
            with open("logs/uptime_stats.json", "r") as f:
                return json.load(f)
        else:
            return {"error": "No uptime data available"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/alerts")
async def get_active_alerts():
    """Get active alerts"""
    try:
        health_data = await health_monitor.perform_comprehensive_health_check()
        performance_data = await performance_monitor.run_comprehensive_performance_test()
        
        alerts = []
        
        # Combine alerts from both monitors
        if not health_data.get("overall_healthy", False):
            alerts.append({
                "type": "critical",
                "source": "health",
                "message": "System health check failed",
                "timestamp": datetime.now().isoformat()
            })
        
        performance_alerts = performance_data.get("alerts", [])
        for alert in performance_alerts:
            alert["source"] = "performance"
            alert["timestamp"] = datetime.now().isoformat()
            alerts.append(alert)
        
        return {"alerts": alerts, "count": len(alerts)}
        
    except Exception as e:
        return {"error": str(e), "alerts": [], "count": 0}

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs("logs", exist_ok=True)
    os.makedirs("reports", exist_ok=True)
    
    # Run the dashboard
    uvicorn.run(app, host="0.0.0.0", port=8001)
