/**
 * Pattern Success/Failure Logging System
 *
 * Comprehensive logging system that tracks pattern application outcomes,
 * analyzes performance data, and triggers adaptations for continuous improvement
 */

const PatternLogger = require('./pattern-logger');
const OutcomeAnalyzer = require('./outcome-analyzer');
const AdaptationTrigger = require('./adaptation-trigger');
const EventEmitter = require('events');

class PatternSuccessFailureLogger extends EventEmitter {
  constructor(options = {}) {
    super();

    this.logger = new PatternLogger(options);
    this.analyzer = new OutcomeAnalyzer(options);
    this.trigger = new AdaptationTrigger(options);

    this.analysisSchedule = options.analysisSchedule || 'daily';
    this.adaptationEnabled = options.adaptationEnabled !== false;
    this.autoAnalysisEnabled = options.autoAnalysisEnabled !== false;

    this.analysisHistory = [];
    this.systemMetrics = {
      total_applications_logged: 0,
      total_failures_logged: 0,
      total_analyses_performed: 0,
      total_adaptations_triggered: 0,
      average_processing_time: 0
    };

    this.setupEventForwarding();
  }

  /**
   * Initialize the logging system
   */
  async initialize() {
    await this.logger.initialize();

    if (this.autoAnalysisEnabled) {
      this.scheduleAnalysis();
    }

    this.emit('system_initialized', {
      timestamp: new Date().toISOString(),
      components: ['logger', 'analyzer', 'trigger'],
      auto_analysis: this.autoAnalysisEnabled,
      adaptation_enabled: this.adaptationEnabled
    });
  }

  /**
   * Setup event forwarding between components
   */
  setupEventForwarding() {
    // Forward logger events
    this.logger.on('pattern_application_logged', (data) => {
      this.emit('pattern_application_logged', data);
      this.systemMetrics.total_applications_logged++;
    });

    this.logger.on('pattern_failure_logged', (data) => {
      this.emit('pattern_failure_logged', data);
      this.systemMetrics.total_failures_logged++;
    });

    // Forward analyzer events
    this.analyzer.on('analysis_completed', (data) => {
      this.emit('analysis_completed', data);
      this.systemMetrics.total_analyses_performed++;
    });

    // Forward trigger events
    this.trigger.on('trigger_created', (data) => {
      this.emit('adaptation_trigger_created', data);
      this.systemMetrics.total_adaptations_triggered++;
    });

    this.trigger.on('trigger_completed', (data) => {
      this.emit('adaptation_trigger_completed', data);
    });
  }

  /**
   * Log successful pattern application
   */
  async logPatternSuccess(patternId, context, details = {}) {
    const startTime = Date.now();

    const logEntry = await this.logger.logPatternApplication(patternId, context, 'success', {
      ...details,
      processing_start_time: startTime
    });

    const processingTime = Date.now() - startTime;
    this.updateProcessingTime(processingTime);

    // Check if we should trigger analysis
    if (this.shouldTriggerAnalysis(patternId)) {
      await this.performPatternAnalysis(patternId);
    }

    this.emit('pattern_success_logged', {
      pattern_id: patternId,
      log_entry: logEntry,
      processing_time: processingTime
    });

    return logEntry;
  }

  /**
   * Log failed pattern application
   */
  async logPatternFailure(patternId, context, failureReason, details = {}) {
    const startTime = Date.now();

    const logEntry = await this.logger.logPatternFailure(patternId, context, failureReason, {
      ...details,
      processing_start_time: startTime
    });

    const processingTime = Date.now() - startTime;
    this.updateProcessingTime(processingTime);

    // Always trigger analysis for failures
    await this.performPatternAnalysis(patternId);

    this.emit('pattern_failure_logged', {
      pattern_id: patternId,
      failure_reason: failureReason,
      log_entry: logEntry,
      processing_time: processingTime
    });

    return logEntry;
  }

