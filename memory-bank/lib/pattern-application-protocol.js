/**
 * Pattern Application Protocol
 *
 * Standardized communication protocol for modes to interact with the learning system.
 * Enables pattern discovery, application, feedback, and learning across all Roo modes.
 */

const EventEmitter = require('events');

class PatternApplicationProtocol extends EventEmitter {
  constructor(options = {}) {
    super();

    this.protocolVersion = '1.0.0';
    this.modeSlug = options.modeSlug || 'unknown';
    this.sessionId = options.sessionId || this.generateSessionId();
    this.patternMatcher = null;
    this.recommendationEngine = null;
    this.qualityGateEngine = null;
    this.confidenceTracker = null;
    this.patternLogger = null;

    // Protocol configuration
    this.config = {
      enableCaching: options.enableCaching !== false,
      cacheSize: options.cacheSize || 100,
      timeout: options.timeout || 30000,
      retryAttempts: options.retryAttempts || 3,
      ...options
    };

    // Active requests tracking
    this.activeRequests = new Map();

    // Protocol statistics
    this.stats = {
      requestsSent: 0,
      responsesReceived: 0,
      errors: 0,
      averageResponseTime: 0
    };

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.on('protocol_initialized', () => {
      console.log(`🔗 Pattern Application Protocol v${this.protocolVersion} initialized for mode: ${this.modeSlug}`);
    });

    this.on('pattern_request_sent', (data) => {
      console.log(`📤 Pattern request sent: ${data.requestId}`);
    });

    this.on('pattern_response_received', (data) => {
      console.log(`📥 Pattern response received: ${data.requestId}`);
    });

    this.on('protocol_error', (error) => {
      console.error(`❌ Protocol error: ${error.message}`);
    });
  }

  /**
   * Initialize the protocol with required components
   */
  async initialize(components = {}) {
    try {
      // Initialize pattern matcher
      if (components.patternMatcher) {
        this.patternMatcher = components.patternMatcher;
      } else {
        const PatternMatcher = require('./pattern-matcher');
        this.patternMatcher = new PatternMatcher();
      }

      // Initialize recommendation engine
      if (components.recommendationEngine) {
        this.recommendationEngine = components.recommendationEngine;
      } else {
        const RecommendationEngine = require('./recommendation-engine');
        this.recommendationEngine = new RecommendationEngine();
      }

      // Initialize quality gate engine
      if (components.qualityGateEngine) {
        this.qualityGateEngine = components.qualityGateEngine;
      } else {
        const QualityGateEnforcementEngine = require('./quality-gate-enforcement');
        this.qualityGateEngine = new QualityGateEnforcementEngine();
      }

      // Initialize confidence tracker
      if (components.confidenceTracker) {
        this.confidenceTracker = components.confidenceTracker;
      } else {
        const ConfidenceTracker = require('./confidence-tracker');
        this.confidenceTracker = new ConfidenceTracker();
      }

      // Initialize pattern logger
      if (components.patternLogger) {
        this.patternLogger = components.patternLogger;
      } else {
        const PatternLogger = require('./pattern-logger');
        this.patternLogger = new PatternLogger();
      }

      this.emit('protocol_initialized');
      return true;

    } catch (error) {
      this.emit('protocol_error', error);
      throw error;
    }
  }

  /**
   * Discover patterns for current context
   */
  async discoverPatterns(context, options = {}) {
    const requestId = this.generateRequestId('discover');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'pattern_discovery',
      context: context,
      options: {
        max_patterns: options.maxPatterns || 10,
        confidence_threshold: options.confidenceThreshold || 0.6,
        algorithm: options.algorithm || 'hybrid_approach',
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'discover' });

      const startTime = Date.now();

      // Execute pattern discovery
      const result = await this.patternMatcher.matchPatterns(context, request.options);

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'pattern_discovery_response',
        status: 'success',
        result: result,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'discover', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'pattern_discovery_response',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Get recommendations for current context
   */
  async getRecommendations(context, patternMatches, options = {}) {
    const requestId = this.generateRequestId('recommend');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'recommendation_request',
      context: context,
      pattern_matches: patternMatches,
      options: {
        max_recommendations: options.maxRecommendations || 5,
        algorithm: options.algorithm || 'weighted_score',
        include_external_insights: options.includeExternalInsights || false,
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'recommend' });

      const startTime = Date.now();

