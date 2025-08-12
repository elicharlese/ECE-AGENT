# Knowledge Base Architecture

```mermaid
graph TD
    A[Web Server] -->|GraphQL/REST| B(KnowledgeBase)
    B -->|SQLite| C[(Database)]
    B -->|Backdoor Mgmt| D(CrawlerBackdoor)
    B -->|Search| E[Full-Text Search]
    B -->|Scoring| F[Relevance/Confidence]
    B -->|Metadata| G[Flexible JSON]
```

- **GraphQL/REST**: Unified API for queries and mutations
- **SQLite**: Persistent, async storage for all knowledge entries
- **CrawlerBackdoor**: Soft retraining endpoints for crawlers
- **Full-Text Search**: Title/content search with ranking
- **Relevance/Confidence**: Automated scoring for results
- **Flexible Metadata**: Extensible JSON for future features
