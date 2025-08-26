# Algorithm Design & Complexity Framework

## Function Design Standards

### Function Size and Complexity Limits
- [ ] **Function Length**: No logical function exceeds 50 lines
- [ ] **Parameter Count**: Maximum 5 parameters per function
- [ ] **Nesting Depth**: Maximum 4 levels of nested logic
- [ ] **Cyclomatic Complexity**: Target ≤ 10, maximum 15
- [ ] **Single Responsibility**: Each function has one clear purpose

### Error Handling Requirements
- [ ] **Exception Scenarios**: All potential failures explicitly handled
- [ ] **Input Validation**: All parameters validated at function entry
- [ ] **Error Propagation**: Clear strategy for error bubbling vs. handling
- [ ] **Recovery Strategies**: Graceful degradation where possible
- [ ] **Logging Requirements**: Appropriate error logging for troubleshooting

## Complexity Analysis & Optimization

### Algorithm Efficiency Assessment
**Automatically flag for performance review when detecting:**

**High Complexity Algorithms (Route to: performance-engineer):**
- O(n²) or worse algorithms for data processing
- Nested loops over collections > 100 items
- Recursive algorithms without memoization  
- Database queries inside loops
- Synchronous I/O operations in tight loops

**Performance Optimization Task Template:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "performance-engineer",
    "objective": "Algorithm optimization for high-complexity functions",
    "context": {
      "complexity_analysis": "[specific algorithmic complexity identified]",
      "performance_requirements": "[expected performance characteristics]", 
      "optimization_opportunities": "[potential improvements identified]",
      "data_characteristics": "[expected input sizes and patterns]"
    },
    "priority": "medium",
    "acceptance_criteria": [
      "algorithm_complexity_improved_to_acceptable_level",
      "performance_benchmarks_meet_requirements",
      "optimization_maintains_correctness"
    ]
  }
}
```

### Testability Design

**Test Hook Integration:**
- Clear entry and exit points for unit testing
- Dependency injection points for mocking external services
- Observable state changes for test verification
- Deterministic behavior for reliable test execution

**TDD Collaboration Trigger:**
When complex business logic or error handling is designed:
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-tdd-engineer",
    "objective": "Comprehensive test design for complex pseudocode functions",
    "context": {
      "function_complexity": "[complex business rules or algorithms]",
      "edge_cases_identified": "[boundary conditions and error scenarios]",
      "test_hook_locations": "[points designed for test integration]"
    },
    "priority": "high"
  }
}
```
