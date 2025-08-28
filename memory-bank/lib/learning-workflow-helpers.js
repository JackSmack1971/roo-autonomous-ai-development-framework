/**
 * Learning Workflow Helpers
 *
 * Standardized workflow patterns for integrating learning into mode operations
 * Provides reusable functions for common learning integration scenarios
 */

const LearningProtocolClient = require('./learning-protocol-client');

class LearningWorkflowHelpers {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.modeName = options.modeName || 'unknown';
  }

  /**
   * Standard pre-task learning check workflow
   */
  async preTaskLearningCheck(context = {}, taskType = 'general') {
    console.log(`🔍 [${this.modeName}] Checking for learning guidance...`);

    try {
      const guidance = await this.learningClient.getLearningGuidance(context, taskType);

      if (guidance.available && guidance.guidance.recommendations.length > 0) {
        const highConfidenceRecommendations = guidance.guidance.recommendations.filter(
          rec => rec.confidence_score >= 0.8
        );

        if (highConfidenceRecommendations.length > 0) {
          console.log(`🎯 [${this.modeName}] High-confidence learning pattern found:`);
          console.log(`   Pattern: ${highConfidenceRecommendations[0].pattern_name}`);
          console.log(`   Confidence: ${(highConfidenceRecommendations[0].confidence_score * 100).toFixed(1)}%`);
          console.log(`   Action: ${highConfidenceRecommendations[0].action}`);

          return {
            hasGuidance: true,
            guidance: highConfidenceRecommendations[0],
            allRecommendations: guidance.guidance.recommendations
          };
        } else {
          console.log(`🤔 [${this.modeName}] Learning patterns available but low confidence`);
          return {
            hasGuidance: false,
            guidance: null,
            allRecommendations: guidance.guidance.recommendations
          };
        }
      } else {
        console.log(`📚 [${this.modeName}] Learning system unavailable - using standard workflow`);
        return {
          hasGuidance: false,
          guidance: null,
          fallback: true
        };
      }
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Learning check failed: ${error.message}`);
      return {
        hasGuidance: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Standard post-task learning update workflow
   */
  async postTaskLearningUpdate(taskType, outcome, confidence = 0.5, details = '') {
    console.log(`📝 [${this.modeName}] Logging learning outcome: ${outcome}`);

    try {
      await this.learningClient.logOutcome(
        this.modeName,
        taskType,
        outcome,
        confidence,
        details
      );

      console.log(`✅ [${this.modeName}] Learning outcome logged successfully`);
      return { success: true };

    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Failed to log learning outcome: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Context-aware learning application
   */
  async applyContextAwareLearning(context = {}, taskType = 'general') {
    const learningCheck = await this.preTaskLearningCheck(context, taskType);

    if (learningCheck.hasGuidance && learningCheck.guidance.confidence_score >= 0.8) {
      console.log(`🚀 [${this.modeName}] Applying high-confidence learning pattern automatically`);

      // Apply the learning pattern
      const applicationResult = await this.applyLearningPattern(learningCheck.guidance, context);

      // Log the application
      await this.postTaskLearningUpdate(
        taskType,
        applicationResult.success ? 'success' : 'failure',
        learningCheck.guidance.confidence_score,
        `Auto-applied pattern: ${learningCheck.guidance.pattern_name}`
      );

      return {
        applied: true,
        pattern: learningCheck.guidance,
        result: applicationResult
      };
    } else {
      console.log(`📋 [${this.modeName}] Proceeding with standard workflow`);
      return {
        applied: false,
        reason: learningCheck.hasGuidance ? 'low_confidence' : 'no_guidance'
      };
    }
  }

  /**
   * Apply a specific learning pattern
   */
  async applyLearningPattern(pattern, context) {
    try {
      // This would be customized based on pattern type and action
      console.log(`🔧 [${this.modeName}] Applying pattern: ${pattern.pattern_name}`);

      // Simulate pattern application
      // In real implementation, this would execute the pattern's auto_apply_actions
      const result = {
        success: true,
        action_taken: pattern.action,
        pattern_id: pattern.pattern_id,
        confidence: pattern.confidence_score
      };

      return result;

    } catch (error) {
      console.error(`❌ [${this.modeName}] Pattern application failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        pattern_id: pattern.pattern_id
      };
    }
  }

  /**
   * Intelligent delegation with learning
   */
  async intelligentDelegation(context = {}, taskType = 'delegation') {
    console.log(`🎯 [${this.modeName}] Analyzing delegation with learning...`);

    const guidance = await this.preTaskLearningCheck(context, taskType);

    if (guidance.hasGuidance) {
      const delegationPatterns = guidance.allRecommendations.filter(
        rec => rec.metadata?.pattern_type === 'delegation' || rec.metadata?.pattern_type === 'orchestration'
      );

      if (delegationPatterns.length > 0) {
        const bestPattern = delegationPatterns[0];
        console.log(`📨 [${this.modeName}] Learning-guided delegation: ${bestPattern.pattern_name}`);

        return {
          guided: true,
          recommendation: bestPattern,
          target_mode: bestPattern.action?.target_mode || 'sparc-orchestrator',
          priority: this.calculateDelegationPriority(bestPattern, context)
        };
      }
    }

    // Fallback to standard delegation logic
    return {
      guided: false,
      fallback: true,
      target_mode: this.determineFallbackMode(context, taskType)
    };
  }

  /**
   * Quality gate with learning enhancement
   */
  async learningEnhancedQualityGate(artifact, gateType = 'general') {
    console.log(`🔍 [${this.modeName}] Running learning-enhanced quality gate: ${gateType}`);

    const context = {
      artifact_type: typeof artifact,
      gate_type: gateType,
      artifact_size: artifact ? artifact.toString().length : 0
    };

    const guidance = await this.preTaskLearningCheck(context, `quality_${gateType}`);

    const qualityChecks = [];

    // Standard quality checks
    qualityChecks.push(...this.getStandardQualityChecks(gateType));

    // Add learning-enhanced checks
    if (guidance.hasGuidance) {
      qualityChecks.push(...this.extractLearningQualityChecks(guidance.allRecommendations));
    }

    // Run all checks
    const results = await this.runQualityChecks(artifact, qualityChecks);

    // Log quality gate results
    await this.postTaskLearningUpdate(
      `quality_${gateType}`,
      results.passed ? 'success' : 'failure',
      results.score,
      `Quality gate ${gateType}: ${results.passed ? 'PASSED' : 'FAILED'} (${results.score.toFixed(2)})`
    );

    return results;
  }

  /**
   * Error handling with learning
   */
  async learningEnhancedErrorHandling(error, context = {}) {
    console.log(`🚨 [${this.modeName}] Analyzing error with learning: ${error.message}`);

    const errorContext = {
      error_type: error.name,
      error_message: error.message,
      context: context,
      timestamp: new Date().toISOString()
    };

    const guidance = await this.preTaskLearningCheck(errorContext, 'error_handling');

    if (guidance.hasGuidance) {
      const errorPatterns = guidance.allRecommendations.filter(
        rec => rec.metadata?.pattern_type === 'error' || rec.metadata?.pattern_type === 'recovery'
      );

      if (errorPatterns.length > 0) {
        console.log(`💡 [${this.modeName}] Learning-based error recovery: ${errorPatterns[0].pattern_name}`);

        return {
          guided: true,
          recovery_action: errorPatterns[0].action,
          confidence: errorPatterns[0].confidence_score
        };
      }
    }

    // Fallback error handling
    return {
      guided: false,
      fallback: true,
      standard_handling: this.getStandardErrorHandling(error)
    };
  }

  /**
   * Get standard quality checks for a gate type
   */
  getStandardQualityChecks(gateType) {
    const checks = {
      security: [
        { name: 'input_validation', type: 'security' },
        { name: 'authentication_check', type: 'security' },
        { name: 'authorization_check', type: 'security' }
      ],
      performance: [
        { name: 'response_time_check', type: 'performance' },
        { name: 'resource_usage_check', type: 'performance' },
        { name: 'scalability_assessment', type: 'performance' }
      ],
      general: [
        { name: 'completeness_check', type: 'general' },
        { name: 'consistency_check', type: 'general' },
        { name: 'maintainability_check', type: 'general' }
      ]
    };

    return checks[gateType] || checks.general;
  }

  /**
   * Extract quality checks from learning recommendations
   */
  extractLearningQualityChecks(recommendations) {
    return recommendations
      .filter(rec => rec.metadata?.pattern_type === 'quality')
      .map(rec => ({
        name: rec.pattern_name,
        type: 'learning_enhanced',
        pattern: rec,
        confidence: rec.confidence_score
      }));
  }

  /**
   * Run quality checks
   */
  async runQualityChecks(artifact, checks) {
    const results = {
      passed: true,
      score: 1.0,
      failed_checks: [],
      passed_checks: [],
      details: {}
    };

    for (const check of checks) {
      try {
        const checkResult = await this.runSingleQualityCheck(artifact, check);

        if (checkResult.passed) {
          results.passed_checks.push(check.name);
        } else {
          results.passed = false;
          results.failed_checks.push(check.name);
          results.score -= checkResult.weight || 0.1;
        }

        results.details[check.name] = checkResult;

      } catch (error) {
        console.warn(`Quality check failed: ${check.name} - ${error.message}`);
        results.passed = false;
        results.failed_checks.push(check.name);
        results.score -= 0.1;
      }
    }

    results.score = Math.max(0, results.score);
    return results;
  }

  /**
   * Run a single quality check
   */
  async runSingleQualityCheck(artifact, check) {
    // This would be implemented based on the specific check type
    // For now, return a mock result
    return {
      passed: Math.random() > 0.3, // 70% pass rate for demo
      weight: 0.1,
      details: `Check ${check.name} completed`,
      check_type: check.type
    };
  }

  /**
   * Calculate delegation priority
   */
  calculateDelegationPriority(pattern, context) {
    let priority = 50; // Base priority

    // Boost for high-confidence patterns
    if (pattern.confidence_score > 0.8) {
      priority += 20;
    }

    // Boost for urgent contexts
    if (context.urgent || context.critical) {
      priority += 15;
    }

    // Boost for security patterns
    if (pattern.metadata?.pattern_type === 'security') {
      priority += 10;
    }

    return Math.min(100, priority);
  }

  /**
   * Determine fallback mode for delegation
   */
  determineFallbackMode(context, taskType) {
    // Simple fallback logic - in practice this would be more sophisticated
    if (taskType.includes('security')) return 'security-reviewer';
    if (taskType.includes('performance')) return 'performance-engineer';
    if (taskType.includes('architecture')) return 'sparc-architect';

    return 'sparc-orchestrator';
  }

  /**
   * Get standard error handling
   */
  getStandardErrorHandling(error) {
    return {
      action: 'log_and_retry',
      message: `Standard error handling for ${error.name}: ${error.message}`,
      retry_count: 3,
      escalation_threshold: 5
    };
  }

  /**
   * Get learning statistics
   */
  getStatistics() {
    return {
      mode: this.modeName,
      learning_client_stats: this.learningClient.getStatistics(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = LearningWorkflowHelpers;