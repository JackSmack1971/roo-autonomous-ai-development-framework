# Test-Driven Implementation Protocol

## Test-First Implementation Requirements

### Before Writing Any Production Code
- [ ] **Failing Tests Exist**: All new functionality has failing tests written first
- [ ] **Test Coverage Plan**: Clear understanding of what edge cases need testing
- [ ] **Integration Test Strategy**: Tests for external dependencies and integrations
- [ ] **Performance Test Requirements**: Benchmarks for performance-critical operations

### Test Quality Standards
- [ ] **Meaningful Assertions**: Tests verify actual behavior, not implementation details
- [ ] **Edge Case Coverage**: Boundary conditions, null values, empty collections tested  
- [ ] **Error Scenario Testing**: Exception handling and error conditions validated
- [ ] **Integration Testing**: All external service interactions properly tested

## Automatic TDD Engineer Consultation

### When to CREATE sparc-tdd-engineer task:
- **Complex Business Logic**: Multi-step workflows requiring comprehensive testing
- **Integration Points**: External APIs, databases, file systems need integration tests
- **Performance Requirements**: Functions with specific timing or throughput needs
- **Error Handling**: Complex error scenarios requiring specialized test design

### TDD Collaboration Template:
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-tdd-engineer",
    "objective": "Comprehensive test design for [complex_implementation_area]",
    "context": {
      "implementation_scope": "[what functionality is being implemented]",
      "business_logic_complexity": "[complex rules or workflows involved]",
      "integration_dependencies": "[external systems or services involved]",
      "performance_requirements": "[timing or throughput requirements]",
      "edge_cases_identified": "[boundary conditions and error scenarios]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "test_coverage_above_90_percent",
      "all_edge_cases_covered_in_tests", 
      "integration_scenarios_properly_tested",
      "performance_benchmarks_established"
    ]
  }
}
```

## Quality Assurance Integration

### Real-Time Quality Monitoring
During implementation, continuously assess:
- **Test Pass Rate**: All tests must remain green
- **Coverage Metrics**: Coverage must not decrease below 90%
- **Code Quality**: Maintain quality standards without technical debt accumulation
- **Performance Impact**: No performance regressions in critical paths
