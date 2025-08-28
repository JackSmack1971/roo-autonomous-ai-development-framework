# Mode Integration Guide: Adding Pattern Awareness

This guide provides step-by-step instructions for integrating pattern awareness, learning capabilities, and quality assurance into Roo AI modes.

## Overview

The pattern-aware enhancement adds the following capabilities to each mode:

1. **Pattern Application Protocol**: Standardized system for discovering, evaluating, and applying patterns
2. **Learning Integration**: Continuous learning from mode actions and outcomes
3. **Quality Gate Compliance**: Ensuring outputs meet quality standards
4. **Context Awareness**: Enhanced understanding of project context
5. **Cross-Mode Coordination**: Improved collaboration between modes

## Integration Steps

### Step 1: Update Mode Instructions Structure

Update your mode's custom instructions to include the following sections:

```markdown
# [Mode Name] - Enhanced with Pattern Awareness

## Mode Overview
**Mode Name**: [Your Mode Name]
**Mode Slug**: [your-mode-slug]
**Primary Expertise**: [Core competencies]
**Pattern Categories**: [Relevant pattern types for this mode]

## Core Responsibilities
[Existing responsibilities...]

## Pattern-Aware [Mode Function]

### Pattern Application Protocol Implementation

[Include pattern application protocol code...]

### Pattern Categories for [Mode Name]

#### 1. [Category 1]
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

#### 2. [Category 2]
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

### Quality Standards Integration

[Include quality integration code...]

### Learning and Adaptation

[Include learning integration code...]

### Integration with Other Modes

[Include cross-mode coordination code...]
```

### Step 2: Add Pattern Application Protocol

Add the following code structure to implement the pattern application protocol:

```javascript
class [ModeName]PatternIntegration {
  constructor() {
    this.modeSlug = '[your-mode-slug]';
    this.confidenceThreshold = 0.75; // Mode-specific threshold
    this.patternCategories = [
      '[category1]',
      '[category2]',
      '[category3]'
    ];
  }

  async enhance[ModeFunction](task, context) {
    // 1. Discover relevant patterns
    const patterns = await this.discoverPatterns(context, task);

    // 2. Evaluate pattern applicability
    const applicablePatterns = await this.evaluatePatternApplicability(patterns, context, task);

    // 3. Integrate patterns into [mode function]
    const enhancedOutput = await this.applyPatternsToOutput(task, applicablePatterns, context);

    // 4. Apply quality gates
    const qualityCheckedOutput = await this.applyQualityGates(enhancedOutput, context);

    // 5. Report pattern application
    await this.reportPatternApplication(applicablePatterns, qualityCheckedOutput, context);

    return qualityCheckedOutput;
  }

  async discoverPatterns(context, task) {
    const PatternMatcher = require('../memory-bank/lib/pattern-matcher');
    const matcher = new PatternMatcher();

    // Enhance context with mode-specific information
    const enhancedContext = {
      ...context,
      [modeSpecificField1]: this.extract[ModeSpecificField1](task),
      [modeSpecificField2]: this.extract[ModeSpecificField2](task),
      task_type: task.type,
      mode: this.modeSlug
    };

    const result = await matcher.matchPatterns(enhancedContext, {
      mode: this.modeSlug,
      categories: this.patternCategories
    });

    return result;
  }

  async evaluatePatternApplicability(patterns, context, task) {
    const applicable = [];

    for (const pattern of patterns.recommendations) {
      const applicability = await this.assessPatternApplicability(pattern, context, task);

      if (applicability.score >= this.confidenceThreshold) {
        applicable.push({
          ...pattern,
          applicability_score: applicability.score,
          reasoning: applicability.reasoning,
          integration_points: applicability.integration_points
        });
      }
    }

    return applicable.sort((a, b) => b.applicability_score - a.applicability_score);
  }

  async assessPatternApplicability(pattern, context, task) {
    // Mode-specific applicability assessment
    let score = pattern.confidence_score;
    const reasoning = [];
    const integration_points = [];

    // Add mode-specific evaluation logic here
    // [Your mode-specific evaluation code]

    return { score: Math.min(1, score), reasoning, integration_points };
  }

  async applyPatternsToOutput(task, patterns, context) {
    // Mode-specific pattern application logic
    let output = task.template || '';

    // Apply patterns according to mode-specific logic
    for (const pattern of patterns) {
      output = await this.applyPattern(output, pattern, context, task);
    }

    return output;
  }

  async applyPattern(output, pattern, context, task) {
    // Mode-specific pattern application
    const patternType = pattern.metadata?.pattern_type;

    switch (patternType) {
      case '[pattern_type_1]':
        return await this.apply[PatternType1]Pattern(output, pattern, context);
      case '[pattern_type_2]':
        return await this.apply[PatternType2]Pattern(output, pattern, context);
      default:
        return await this.applyGenericPattern(output, pattern, context);
    }
  }

  async applyQualityGates(output, context) {
    const QualityGateIntegration = require('./quality-gate-integration');
    const qualityIntegration = new QualityGateIntegration(this.modeSlug);

    const qualityResult = await qualityIntegration.ensureQualityCompliance(output, context);

    return qualityResult.output;
  }

  async reportPatternApplication(patterns, output, context) {
    const LearningFeedback = require('./learning-feedback');
    const feedback = new LearningFeedback(this.modeSlug);

    for (const pattern of patterns) {
      await feedback.provideFeedback({
        type: '[mode_function]_pattern_application',
        pattern_id: pattern.pattern_id,
        pattern_name: pattern.pattern_name
      }, {
        success: true,
        output_quality: this.assessOutputQuality(output),
        patterns_applied: patterns.length
      }, context);
    }
  }

  // Mode-specific helper methods
  extract[ModeSpecificField1](task) {
    // Extract mode-specific information from task
    return task.[field] || 'unknown';
  }

  extract[ModeSpecificField2](task) {
    // Extract mode-specific information from task
    return task.[field] || 'unknown';
  }

  assessOutputQuality(output) {
    // Assess the quality of mode output
    return 0.8; // Placeholder - implement mode-specific quality assessment
  }

  async apply[PatternType1]Pattern(output, pattern, context) {
    // Apply specific pattern type to output
    return output; // Implement mode-specific application
  }

  async apply[PatternType2]Pattern(output, pattern, context) {
    // Apply specific pattern type to output
    return output; // Implement mode-specific application
  }

  async applyGenericPattern(output, pattern, context) {
    // Apply generic pattern transformations
    return output; // Implement generic pattern application
  }
}
```

