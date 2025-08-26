# Quality Remediation Task Creation

## Targeted Quality Interventions

### Architecture Quality Issues
**When architecture inconsistencies detected:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-architect",
    "objective": "Resolve architecture-implementation inconsistencies",
    "context": {
      "consistency_gaps": "[specific misalignments between architecture and code]",
      "affected_components": "[components with architectural drift]",
      "quality_impact": "[how inconsistencies affect system quality]",
      "remediation_strategy": "[recommended approach to restore consistency]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "architecture_documentation_updated_to_match_implementation",
      "or_implementation_refactored_to_match_architecture",
      "consistency_metrics_restored_above_threshold",
      "architectural_decision_rationale_documented"
    ]
  }
}
```

### Security Quality Issues  
**When security controls are inconsistent or incomplete:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "security-reviewer",
    "objective": "Remediate security control gaps identified by quality monitoring",
    "context": {
      "security_gaps": "[specific security controls missing or misconfigured]",
      "threat_exposure": "[threats not adequately mitigated by current controls]",
      "compliance_impact": "[regulatory requirements not met]",
      "urgency_justification": "[business risk of delayed remediation]"
    },
    "priority": "critical",
    "acceptance_criteria": [
      "all_identified_security_gaps_addressed",
      "security_controls_tested_and_validated",
      "compliance_requirements_satisfied",
      "security_documentation_updated"
    ]
  }
}
```

### Test Coverage Quality Issues
**When test coverage falls below standards:**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-tdd-engineer",
    "objective": "Restore test coverage for quality-critical components",
    "context": {
      "coverage_gaps": "[specific functions or components lacking adequate tests]",
      "risk_assessment": "[business impact of untested code]",
      "coverage_targets": "[specific coverage percentages required]",
      "testing_priorities": "[most critical areas requiring immediate test coverage]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "test_coverage_restored_above_90_percent",
      "critical_business_logic_fully_covered",
      "edge_cases_and_error_scenarios_tested",
      "test_quality_metrics_meet_standards"
    ]
  }
}
```
