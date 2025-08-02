# Maintenance Agents

This folder contains agents for platform monitoring, cleanup, and alerting. Each agent is designed to run independently and trigger signals (not loops) for incident response and maintenance.

## Agents

- **monitor_agent.py**: Monitors system health and triggers alerts if thresholds are exceeded.
- **cleanup_agent.py**: Standardizes file/folder names, removes temp files, and logs changes.
- **alert_agent.py**: Sends alerts when triggered by other agents or scripts.

## Usage

Each agent can be run as a standalone script:

```bash
python monitor_agent.py
python cleanup_agent.py
python alert_agent.py
```

Agents are designed to be called by cron, CI/CD, or other automation tools. They do not run in infinite loops by default.

## Best Practices
- **No infinite loops**: Agents run once and exit, emitting signals/alerts as needed.
- **Non-destructive**: Cleanup agent only standardizes and removes obvious temp files.
- **Alerting**: Alerts are logged and can be integrated with external systems.
