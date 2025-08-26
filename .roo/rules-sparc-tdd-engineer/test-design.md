# Comprehensive Test Design Framework

## Test Coverage Excellence Standards

### Coverage Requirements (NON-NEGOTIABLE)
- [ ] **Unit Test Coverage**: ≥ 90% for all business logic
- [ ] **Integration Test Coverage**: All external dependencies tested
- [ ] **Edge Case Coverage**: Boundary conditions and error scenarios
- [ ] **Performance Test Coverage**: All time-sensitive operations validated
- [ ] **Security Test Coverage**: All input validation and auth logic tested

### Test Quality Gates
- [ ] **Test Reliability**: No flaky or intermittent test failures
- [ ] **Test Maintainability**: Tests are readable and easy to modify  
- [ ] **Test Independence**: Tests can run in any order without dependencies
- [ ] **Test Speed**: Unit test suite runs in < 30 seconds
- [ ] **Test Clarity**: Test names clearly describe what is being tested

## Specialist Test Delegation

### Performance Testing (Route to: performance-engineer)
**CREATE performance test task when detecting:**
- Database operations with complex queries
- API endpoints with response time SLAs  
- Batch processing or background job operations
- Concurrent user scenarios above 10 users
- Resource-intensive computations or algorithms

### Security Testing (Route to: security-reviewer)  
**CREATE security test task when detecting:**
- Authentication and authorization mechanisms
- Input validation and sanitization logic
- Cryptographic operations and key handling
- File upload and data processing functions
- External API integrations with sensitive data

### Integration Testing (Route to: integration-specialist)
**CREATE integration test task when detecting:**
- Multiple external service dependencies
- Complex workflow orchestration across services
- Event-driven architecture with async processing
- Data consistency requirements across system boundaries
- Service mesh or API gateway interactions

## Test Design Templates

### Security Test Creation Template:
```json
{
  "tool": "new_task",
  "args": {
    "mode": "security-reviewer",
    "objective": "Security test design for [security_sensitive_functionality]",
    "context": {
      "security_test_requirements": "[what security aspects need testing]",
      "attack_scenarios": "[potential security test scenarios]",
      "input_validation_points": "[user input requiring security testing]"
    },
    "priority": "high"
  }
}
```
