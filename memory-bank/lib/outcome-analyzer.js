/**
 * Outcome Analyzer
 *
 * Analyzes pattern application outcomes to identify trends, patterns,
 * and opportunities for system improvement
 */

const EventEmitter = require('events');

class OutcomeAnalyzer extends EventEmitter {
  constructor(options = {}) {
    super();

    this.analysisWindow = options.analysisWindow || 30; // days
    this.minSampleSize = options.minSampleSize || 5;
    this.confidenceThreshold = options.confidenceThreshold || 0.8;
    this.trendSensitivity = options.trendSensitivity || 0.1;

    this.analyzedPatterns = new Map();
    this.trendAnalysis = new Map();
    this.failurePatterns = new Map();
    this.successPatterns = new Map();
  }

  /**
   * Analyze pattern outcomes from logged data
   */
  async analyzeOutcomes(logData, options = {}) {
    const analysis = {
      timestamp: new Date().toISOString(),
      analysis_window: options.window || this.analysisWindow,
      total_applications: logData.length,
      patterns_analyzed: new Set(),
      insights: [],
      recommendations: [],
      risk_indicators: [],
      trend_analysis: {}
    };

    // Group logs by pattern
    const patternGroups = this.groupLogsByPattern(logData);

    // Analyze each pattern
    for (const [patternId, logs] of patternGroups.entries()) {
      if (logs.length < this.minSampleSize) {
        continue; // Skip patterns with insufficient data
      }

      analysis.patterns_analyzed.add(patternId);

      const patternAnalysis = await this.analyzePatternOutcomes(patternId, logs);
      this.analyzedPatterns.set(patternId, patternAnalysis);

      // Add insights and recommendations
      analysis.insights.push(...patternAnalysis.insights);
      analysis.recommendations.push(...patternAnalysis.recommendations);
      analysis.risk_indicators.push(...patternAnalysis.risk_indicators);
    }

    // Cross-pattern analysis
    analysis.trend_analysis = await this.analyzeCrossPatternTrends(patternGroups);

    // Generate system-level insights
    analysis.system_insights = this.generateSystemInsights(analysis);

    this.emit('analysis_completed', analysis);

    return analysis;
  }

  /**
   * Group logs by pattern ID
   */
  groupLogsByPattern(logData) {
    const groups = new Map();

    logData.forEach(log => {
      const patternId = log.pattern_id;
      if (!groups.has(patternId)) {
        groups.set(patternId, []);
      }
      groups.get(patternId).push(log);
    });

    return groups;
  }

  /**
   * Analyze outcomes for a specific pattern
   */
  async analyzePatternOutcomes(patternId, logs) {
    const analysis = {
      pattern_id: patternId,
      total_applications: logs.length,
      success_rate: this.calculateSuccessRate(logs),
      average_confidence: this.calculateAverageConfidence(logs),
      average_quality_impact: this.calculateAverageQualityImpact(logs),
      failure_analysis: this.analyzeFailures(logs),
      trend_analysis: this.analyzePatternTrends(logs),
      context_analysis: this.analyzeContextEffectiveness(logs),
      insights: [],
      recommendations: [],
      risk_indicators: []
    };

    // Generate insights
    analysis.insights = this.generatePatternInsights(analysis);

    // Generate recommendations
    analysis.recommendations = this.generatePatternRecommendations(analysis);

    // Identify risk indicators
    analysis.risk_indicators = this.identifyRiskIndicators(analysis);

    return analysis;
  }

  /**
   * Calculate success rate from logs
   */
  calculateSuccessRate(logs) {
    if (logs.length === 0) return 0;

    const successfulOutcomes = ['success', 'auto_apply', 'recommend'];
    const successCount = logs.filter(log =>
      successfulOutcomes.includes(log.outcome)
    ).length;

    return successCount / logs.length;
  }

