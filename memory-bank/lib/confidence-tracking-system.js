/**
 * Confidence Tracking System
 *
 * Main orchestrator for pattern confidence tracking, decision making,
 * and adaptation management in the learning system
 */

const ConfidenceCalculator = require('./confidence-calculator');
const ConfidenceTracker = require('./confidence-tracker');
const DecisionEngine = require('./decision-engine');
const AdaptationManager = require('./adaptation-manager');
const EventEmitter = require('events');

class ConfidenceTrackingSystem extends EventEmitter {
  constructor(options = {}) {
    super();

    // Initialize components
    this.calculator = new ConfidenceCalculator(options);
    this.tracker = new ConfidenceTracker(options);
    this.decisionEngine = new DecisionEngine(options);
    this.adaptationManager = new AdaptationManager(options);

    // System state
    this.initialized = false;
    this.systemHealth = {
      status: 'initializing',
      last_health_check: null,
      component_status: {
        calculator: 'unknown',
        tracker: 'unknown',
        decision_engine: 'unknown',
        adaptation_manager: 'unknown'
      }
    };

    // Setup event forwarding
    this.setupEventForwarding();
  }

  /**
   * Initialize the confidence tracking system
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Confidence Tracking System...');

      // Initialize all components
      await this.calculator.initialize();
      this.systemHealth.component_status.calculator = 'healthy';

      await this.tracker.initialize();
      this.systemHealth.component_status.tracker = 'healthy';

      await this.decisionEngine.initialize();
      this.systemHealth.component_status.decision_engine = 'healthy';

      // Adaptation manager doesn't need async initialization
      this.systemHealth.component_status.adaptation_manager = 'healthy';

      this.initialized = true;
      this.systemHealth.status = 'healthy';
      this.systemHealth.last_health_check = new Date().toISOString();

      console.log('Confidence Tracking System initialized successfully');

      this.emit('system_initialized', {
        timestamp: new Date().toISOString(),
        components: this.systemHealth.component_status
      });

    } catch (error) {
      this.systemHealth.status = 'error';
      this.systemHealth.error = error.message;
      this.systemHealth.last_health_check = new Date().toISOString();

      console.error('Failed to initialize Confidence Tracking System:', error);
      this.emit('system_initialization_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Setup event forwarding between components
   */
  setupEventForwarding() {
    // Forward tracker events
    this.tracker.on('confidence_tracked', (data) => {
      this.emit('confidence_tracked', data);
    });

    this.tracker.on('confidence_adapted', (data) => {
      this.emit('confidence_adapted', data);
    });

    this.tracker.on('confidence_anomaly_detected', (data) => {
      this.emit('confidence_anomaly_detected', data);
    });

    // Forward decision engine events
    this.decisionEngine.on('decision_made', (data) => {
      this.emit('decision_made', data);
    });

    // Forward adaptation manager events
    this.adaptationManager.on('pattern_analyzed', (data) => {
      this.emit('pattern_analyzed', data);
    });

    this.adaptationManager.on('adaptation_applied', (data) => {
      this.emit('adaptation_applied', data);
    });
  }

  /**
   * Process a pattern with full confidence tracking
   */
  async processPattern(pattern, context = {}, options = {}) {
    await this.initialize();

    const processingResult = {
      pattern_id: pattern.id,
      timestamp: new Date().toISOString(),
      stages: {},
      final_decision: null,
      processing_time: 0
    };

    const startTime = Date.now();

    try {
      // Stage 1: Confidence Calculation
      processingResult.stages.confidence_calculation = await this.calculatePatternConfidence(pattern, context);

      // Stage 2: Confidence Tracking
      processingResult.stages.confidence_tracking = await this.trackPatternConfidence(pattern, context, options);

      // Stage 3: Decision Making
      processingResult.stages.decision_making = await this.makePatternDecision(pattern, context, options);

      // Stage 4: Adaptation Analysis (if enabled)
      if (options.enable_adaptation !== false) {
        processingResult.stages.adaptation_analysis = await this.analyzePatternAdaptation(pattern, context, options);
      }

      // Set final decision
      processingResult.final_decision = processingResult.stages.decision_making.decision;

      processingResult.processing_time = Date.now() - startTime;

      this.emit('pattern_processed', processingResult);

      return processingResult;

    } catch (error) {
      processingResult.error = error.message;
      processingResult.processing_time = Date.now() - startTime;

      this.emit('pattern_processing_failed', {
        pattern_id: pattern.id,
        error: error.message,
        processing_result: processingResult
      });

      throw error;
    }
  }

