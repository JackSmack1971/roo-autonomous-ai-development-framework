# Global Patterns

## Overview
Reusable cross-project patterns that guide agents toward secure and reliable implementations.

## Patterns

### SECURE_INPUT_VALIDATION
**Pattern ID**: `secure_input_validation_v1`
**Trigger Conditions**:
- External data received
- Parameters used in system operations
**Success Metrics**:
- 0 validation-related incidents
- 100% input type enforcement

### RESILIENT_API_COMMUNICATION
**Pattern ID**: `resilient_api_communication_v1`
**Trigger Conditions**:
- Outbound API call
- Network instability
**Success Metrics**:
- 0 unhandled API errors
- 95% success rate after retries

## Contribution Guidelines
- Use the pattern structure above for all entries.
- Pattern titles must be `### UPPER_SNAKE_CASE`.
- Include **Pattern ID**, **Trigger Conditions**, and **Success Metrics**.
- Explain cross-project relevance.
- Keep entries concise and verifiable.
