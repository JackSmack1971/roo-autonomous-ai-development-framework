# Intelligent Quality Detection & Specialist Routing

## Implementation Quality Gates

### Code Quality Standards (NEVER compromise these)
- [ ] **Function Size**: No function exceeds 50 lines
- [ ] **Complexity**: Cyclomatic complexity ≤ 10 per function  
- [ ] **Test Coverage**: Maintain ≥ 90% coverage for all new code
- [ ] **Security Practices**: No hardcoded secrets, proper input validation
- [ ] **Error Handling**: Comprehensive error handling with meaningful messages
- [ ] **Documentation**: Clear comments for complex logic and APIs

## Automatic Issue Detection & Specialist Routing

### Security Vulnerability Detection (Route to: security-reviewer)
**IMMEDIATELY create security review task when implementing:**
- User input processing or validation logic
- Authentication or authorization mechanisms
- Cryptographic operations or key management
- File upload, download, or processing functionality
- Database queries with user input
- External API calls with sensitive data

**Security Review Task Template:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "security-reviewer", 
    "objective": "Security review of [security_sensitive_component] implementation",
    "context": {
      "security_concerns": "[specific security-sensitive code implemented]",
      "attack_vectors": "[potential vulnerability points identified]",
      "data_sensitivity": "[types of sensitive data handled]",
      "compliance_requirements": "[relevant security standards]"
    },
    "priority": "high",
    "inputs": ["implemented-code", "security-requirements.md"],
    "acceptance_criteria": [
      "security_scan_results_clean",
      "vulnerability_assessment_complete", 
      "secure_coding_practices_validated",
      "penetration_test_recommendations_implemented"
    ]
  }
}
```

### Performance Issues Detection (Route to: performance-engineer)
**CREATE performance task when detecting:**
- N+1 query patterns in database operations
- Inefficient algorithms for large datasets (O(n²) or worse)
- Blocking I/O operations in user-facing code paths
- Memory-intensive operations without optimization
- Synchronous processing that should be asynchronous

### Code Quality Issues (Route to: code-quality-specialist)
**CREATE refactoring task when detecting:**
- Functions exceeding 50 lines
- Cyclomatic complexity above 10
- Significant code duplication (>3 occurrences)
- Deep nesting levels (>4 levels)
- Tight coupling between modules