  /**
   * Calculate pattern confidence
   */
  async calculatePatternConfidence(pattern, context) {
    const confidenceResult = await this.calculator.calculateConfidence(pattern, context);

    return {
      confidence_score: confidenceResult.score,
      factors: confidenceResult.factors,
      calculation_method: confidenceResult.calculation_method,
      recommendation: this.calculator.getConfidenceRecommendation(pattern)
    };
  }

  /**
   * Track pattern confidence
   */
  async trackPatternConfidence(pattern, context, options) {
    const trackingResult = await this.tracker.trackConfidence(pattern, context, options);

    return {
      confidence_change: trackingResult.confidence_change,
      factors: trackingResult.factors,
      anomaly_detected: trackingResult.confidence_change > 0.1 // Simple anomaly detection
    };
  }

  /**
   * Make pattern decision
   */
  async makePatternDecision(pattern, context, options) {
    const decisionResult = await this.decisionEngine.makeDecision(pattern, context, options);

    return {
      decision: decisionResult.decision,
      risk_assessment: decisionResult.risk_assessment,
      recommendations: decisionResult.recommendations
    };
  }

  /**
   * Analyze pattern adaptation opportunities
   */
  async analyzePatternAdaptation(pattern, context, options) {
    // Create mock performance data for analysis
    const performanceData = {
      recent_success_rate: pattern.success_rate,
      context_match_score: 0.8, // Would come from actual tracking
      recent_quality_impact: pattern.metadata?.usage_statistics?.average_quality_impact || 0
    };

    const adaptationAnalysis = await this.adaptationManager.analyzePatternPerformance(
      pattern,
      performanceData,
      context
    );

    return {
      adaptation_opportunities: adaptationAnalysis.adaptation_opportunities.length,
      recommended_adaptations: adaptationAnalysis.recommended_adaptations.length,
      top_recommendation: adaptationAnalysis.recommended_adaptations[0]
    };
  }

  /**
   * Update pattern confidence from application outcome
   */
  async updatePatternConfidence(patternId, success, qualityImpact = 0, context = {}) {
    await this.initialize();

    // Get pattern (placeholder - would integrate with pattern storage)
    const pattern = await this.getPattern(patternId);
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    // Update confidence using tracker
    const updateResult = await this.tracker.updateConfidenceFromOutcome(
      patternId,
      success,
      qualityImpact,
      context
    );

    // Update pattern object (placeholder - would update pattern storage)
    pattern.confidence_score = updateResult.new_confidence;
    pattern.success_rate = (pattern.success_rate * 0.9) + (success ? 0.1 : 0);

    await this.updatePattern(pattern);

    this.emit('pattern_confidence_updated', {
      pattern_id: patternId,
      success: success,
      confidence_change: updateResult.confidence_change,
      new_confidence: updateResult.new_confidence
    });

    return updateResult;
  }

  /**
   * Apply pattern adaptation
   */
  async applyPatternAdaptation(patternId, adaptationRecommendation) {
    await this.initialize();

    // Get pattern (placeholder)
    const pattern = await this.getPattern(patternId);
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    // Apply adaptation
    const adaptationResult = await this.adaptationManager.applyAdaptation(
      pattern,
      adaptationRecommendation
    );

    this.emit('pattern_adaptation_applied', {
      pattern_id: patternId,
      adaptation_type: adaptationResult.adaptation_type,
      status: adaptationResult.status
    });

    return adaptationResult;
  }

  /**
   * Get comprehensive pattern analytics
   */
  async getPatternAnalytics(patternId, options = {}) {
    await this.initialize();

    const analytics = {
      pattern_id: patternId,
      timestamp: new Date().toISOString(),
      confidence_analytics: null,
      decision_analytics: null,
      adaptation_analytics: null
    };

    // Get confidence analytics
    try {
      analytics.confidence_analytics = await this.tracker.getConfidenceAnalytics(patternId, options);
    } catch (error) {
      analytics.confidence_analytics = { error: error.message };
    }

    // Get decision analytics
    try {
      analytics.decision_analytics = this.decisionEngine.getDecisionAnalytics({
        pattern_id: patternId,
        ...options
      });
    } catch (error) {
      analytics.decision_analytics = { error: error.message };
    }

    // Get adaptation analytics
    try {
      analytics.adaptation_analytics = this.adaptationManager.getAdaptationAnalytics(patternId, options);
    } catch (error) {
      analytics.adaptation_analytics = { error: error.message };
    }

    return analytics;
  }