### Step 3: Add Learning Integration

Add learning integration to enable continuous improvement:

```javascript
class [ModeName]Learning {
  constructor() {
    this.learningMetrics = {
      pattern_success_rate: new Map(),
      output_quality_trends: [],
      user_feedback_scores: [],
      performance_metrics: []
    };
  }

  async learnFrom[ModeFunction](result, context) {
    // Learn from successful pattern applications
    if (result.applied_patterns) {
      for (const pattern of result.applied_patterns) {
        this.updatePatternSuccessRate(pattern.pattern_id, result.quality_score > 0.8);
      }
    }

    // Learn from output quality trends
    this.learningMetrics.output_quality_trends.push({
      timestamp: new Date().toISOString(),
      quality_score: result.quality_score,
      context: context
    });

    // Learn from user feedback if available
    if (result.user_feedback) {
      this.learningMetrics.user_feedback_scores.push({
        timestamp: new Date().toISOString(),
        score: result.user_feedback.score,
        context: context
      });
    }

    // Adapt [mode function] strategy based on learning
    await this.adapt[ModeFunction]Strategy();
  }

  updatePatternSuccessRate(patternId, success) {
    const current = this.learningMetrics.pattern_success_rate.get(patternId) || { success: 0, total: 0 };
    current.total += 1;
    if (success) current.success += 1;
    this.learningMetrics.pattern_success_rate.set(patternId, current);
  }

  async adapt[ModeFunction]Strategy() {
    // Analyze learning metrics and adapt strategy
    const successfulPatterns = Array.from(this.learningMetrics.pattern_success_rate.entries())
      .filter(([, stats]) => (stats.success / stats.total) > 0.8)
      .map(([patternId]) => patternId);

    // Increase confidence threshold for highly successful patterns
    // Decrease confidence threshold for struggling patterns
    // Update pattern application priorities
  }

  async recommend[ModeFunction]Approach(task, context) {
    // Recommend the best [mode function] approach based on learning
    const recommendations = [];

    // Check for known successful patterns
    const knownSuccessfulPatterns = await this.findSuccessfulPatterns(task, context);
    if (knownSuccessfulPatterns.length > 0) {
      recommendations.push({
        approach: 'pattern_based',
        patterns: knownSuccessfulPatterns,
        confidence: 0.9,
        reasoning: 'Based on successful historical applications'
      });
    }

    // Check for learning-based recommendations
    const learningBasedRecommendations = await this.generateLearningBasedRecommendations(task, context);
    recommendations.push(...learningBasedRecommendations);

    // Systematic approach as fallback
    recommendations.push({
      approach: 'systematic',
      confidence: 0.8,
      reasoning: 'Standard systematic approach'
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  async findSuccessfulPatterns(task, context) {
    // Find patterns that have been successful in similar contexts
    const successfulPatterns = [];

    for (const [patternId, stats] of this.learningMetrics.pattern_success_rate) {
      if ((stats.success / stats.total) > 0.8) {
        // Check if pattern is applicable to current task/context
        if (await this.isPatternApplicable(patternId, task, context)) {
          successfulPatterns.push({
            pattern_id: patternId,
            success_rate: stats.success / stats.total,
            application_count: stats.total
          });
        }
      }
    }

    return successfulPatterns;
  }

  async generateLearningBasedRecommendations(task, context) {
    // Generate recommendations based on learning metrics
    const recommendations = [];

    // Analyze quality trends
    const recentQualityScores = this.learningMetrics.output_quality_trends
      .slice(-10) // Last 10 outputs
      .map(trend => trend.quality_score);

    if (recentQualityScores.length > 0) {
      const averageQuality = recentQualityScores.reduce((sum, score) => sum + score, 0) / recentQualityScores.length;

      if (averageQuality > 0.8) {
        recommendations.push({
          approach: 'continue_current_strategy',
          confidence: 0.85,
          reasoning: `Current strategy achieving ${Math.round(averageQuality * 100)}% quality`
        });
      } else {
        recommendations.push({
          approach: 'adjust_strategy',
          confidence: 0.75,
          reasoning: `Current strategy at ${Math.round(averageQuality * 100)}% quality - consider adjustments`
        });
      }
    }

    return recommendations;
  }

  async isPatternApplicable(patternId, task, context) {
    // Check if a pattern is applicable to current task/context
    // This would use the pattern matching system to determine applicability
    return true; // Placeholder - implement actual applicability check
  }
}
```

