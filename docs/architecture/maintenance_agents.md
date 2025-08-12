# Maintenance Agents Architecture

```mermaid
graph TD
    A[MonitorAgent] -->|Alert| B(AlertAgent)
    C[CleanupAgent] -->|Alert| B
    B -->|Signal| D[User/Admin]
    B -->|Log| E[Incident Log]
```

- **MonitorAgent**: Checks system health, triggers alerts if thresholds exceeded
- **CleanupAgent**: Standardizes files/folders, removes temp files, triggers alerts if needed
- **AlertAgent**: Sends alerts to logs, stdout, or external systems
- **No infinite loops**: Agents run once and exit, emitting signals/alerts
- **Signals, not loops**: Designed for automation, not persistent daemons
