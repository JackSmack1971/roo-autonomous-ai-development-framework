/**
 * Pattern Protocol Client
 *
 * Client library for modes to interact with the Pattern Application Protocol.
 * Provides a simple, consistent interface for accessing learning system capabilities.
 */

const PatternApplicationProtocol = require('./pattern-application-protocol');

class PatternProtocolClient {
  constructor(modeSlug, options = {}) {
    this.modeSlug = modeSlug;
    this.protocol = new PatternApplicationProtocol({
      modeSlug: modeSlug,
      ...options
    });

    this.initialized = false;
    this.sessionId = null;
  }

  /**
   * Initialize the client
   */
  async initialize(components = {}) {
    try {
      await this.protocol.initialize(components);
      this.initialized = true;
      this.sessionId = this.protocol.sessionId;
      return true;
    } catch (error) {
      console.error(`Failed to initialize pattern protocol client for ${this.modeSlug}:`, error);
      throw error;
    }
  }

  /**
   * Discover patterns for current context
   */
  async discoverPatterns(context, options = {}) {
    this.ensureInitialized();
    return await this.protocol.discoverPatterns(context, options);
  }

  /**
   * Get recommendations for current context
   */
  async getRecommendations(context, patternMatches, options = {}) {
    this.ensureInitialized();
    return await this.protocol.getRecommendations(context, patternMatches, options);
  }

  /**
   * Apply a pattern
   */
  async applyPattern(patternId, patternData, context, options = {}) {
    this.ensureInitialized();
    return await this.protocol.applyPattern(patternId, patternData, context, options);
  }

  /**
   * Report feedback on pattern application
   */
  async reportFeedback(patternId, feedback, context, options = {}) {
    this.ensureInitialized();
    return await this.protocol.reportFeedback(patternId, feedback, context, options);
  }

  /**
   * Execute quality gates
   */
  async executeQualityGates(target, context, options = {}) {
    this.ensureInitialized();
    return await this.protocol.executeQualityGates(target, context, options);
  }

  /**
   * Get learning insights
   */
  async getLearningInsights(context, options = {}) {
    this.ensureInitialized();
    return await this.protocol.getLearningInsights(context, options);
  }

  /**
   * Enhanced context-aware pattern discovery and application
   */
  async discoverAndApplyPatterns(context, options = {}) {
    this.ensureInitialized();

    const result = {
      discovery: null,
      recommendations: null,
      applications: [],
      feedback: [],
      quality_checks: [],
      insights: null
    };

    try {
      // Step 1: Discover patterns
      result.discovery = await this.protocol.discoverPatterns(context, options.discovery || {});

      // Step 2: Get recommendations
      result.recommendations = await this.protocol.getRecommendations(
        context,
        result.discovery.result,
        options.recommendations || {}
      );

      // Step 3: Apply top recommendations
      const topRecommendations = result.recommendations.result.recommendations.slice(0, 3);

      for (const recommendation of topRecommendations) {
        try {
          const application = await this.protocol.applyPattern(
            recommendation.pattern_id,
            recommendation,
            context,
            options.application || {}
          );

          result.applications.push(application);

          // Step 4: Execute quality gates
          const qualityCheck = await this.protocol.executeQualityGates(
            { id: `application_${application.request_id}`, type: 'pattern_application', data: application },
            context,
            options.quality || {}
          );

          result.quality_checks.push(qualityCheck);

          // Step 5: Report feedback
          const feedback = {
            success: application.result.success,
            score: recommendation.confidence_score,
            metrics: application.result.metrics,
            quality_score: qualityCheck.result.summary.quality_score
          };

          const feedbackReport = await this.protocol.reportFeedback(
            recommendation.pattern_id,
            feedback,
            context,
            options.feedback || {}
          );

          result.feedback.push(feedbackReport);

        } catch (error) {
          console.warn(`Failed to apply pattern ${recommendation.pattern_id}:`, error.message);
          result.applications.push({
            pattern_id: recommendation.pattern_id,
            success: false,
            error: error.message
          });
        }
      }

      // Step 6: Get learning insights
      result.insights = await this.protocol.getLearningInsights(context, options.insights || {});

      return result;

    } catch (error) {
      console.error('Enhanced pattern discovery and application failed:', error);
      throw error;
    }
  }