### Step 4: Add Quality Integration

Add quality gate compliance checking:

```javascript
class [ModeName]QualityIntegration {
  constructor() {
    this.qualityChecks = [
      '[mode_specific_check_1]',
      '[mode_specific_check_2]',
      '[mode_specific_check_3]'
    ];
  }

  async validate[ModeOutput]Quality(output, context) {
    const results = {};

    for (const check of this.qualityChecks) {
      results[check] = await this.performQualityCheck(check, output, context);
    }

    return {
      overall_score: this.calculateOverallScore(results),
      passed: this.isQualityAcceptable(results),
      results: results,
      recommendations: this.generateQualityRecommendations(results)
    };
  }

  async performQualityCheck(checkType, output, context) {
    // Implement mode-specific quality checks
    switch (checkType) {
      case '[mode_specific_check_1]':
        return await this.check[ModeSpecificCheck1](output, context);
      case '[mode_specific_check_2]':
        return await this.check[ModeSpecificCheck2](output, context);
      case '[mode_specific_check_3]':
        return await this.check[ModeSpecificCheck3](output, context);
      default:
        return { score: 0, passed: false };
    }
  }

  calculateOverallScore(results) {
    const scores = Object.values(results).map(r => r.score || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  isQualityAcceptable(results) {
    // Define quality acceptance criteria for your mode
    const criticalChecks = ['[critical_check_1]', '[critical_check_2]'];
    const allPassed = criticalChecks.every(check => results[check]?.passed);

    const averageScore = this.calculateOverallScore(results);
    return allPassed && averageScore >= 0.7;
  }

  generateQualityRecommendations(results) {
    const recommendations = [];

    // Generate recommendations based on failed checks
    for (const [checkType, result] of Object.entries(results)) {
      if (!result.passed) {
        recommendations.push({
          check: checkType,
          issue: result.message || 'Quality check failed',
          recommendation: this.getRecommendationForCheck(checkType),
          priority: result.severity === 'critical' ? 'high' : 'medium'
        });
      }
    }

    return recommendations;
  }

  getRecommendationForCheck(checkType) {
    const recommendations = {
      '[mode_specific_check_1]': 'Address [specific issue] by [specific action]',
      '[mode_specific_check_2]': 'Improve [specific aspect] through [specific method]',
      '[mode_specific_check_3]': 'Enhance [specific area] using [specific technique]'
    };

    return recommendations[checkType] || 'Review and improve the identified issue';
  }

  // Mode-specific quality check implementations
  async check[ModeSpecificCheck1](output, context) {
    // Implement mode-specific quality check
    return {
      passed: true, // Implement actual check logic
      score: 0.9,
      message: 'Check passed successfully',
      severity: 'medium'
    };
  }

  async check[ModeSpecificCheck2](output, context) {
    // Implement mode-specific quality check
    return {
      passed: true, // Implement actual check logic
      score: 0.85,
      message: 'Check passed successfully',
      severity: 'medium'
    };
  }

  async check[ModeSpecificCheck3](output, context) {
    // Implement mode-specific quality check
    return {
      passed: true, // Implement actual check logic
      score: 0.8,
      message: 'Check passed successfully',
      severity: 'low'
    };
  }
}
```