  /**
   * Log pattern application with automatic success/failure detection
   */
  async logPatternApplication(patternId, context, outcome, details = {}) {
    if (outcome === 'success' || outcome === 'auto_apply' || outcome === 'recommend') {
      return await this.logPatternSuccess(patternId, context, details);
    } else {
      const failureReason = details.failure_reason || 'application_failed';
      return await this.logPatternFailure(patternId, context, failureReason, details);
    }
  }

  /**
   * Perform comprehensive pattern analysis
   */
  async performPatternAnalysis(patternId, options = {}) {
    const startTime = Date.now();

    try {
      // Get pattern logs
      const applicationLogs = this.logger.getApplicationLogs({
        pattern_id: patternId,
        limit: options.max_logs || 100
      });

      const failureLogs = this.logger.getFailureLogs({
        pattern_id: patternId,
        limit: options.max_logs || 100
      });

      const allLogs = [...applicationLogs, ...failureLogs];

      if (allLogs.length < 3) {
        return {
          pattern_id: patternId,
          status: 'insufficient_data',
          message: 'Insufficient log data for analysis',
          logs_count: allLogs.length
        };
      }

      // Perform outcome analysis
      const analysis = await this.analyzer.analyzeOutcomes(allLogs, options);

      // Store analysis in history
      this.analysisHistory.push({
        pattern_id: patternId,
        timestamp: new Date().toISOString(),
        analysis: analysis,
        processing_time: Date.now() - startTime,
        logs_analyzed: allLogs.length
      });

      // Trigger adaptations if enabled
      if (this.adaptationEnabled && analysis.patterns_analyzed.size > 0) {
        const patternAnalysis = analysis.patterns_analyzed.get(patternId);
        if (patternAnalysis) {
          await this.trigger.evaluateAndTrigger(patternId, patternAnalysis, options.context || {});
        }
      }

      const processingTime = Date.now() - startTime;
      this.updateProcessingTime(processingTime);

      this.emit('pattern_analysis_completed', {
        pattern_id: patternId,
        analysis_summary: {
          logs_analyzed: allLogs.length,
          insights_generated: analysis.insights.length,
          recommendations_count: analysis.recommendations.length,
          risk_indicators_count: analysis.risk_indicators.length
        },
        processing_time: processingTime
      });

      return analysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.emit('pattern_analysis_failed', {
        pattern_id: patternId,
        error: error.message,
        processing_time: processingTime
      });

      throw error;
    }
  }

  /**
   * Perform system-wide analysis
   */
  async performSystemAnalysis(options = {}) {
    const startTime = Date.now();

    try {
      // Get all recent logs
      const applicationLogs = this.logger.getApplicationLogs({
        since: options.since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        limit: options.max_logs || 1000
      });

      const failureLogs = this.logger.getFailureLogs({
        since: options.since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        limit: options.max_logs || 1000
      });

      const allLogs = [...applicationLogs, ...failureLogs];

      if (allLogs.length === 0) {
        return {
          status: 'no_data',
          message: 'No log data available for system analysis'
        };
      }

      // Perform system-wide outcome analysis
      const analysis = await this.analyzer.analyzeOutcomes(allLogs, {
        ...options,
        system_wide: true
      });

      // Store system analysis
      this.analysisHistory.push({
        analysis_type: 'system_wide',
        timestamp: new Date().toISOString(),
        analysis: analysis,
        processing_time: Date.now() - startTime,
        logs_analyzed: allLogs.length
      });

      const processingTime = Date.now() - startTime;
      this.updateProcessingTime(processingTime);

      this.emit('system_analysis_completed', {
        analysis_summary: {
          logs_analyzed: allLogs.length,
          patterns_analyzed: analysis.patterns_analyzed.size,
          insights_generated: analysis.insights.length,
          recommendations_count: analysis.recommendations.length,
          risk_indicators_count: analysis.risk_indicators.length
        },
        processing_time: processingTime
      });

      return analysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.emit('system_analysis_failed', {
        error: error.message,
        processing_time: processingTime
      });

      throw error;
    }
  }

