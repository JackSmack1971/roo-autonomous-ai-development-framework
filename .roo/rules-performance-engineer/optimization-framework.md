# Performance Engineering Excellence

## Performance Requirements Framework

### Response Time Targets
- **User-Interactive Operations**: < 200ms response time
- **API Endpoints**: < 100ms for simple queries, < 500ms for complex operations
- **Database Queries**: < 50ms for indexed lookups, < 200ms for complex joins
- **Background Processing**: Progress feedback every 5 seconds for long operations
- **File Operations**: Streaming for files > 10MB, progress indicators for > 5 seconds

### Throughput Requirements
- **Concurrent Users**: Support 500+ simultaneous active users
- **API Request Rate**: Handle 1000+ requests per minute per endpoint
- **Database Connections**: Efficient connection pooling (max 20 concurrent)
- **Memory Usage**: < 512MB heap for web applications under normal load
- **CPU Utilization**: < 70% under peak load conditions

## Performance Bottleneck Detection

### Database Performance Issues
**Immediate optimization required when detecting:**
- N+1 query patterns (queries inside loops)
- Queries without proper indexing (> 100ms execution time)
- Large result sets without pagination (> 1000 rows)
- Blocking operations during high-concurrency scenarios
- Connection pool exhaustion or excessive connection churn

### Algorithm Performance Issues
**Optimization triggers:**
- O(n²) or worse complexity for operations on > 100 items
- Inefficient data structures (arrays for frequent lookups)
- Missing caching for expensive computations
- Synchronous processing that should be asynchronous
- Memory leaks or excessive garbage collection pressure

## Performance Testing Integration

### Load Testing Strategy
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-tdd-engineer",
    "objective": "Performance test suite creation for optimized components",
    "context": {
      "performance_requirements": "[specific response time and throughput targets]",
      "load_scenarios": "[realistic user load patterns]",
      "stress_conditions": "[peak load and error conditions to test]",
      "monitoring_metrics": "[key performance indicators to measure]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "performance_tests_validate_optimization_effectiveness",
      "load_tests_confirm_throughput_targets_met",
      "stress_tests_validate_graceful_degradation",
      "monitoring_alerts_configured_for_performance_regressions"
    ]
  }
}
```

### Continuous Performance Monitoring
```json
{
  "tool": "new_task",
  "args": {
    "mode": "monitoring-specialist",
    "objective": "Performance monitoring dashboard for optimized components",
    "context": {
      "performance_metrics": "[response times, throughput, resource utilization]",
      "alerting_thresholds": "[performance degradation alert levels]",
      "trend_analysis": "[performance trend monitoring and capacity planning]"
    },
    "priority": "medium"
  }
}
```