### Step 5: Add Context Awareness Enhancement

Add context awareness capabilities:

```javascript
class [ModeName]ContextAwareness {
  constructor() {
    this.contextAnalyzer = null;
  }

  async initializeContextAnalyzer() {
    if (!this.contextAnalyzer) {
      const ContextAnalyzer = require('../memory-bank/lib/context-analyzer');
      this.contextAnalyzer = new ContextAnalyzer();
    }
  }

  async enhanceWithContext(operation, context) {
    await this.initializeContextAnalyzer();

    // Analyze current context
    const contextAnalysis = await this.contextAnalyzer.analyzeContext(context);

    // Enhance operation with context insights
    const enhancedOperation = {
      ...operation,
      context_insights: contextAnalysis.context_insights,
      context_quality: contextAnalysis.context_quality,
      context_risks: contextAnalysis.context_risks,
      context_recommendations: contextAnalysis.context_recommendations
    };

    return enhancedOperation;
  }

  async adaptToContext(operation, context) {
    const enhanced = await this.enhanceWithContext(operation, context);

    // Adapt operation based on context
    if (enhanced.context_quality.overall_score < 0.7) {
      // Low context quality - request more information
      enhanced.adaptation = {
        type: 'request_more_info',
        reason: 'Context quality is below threshold',
        required_info: this.identifyMissingContext(context)
      };
    } else if (enhanced.context_risks.length > 0) {
      // Context risks detected - apply mitigation
      enhanced.adaptation = {
        type: 'apply_mitigation',
        reason: 'Context risks detected',
        mitigations: this.generateMitigations(enhanced.context_risks)
      };
    }

    return enhanced;
  }

  identifyMissingContext(context) {
    const required = ['[required_field_1]', '[required_field_2]'];
    const missing = required.filter(field => !context[field]);
    return missing;
  }

  generateMitigations(risks) {
    return risks.map(risk => ({
      risk: risk.description,
      mitigation: `Address ${risk.type} risk through enhanced validation`
    }));
  }

  async adapt[ModeFunction]ToContext(operation, context) {
    const adapted = await this.adaptToContext(operation, context);

    // Apply mode-specific adaptations
    if (adapted.adaptation) {
      switch (adapted.adaptation.type) {
        case 'request_more_info':
          return await this.handleMissingContext(adapted, context);
        case 'apply_mitigation':
          return await this.applyRiskMitigations(adapted, context);
        default:
          return adapted;
      }
    }

    return adapted;
  }

  async handleMissingContext(adapted, context) {
    // Handle missing context by requesting additional information
    adapted.requested_info = adapted.adaptation.required_info;
    adapted.status = 'pending_additional_info';

    return adapted;
  }

  async applyRiskMitigations(adapted, context) {
    // Apply risk mitigations to the operation
    adapted.applied_mitigations = adapted.adaptation.mitigations;
    adapted.risk_level = 'mitigated';

    return adapted;
  }
}
```