  /**
   * Get pattern performance metrics
   */
  async getPatternMetrics(patternId, options = {}) {
    const logs = this.logger.getApplicationLogs({
      pattern_id: patternId,
      limit: options.limit || 100
    });

    if (logs.length === 0) {
      return {
        pattern_id: patternId,
        status: 'no_data',
        message: 'No performance data available'
      };
    }

    const metrics = {
      pattern_id: patternId,
      total_applications: logs.length,
      success_rate: this.calculateSuccessRate(logs),
      average_confidence: this.calculateAverageConfidence(logs),
      average_quality_impact: this.calculateAverageQualityImpact(logs),
      performance_trends: this.calculatePerformanceTrends(logs),
      failure_analysis: this.analyzeFailurePatterns(logs),
      context_performance: this.analyzeContextPerformance(logs),
      time_based_metrics: this.calculateTimeBasedMetrics(logs)
    };

    return metrics;
  }

  /**
   * Get system-wide metrics
   */
  async getSystemMetrics(options = {}) {
    const applicationLogs = this.logger.getApplicationLogs({
      since: options.since,
      limit: options.limit || 1000
    });

    const failureLogs = this.logger.getFailureLogs({
      since: options.since,
      limit: options.limit || 1000
    });

    const systemMetrics = {
      ...this.systemMetrics,
      total_logs: applicationLogs.length + failureLogs.length,
      application_logs: applicationLogs.length,
      failure_logs: failureLogs.length,
      success_rate: this.calculateSuccessRate(applicationLogs),
      failure_rate: failureLogs.length / (applicationLogs.length + failureLogs.length),
      most_active_patterns: this.getMostActivePatterns(applicationLogs),
      common_failure_reasons: this.getCommonFailureReasons(failureLogs),
      performance_trends: this.calculateSystemPerformanceTrends(applicationLogs),
      analysis_effectiveness: this.calculateAnalysisEffectiveness()
    };

    return systemMetrics;
  }

  /**
   * Export comprehensive logging data
   */
  async exportLoggingData(format = 'json', options = {}) {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      system_metrics: await this.getSystemMetrics(options),
      logger_data: await this.logger.exportLogs(format, options),
      analyzer_data: this.analyzer.exportAnalysis(format),
      trigger_data: this.trigger.exportTriggerData(format),
      analysis_history: options.include_analysis_history ? this.analysisHistory : [],
      options: options
    };

    if (format === 'csv') {
      return this.convertExportToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Trigger manual pattern analysis
   */
  async triggerPatternAnalysis(patternId, context = {}) {
    const analysis = await this.performPatternAnalysis(patternId, { context });

    this.emit('manual_analysis_triggered', {
      pattern_id: patternId,
      analysis_summary: {
        insights_count: analysis.insights?.length || 0,
        recommendations_count: analysis.recommendations?.length || 0,
        risk_indicators_count: analysis.risk_indicators?.length || 0
      },
      context: context
    });

    return analysis;
  }

  /**
   * Trigger system-wide analysis
   */
  async triggerSystemAnalysis(options = {}) {
    const analysis = await this.performSystemAnalysis(options);

    this.emit('manual_system_analysis_triggered', {
      analysis_summary: {
        patterns_analyzed: analysis.patterns_analyzed?.size || 0,
        insights_count: analysis.insights?.length || 0,
        recommendations_count: analysis.recommendations?.length || 0,
        risk_indicators_count: analysis.risk_indicators?.length || 0
      },
      options: options
    });

    return analysis;
  }

  /**
   * Helper methods
   */
  shouldTriggerAnalysis(patternId) {
    // Trigger analysis every N applications or on failure
    const logs = this.logger.getApplicationLogs({ pattern_id: patternId });
    const analysisCount = this.analysisHistory.filter(a => a.pattern_id === patternId).length;

    return logs.length % 5 === 0 || analysisCount === 0;
  }

  updateProcessingTime(processingTime) {
    const currentAvg = this.systemMetrics.average_processing_time;
    const totalProcessed = this.systemMetrics.total_applications_logged + this.systemMetrics.total_failures_logged;

    if (totalProcessed > 0) {
      this.systemMetrics.average_processing_time =
        (currentAvg * (totalProcessed - 1) + processingTime) / totalProcessed;
    } else {
      this.systemMetrics.average_processing_time = processingTime;
    }
  }

  calculateSuccessRate(logs) {
    if (logs.length === 0) return 0;

    const successfulOutcomes = ['success', 'auto_apply', 'recommend'];
    const successCount = logs.filter(log =>
      successfulOutcomes.includes(log.outcome)
    ).length;

    return successCount / logs.length;
  }

  calculateAverageConfidence(logs) {
    const confidenceLogs = logs.filter(log => log.decision_confidence !== undefined);
    if (confidenceLogs.length === 0) return 0;

    const totalConfidence = confidenceLogs.reduce((sum, log) => sum + log.decision_confidence, 0);
    return totalConfidence / confidenceLogs.length;
  }

  calculateAverageQualityImpact(logs) {
    const impactLogs = logs.filter(log => log.quality_impact !== undefined);
    if (impactLogs.length === 0) return 0;

    const totalImpact = impactLogs.reduce((sum, log) => sum + log.quality_impact, 0);
    return totalImpact / impactLogs.length;
  }

  calculatePerformanceTrends(logs) {
    if (logs.length < 3) {
      return { trend: 'insufficient_data' };
    }

    const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const midpoint = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, midpoint);
    const secondHalf = sortedLogs.slice(midpoint);

    const firstHalfSuccessRate = this.calculateSuccessRate(firstHalf);
    const secondHalfSuccessRate = this.calculateSuccessRate(secondHalf);

    const change = secondHalfSuccessRate - firstHalfSuccessRate;

    return {
      trend: change > 0.05 ? 'improving' : change < -0.05 ? 'declining' : 'stable',
      change: change,
      first_half_success_rate: firstHalfSuccessRate,
      second_half_success_rate: secondHalfSuccessRate
    };
  }