  /**
   * Calculate average confidence from logs
   */
  calculateAverageConfidence(logs) {
    const confidenceLogs = logs.filter(log => log.decision_confidence !== undefined);
    if (confidenceLogs.length === 0) return 0;

    const totalConfidence = confidenceLogs.reduce((sum, log) => sum + log.decision_confidence, 0);
    return totalConfidence / confidenceLogs.length;
  }

  /**
   * Calculate average quality impact from logs
   */
  calculateAverageQualityImpact(logs) {
    const impactLogs = logs.filter(log => log.quality_impact !== undefined);
    if (impactLogs.length === 0) return 0;

    const totalImpact = impactLogs.reduce((sum, log) => sum + log.quality_impact, 0);
    return totalImpact / impactLogs.length;
  }

  /**
   * Analyze failure patterns
   */
  analyzeFailures(logs) {
    const failureLogs = logs.filter(log => log.outcome === 'failure');

    if (failureLogs.length === 0) {
      return {
        has_failures: false,
        failure_rate: 0,
        common_failure_reasons: [],
        failure_categories: {}
      };
    }

    const failureReasons = failureLogs.map(log => log.details?.failure_reason || 'unknown');
    const reasonCount = failureReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    const failureCategories = failureLogs.reduce((acc, log) => {
      const category = log.details?.failure_category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      has_failures: true,
      failure_rate: failureLogs.length / logs.length,
      common_failure_reasons: Object.entries(reasonCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count, percentage: count / failureLogs.length })),
      failure_categories: failureCategories
    };
  }

  /**
   * Analyze pattern trends over time
   */
  analyzePatternTrends(logs) {
    if (logs.length < 3) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    // Sort logs by timestamp
    const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Divide into periods (first half vs second half)
    const midpoint = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, midpoint);
    const secondHalf = sortedLogs.slice(midpoint);

    // Calculate success rates for each period
    const firstHalfSuccessRate = this.calculateSuccessRate(firstHalf);
    const secondHalfSuccessRate = this.calculateSuccessRate(secondHalf);

    const change = secondHalfSuccessRate - firstHalfSuccessRate;
    const changePercent = Math.abs(change / firstHalfSuccessRate);

    let trend = 'stable';
    let confidence = 0;

    if (changePercent > this.trendSensitivity) {
      trend = change > 0 ? 'improving' : 'declining';
      confidence = Math.min(changePercent / 0.5, 1); // Scale confidence
    }

    return {
      trend: trend,
      confidence: confidence,
      change: change,
      change_percent: changePercent,
      first_half_success_rate: firstHalfSuccessRate,
      second_half_success_rate: secondHalfSuccessRate,
      analysis_period_days: this.calculateAnalysisPeriod(sortedLogs)
    };
  }

  /**
   * Analyze context effectiveness
   */
  analyzeContextEffectiveness(logs) {
    const contextGroups = new Map();

    // Group logs by context similarity (simplified)
    logs.forEach(log => {
      const contextKey = this.getContextKey(log.context);
      if (!contextGroups.has(contextKey)) {
        contextGroups.set(contextKey, []);
      }
      contextGroups.get(contextKey).push(log);
    });

    const contextAnalysis = [];

    for (const [contextKey, contextLogs] of contextGroups.entries()) {
      if (contextLogs.length >= 3) {
        const successRate = this.calculateSuccessRate(contextLogs);
        const averageConfidence = this.calculateAverageConfidence(contextLogs);

        contextAnalysis.push({
          context_key: contextKey,
          applications: contextLogs.length,
          success_rate: successRate,
          average_confidence: averageConfidence,
          effectiveness_score: (successRate + averageConfidence) / 2
        });
      }
    }

    // Sort by effectiveness
    contextAnalysis.sort((a, b) => b.effectiveness_score - a.effectiveness_score);

    return {
      total_contexts: contextGroups.size,
      effective_contexts: contextAnalysis.filter(c => c.effectiveness_score > 0.7).length,
      context_analysis: contextAnalysis.slice(0, 5) // Top 5 contexts
    };
  }

  /**
   * Generate insights for a pattern
   */
  generatePatternInsights(analysis) {
    const insights = [];

    // Success rate insights
    if (analysis.success_rate > 0.9) {
      insights.push({
        type: 'success_rate',
        level: 'positive',
        message: `Excellent success rate of ${(analysis.success_rate * 100).toFixed(1)}% - pattern is highly effective`,
        confidence: 0.9
      });
    } else if (analysis.success_rate < 0.7) {
      insights.push({
        type: 'success_rate',
        level: 'negative',
        message: `Low success rate of ${(analysis.success_rate * 100).toFixed(1)}% - pattern needs improvement`,
        confidence: 0.8
      });
    }

    // Trend insights
    if (analysis.trend_analysis.trend === 'improving') {
      insights.push({
        type: 'trend',
        level: 'positive',
        message: `Pattern performance is improving with ${(analysis.trend_analysis.change_percent * 100).toFixed(1)}% increase in success rate`,
        confidence: analysis.trend_analysis.confidence
      });
    } else if (analysis.trend_analysis.trend === 'declining') {
      insights.push({
        type: 'trend',
        level: 'negative',
        message: `Pattern performance is declining with ${(analysis.trend_analysis.change_percent * 100).toFixed(1)}% decrease in success rate`,
        confidence: analysis.trend_analysis.confidence
      });
    }

    // Failure insights
    if (analysis.failure_analysis.has_failures) {
      const topFailure = analysis.failure_analysis.common_failure_reasons[0];
      if (topFailure && topFailure.percentage > 0.3) {
        insights.push({
          type: 'failure',
          level: 'negative',
          message: `High failure rate due to "${topFailure.reason}" (${(topFailure.percentage * 100).toFixed(1)}% of failures)`,
          confidence: 0.85
        });
      }
    }

    // Quality impact insights
    if (analysis.average_quality_impact > 0.2) {
      insights.push({
        type: 'quality_impact',
        level: 'positive',
        message: `Pattern has strong positive quality impact (${(analysis.average_quality_impact * 100).toFixed(1)} points)`,
        confidence: 0.8
      });
    } else if (analysis.average_quality_impact < -0.2) {
      insights.push({
        type: 'quality_impact',
        level: 'negative',
        message: `Pattern has negative quality impact (${(analysis.average_quality_impact * 100).toFixed(1)} points)`,
        confidence: 0.8
      });
    }

    return insights;
  }

  /**
   * Generate recommendations for a pattern
   */
  generatePatternRecommendations(analysis) {
    const recommendations = [];

    // Success rate recommendations
    if (analysis.success_rate < 0.8) {
      recommendations.push({
        type: 'improvement',
        priority: 'high',
        action: 'Refine pattern conditions and validation',
        rationale: `Success rate of ${(analysis.success_rate * 100).toFixed(1)}% indicates room for improvement`,
        expected_impact: 'medium'
      });
    }

    // Failure-based recommendations
    if (analysis.failure_analysis.has_failures) {
      const topFailure = analysis.failure_analysis.common_failure_reasons[0];
      if (topFailure && topFailure.percentage > 0.2) {
        recommendations.push({
          type: 'failure_mitigation',
          priority: 'high',
          action: `Address common failure: ${topFailure.reason}`,
          rationale: `${(topFailure.percentage * 100).toFixed(1)}% of failures are due to this issue`,
          expected_impact: 'high'
        });
      }
    }

    // Trend-based recommendations
    if (analysis.trend_analysis.trend === 'declining') {
      recommendations.push({
        type: 'trend_reversal',
        priority: 'medium',
        action: 'Review recent changes and context factors',
        rationale: 'Declining trend indicates environmental or contextual changes',
        expected_impact: 'medium'
      });
    }

    // Context-based recommendations
    if (analysis.context_analysis.effective_contexts < analysis.context_analysis.total_contexts * 0.5) {
      recommendations.push({
        type: 'context_optimization',
        priority: 'medium',
        action: 'Focus pattern application on high-effectiveness contexts',
        rationale: 'Pattern performs poorly in many contexts',
        expected_impact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Identify risk indicators for a pattern
   */
  identifyRiskIndicators(analysis) {
    const indicators = [];

    // Low success rate
    if (analysis.success_rate < 0.6) {
      indicators.push({
        type: 'low_success_rate',
        severity: 'high',
        message: `Success rate of ${(analysis.success_rate * 100).toFixed(1)}% is below acceptable threshold`,
        metric: analysis.success_rate,
        threshold: 0.6
      });
    }

    // High failure rate
    if (analysis.failure_analysis.failure_rate > 0.3) {
      indicators.push({
        type: 'high_failure_rate',
        severity: 'high',
        message: `Failure rate of ${(analysis.failure_analysis.failure_rate * 100).toFixed(1)}% is concerning`,
        metric: analysis.failure_analysis.failure_rate,
        threshold: 0.3
      });
    }

    // Declining trend
    if (analysis.trend_analysis.trend === 'declining' && analysis.trend_analysis.confidence > 0.7) {
      indicators.push({
        type: 'declining_trend',
        severity: 'medium',
        message: `Pattern performance is declining with ${(analysis.trend_analysis.change_percent * 100).toFixed(1)}% decrease`,
        metric: analysis.trend_analysis.change_percent,
        threshold: -0.1
      });
    }

    // Negative quality impact
    if (analysis.average_quality_impact < -0.1) {
      indicators.push({
        type: 'negative_quality_impact',
        severity: 'medium',
        message: `Pattern has negative quality impact (${(analysis.average_quality_impact * 100).toFixed(1)} points)`,
        metric: analysis.average_quality_impact,
        threshold: -0.1
      });
    }

    return indicators;
  }

  /**
   * Analyze trends across all patterns
   */
  async analyzeCrossPatternTrends(patternGroups) {
    const trends = {
      system_success_rate: 0,
      improving_patterns: 0,
      declining_patterns: 0,
      high_risk_patterns: 0,
      common_failure_modes: new Map(),
      performance_clusters: {
        high_performing: [],
        medium_performing: [],
        low_performing: []
      }
    };

    let totalApplications = 0;
    let totalSuccesses = 0;

    for (const [patternId, logs] of patternGroups.entries()) {
      const successRate = this.calculateSuccessRate(logs);
      const trendAnalysis = this.analyzePatternTrends(logs);

      totalApplications += logs.length;
      totalSuccesses += logs.filter(log => ['success', 'auto_apply', 'recommend'].includes(log.outcome)).length;

      // Categorize patterns
      if (successRate >= 0.8) {
        trends.performance_clusters.high_performing.push(patternId);
      } else if (successRate >= 0.6) {
        trends.performance_clusters.medium_performing.push(patternId);
      } else {
        trends.performance_clusters.low_performing.push(patternId);
      }

      // Count trends
      if (trendAnalysis.trend === 'improving') {
        trends.improving_patterns++;
      } else if (trendAnalysis.trend === 'declining') {
        trends.declining_patterns++;
      }

      // Check for high risk
      if (successRate < 0.6 || trendAnalysis.trend === 'declining') {
        trends.high_risk_patterns++;
      }

      // Collect failure modes
      const failures = logs.filter(log => log.outcome === 'failure');
      failures.forEach(log => {
        const reason = log.details?.failure_reason || 'unknown';
        trends.common_failure_modes.set(
          reason,
          (trends.common_failure_modes.get(reason) || 0) + 1
        );
      });
    }

    trends.system_success_rate = totalApplications > 0 ? totalSuccesses / totalApplications : 0;

    // Convert failure modes map to sorted array
    trends.common_failure_modes = Array.from(trends.common_failure_modes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([reason, count]) => ({ reason, count }));

    return trends;
  }

  /**
   * Generate system-level insights
   */
  generateSystemInsights(analysis) {
    const insights = [];

    // System success rate insight
    if (analysis.trend_analysis.system_success_rate > 0.8) {
      insights.push({
        type: 'system_performance',
        level: 'positive',
        message: `System success rate of ${(analysis.trend_analysis.system_success_rate * 100).toFixed(1)}% is excellent`,
        metric: analysis.trend_analysis.system_success_rate
      });
    } else if (analysis.trend_analysis.system_success_rate < 0.7) {
      insights.push({
        type: 'system_performance',
        level: 'negative',
        message: `System success rate of ${(analysis.trend_analysis.system_success_rate * 100).toFixed(1)}% needs improvement`,
        metric: analysis.trend_analysis.system_success_rate
      });
    }

    // High-risk patterns insight
    if (analysis.trend_analysis.high_risk_patterns > analysis.patterns_analyzed.size * 0.3) {
      insights.push({
        type: 'risk_concentration',
        level: 'warning',
        message: `${analysis.trend_analysis.high_risk_patterns} patterns (${((analysis.trend_analysis.high_risk_patterns / analysis.patterns_analyzed.size) * 100).toFixed(1)}%) are at high risk`,
        metric: analysis.trend_analysis.high_risk_patterns
      });
    }

    // Performance distribution insight
    const highPerforming = analysis.trend_analysis.performance_clusters.high_performing.length;
    const totalPatterns = analysis.patterns_analyzed.size;

    if (highPerforming > totalPatterns * 0.5) {
      insights.push({
        type: 'performance_distribution',
        level: 'positive',
        message: `${highPerforming} of ${totalPatterns} patterns (${((highPerforming / totalPatterns) * 100).toFixed(1)}%) are high-performing`,
        metric: highPerforming / totalPatterns
      });
    }

    return insights;
  }

  /**
   * Get context key for grouping (simplified)
   */
  getContextKey(context) {
    if (!context) return 'unknown';

    // Create a simplified context key based on key attributes
    const keyParts = [
      context.component_type || 'unknown',
      context.data_sensitivity || 'unknown',
      context.user_facing ? 'user_facing' : 'internal',
      context.is_production ? 'production' : 'development'
    ];

    return keyParts.join('_');
  }

  /**
   * Calculate analysis period in days
   */
  calculateAnalysisPeriod(logs) {
    if (logs.length < 2) return 0;

    const timestamps = logs.map(log => new Date(log.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));

    const diffTime = latest - earliest;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get analysis results for a specific pattern
   */
  getPatternAnalysis(patternId) {
    return this.analyzedPatterns.get(patternId);
  }

  /**
   * Get all analyzed patterns
   */
  getAllPatternAnalyses() {
    return Array.from(this.analyzedPatterns.entries());
  }

  /**
   * Export analysis results
   */
  exportAnalysis(format = 'json') {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      analyzed_patterns: Object.fromEntries(this.analyzedPatterns),
      trend_analysis: Object.fromEntries(this.trendAnalysis),
      failure_patterns: Object.fromEntries(this.failurePatterns),
      success_patterns: Object.fromEntries(this.successPatterns)
    };

    if (format === 'csv') {
      return this.convertAnalysisToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert analysis to CSV format
   */
  convertAnalysisToCSV(data) {
    let csv = 'PATTERN_ID,SUCCESS_RATE,AVERAGE_CONFIDENCE,TREND,INSIGHTS_COUNT,RECOMMENDATIONS_COUNT\n';

    for (const [patternId, analysis] of Object.entries(data.analyzed_patterns)) {
      csv += `${patternId},${analysis.success_rate},${analysis.average_confidence},${analysis.trend_analysis.trend},${analysis.insights.length},${analysis.recommendations.length}\n`;
    }

    return csv;
  }
}

module.exports = OutcomeAnalyzer;