# Mode Instruction Template with Pattern Awareness

This template demonstrates how to integrate pattern awareness, application protocols, and learning integration into Roo mode custom instructions.

## Template Structure

### 1. Core Mode Definition
- **Mode Name**: [Mode Name]
- **Mode Slug**: [mode-slug]
- **Primary Expertise**: [List core competencies]
- **Pattern Categories**: [Relevant pattern types for this mode]

### 2. Pattern Awareness Integration

#### Pattern Application Protocol
All modes MUST implement the following pattern application protocol:

```javascript
// Pattern Application Protocol v1.0
const patternApplication = {
  // 1. Pattern Discovery
  discoverPatterns: async (context) => {
    // Query learning system for relevant patterns
    const PatternMatcher = require('../memory-bank/lib/pattern-matcher');
    const matcher = new PatternMatcher();
    return await matcher.matchPatterns(context);
  },

  // 2. Pattern Evaluation
  evaluatePattern: async (pattern, context) => {
    // Evaluate pattern applicability and confidence
    const confidenceThreshold = 0.7; // Mode-specific threshold
    return pattern.confidence_score >= confidenceThreshold;
  },

  // 3. Pattern Application
  applyPattern: async (pattern, context, options = {}) => {
    // Apply the pattern according to mode-specific logic
    const result = {
      pattern_id: pattern.pattern_id,
      applied_at: new Date().toISOString(),
      success: false,
      artifacts: [],
      metrics: {}
    };

    try {
      // Mode-specific pattern application logic
      // ...

      result.success = true;
      result.metrics = { /* application metrics */ };

      // Report pattern application result
      await this.reportPatternApplication(result);

      return result;
    } catch (error) {
      result.error = error.message;
      await this.reportPatternApplication(result);
      throw error;
    }
  },

  // 4. Pattern Feedback
  reportPatternApplication: async (result) => {
    // Report application result to learning system
    const PatternLogger = require('../memory-bank/lib/pattern-logger');
    const logger = new PatternLogger();

    await logger.logPatternApplication({
      pattern_id: result.pattern_id,
      mode: this.modeSlug,
      success: result.success,
      context: result.context,
      metrics: result.metrics,
      error: result.error,
      timestamp: result.applied_at
    });
  },

  // 5. Learning Integration
  learnFromApplication: async (result) => {
    // Update pattern confidence and learning models
    const ConfidenceTracker = require('../memory-bank/lib/confidence-tracker');
    const tracker = new ConfidenceTracker();

    await tracker.updateConfidence(result.pattern_id, {
      success: result.success,
      mode: this.modeSlug,
      context: result.context,
      metrics: result.metrics
    });
  }
};
```

#### Pattern-Aware Decision Making
Before making decisions, modes MUST:

1. **Context Analysis**: Analyze current project context
2. **Pattern Discovery**: Query learning system for relevant patterns
3. **Pattern Evaluation**: Evaluate pattern confidence and applicability
4. **Pattern Integration**: Consider patterns in decision-making process
5. **Application Reporting**: Report pattern application results

### 3. Learning Integration Requirements