      // Generate recommendations
      const result = await this.recommendationEngine.generateRecommendations(
        context,
        patternMatches,
        request.options
      );

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'recommendation_response',
        status: 'success',
        result: result,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'recommend', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'recommendation_response',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Apply a pattern
   */
  async applyPattern(patternId, patternData, context, options = {}) {
    const requestId = this.generateRequestId('apply');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'pattern_application',
      pattern_id: patternId,
      pattern_data: patternData,
      context: context,
      options: {
        validate_quality: options.validateQuality !== false,
        log_application: options.logApplication !== false,
        update_confidence: options.updateConfidence !== false,
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'apply' });

      const startTime = Date.now();

      // Validate pattern application if requested
      if (request.options.validate_quality) {
        const qualityCheck = await this.validatePatternApplication(patternData, context);
        if (!qualityCheck.valid) {
          throw new Error(`Pattern application validation failed: ${qualityCheck.reason}`);
        }
      }

      // Apply the pattern (mode-specific logic would go here)
      const applicationResult = await this.executePatternApplication(patternData, context, options);

      // Update confidence if requested
      if (request.options.update_confidence) {
        await this.confidenceTracker.updateConfidence(patternId, {
          success: applicationResult.success,
          mode: this.modeSlug,
          context: context,
          metrics: applicationResult.metrics
        });
      }

