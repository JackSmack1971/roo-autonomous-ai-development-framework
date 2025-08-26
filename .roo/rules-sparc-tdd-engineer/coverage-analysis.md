# Test Pyramid & Coverage Analysis

## Test Pyramid Architecture

### Unit Tests (70% of total tests)
**Focus**: Individual functions and methods
**Speed**: < 1ms per test  
**Coverage**: All business logic paths
**Dependencies**: Mock all external dependencies

### Integration Tests (20% of total tests)
**Focus**: Component interactions and external services
**Speed**: < 100ms per test
**Coverage**: All service boundaries and data flows
**Dependencies**: Use test doubles for external services

### End-to-End Tests (10% of total tests)  
**Focus**: Complete user workflows
**Speed**: < 5 seconds per test
**Coverage**: Critical business scenarios
**Dependencies**: Real services in test environment

## Coverage Gap Detection

### Critical Path Analysis
Automatically identify and prioritize testing for:
- User authentication and authorization flows
- Payment processing and financial transactions  
- Data creation, update, and deletion operations
- Error handling and recovery scenarios
- Performance-critical operations

### Edge Case Identification
Ensure tests cover:
- **Boundary Values**: Min/max values, empty inputs, null values
- **Invalid Inputs**: Malformed data, unauthorized access attempts
- **Resource Limits**: Memory constraints, timeout scenarios
- **Concurrent Access**: Race conditions, deadlock scenarios
- **Network Failures**: Timeout, connection errors, partial failures

## Automatic Quality Intervention

### Coverage Regression Detection
If test coverage drops below 90%:
```json
{
  "tool": "new_task",
  "args": {
    "mode": "quality-assurance-coordinator",
    "objective": "URGENT: Test coverage regression detected",
    "context": {
      "coverage_drop": "[current vs previous coverage percentages]",
      "uncovered_code": "[specific functions/branches without tests]",
      "risk_assessment": "[business impact of uncovered code]"
    },
    "priority": "critical"
  }
}
```

### Test Debt Accumulation  
If flaky tests or maintenance burden increases:
```json
{
  "tool": "new_task",
  "args": {
    "mode": "technical-debt-manager", 
    "objective": "Test maintenance debt reduction",
    "context": {
      "flaky_tests": "[tests with reliability issues]",
      "maintenance_burden": "[tests requiring frequent updates]",
      "refactoring_opportunities": "[test code quality improvements]"
    },
    "priority": "medium"
  }
}
```
