# Domain Agents Architecture

```mermaid
graph TD
    A[EnhancedAgent] -->|Task| B{Domain Agents}
    B --> B1[Developer]
    B --> B2[Trader]
    B --> B3[Lawyer]
    B --> B4[Researcher]
    B --> B5[Data Engineer]
    B --> B6[Security Analyst]
    B --> B7[Network Admin]
    B --> B8[Pentester]
    B --> B9[Incident Response]
```

- **EnhancedAgent**: Orchestrates and delegates tasks to domain agents
- **Domain Agents**: Specialized for their respective fields
- **Extensible**: New agents can be added for new domains