#### Continuous Learning Loop
```javascript
class LearningIntegration {
  constructor(modeSlug) {
    this.modeSlug = modeSlug;
    this.learningEnabled = true;
    this.confidenceThreshold = 0.7;
  }

  // Integrate learning into mode workflow
  async integrateLearning(context, task) {
    // 1. Discover relevant patterns
    const patterns = await this.discoverPatterns(context, task);

    // 2. Evaluate and filter patterns
    const applicablePatterns = await this.filterApplicablePatterns(patterns, context);

    // 3. Apply learning-enhanced decision making
    const decision = await this.makeLearningEnhancedDecision(task, applicablePatterns, context);

    // 4. Apply selected patterns
    const applicationResults = await this.applySelectedPatterns(decision.patterns, context);

    // 5. Learn from results
    await this.learnFromResults(applicationResults, context);

    return decision;
  }

  async discoverPatterns(context, task) {
    const PatternMatcher = require('../memory-bank/lib/pattern-matcher');
    const matcher = new PatternMatcher();

    return await matcher.matchPatterns(context, {
      task_type: task.type,
      mode: this.modeSlug
    });
  }

  async filterApplicablePatterns(patterns, context) {
    return patterns.recommendations.filter(rec =>
      rec.confidence_score >= this.confidenceThreshold &&
      this.isPatternApplicableToMode(rec, context)
    );
  }

  async makeLearningEnhancedDecision(task, patterns, context) {
    // Mode-specific decision logic enhanced with patterns
    const decision = {
      task_id: task.id,
      patterns_to_apply: [],
      reasoning: [],
      confidence: 0
    };

    // Analyze patterns and enhance decision
    for (const pattern of patterns) {
      if (this.shouldApplyPattern(pattern, task, context)) {
        decision.patterns_to_apply.push(pattern);
        decision.reasoning.push(`Applying ${pattern.pattern_name} based on ${pattern.confidence_score} confidence`);
      }
    }

    decision.confidence = this.calculateDecisionConfidence(decision.patterns_to_apply);

    return decision;
  }

  async applySelectedPatterns(patterns, context) {
    const results = [];

    for (const pattern of patterns) {
      try {
        const result = await this.applyPattern(pattern, context);
        results.push(result);

        // Report success
        await this.reportPatternSuccess(pattern, result, context);
      } catch (error) {
        // Report failure
        await this.reportPatternFailure(pattern, error, context);
        results.push({ pattern_id: pattern.pattern_id, success: false, error: error.message });
      }
    }

    return results;
  }

  async learnFromResults(results, context) {
    const ConfidenceTracker = require('../memory-bank/lib/confidence-tracker');
    const tracker = new ConfidenceTracker();

    for (const result of results) {
      await tracker.updateConfidence(result.pattern_id, {
        success: result.success,
        mode: this.modeSlug,
        context: context,
        metrics: result.metrics || {},
        error: result.error
      });
    }
  }

  // Mode-specific helper methods
  shouldApplyPattern(pattern, task, context) {
    // Mode-specific logic for pattern applicability
    return true; // Override in specific mode implementation
  }

  isPatternApplicableToMode(pattern, context) {
    // Check if pattern is relevant to this mode
    return true; // Override in specific mode implementation
  }

  calculateDecisionConfidence(patterns) {
    if (patterns.length === 0) return 0;
    const totalConfidence = patterns.reduce((sum, p) => sum + p.confidence_score, 0);
    return totalConfidence / patterns.length;
  }

  async applyPattern(pattern, context) {
    // Mode-specific pattern application logic
    throw new Error('applyPattern must be implemented by specific mode');
  }

  async reportPatternSuccess(pattern, result, context) {
    const PatternLogger = require('../memory-bank/lib/pattern-logger');
    const logger = new PatternLogger();

    await logger.logPatternApplication({
      pattern_id: pattern.pattern_id,
      mode: this.modeSlug,
      success: true,
      context: context,
      result: result,
      timestamp: new Date().toISOString()
    });
  }

  async reportPatternFailure(pattern, error, context) {
    const PatternLogger = require('../memory-bank/lib/pattern-logger');
    const logger = new PatternLogger();

    await logger.logPatternApplication({
      pattern_id: pattern.pattern_id,
      mode: this.modeSlug,
      success: false,
      context: context,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 4. Quality Gate Integration

#### Quality Gate Compliance
Modes MUST ensure their outputs comply with relevant quality gates:

```javascript
class QualityGateIntegration {
  constructor(modeSlug) {
    this.modeSlug = modeSlug;
    this.qualityEngine = null;
  }

  async initializeQualityEngine() {
    if (!this.qualityEngine) {
      const QualityGateEnforcementEngine = require('../memory-bank/lib/quality-gate-enforcement');
      this.qualityEngine = new QualityGateEnforcementEngine();
    }
  }

  async checkQualityGates(output, context) {
    await this.initializeQualityEngine();

    const target = {
      id: `mode_output_${Date.now()}`,
      type: 'mode_output',
      mode: this.modeSlug,
      content: output,
      context: context
    };

    const execution = await this.qualityEngine.executeQualityGates(target, context);

    return {
      compliant: execution.summary.overall_status === 'passed',
      score: execution.summary.quality_score,
      violations: execution.summary.failed_gates,
      recommendations: execution.summary.recommendations
    };
  }

  async ensureQualityCompliance(output, context) {
    const qualityCheck = await this.checkQualityGates(output, context);

    if (!qualityCheck.compliant) {
      // Attempt automatic remediation
      const remediatedOutput = await this.remediateQualityIssues(output, qualityCheck.recommendations);

      // Re-check quality after remediation
      const recheck = await this.checkQualityGates(remediatedOutput, context);

      return {
        output: remediatedOutput,
        quality_score: recheck.score,
        compliant: recheck.compliant,
        remediation_applied: true
      };
    }

    return {
      output: output,
      quality_score: qualityCheck.score,
      compliant: true,
      remediation_applied: false
    };
  }

  async remediateQualityIssues(output, recommendations) {
    // Mode-specific remediation logic
    let remediatedOutput = output;

    for (const recommendation of recommendations) {
      remediatedOutput = await this.applyRecommendation(remediatedOutput, recommendation);
    }

    return remediatedOutput;
  }

  async applyRecommendation(output, recommendation) {
    // Mode-specific recommendation application
    // This should be overridden in specific mode implementations
    return output;
  }
}
```

### 5. Context Awareness Enhancement

#### Context-Aware Operation
Modes MUST enhance their operation with context awareness:

```javascript
class ContextAwareness {
  constructor(modeSlug) {
    this.modeSlug = modeSlug;
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
    const required = ['technology_stack', 'project_type', 'team_size'];
    const missing = required.filter(field => !context[field]);
    return missing;
  }

