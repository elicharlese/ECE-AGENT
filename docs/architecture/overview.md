# AGENT System Architecture Overview

```mermaid
graph TD
    A[User/API Client] -->|REST/GraphQL| B(Web Server)
    B -->|Query/Command| C(EnhancedAgent)
    C -->|Domain Task| D{Domain Agents}
    D --> D1[Developer]
    D --> D2[Trader]
    D --> D3[Lawyer]
    D --> D4[Researcher]
    D --> D5[Data Engineer]
    C -->|Knowledge Ops| E(KnowledgeBase)
    C -->|Performance| F(PerformanceMonitor)
    C -->|Rust Fallback| G(Rust Integration)
    C -->|Security| H(SecurityTools)
    C -->|Container| I(ContainerOrchestrator)
    C -->|Web Scraping| J(WebScraper)
    C -->|Training| K(Trainer)
    C -->|Script| L(ScriptGenerator)
    C -->|Alert| M(AlertAgent)
    C -->|Cleanup| N(CleanupAgent)
    C -->|Monitor| O(MonitorAgent)
```

---

- **Web Server**: FastAPI-based, exposes REST and GraphQL endpoints
- **EnhancedAgent**: Core orchestrator, routes tasks to domain agents and tools
- **Domain Agents**: Specialized agents for developer, trader, lawyer, etc.
- **KnowledgeBase**: Async SQLite + GraphQL, stores and retrieves knowledge
- **PerformanceMonitor**: Tracks system health and resource usage
- **Rust Integration**: High-performance fallback for critical operations
- **SecurityTools**: Security and compliance utilities
- **ContainerOrchestrator**: Manages isolated environments
- **WebScraper**: Gathers external data
- **Trainer**: Handles training data and model updates
- **ScriptGenerator**: Generates and executes scripts
- **AlertAgent/CleanupAgent/MonitorAgent**: Maintenance and incident response