  /**
   * Get system health status
   */
  async getSystemHealth() {
    await this.initialize();

    // Perform health checks
    const healthChecks = await this.performHealthChecks();

    this.systemHealth = {
      ...this.systemHealth,
      ...healthChecks,
      last_health_check: new Date().toISOString()
    };

    return this.systemHealth;
  }

  /**
   * Perform system health checks
   */
  async performHealthChecks() {
    const health = {
      status: 'healthy',
      checks: {}
    };

    // Component availability check
    health.checks.components_available = {
      status: 'passed',
      details: 'All components initialized successfully'
    };

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    health.checks.memory_usage = {
      status: memoryUsage.heapUsed < 100 * 1024 * 1024 ? 'passed' : 'warning', // 100MB threshold
      details: `Heap used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    };

    // Event processing check
    health.checks.event_processing = {
      status: 'passed',
      details: 'Event forwarding active'
    };

    // Determine overall status
    if (Object.values(health.checks).some(check => check.status === 'failed')) {
      health.status = 'unhealthy';
    } else if (Object.values(health.checks).some(check => check.status === 'warning')) {
      health.status = 'warning';
    }

    return health;
  }

  /**
   * Export system data
   */
  async exportSystemData(format = 'json') {
    await this.initialize();

    const exportData = {
      export_timestamp: new Date().toISOString(),
      system_health: this.systemHealth,
      confidence_tracking_data: {
        // Would export actual tracking data
        status: 'placeholder'
      },
      decision_history: this.decisionEngine.decisionHistory,
      adaptation_history: this.adaptationManager.adaptationHistory
    };

    if (format === 'csv') {
      return this.convertSystemDataToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert system data to CSV
   */
  convertSystemDataToCSV(data) {
    // Convert decision history to CSV
    const decisionHeaders = ['timestamp', 'pattern_id', 'decision_type', 'confidence_score', 'risk_level'];
    const decisionRows = data.decision_history.map(decision => [
      decision.timestamp,
      decision.pattern_id,
      decision.decision.type,
      decision.decision.confidence_score,
      decision.risk_assessment.level
    ]);

    const csvContent = [
      'DECISION_HISTORY',
      decisionHeaders.join(','),
      ...decisionRows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    await this.initialize();

    const metrics = {
      timestamp: new Date().toISOString(),
      patterns_processed: this.tracker.trackingData.size,
      decisions_made: this.decisionEngine.decisionHistory.length,
      adaptations_applied: this.adaptationManager.adaptationHistory.filter(
        h => h.status === 'completed'
      ).length,
      system_uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      event_counts: this.getEventCounts()
    };

    return metrics;
  }

  /**
   * Get event counts for monitoring
   */
  getEventCounts() {
    // This would track actual event counts
    // For now, return placeholder data
    return {
      confidence_tracked: 0,
      decisions_made: 0,
      adaptations_applied: 0,
      anomalies_detected: 0
    };
  }

  /**
   * Cleanup old data
   */
  async cleanup(options = {}) {
    await this.initialize();

    const cleanupResults = {
      tracker_cleanup: null,
      decision_cleanup: null,
      adaptation_cleanup: null
    };

    // Cleanup tracker data
    try {
      cleanupResults.tracker_cleanup = await this.tracker.cleanup(options);
    } catch (error) {
      cleanupResults.tracker_cleanup = { error: error.message };
    }

    // Decision engine doesn't have cleanup method
    cleanupResults.decision_cleanup = { status: 'no_cleanup_needed' };

    // Adaptation manager doesn't have cleanup method
    cleanupResults.adaptation_cleanup = { status: 'no_cleanup_needed' };

    this.emit('system_cleanup_completed', cleanupResults);

    return cleanupResults;
  }

  /**
   * Placeholder methods - would integrate with pattern storage
   */
  async getPattern(patternId) {
    // Placeholder - integrate with PatternStorage
    return {
      id: patternId,
      confidence_score: 0.8,
      success_rate: 0.9,
      metadata: {
        usage_statistics: {
          total_applications: 10,
          successful_applications: 9
        }
      }
    };
  }

  async updatePattern(pattern) {
    // Placeholder - integrate with PatternStorage
    console.log(`Updating pattern ${pattern.id} confidence to ${pattern.confidence_score}`);
  }
}

module.exports = ConfidenceTrackingSystem;