  analyzeFailurePatterns(logs) {
    const failureLogs = logs.filter(log => log.outcome === 'failure');

    if (failureLogs.length === 0) {
      return { has_failures: false };
    }

    const failureReasons = failureLogs.map(log => log.details?.failure_reason || 'unknown');
    const reasonCount = failureReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    return {
      has_failures: true,
      failure_rate: failureLogs.length / logs.length,
      common_reasons: Object.entries(reasonCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  analyzeContextPerformance(logs) {
    const contextGroups = new Map();

    logs.forEach(log => {
      const contextKey = this.getContextKey(log.context);
      if (!contextGroups.has(contextKey)) {
        contextGroups.set(contextKey, []);
      }
      contextGroups.get(contextKey).push(log);
    });

    const contextPerformance = [];
    for (const [contextKey, contextLogs] of contextGroups.entries()) {
      if (contextLogs.length >= 2) {
        contextPerformance.push({
          context: contextKey,
          applications: contextLogs.length,
          success_rate: this.calculateSuccessRate(contextLogs),
          average_confidence: this.calculateAverageConfidence(contextLogs)
        });
      }
    }

    return contextPerformance.sort((a, b) => b.success_rate - a.success_rate);
  }

  calculateTimeBasedMetrics(logs) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      last_hour: this.calculateMetricsForPeriod(logs, oneHourAgo, now),
      last_day: this.calculateMetricsForPeriod(logs, oneDayAgo, now),
      last_week: this.calculateMetricsForPeriod(logs, oneWeekAgo, now)
    };
  }

  calculateMetricsForPeriod(logs, startDate, endDate) {
    const periodLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    return {
      applications: periodLogs.length,
      success_rate: this.calculateSuccessRate(periodLogs),
      average_confidence: this.calculateAverageConfidence(periodLogs)
    };
  }

  getMostActivePatterns(logs, limit = 10) {
    const patternCount = logs.reduce((acc, log) => {
      acc[log.pattern_id] = (acc[log.pattern_id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(patternCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([patternId, count]) => ({ pattern_id: patternId, applications: count }));
  }

  getCommonFailureReasons(logs, limit = 10) {
    const failureLogs = logs.filter(log => log.outcome === 'failure');
    const reasonCount = failureLogs.reduce((acc, log) => {
      const reason = log.details?.failure_reason || 'unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(reasonCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([reason, count]) => ({ reason, count }));
  }

  calculateSystemPerformanceTrends(logs) {
    if (logs.length < 10) {
      return { trend: 'insufficient_data' };
    }

    const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const chunkSize = Math.floor(sortedLogs.length / 3);
    const chunks = [
      sortedLogs.slice(0, chunkSize),
      sortedLogs.slice(chunkSize, 2 * chunkSize),
      sortedLogs.slice(2 * chunkSize)
    ];

    const chunkSuccessRates = chunks.map(chunk => this.calculateSuccessRate(chunk));

    if (chunkSuccessRates[2] > chunkSuccessRates[0] + 0.05) {
      return { trend: 'improving', change: chunkSuccessRates[2] - chunkSuccessRates[0] };
    } else if (chunkSuccessRates[2] < chunkSuccessRates[0] - 0.05) {
      return { trend: 'declining', change: chunkSuccessRates[2] - chunkSuccessRates[0] };
    } else {
      return { trend: 'stable', change: chunkSuccessRates[2] - chunkSuccessRates[0] };
    }
  }

  calculateAnalysisEffectiveness() {
    const analyses = this.analysisHistory.filter(a => a.analysis_type !== 'system_wide');

    if (analyses.length === 0) {
      return { effectiveness: 0, analyses_count: 0 };
    }

    // Calculate effectiveness based on insights and recommendations generated
    const totalInsights = analyses.reduce((sum, a) => sum + (a.analysis.insights?.length || 0), 0);
    const totalRecommendations = analyses.reduce((sum, a) => sum + (a.analysis.recommendations?.length || 0), 0);

    const effectiveness = (totalInsights + totalRecommendations) / analyses.length;

    return {
      effectiveness: effectiveness,
      analyses_count: analyses.length,
      average_insights: totalInsights / analyses.length,
      average_recommendations: totalRecommendations / analyses.length
    };
  }

  getContextKey(context) {
    if (!context) return 'unknown';

    const keyParts = [
      context.component_type || 'unknown',
      context.data_sensitivity || 'unknown',
      context.user_facing ? 'user_facing' : 'internal',
      context.is_production ? 'production' : 'development'
    ];

    return keyParts.join('_');
  }

  convertExportToCSV(data) {
    // Convert key metrics to CSV
    let csv = 'METRIC,VALUE\n';
    csv += `total_applications_logged,${data.system_metrics.total_applications_logged}\n`;
    csv += `total_failures_logged,${data.system_metrics.total_failures_logged}\n`;
    csv += `success_rate,${data.system_metrics.success_rate}\n`;

    return csv;
  }

  /**
   * Schedule automatic analysis
   */
  scheduleAnalysis() {
    const scheduleInterval = this.analysisSchedule === 'daily' ? 24 * 60 * 60 * 1000 :
                           this.analysisSchedule === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    setInterval(async () => {
      try {
        await this.performSystemAnalysis();
      } catch (error) {
        console.error('Scheduled analysis failed:', error);
      }
    }, scheduleInterval);
  }

  /**
   * Cleanup old data
   */
  async cleanup(options = {}) {
    const cleanupResults = {
      logger_cleanup: null,
      analysis_cleanup: null
    };

    // Cleanup logger data
    try {
      cleanupResults.logger_cleanup = await this.logger.cleanup(options);
    } catch (error) {
      cleanupResults.logger_cleanup = { error: error.message };
    }

    // Cleanup analysis history
    const retentionDays = options.retention_days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const originalLength = this.analysisHistory.length;
    this.analysisHistory = this.analysisHistory.filter(
      analysis => new Date(analysis.timestamp) > cutoffDate
    );
    cleanupResults.analysis_cleanup = {
      cleaned_entries: originalLength - this.analysisHistory.length,
      retention_days: retentionDays
    };

    this.emit('cleanup_completed', cleanupResults);

    return cleanupResults;
  }
}

module.exports = PatternSuccessFailureLogger;