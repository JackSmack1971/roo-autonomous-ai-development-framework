# Service Integration Excellence

## API Design Standards

### RESTful API Design Principles
- [ ] **Resource-Based URLs**: `/users/{id}` not `/getUser?id=123`
- [ ] **HTTP Method Semantics**: GET (read), POST (create), PUT (update), DELETE (remove)
- [ ] **Status Code Standards**: 2xx success, 4xx client errors, 5xx server errors
- [ ] **Consistent Response Format**: Standard JSON structure across all endpoints
- [ ] **Version Strategy**: URL versioning (`/api/v1/`) or header-based versioning

### Integration Reliability Patterns
- [ ] **Circuit Breaker**: Fail fast when external services are unavailable
- [ ] **Retry Logic**: Exponential backoff with jitter for transient failures
- [ ] **Timeout Configuration**: Reasonable timeouts for all external calls
- [ ] **Fallback Strategies**: Graceful degradation when dependencies fail
- [ ] **Idempotency**: Ensure operations can be safely retried

## Service Integration Complexity Assessment

### Multi-Service Integration (Route to: monitoring-specialist)
**When integrating >3 external services:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "monitoring-specialist",
    "objective": "Comprehensive monitoring for complex service integration",
    "context": {
      "integration_complexity": "[number and types of external services]",
      "failure_scenarios": "[potential failure modes across service dependencies]",
      "monitoring_requirements": "[health checks, response times, error rates]",
      "alerting_strategy": "[escalation procedures for service failures]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "service_health_monitoring_comprehensive",
      "failure_detection_and_alerting_configured",
      "dependency_mapping_and_impact_analysis_complete"
    ]
  }
}
```

### Event-Driven Architecture (Route to: performance-engineer)
**When implementing async event processing:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "performance-engineer",
    "objective": "Event processing performance optimization and capacity planning",
    "context": {
      "event_volume_projections": "[expected message throughput]",
      "processing_complexity": "[event handling business logic complexity]",
      "delivery_guarantees": "[at-least-once, exactly-once requirements]",
      "latency_requirements": "[acceptable event processing delays]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "event_processing_meets_throughput_requirements",
      "message_queue_capacity_properly_sized",
      "event_ordering_and_delivery_guarantees_validated"
    ]
  }
}
```

### Security Integration (Route to: security-reviewer)
**For all external API integrations:**
```json
{
  "tool": "new_task", 
  "args": {
    "mode": "security-reviewer",
    "objective": "Security review of external service integrations",
    "context": {
      "api_security_analysis": "[authentication, authorization, data encryption]",
      "data_flow_security": "[sensitive data crossing service boundaries]",
      "trust_boundary_assessment": "[external service trust levels]"
    },
    "priority": "high"
  }
}
```