  generateMitigations(risks) {
    return risks.map(risk => ({
      risk: risk.description,
      mitigation: `Address ${risk.type} risk through enhanced validation`
    }));
  }
}
```

### 6. Learning Feedback Integration

#### Continuous Learning Feedback
Modes MUST provide feedback to the learning system:

```javascript
class LearningFeedback {
  constructor(modeSlug) {
    this.modeSlug = modeSlug;
    this.feedbackEnabled = true;
  }

  async provideFeedback(action, result, context) {
    if (!this.feedbackEnabled) return;

    const feedback = {
      mode: this.modeSlug,
      action: action,
      result: result,
      context: context,
      timestamp: new Date().toISOString(),
      success: result.success,
      metrics: result.metrics || {},
      learnings: await this.extractLearnings(action, result, context)
    };

    // Store feedback in learning system
    await this.storeFeedback(feedback);

    // Update pattern confidence if applicable
    if (action.pattern_id) {
      await this.updatePatternConfidence(action.pattern_id, feedback);
    }

    return feedback;
  }

  async extractLearnings(action, result, context) {
    const learnings = [];

    // Extract general learnings
    if (result.success) {
      learnings.push({
        type: 'success_pattern',
        description: `Successful ${action.type} in ${context.project_type} context`,
        confidence: 0.8
      });
    } else {
      learnings.push({
        type: 'failure_pattern',
        description: `Failed ${action.type} in ${context.project_type} context`,
        confidence: 0.6
      });
    }

    // Extract context-specific learnings
    if (context.technology_stack) {
      learnings.push({
        type: 'technology_learning',
        description: `${action.type} ${result.success ? 'works well' : 'has issues'} with ${context.technology_stack.join(', ')}`,
        confidence: 0.7
      });
    }

    return learnings;
  }

  async storeFeedback(feedback) {
    const PatternLogger = require('../memory-bank/lib/pattern-logger');
    const logger = new PatternLogger();

    await logger.logFeedback(feedback);
  }

  async updatePatternConfidence(patternId, feedback) {
    const ConfidenceTracker = require('../memory-bank/lib/confidence-tracker');
    const tracker = new ConfidenceTracker();

    await tracker.updateConfidence(patternId, {
      success: feedback.success,
      mode: this.modeSlug,
      context: feedback.context,
      metrics: feedback.metrics
    });
  }
}
```

## Implementation Guide

### Step 1: Update Mode Instructions
1. Add pattern awareness section to mode instructions
2. Include pattern application protocol implementation
3. Add learning integration requirements

### Step 2: Implement Pattern Integration
1. Create mode-specific pattern application logic
2. Implement learning feedback mechanisms
3. Add quality gate compliance checking

### Step 3: Enhance Context Awareness
1. Integrate context analysis into mode operations
2. Adapt mode behavior based on context insights
3. Implement context-aware decision making

### Step 4: Testing and Validation
1. Test pattern application in various contexts
2. Validate learning feedback mechanisms
3. Ensure quality gate compliance

## Example Integration Points

### Code Mode Integration Example
```javascript
// In Code mode instructions, add:
## Pattern-Aware Code Generation

When generating code, Code mode MUST:

1. **Discover Patterns**: Query learning system for relevant coding patterns
2. **Evaluate Applicability**: Assess pattern confidence and context fit
3. **Apply Patterns**: Integrate applicable patterns into code generation
4. **Report Application**: Log pattern application results for learning

### Pattern Categories for Code Mode
- **Design Patterns**: Singleton, Factory, Observer, Strategy
- **Security Patterns**: Input validation, Authentication, Authorization
- **Performance Patterns**: Caching, Lazy loading, Connection pooling
- **Error Handling Patterns**: Try-catch, Circuit breaker, Retry logic
```

### Debug Mode Integration Example
```javascript
// In Debug mode instructions, add:
## Learning-Enhanced Debugging

When debugging issues, Debug mode MUST:

1. **Pattern-Based Diagnosis**: Use historical patterns to identify issue types
2. **Context-Aware Analysis**: Consider project context in debugging approach
3. **Learning from Resolution**: Capture successful debugging patterns
4. **Quality Gate Verification**: Ensure fixes meet quality standards

### Pattern Categories for Debug Mode
- **Common Bug Patterns**: Null pointer, Race conditions, Memory leaks
- **Debugging Strategies**: Binary search, Logging, Profiling
- **Root Cause Analysis**: 5-whys, Fishbone diagrams, Timeline analysis
```

This template provides a comprehensive framework for integrating pattern awareness and learning capabilities into Roo modes while maintaining their specific expertise and workflows.