      // Log application if requested
      if (request.options.log_application) {
        await this.patternLogger.logPatternApplication({
          pattern_id: patternId,
          mode: this.modeSlug,
          success: applicationResult.success,
          context: context,
          result: applicationResult,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'pattern_application_response',
        status: 'success',
        pattern_id: patternId,
        result: applicationResult,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'apply', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'pattern_application_response',
        status: 'error',
        pattern_id: patternId,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Report pattern application feedback
   */
  async reportFeedback(patternId, feedback, context, options = {}) {
    const requestId = this.generateRequestId('feedback');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'feedback_report',
      pattern_id: patternId,
      feedback: feedback,
      context: context,
      options: {
        update_confidence: options.updateConfidence !== false,
        log_feedback: options.logFeedback !== false,
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'feedback' });

      const startTime = Date.now();

      // Update confidence based on feedback
      if (request.options.update_confidence) {
        await this.confidenceTracker.updateConfidence(patternId, {
          success: feedback.success,
          mode: this.modeSlug,
          context: context,
          metrics: feedback.metrics || {},
          feedback_score: feedback.score
        });
      }

      // Log feedback if requested
      if (request.options.log_feedback) {
        await this.patternLogger.logFeedback({
          pattern_id: patternId,
          mode: this.modeSlug,
          feedback: feedback,
          context: context,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'feedback_report_response',
        status: 'success',
        pattern_id: patternId,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'feedback', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'feedback_report_response',
        status: 'error',
        pattern_id: patternId,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Execute quality gates for output
   */
  async executeQualityGates(target, context, options = {}) {
    const requestId = this.generateRequestId('quality');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'quality_gate_execution',
      target: target,
      context: context,
      options: {
        fail_on_critical: options.failOnCritical !== false,
        include_manual_review: options.includeManualReview || false,
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'quality' });

      const startTime = Date.now();

      // Execute quality gates
      const result = await this.qualityGateEngine.executeQualityGates(target, context, request.options);

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'quality_gate_execution_response',
        status: 'success',
        result: result,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'quality', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'quality_gate_execution_response',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Get learning insights for mode
   */
  async getLearningInsights(context, options = {}) {
    const requestId = this.generateRequestId('insights');

    const request = {
      request_id: requestId,
      session_id: this.sessionId,
      mode: this.modeSlug,
      type: 'learning_insights_request',
      context: context,
      options: {
        include_pattern_performance: options.includePatternPerformance !== false,
        include_quality_trends: options.includeQualityTrends !== false,
        include_recommendations: options.includeRecommendations !== false,
        ...options
      },
      timestamp: new Date().toISOString()
    };

    try {
      this.activeRequests.set(requestId, request);
      this.emit('pattern_request_sent', { requestId, type: 'insights' });

      const startTime = Date.now();

      // Gather learning insights
      const insights = await this.gatherLearningInsights(context, request.options);

      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime);

      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'learning_insights_response',
        status: 'success',
        insights: insights,
        response_time_ms: responseTime,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('pattern_response_received', { requestId, type: 'insights', responseTime });

      return response;

    } catch (error) {
      const response = {
        request_id: requestId,
        session_id: this.sessionId,
        mode: this.modeSlug,
        type: 'learning_insights_response',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.activeRequests.delete(requestId);
      this.emit('protocol_error', { requestId, error });

      throw error;
    }
  }

  /**
   * Validate pattern application
   */
  async validatePatternApplication(patternData, context) {
    // Basic validation - could be extended with more sophisticated checks
    const validation = {
      valid: true,
      reason: 'Pattern application is valid',
      checks: []
    };

    // Check if pattern has required fields
    if (!patternData.pattern_id) {
      validation.valid = false;
      validation.reason = 'Pattern ID is required';
      validation.checks.push({ field: 'pattern_id', status: 'missing' });
    }

    // Check pattern confidence
    if (patternData.confidence_score < 0.5) {
      validation.valid = false;
      validation.reason = 'Pattern confidence too low for application';
      validation.checks.push({ field: 'confidence_score', status: 'too_low', value: patternData.confidence_score });
    }

    // Context compatibility check
    const contextCompatible = await this.checkContextCompatibility(patternData, context);
    if (!contextCompatible) {
      validation.valid = false;
      validation.reason = 'Pattern not compatible with current context';
      validation.checks.push({ field: 'context_compatibility', status: 'incompatible' });
    }

    return validation;
  }

  /**
   * Execute pattern application (mode-specific implementation)
   */
  async executePatternApplication(patternData, context, options) {
    // This would be overridden by mode-specific implementations
    // For now, return a mock successful result
    return {
      success: true,
      applied_at: new Date().toISOString(),
      metrics: {
        execution_time_ms: Math.random() * 1000 + 500,
        resources_used: Math.random() * 100 + 50,
        quality_score: Math.random() * 0.4 + 0.6
      },
      artifacts: [],
      message: `Pattern ${patternData.pattern_name} applied successfully`
    };
  }

  /**
   * Check context compatibility
   */
  async checkContextCompatibility(patternData, context) {
    // Basic compatibility check - could be extended
    if (!patternData.context_match) return true;

    const requiredFields = patternData.context_match.required_fields || [];
    for (const field of requiredFields) {
      if (!context[field]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gather learning insights
   */
  async gatherLearningInsights(context, options) {
    const insights = {};

    if (options.include_pattern_performance) {
      insights.pattern_performance = await this.getPatternPerformanceInsights();
    }

    if (options.include_quality_trends) {
      insights.quality_trends = await this.getQualityTrendsInsights();
    }

    if (options.include_recommendations) {
      insights.recommendations = await this.getLearningRecommendations(context);
    }

    return insights;
  }

  /**
   * Get pattern performance insights
   */
  async getPatternPerformanceInsights() {
    // This would query the confidence tracker and pattern logger
    // For now, return mock data
    return {
      top_performing_patterns: [
        { pattern_id: 'security-jwt-auth', success_rate: 0.95, application_count: 45 },
        { pattern_id: 'performance-caching', success_rate: 0.91, application_count: 78 }
      ],
      underperforming_patterns: [
        { pattern_id: 'architecture-monolithic', success_rate: 0.72, application_count: 25 }
      ],
      trend_analysis: {
        overall_success_rate: 0.87,
        improvement_rate: 0.02 // 2% improvement per session
      }
    };
  }

  /**
   * Get quality trends insights
   */
  async getQualityTrendsInsights() {
    // This would analyze quality gate results over time
    return {
      quality_score_trend: 'improving',
      average_quality_score: 0.82,
      critical_issues_trend: 'decreasing',
      manual_reviews_trend: 'stable'
    };
  }

  /**
   * Get learning recommendations
   */
  async getLearningRecommendations(context) {
    // Generate recommendations based on learning data
    return [
      {
        type: 'pattern_adoption',
        description: 'Consider adopting high-performing patterns more frequently',
        priority: 'medium'
      },
      {
        type: 'quality_improvement',
        description: 'Focus on reducing manual review requirements',
        priority: 'high'
      }
    ];
  }

  /**
   * Generate unique request ID
   */
  generateRequestId(type) {
    return `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Update protocol statistics
   */
  updateStats(responseTime) {
    this.stats.requestsSent++;
    this.stats.responsesReceived++;
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (this.stats.responsesReceived - 1) + responseTime) /
      this.stats.responsesReceived;
  }

  /**
   * Get protocol statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      active_requests: this.activeRequests.size,
      session_id: this.sessionId,
      mode: this.modeSlug,
      protocol_version: this.protocolVersion
    };
  }

  /**
   * Get active requests
   */
  getActiveRequests() {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Clear protocol state
   */
  clearState() {
    this.activeRequests.clear();
    this.stats = {
      requestsSent: 0,
      responsesReceived: 0,
      errors: 0,
      averageResponseTime: 0
    };
    this.emit('protocol_state_cleared');
  }
}

module.exports = PatternApplicationProtocol;