  /**
   * Quick pattern application with automatic feedback
   */
  async quickApply(patternId, patternData, context, successCallback = null) {
    this.ensureInitialized();

    try {
      // Apply the pattern
      const application = await this.protocol.applyPattern(patternId, patternData, context, {
        validate_quality: true,
        log_application: true,
        update_confidence: true
      });

      // Execute quality gates
      const qualityCheck = await this.protocol.executeQualityGates(
        { id: `quick_apply_${application.request_id}`, type: 'pattern_application', data: application },
        context
      );

      // Report feedback
      const feedback = {
        success: application.result.success,
        score: patternData.confidence_score || 0.8,
        metrics: application.result.metrics,
        quality_score: qualityCheck.result.summary.quality_score,
        quick_apply: true
      };

      await this.protocol.reportFeedback(patternId, feedback, context);

      // Call success callback if provided
      if (successCallback && application.result.success) {
        await successCallback(application.result);
      }

      return {
        application,
        quality_check: qualityCheck,
        feedback_sent: true
      };

    } catch (error) {
      // Report failure feedback
      try {
        await this.protocol.reportFeedback(patternId, {
          success: false,
          error: error.message,
          quick_apply: true
        }, context);
      } catch (feedbackError) {
        console.warn('Failed to report failure feedback:', feedbackError.message);
      }

      throw error;
    }
  }

  /**
   * Batch pattern operations
   */
  async batchOperations(operations, context) {
    this.ensureInitialized();

    const results = {
      successful_operations: [],
      failed_operations: [],
      summary: {
        total: operations.length,
        successful: 0,
        failed: 0
      }
    };

    for (const operation of operations) {
      try {
        let result;

        switch (operation.type) {
          case 'discover':
            result = await this.protocol.discoverPatterns(operation.context || context, operation.options || {});
            break;
          case 'recommend':
            result = await this.protocol.getRecommendations(
              operation.context || context,
              operation.pattern_matches,
              operation.options || {}
            );
            break;
          case 'apply':
            result = await this.protocol.applyPattern(
              operation.pattern_id,
              operation.pattern_data,
              operation.context || context,
              operation.options || {}
            );
            break;
          case 'feedback':
            result = await this.protocol.reportFeedback(
              operation.pattern_id,
              operation.feedback,
              operation.context || context,
              operation.options || {}
            );
            break;
          case 'quality':
            result = await this.protocol.executeQualityGates(
              operation.target,
              operation.context || context,
              operation.options || {}
            );
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }

        results.successful_operations.push({
          operation: operation,
          result: result
        });
        results.summary.successful++;

      } catch (error) {
        results.failed_operations.push({
          operation: operation,
          error: error.message
        });
        results.summary.failed++;
      }
    }

    return results;
  }

  /**
   * Get pattern statistics for the mode
   */
  async getPatternStatistics(options = {}) {
    this.ensureInitialized();

    const stats = {
      mode: this.modeSlug,
      session_id: this.sessionId,
      protocol_stats: this.protocol.getStatistics(),
      pattern_performance: null,
      quality_trends: null,
      learning_insights: null
    };

    try {
      // Get learning insights
      const insights = await this.protocol.getLearningInsights({}, {
        include_pattern_performance: true,
        include_quality_trends: true,
        include_recommendations: true
      });

      stats.pattern_performance = insights.result.insights.pattern_performance;
      stats.quality_trends = insights.result.insights.quality_trends;
      stats.learning_insights = insights.result.insights.recommendations;

    } catch (error) {
      console.warn('Failed to get pattern statistics:', error.message);
    }

    return stats;
  }

  /**
   * Health check for the pattern protocol
   */
  async healthCheck() {
    try {
      if (!this.initialized) {
        return { status: 'not_initialized' };
      }

      // Test basic protocol functionality
      const testContext = { test: true, timestamp: Date.now() };
      await this.protocol.discoverPatterns(testContext, { max_patterns: 1 });

      return {
        status: 'healthy',
        mode: this.modeSlug,
        session_id: this.sessionId,
        protocol_version: this.protocol.protocolVersion,
        stats: this.protocol.getStatistics()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        mode: this.modeSlug,
        error: error.message
      };
    }
  }

  /**
   * Ensure client is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('PatternProtocolClient not initialized. Call initialize() first.');
    }
  }

  /**
   * Get client information
   */
  getInfo() {
    return {
      mode: this.modeSlug,
      initialized: this.initialized,
      session_id: this.sessionId,
      protocol_version: this.protocol.protocolVersion,
      stats: this.protocol.getStatistics()
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.protocol) {
      this.protocol.clearState();
    }
    this.initialized = false;
    this.sessionId = null;
  }
}

// Factory function to create configured clients
PatternProtocolClient.create = function(modeSlug, options = {}) {
  return new PatternProtocolClient(modeSlug, options);
};

// Convenience methods for common modes
PatternProtocolClient.createCodeClient = function(options = {}) {
  return new PatternProtocolClient('code', options);
};

PatternProtocolClient.createDebugClient = function(options = {}) {
  return new PatternProtocolClient('debug', options);
};

PatternProtocolClient.createArchitectClient = function(options = {}) {
  return new PatternProtocolClient('architect', options);
};

PatternProtocolClient.createSecurityClient = function(options = {}) {
  return new PatternProtocolClient('security', options);
};

module.exports = PatternProtocolClient;