### Step 6: Add Cross-Mode Coordination

Add coordination capabilities with other modes:

```javascript
class [ModeName]Coordination {
  constructor() {
    this.coordinationProtocols = {
      '[other_mode_1]': '[coordination_type_1]',
      '[other_mode_2]': '[coordination_type_2]',
      '[other_mode_3]': '[coordination_type_3]'
    };
  }

  async coordinateWithMode(targetMode, task, context) {
    const protocol = this.coordinationProtocols[targetMode];

    switch (protocol) {
      case '[coordination_type_1]':
        return await this.request[OtherMode1]Support(task, context);
      case '[coordination_type_2]':
        return await this.request[OtherMode2]Support(task, context);
      case '[coordination_type_3]':
        return await this.request[OtherMode3]Support(task, context);
      default:
        return null;
    }
  }

  async request[OtherMode1]Support(task, context) {
    // Request support from other mode 1
    return {
      type: '[coordination_type_1]',
      task: task,
      context: context,
      priority: 'high',
      requested_support: '[specific_support_needed]'
    };
  }

  async request[OtherMode2]Support(task, context) {
    // Request support from other mode 2
    return {
      type: '[coordination_type_2]',
      task: task,
      context: context,
      priority: 'medium',
      requested_support: '[specific_support_needed]'
    };
  }

  async request[OtherMode3]Support(task, context) {
    // Request support from other mode 3
    return {
      type: '[coordination_type_3]',
      task: task,
      context: context,
      priority: 'low',
      requested_support: '[specific_support_needed]'
    };
  }

  async provideSupportToMode(requestingMode, request, context) {
    // Provide support to requesting mode
    const support = {
      supporting_mode: this.modeSlug,
      requesting_mode: requestingMode,
      request_type: request.type,
      support_provided: '',
      status: 'in_progress'
    };

    try {
      // Provide mode-specific support
      support.support_provided = await this.generateSupport(request, context);
      support.status = 'completed';

      return support;
    } catch (error) {
      support.status = 'failed';
      support.error = error.message;
      throw error;
    }
  }

  async generateSupport(request, context) {
    // Generate support based on request type
    switch (request.type) {
      case '[coordination_type_1]':
        return await this.generate[SupportType1](request, context);
      case '[coordination_type_2]':
        return await this.generate[SupportType2](request, context);
      case '[coordination_type_3]':
        return await this.generate[SupportType3](request, context);
      default:
        return 'General support provided';
    }
  }

  async generate[SupportType1](request, context) {
    // Generate specific support type 1
    return '[Support content for type 1]';
  }

  async generate[SupportType2](request, context) {
    // Generate specific support type 2
    return '[Support content for type 2]';
  }

  async generate[SupportType3](request, context) {
    // Generate specific support type 3
    return '[Support content for type 3]';
  }
}
```

### Step 7: Update Mode Behavior

Update the main mode behavior to integrate all components:

```javascript
// In your mode's main execution logic, integrate the pattern-aware enhancements:

async function execute[ModeFunction](task, context) {
  // Initialize pattern integration
  const patternIntegration = new [ModeName]PatternIntegration();
  const learning = new [ModeName]Learning();
  const qualityIntegration = new [ModeName]QualityIntegration();
  const contextAwareness = new [ModeName]ContextAwareness();
  const coordination = new [ModeName]Coordination();

  try {
    // 1. Enhance with context awareness
    const contextEnhanced = await contextAwareness.adapt[ModeFunction]ToContext(task, context);

    // 2. Check if additional information is needed
    if (contextEnhanced.status === 'pending_additional_info') {
      return {
        status: 'pending',
        requested_info: contextEnhanced.requested_info,
        message: 'Additional context information needed'
      };
    }

    // 3. Coordinate with other modes if needed
    const coordinationRequests = [];
    for (const [mode, support] of Object.entries(contextEnhanced.coordination_needed || {})) {
      const request = await coordination.coordinateWithMode(mode, task, context);
      if (request) coordinationRequests.push(request);
    }

    // 4. Execute pattern-aware [mode function]
    const result = await patternIntegration.enhance[ModeFunction](contextEnhanced, context);

    // 5. Validate quality
    const qualityValidation = await qualityIntegration.validate[ModeOutput]Quality(result.output, context);

    if (!qualityValidation.passed) {
      // Attempt remediation
      result.output = await qualityIntegration.remediateQualityIssues(result.output, qualityValidation.recommendations);
    }

    // 6. Learn from execution
    await learning.learnFrom[ModeFunction]({
      ...result,
      quality_score: qualityValidation.overall_score,
      applied_patterns: result.applied_patterns,
      coordination_requests: coordinationRequests
    }, context);

    // 7. Provide final result
    return {
      output: result.output,
      quality_score: qualityValidation.overall_score,
      applied_patterns: result.applied_patterns,
      learning_insights: result.learning_insights,
      coordination_requests: coordinationRequests,
      recommendations: qualityValidation.recommendations
    };

  } catch (error) {
    // Handle errors and learn from failures
    await learning.learnFrom[ModeFunction]({
      success: false,
      error: error.message,
      task: task,
      context: context
    }, context);

    throw error;
  }
}
```

