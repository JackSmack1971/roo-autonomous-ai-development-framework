/**
 * Learning Integration Example
 *
 * Complete working example demonstrating how to integrate learning capabilities
 * into any mode's workflow with proper error handling and quality control
 */

const LearningProtocolClient = require('./learning-protocol-client');
const LearningWorkflowHelpers = require('./learning-workflow-helpers');
const LearningQualityControl = require('./learning-quality-control');
const LearningErrorHandler = require('./learning-error-handler');

class LearningIntegratedModeExample {
  constructor(modeName = 'example-mode') {
    this.modeName = modeName;

    // Initialize learning components
    this.learningClient = new LearningProtocolClient({
      modeName: this.modeName,
      learningSystemPath: __dirname + '/../',
      enableCaching: true,
      timeoutMs: 5000,
      confidenceThreshold: 0.7
    });

    this.workflowHelpers = new LearningWorkflowHelpers({
      modeName: this.modeName,
      learningClient: this.learningClient
    });

    this.qualityControl = new LearningQualityControl({
      modeName: this.modeName,
      confidenceThreshold: 0.7,
      successRateThreshold: 0.8
    });

    this.errorHandler = new LearningErrorHandler({
      modeName: this.modeName,
      maxConsecutiveFailures: 3,
      errorRateThreshold: 0.1
    });

    console.log(`🚀 [${this.modeName}] Learning-integrated mode initialized`);
  }

  /**
   * Complete workflow example with learning integration
   */
  async executeTaskWithLearning(taskDescription, context = {}) {
    console.log(`🎯 [${this.modeName}] Starting task: ${taskDescription}`);

    const taskContext = {
      task_description: taskDescription,
      context_data: context,
      timestamp: new Date().toISOString(),
      mode: this.modeName
    };

    let taskOutcome = 'success';
    let taskConfidence = 0.5;

    try {
      // Phase 1: Pre-task learning check
      console.log(`🔍 [${this.modeName}] Phase 1: Learning consultation`);
      const learningGuidance = await this.performLearningCheck(taskContext);

      // Phase 2: Execute core task with learning awareness
      console.log(`⚡ [${this.modeName}] Phase 2: Core execution`);
      const executionResult = await this.executeCoreTask(taskDescription, context, learningGuidance);

      // Phase 3: Quality control
      console.log(`🔍 [${this.modeName}] Phase 3: Quality control`);
      const qualityResult = await this.performQualityControl(executionResult, taskContext);

      if (!qualityResult.passed) {
        console.warn(`⚠️ [${this.modeName}] Quality gate failed - attempting remediation`);
        const remediationResult = await this.attemptQualityRemediation(qualityResult, taskContext);
        if (!remediationResult.success) {
          taskOutcome = 'failure';
          taskConfidence = 0.3;
        }
      }

      // Phase 4: Learning update
      console.log(`📝 [${this.modeName}] Phase 4: Learning update`);
      await this.updateLearningSystem(taskContext, taskOutcome, taskConfidence, executionResult);

      return {
        success: taskOutcome === 'success',
        result: executionResult,
        quality_check: qualityResult,
        learning_guidance: learningGuidance,
        confidence: taskConfidence
      };

    } catch (error) {
      console.error(`❌ [${this.modeName}] Task execution failed: ${error.message}`);

      // Handle error with learning error handler
      const errorResult = await this.errorHandler.handleLearningError(error, taskContext, 'task_execution');

      taskOutcome = 'failure';
      taskConfidence = 0.1;

      // Still update learning system about the failure
      await this.updateLearningSystem(taskContext, taskOutcome, taskConfidence, null, error.message);

      return {
        success: false,
        error: error.message,
        error_handling: errorResult,
        confidence: taskConfidence
      };
    }
  }

