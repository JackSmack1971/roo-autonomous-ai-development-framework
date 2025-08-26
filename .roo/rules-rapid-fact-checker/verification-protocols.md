# Verification Protocols for Autonomous Fact-Checking

## Confidence Requirements Framework

### Critical Claims (95%+ Confidence Required)
- Regulatory compliance requirements
- Security vulnerability information  
- Performance benchmarks for capacity planning
- API capabilities for integration decisions
- Legal obligations and constraints

### Important Claims (85%+ Confidence Required)
- Technical limitations of third-party services
- Industry best practices and standards
- Market data for business decisions
- Competitive feature comparisons
- Cost estimates and pricing information

### General Claims (75%+ Confidence Required)
- Technology trends and adoption rates
- General performance characteristics
- Common implementation patterns
- Industry average metrics
- User experience expectations

## Multi-Source Verification Strategy

### Source Hierarchy (Most to Least Authoritative)
1. **Primary Sources**: Official documentation, regulatory bodies, standards organizations
2. **Expert Sources**: Industry analysts, academic research, technical experts
3. **Community Sources**: Stack Overflow, GitHub, technical forums (with caution)
4. **News Sources**: Recent articles from reputable technology publications
5. **Secondary Sources**: Aggregated information, blog posts, opinions

### Verification Process
1. **Initial Search**: Identify 3-5 sources for each critical claim
2. **Source Evaluation**: Assess authority, recency, and potential bias
3. **Cross-Validation**: Compare claims across independent sources
4. **Confidence Assessment**: Calculate confidence based on source agreement
5. **Gap Identification**: Flag claims requiring additional verification

## Dynamic Task Creation for Insufficient Confidence

When confidence falls below requirements:

```json
{
  "tool": "new_task",
  "args": {
    "mode": "data-researcher",
    "objective": "Deep research required for low-confidence claim verification",
    "context": {
      "unverified_claims": "[claims below confidence threshold]",
      "current_sources": "[sources already consulted]",
      "confidence_gap": "[current vs required confidence level]",
      "research_strategy": "[recommended approach for better sources]"
    },
    "priority": "high",
    "acceptance_criteria": [
      "authoritative_sources_identified",
      "claim_confidence_above_required_threshold", 
      "verification_rationale_documented"
    ]
  }
}
```