## Testing Integration

### Unit Tests
Create unit tests for each component:

```javascript
// Example test structure
describe('[ModeName] Pattern Integration', () => {
  let patternIntegration;

  beforeEach(() => {
    patternIntegration = new [ModeName]PatternIntegration();
  });

  test('should discover relevant patterns', async () => {
    const context = { /* test context */ };
    const task = { /* test task */ };

    const patterns = await patternIntegration.discoverPatterns(context, task);

    expect(patterns).toBeDefined();
    expect(patterns.recommendations).toBeInstanceOf(Array);
  });

  test('should evaluate pattern applicability', async () => {
    const patterns = { /* mock patterns */ };
    const context = { /* test context */ };
    const task = { /* test task */ };

    const applicable = await patternIntegration.evaluatePatternApplicability(patterns, context, task);

    expect(applicable).toBeInstanceOf(Array);
    expect(applicable[0]).toHaveProperty('applicability_score');
  });

  test('should apply patterns to output', async () => {
    const task = { /* test task */ };
    const patterns = [ /* mock patterns */ ];
    const context = { /* test context */ };

    const result = await patternIntegration.applyPatternsToOutput(task, patterns, context);

    expect(result).toBeDefined();
    expect(result).not.toBe(task.template);
  });
});
```

### Integration Tests
Create integration tests for the complete workflow:

```javascript
describe('[ModeName] Integration', () => {
  test('should execute complete pattern-aware workflow', async () => {
    const task = { /* test task */ };
    const context = { /* test context */ };

    const result = await execute[ModeFunction](task, context);

    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('quality_score');
    expect(result).toHaveProperty('applied_patterns');
  });

  test('should handle missing context gracefully', async () => {
    const task = { /* test task */ };
    const incompleteContext = { /* incomplete context */ };

    const result = await execute[ModeFunction](task, incompleteContext);

    expect(result.status).toBe('pending');
    expect(result).toHaveProperty('requested_info');
  });

  test('should coordinate with other modes when needed', async () => {
    const task = { /* test task requiring coordination */ };
    const context = { /* test context */ };

    const result = await execute[ModeFunction](task, context);

    expect(result).toHaveProperty('coordination_requests');
    expect(result.coordination_requests.length).toBeGreaterThan(0);
  });
});
```

## Deployment Checklist

- [ ] Update mode instructions with pattern awareness sections
- [ ] Implement pattern application protocol
- [ ] Add learning integration components
- [ ] Integrate quality gate compliance
- [ ] Add context awareness enhancement
- [ ] Implement cross-mode coordination
- [ ] Create comprehensive tests
- [ ] Update mode documentation
- [ ] Train on pattern-aware behavior
- [ ] Monitor performance and learning effectiveness

## Monitoring and Maintenance

### Performance Monitoring
Monitor the following metrics:

- Pattern application success rate
- Quality score trends
- Learning effectiveness
- Context analysis accuracy
- Cross-mode coordination efficiency

### Maintenance Tasks
- Regularly update pattern libraries
- Review and update quality gates
- Analyze learning metrics and adapt strategies
- Update cross-mode coordination protocols
- Maintain comprehensive test coverage

This integration guide provides a comprehensive framework for adding pattern awareness to Roo AI modes while maintaining their specific expertise and workflows.