  /**
   * Perform pre-task learning check
   */
  async performLearningCheck(taskContext) {
    try {
      const guidance = await this.workflowHelpers.preTaskLearningCheck(
        taskContext,
        'task_execution'
      );

      if (guidance.hasGuidance && guidance.guidance.confidence_score >= 0.8) {
        console.log(`🎯 [${this.modeName}] High-confidence learning pattern available: ${guidance.guidance.pattern_name}`);
        return {
          available: true,
          guidance: guidance.guidance,
          should_apply: true
        };
      } else {
        console.log(`📋 [${this.modeName}] Proceeding with standard workflow`);
        return {
          available: false,
          guidance: guidance.allRecommendations || [],
          should_apply: false
        };
      }
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Learning check failed: ${error.message}`);
      return {
        available: false,
        error: error.message,
        should_apply: false
      };
    }
  }

  /**
   * Execute core task with learning awareness
   */
  async executeCoreTask(taskDescription, context, learningGuidance) {
    console.log(`⚡ [${this.modeName}] Executing core task logic`);

    // Apply learning guidance if available and confident
    if (learningGuidance.available && learningGuidance.should_apply) {
      console.log(`🚀 [${this.modeName}] Applying learning pattern: ${learningGuidance.guidance.pattern_name}`);

      // Apply the learning pattern to influence task execution
      return await this.applyLearningPattern(taskDescription, context, learningGuidance.guidance);
    } else {
      // Execute standard task logic
      return await this.executeStandardTask(taskDescription, context);
    }
  }

  /**
   * Apply learning pattern to task execution
   */
  async applyLearningPattern(taskDescription, context, pattern) {
    console.log(`🔧 [${this.modeName}] Applying pattern: ${pattern.pattern_name}`);

    // This would be customized based on the specific pattern type
    // For demonstration, we'll simulate pattern application
    const enhancedContext = {
      ...context,
      learning_enhanced: true,
      applied_pattern: pattern.pattern_name,
      pattern_confidence: pattern.confidence_score
    };

    // Execute task with enhanced context
    const result = await this.executeStandardTask(taskDescription, enhancedContext);

    return {
      ...result,
      learning_applied: true,
      pattern_name: pattern.pattern_name,
      confidence_boost: pattern.confidence_score * 0.2
    };
  }

  /**
   * Execute standard task logic (placeholder)
   */
  async executeStandardTask(taskDescription, context) {
    console.log(`📋 [${this.modeName}] Executing standard task logic`);

    // Simulate task execution
    const result = {
      task_description: taskDescription,
      context: context,
      execution_time_ms: Math.random() * 1000 + 500,
      success: Math.random() > 0.2, // 80% success rate
      output: `Completed: ${taskDescription}`,
      learning_enhanced: context.learning_enhanced || false
    };

    if (!result.success) {
      throw new Error(`Task execution failed: ${taskDescription}`);
    }

    return result;
  }

  /**
   * Perform quality control on execution result
   */
  async performQualityControl(executionResult, taskContext) {
    const qualityResult = await this.qualityControl.runQualityGate(
      executionResult,
      'task_execution',
      taskContext
    );

    return qualityResult;
  }

  /**
   * Attempt quality remediation
   */
  async attemptQualityRemediation(qualityResult, taskContext) {
    console.log(`🔧 [${this.modeName}] Attempting quality remediation`);

    // Try to apply learning-based remediation
    for (const recommendation of qualityResult.recommendations) {
      if (recommendation.type === 'learning_recommendation' && recommendation.confidence > 0.7) {
        console.log(`💡 [${this.modeName}] Applying remediation: ${recommendation.pattern_name}`);

        // Apply remediation pattern
        const remediationResult = await this.applyRemediationPattern(recommendation, taskContext);

        if (remediationResult.success) {
          return remediationResult;
        }
      }
    }

    return { success: false, reason: 'no_successful_remediation' };
  }

  /**
   * Apply remediation pattern
   */
  async applyRemediationPattern(recommendation, taskContext) {
    // Placeholder remediation logic
    console.log(`🔧 [${this.modeName}] Applying remediation pattern: ${recommendation.pattern_name}`);

    return {
      success: Math.random() > 0.4, // 60% remediation success rate
      pattern_applied: recommendation.pattern_name,
      confidence: recommendation.confidence
    };
  }

  /**
   * Update learning system with task outcomes
   */
  async updateLearningSystem(taskContext, outcome, confidence, executionResult, errorMessage = null) {
    const details = errorMessage ?
      `Task failed: ${errorMessage}` :
      `Task completed successfully with confidence ${(confidence * 100).toFixed(1)}%`;

    await this.workflowHelpers.postTaskLearningUpdate(
      'task_execution',
      outcome,
      confidence,
      details
    );

    console.log(`📝 [${this.modeName}] Learning system updated with outcome: ${outcome}`);
  }

  /**
   * Demonstrate error handling
   */
  async demonstrateErrorHandling() {
    console.log(`🚨 [${this.modeName}] Demonstrating error handling capabilities`);

    // Simulate various error scenarios
    const errorScenarios = [
      new Error('Network timeout'),
      new Error('Validation failed'),
      new Error('Resource exhausted'),
      new Error('Authentication failed')
    ];

    for (const error of errorScenarios) {
      console.log(`\n--- Testing error: ${error.message} ---`);

      try {
        // Force an error to test handling
        throw error;
      } catch (caughtError) {
        const result = await this.errorHandler.handleLearningError(
          caughtError,
          { test_context: true },
          'error_testing'
        );

        console.log(`Error handling result:`, result);
      }
    }

    console.log(`\n📊 Error handler statistics:`, this.errorHandler.getStatistics());
  }

  /**
   * Demonstrate quality control
   */
  async demonstrateQualityControl() {
    console.log(`🔍 [${this.modeName}] Demonstrating quality control capabilities`);

    // Test with different artifacts
    const testArtifacts = [
      { type: 'code', content: 'function test() { return true; }' },
      { type: 'config', content: 'invalid: yaml: content:' },
      { type: 'documentation', content: 'This is a test document.' }
    ];

    for (const artifact of testArtifacts) {
      console.log(`\n--- Testing quality gate for: ${artifact.type} ---`);

      const result = await this.qualityControl.runQualityGate(
        artifact.content,
        artifact.type,
        { test_mode: true }
      );

      console.log(`Quality gate result:`, {
        passed: result.passed,
        score: (result.overall_score * 100).toFixed(1) + '%',
        checks_passed: result.checks.filter(c => c.passed).length,
        checks_failed: result.checks.filter(c => !c.passed).length
      });
    }

    console.log(`\n📊 Quality control statistics:`, this.qualityControl.getStatistics());
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    return {
      mode: this.modeName,
      learning_client: this.learningClient.getStatistics(),
      error_handler: this.errorHandler.getStatistics(),
      quality_control: this.qualityControl.getStatistics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset all learning components
   */
  reset() {
    this.learningClient.clearCache();
    this.errorHandler.reset();
    this.qualityControl.reset();
    console.log(`🔄 [${this.modeName}] All learning components reset`);
  }
}

/**
 * Demonstration function showing the complete learning integration
 */
async function demonstrateLearningIntegration() {
  console.log('🚀 Starting Learning Integration Demonstration\n');

  const exampleMode = new LearningIntegratedModeExample('demo-mode');

  // Demonstrate task execution with learning
  console.log('=== TASK EXECUTION WITH LEARNING ===');
  const taskResult = await exampleMode.executeTaskWithLearning(
    'Implement user authentication system',
    {
      technology_stack: ['nodejs', 'express', 'jwt'],
      security_requirements: ['oauth2', 'password_hashing'],
      user_count: 10000
    }
  );

  console.log('Task execution result:', taskResult);

  // Demonstrate error handling
  console.log('\n=== ERROR HANDLING DEMONSTRATION ===');
  await exampleMode.demonstrateErrorHandling();

  // Demonstrate quality control
  console.log('\n=== QUALITY CONTROL DEMONSTRATION ===');
  await exampleMode.demonstrateQualityControl();

  // Show final statistics
  console.log('\n=== FINAL STATISTICS ===');
  console.log(JSON.stringify(exampleMode.getStatistics(), null, 2));

  console.log('\n✅ Learning Integration Demonstration Complete');
}

// Export for use in other modules
module.exports = LearningIntegratedModeExample;

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateLearningIntegration().catch(console.error);
}