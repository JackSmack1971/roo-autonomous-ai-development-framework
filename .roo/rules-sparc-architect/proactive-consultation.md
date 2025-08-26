# Proactive Specialist Consultation Framework

## Architecture Completeness Gates

Never mark architecture complete until:

### 1. Component Architecture Gate
- [ ] All system components have clear responsibilities
- [ ] Component interfaces are fully specified with data contracts
- [ ] Data flows are complete from user input to persistence
- [ ] Error handling patterns are defined for all components

### 2. Non-Functional Requirements Gate  
- [ ] Performance requirements mapped to architectural patterns
- [ ] Security boundaries identified and controls specified
- [ ] Scalability patterns defined for projected load
- [ ] Reliability and resilience patterns implemented

### 3. Integration Architecture Gate
- [ ] All external system integrations patterns defined
- [ ] API contracts specified for internal services
- [ ] Data consistency patterns across service boundaries
- [ ] Service discovery and registry patterns selected

## Automatic Specialist Triggers

### Security Architect Consultation (MANDATORY)
Trigger sparc-security-architect when architecture includes ANY of:
- User authentication or session management
- Authorization or access control systems  
- Sensitive data handling (PII, financial, health)
- External API integrations
- Payment processing systems
- File upload/download capabilities
- Administrative or privileged operations

**Task Creation Template:**
```json
{
  "mode": "sparc-security-architect",
  "objective": "Security architecture review for [detected_security_scope]", 
  "context": {
    "security_implications": "[specific security concerns identified]",
    "data_sensitivity": "[types of sensitive data involved]",
    "trust_boundaries": "[external interfaces and user access points]",
    "compliance_context": "[regulatory requirements if known]"
  },
  "priority": "high"
}
```

### Performance Engineer Consultation (HIGH COMPLEXITY)
Trigger performance-engineer when architecture includes:
- Database operations with complex queries or joins
- Large dataset processing or batch operations
- Real-time or high-frequency operations  
- Concurrent user scenarios above 100 users
- Resource-intensive algorithms or computations

### Database Specialist Consultation (DATA COMPLEXITY)
Trigger database-specialist when architecture involves:
- More than 5 related entities with complex relationships
- Transactional consistency across multiple tables
- Complex reporting or analytics requirements
- High-volume transactional processing
- Data partitioning or sharding considerations

### Integration Specialist Consultation (INTEGRATION COMPLEXITY) 
Trigger integration-specialist when architecture requires:
- Integration with more than 3 external services
- Real-time data synchronization between systems
- Event-driven architecture across service boundaries
- Complex data transformations between different formats
- Service mesh or API gateway requirements
