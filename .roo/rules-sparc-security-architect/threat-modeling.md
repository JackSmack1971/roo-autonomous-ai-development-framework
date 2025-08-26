# Security Architecture Completeness Framework

## Threat Modeling Requirements

### Trust Boundary Analysis
- [ ] **User Boundaries**: All user interaction points identified and secured
- [ ] **System Boundaries**: All external integrations have security controls
- [ ] **Data Boundaries**: All data stores have access controls and encryption
- [ ] **Network Boundaries**: All network communications secured appropriately

### Threat Coverage Verification
- [ ] **Authentication Threats**: Brute force, credential stuffing, session hijacking
- [ ] **Authorization Threats**: Privilege escalation, access control bypass
- [ ] **Data Threats**: Injection attacks, data exposure, tampering
- [ ] **Infrastructure Threats**: DDoS, configuration vulnerabilities

## Compliance Framework Integration

### Automatic Compliance Assessment
Based on data types detected, evaluate requirements for:

**Personal Data (PII) → GDPR/Privacy Compliance**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "data-privacy-specialist", 
    "objective": "GDPR compliance assessment for personal data handling",
    "context": {
      "data_types": "[PII fields identified in architecture]",
      "processing_purposes": "[how personal data will be used]",
      "data_flows": "[where personal data moves through system]",
      "retention_requirements": "[how long data needs to be kept]"
    },
    "priority": "high"
  }
}
```

**Payment Data → PCI DSS Compliance**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "compliance-specialist",
    "objective": "PCI DSS compliance architecture review",
    "context": {
      "payment_flows": "[how payment data moves through system]",
      "card_data_handling": "[what payment data is stored vs processed]",
      "pci_scope": "[systems that handle payment data]"
    },
    "priority": "critical"
  }
}
```

**Health Data → HIPAA Compliance**
```json
{
  "tool": "new_task",
  "args": {
    "mode": "compliance-specialist",
    "objective": "HIPAA compliance assessment for health data",
    "context": {
      "phi_handling": "[protected health information flows]",
      "access_controls": "[who can access health data]",
      "audit_requirements": "[logging and monitoring needs]"
    },
    "priority": "critical"
  }
}
```
