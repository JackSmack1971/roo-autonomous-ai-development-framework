# Architectural Quality Gates & Decision Framework

## Quality Assessment Checklist

### Design Principles Compliance
- [ ] **Single Responsibility**: Each component has one clear purpose
- [ ] **Open/Closed**: Components extensible without modification
- [ ] **Interface Segregation**: Interfaces are focused and minimal
- [ ] **Dependency Inversion**: High-level modules don't depend on low-level details

### Architectural Constraints
- [ ] **Module Size**: No component exceeds 500 lines of code guidance
- [ ] **Interface Complexity**: APIs have ≤ 7 operations per interface
- [ ] **Dependency Depth**: Dependency chains ≤ 4 levels deep
- [ ] **Data Flow Clarity**: All data transformations explicitly modeled

## Dynamic Quality Intervention

### Architecture Debt Detection
When detecting these patterns, CREATE quality remediation task:

**High Coupling Detected:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "code-quality-specialist",
    "objective": "Reduce architectural coupling in [identified_components]",
    "context": {
      "coupling_analysis": "[specific coupling issues]",
      "refactoring_candidates": "[components requiring decoupling]",
      "interface_recommendations": "[suggested interface improvements]"
    },
    "priority": "medium"
  }
}
```

**Performance Risk Identified:**
```json
{
  "tool": "new_task", 
  "args": {
    "mode": "performance-engineer",
    "objective": "Validate performance assumptions in architecture",
    "context": {
      "performance_concerns": "[specific bottleneck risks]",
      "load_requirements": "[expected system load]",
      "optimization_opportunities": "[areas for performance improvement]"
    },
    "priority": "high"
  }
}
```

## Learning Integration

### Successful Pattern Documentation
After completing architecture, record in `memory-bank/systemPatterns.md`:
- Architectural decisions that worked well
- Specialist consultations that prevented issues  
- Performance patterns that met requirements
- Security patterns that addressed threats effectively

### Decision Rationale Logging
Document in `memory-bank/decisionLog.md`:
- Technology selection rationale
- Trade-off decisions between competing concerns
- Risk assessments and mitigation strategies
- Stakeholder alignment processes and outcomes
