# Dynamic Task Creation Templates

## Research Task Template
When market research is needed:

```json
{
  "tool": "new_task",
  "args": {
    "mode": "data-researcher",
    "objective": "Research [specific_market_aspect] to validate specification assumptions",
    "context": {
      "specification_gap": "[what assumptions need validation]",
      "business_context": "[why this research matters for project success]",
      "decision_impact": "[how research affects requirements definition]",
      "success_criteria": "[what evidence validates or invalidates assumptions]"
    },
    "priority": "high",
    "inputs": ["draft-specification.md", "stakeholder-requirements.md"],
    "acceptance_criteria": [
      "market_data_provides_evidence_for_assumptions",
      "competitive_analysis_informs_feature_priorities",
      "user_research_validates_behavior_expectations",
      "specification_updated_with_research_findings"
    ],
    "handoff_contract": "HANDOFF/V1"
  }
}
```

## Fact-Checking Task Template
When technical claims need verification:

```json
{
  "tool": "new_task",
  "args": {
    "mode": "rapid-fact-checker",
    "objective": "Verify technical claims and regulatory requirements in specification",
    "context": {
      "claims_to_verify": "[specific technical or regulatory claims]",
      "accuracy_requirements": "[confidence level needed for decisions]",
      "risk_assessment": "[impact of incorrect assumptions]",
      "sources_required": "[types of authoritative sources needed]"
    },
    "priority": "high",
    "inputs": ["specification-draft.md", "referenced-standards.md"],
    "acceptance_criteria": [
      "critical_claims_verified_above_95_percent_confidence",
      "regulatory_requirements_validated_with_authoritative_sources",
      "technical_limitations_confirmed_or_corrected",
      "specification_updated_with_verified_information"
    ]
  }
}
```

## Architecture Review Task Template
When complex system implications are detected:

```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-architect", 
    "objective": "Assess architectural implications of specification requirements",
    "context": {
      "complex_requirements": "[requirements with architectural implications]",
      "integration_needs": "[external systems or services involved]",
      "performance_requirements": "[scalability and performance expectations]",
      "feasibility_concerns": "[potential technical challenges]"
    },
    "priority": "high",
    "inputs": ["specification.md", "acceptance-criteria.md", "integration-requirements.md"],
    "acceptance_criteria": [
      "architectural_feasibility_assessed",
      "integration_complexity_evaluated",
      "performance_requirements_validated",
      "specification_updated_with_technical_constraints"
    ]
  }
}
```

## Quality Escalation Template
When requirements quality issues cannot be resolved:

```json
{
  "tool": "new_task",
  "args": {
    "mode": "sparc-orchestrator",
    "objective": "Resolve specification quality issues requiring strategic decision",
    "context": {
      "quality_issues": "[specific issues preventing completion]",
      "stakeholder_conflicts": "[conflicting requirements or priorities]",
      "resource_constraints": "[time, budget, or technical limitations]",
      "decision_required": "[specific decisions needed from leadership]"
    },
    "priority": "critical",
    "acceptance_criteria": [
      "stakeholder_conflicts_resolved",
      "quality_standards_restored",
      "specification_completion_path_clear"
    ]
  }
}
```
