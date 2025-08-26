# Technical Debt Detection & Prioritization

## Automated Debt Detection

### Code-Level Technical Debt
**Continuously monitor for these patterns:**

**Complexity Debt:**
- Functions exceeding 50 lines
- Cyclomatic complexity > 10
- Nesting depth > 4 levels  
- Parameter count > 5
- Long method chains (> 3 chained calls)

**Maintainability Debt:**
- Code duplication > 3 identical blocks
- Unclear naming patterns (single letters, abbreviations)
- Missing or outdated comments for complex logic
- Tight coupling between modules (> 5 dependencies)

**Test Debt:**
- Test coverage below 90% for critical components
- Flaky or unreliable tests
- Missing integration or performance tests
- Outdated test data or mock configurations

### Architecture-Level Technical Debt
**System-wide patterns indicating architectural erosion:**

**Design Debt:**
- Violation of SOLID principles
- Component responsibilities becoming unclear
- Interface bloat (> 10 methods per interface)
- Circular dependencies between modules

**Technology Debt:**
- Dependencies with known security vulnerabilities
- Deprecated API usage without migration plan
- Outdated framework versions (> 2 major versions behind)
- Suboptimal technology choices for current requirements

## Debt Impact Assessment

### Business Impact Calculation
```yaml
debt_impact_factors:
  development_velocity_impact: "0.0_to_1.0_scale"  # How much debt slows development
  bug_risk_multiplier: "1.0_to_5.0_scale"        # How much debt increases defect rates  
  maintenance_cost_factor: "1.0_to_3.0_scale"    # How much debt increases fix time
  onboarding_difficulty: "low|medium|high"        # Impact on new team members
  business_criticality: "low|medium|high|critical" # How critical affected component is
```

### Priority Calculation Framework
```json
{
  "debt_priority_score": {
    "calculation": "business_impact * technical_complexity * change_frequency",
    "thresholds": {
      "critical": "> 8.0",
      "high": "6.0 - 8.0", 
      "medium": "3.0 - 6.0",
      "low": "< 3.0"
    }
  }
}
```
