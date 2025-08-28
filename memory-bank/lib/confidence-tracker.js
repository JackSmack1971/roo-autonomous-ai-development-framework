/**
 * Confidence Tracker
 *
 * Tracks confidence changes over time, manages adaptation events,
 * and provides analytics for pattern effectiveness
 */

const ConfidenceCalculator = require('./confidence-calculator');
const EventEmitter = require('events');

class ConfidenceTracker extends EventEmitter {
  constructor(options = {}) {
    super();

    this.calculator = new ConfidenceCalculator(options);
    this.trackingData = new Map();
    this.adaptationHistory = new Map();
    this.analyticsCache = new Map();
    this.maxHistorySize = options.maxHistorySize || 1000;
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes
  }

  /**
   * Initialize the confidence tracker
   */
  async initialize() {
    await this.calculator.initialize();
  }

  /**
   * Track confidence for a pattern with full context
   */
  async trackConfidence(pattern, context = {}, options = {}) {
    const patternId = pattern.id;

    // Calculate current confidence
    const confidenceResult = await this.calculator.calculateConfidence(pattern, context, options);

    // Get previous tracking data
    const previousData = this.trackingData.get(patternId);

    // Create tracking entry
    const trackingEntry = {
      pattern_id: patternId,
      timestamp: new Date().toISOString(),
      confidence_score: confidenceResult.score,
      factors: confidenceResult.factors,
      context: context,
      calculation_method: confidenceResult.calculation_method,
      previous_confidence: previousData?.confidence_score,
      confidence_change: previousData ?
        confidenceResult.score - previousData.confidence_score : 0,
      metadata: {
        applications_since_last_track: options.applications_since_last_track || 0,
        context_similarity: options.context_similarity,
        quality_impact: options.quality_impact
      }
    };

    // Store tracking data
    this.storeTrackingEntry(patternId, trackingEntry);

    // Check for significant confidence changes
    this.detectConfidenceAnomalies(trackingEntry, previousData);

    // Update analytics cache
    this.updateAnalyticsCache(patternId);

    // Emit tracking event
    this.emit('confidence_tracked', {
      pattern: pattern,
      tracking_entry: trackingEntry,
      confidence_change: trackingEntry.confidence_change
    });

    return trackingEntry;
  }

  /**
   * Update confidence based on application outcome
   */
  async updateConfidenceFromOutcome(patternId, success, qualityImpact = 0, context = {}) {
    // Get current pattern data (would come from pattern storage in real implementation)
    const pattern = await this.getPattern(patternId); // Placeholder - integrate with pattern storage

    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    // Calculate confidence update
    const updateResult = await this.calculator.updateConfidenceFromOutcome(
      pattern,
      success,
      qualityImpact,
      context
    );

    // Create adaptation event
    const adaptationEvent = {
      pattern_id: patternId,
      event_type: 'confidence_update',
      timestamp: new Date().toISOString(),
      trigger: success ? 'application_success' : 'application_failure',
      previous_confidence: updateResult.previous_confidence,
      new_confidence: updateResult.new_confidence,
      confidence_change: updateResult.new_confidence - updateResult.previous_confidence,
      factors: updateResult.factors,
      context: context,
      quality_impact: qualityImpact
    };

    // Store adaptation event
    this.storeAdaptationEvent(patternId, adaptationEvent);

    // Update pattern confidence (would update pattern storage in real implementation)
    pattern.confidence_score = updateResult.new_confidence;
    await this.updatePattern(pattern); // Placeholder - integrate with pattern storage

    // Track the updated confidence
    await this.trackConfidence(pattern, context, {
      applications_since_last_track: 1,
      quality_impact: qualityImpact
    });

    // Emit adaptation event
    this.emit('confidence_adapted', {
      pattern: pattern,
      adaptation_event: adaptationEvent,
      confidence_change: adaptationEvent.confidence_change
    });

    return adaptationEvent;
  }

  /**
   * Store tracking entry with history management
   */
  storeTrackingEntry(patternId, entry) {
    if (!this.trackingData.has(patternId)) {
      this.trackingData.set(patternId, []);
    }

    const history = this.trackingData.get(patternId);
    history.push(entry);

    // Maintain history size limit
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Store adaptation event
   */
  storeAdaptationEvent(patternId, event) {
    if (!this.adaptationHistory.has(patternId)) {
      this.adaptationHistory.set(patternId, []);
    }

    const history = this.adaptationHistory.get(patternId);
    history.push(event);

    // Maintain history size limit
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Detect confidence anomalies and significant changes
   */
  detectConfidenceAnomalies(currentEntry, previousEntry) {
    if (!previousEntry) {
      return; // No previous data to compare
    }

    const changeThreshold = 0.1; // 10% change threshold
    const confidenceChange = Math.abs(currentEntry.confidence_change);

    if (confidenceChange > changeThreshold) {
      const anomaly = {
        pattern_id: currentEntry.pattern_id,
        anomaly_type: 'significant_confidence_change',
        severity: confidenceChange > 0.2 ? 'high' : 'medium',
        previous_confidence: previousEntry.confidence_score,
        current_confidence: currentEntry.confidence_score,
        confidence_change: currentEntry.confidence_change,
        timestamp: currentEntry.timestamp,
        factors: currentEntry.factors
      };

      this.emit('confidence_anomaly_detected', anomaly);
    }

    // Detect confidence volatility
    const recentHistory = this.getRecentTrackingHistory(currentEntry.pattern_id, 10);
    if (recentHistory.length >= 5) {
      const volatility = this.calculateVolatility(recentHistory);

      if (volatility > 0.15) { // High volatility threshold
        const volatilityEvent = {
          pattern_id: currentEntry.pattern_id,
          anomaly_type: 'high_confidence_volatility',
          volatility_score: volatility,
          recent_history_length: recentHistory.length,
          timestamp: currentEntry.timestamp
        };

        this.emit('confidence_volatility_detected', volatilityEvent);
      }
    }
  }

  /**
   * Get recent tracking history for a pattern
   */
  getRecentTrackingHistory(patternId, limit = 10) {
    const history = this.trackingData.get(patternId);
    if (!history) {
      return [];
    }

    return history.slice(-limit);
  }

  /**
   * Calculate confidence volatility from history
   */
  calculateVolatility(history) {
    if (history.length < 2) {
      return 0;
    }

    const changes = [];
    for (let i = 1; i < history.length; i++) {
      changes.push(Math.abs(history[i].confidence_score - history[i-1].confidence_score));
    }

    // Calculate standard deviation of changes
    const mean = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / changes.length;

    return Math.sqrt(variance);
  }

  /**
   * Get confidence analytics for a pattern
   */
  async getConfidenceAnalytics(patternId, options = {}) {
    // Check cache first
    const cacheKey = `analytics_${patternId}`;
    const cached = this.analyticsCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }

    // Calculate analytics
    const analytics = await this.calculateConfidenceAnalytics(patternId, options);

    // Cache results
    this.analyticsCache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now()
    });

    return analytics;
  }

  /**
   * Calculate comprehensive confidence analytics
   */
  async calculateConfidenceAnalytics(patternId, options = {}) {
    const trackingHistory = this.trackingData.get(patternId);
    const adaptationHistory = this.adaptationHistory.get(patternId);

    if (!trackingHistory || trackingHistory.length === 0) {
      return {
        pattern_id: patternId,
        status: 'insufficient_data',
        message: 'No tracking history available'
      };
    }

    const recentEntries = options.days ?
      this.getRecentEntriesByDays(trackingHistory, options.days) :
      trackingHistory.slice(-20); // Last 20 entries by default

    const analytics = {
      pattern_id: patternId,
      current_confidence: recentEntries[recentEntries.length - 1]?.confidence_score || 0,
      confidence_trend: this.calculateConfidenceTrend(recentEntries),
      volatility: this.calculateVolatility(recentEntries),
      average_confidence: this.calculateAverageConfidence(recentEntries),
      confidence_range: this.calculateConfidenceRange(recentEntries),
      adaptation_events: adaptationHistory ? adaptationHistory.length : 0,
      tracking_points: trackingHistory.length,
      analysis_period: options.days || 'all_time',
      factors_analysis: this.analyzeConfidenceFactors(recentEntries),
      recommendations: await this.generateConfidenceRecommendations(patternId, recentEntries)
    };

    return analytics;
  }

  /**
   * Calculate confidence trend over time
   */
  calculateConfidenceTrend(entries) {
    if (entries.length < 2) {
      return 'insufficient_data';
    }

    const firstConfidence = entries[0].confidence_score;
    const lastConfidence = entries[entries.length - 1].confidence_score;
    const change = lastConfidence - firstConfidence;
    const changePercent = Math.abs(change / firstConfidence);

    if (changePercent < 0.05) {
      return 'stable';
    } else if (change > 0) {
      return changePercent > 0.15 ? 'strongly_improving' : 'improving';
    } else {
      return changePercent > 0.15 ? 'strongly_declining' : 'declining';
    }
  }

  /**
   * Calculate average confidence over entries
   */
  calculateAverageConfidence(entries) {
    if (entries.length === 0) {
      return 0;
    }

    const sum = entries.reduce((total, entry) => total + entry.confidence_score, 0);
    return sum / entries.length;
  }

  /**
   * Calculate confidence range (min/max)
   */
  calculateConfidenceRange(entries) {
    if (entries.length === 0) {
      return { min: 0, max: 0 };
    }

    const confidences = entries.map(entry => entry.confidence_score);
    return {
      min: Math.min(...confidences),
      max: Math.max(...confidences)
    };
  }

  /**
   * Analyze which factors most influence confidence
   */
  analyzeConfidenceFactors(entries) {
    const factorImpact = {
      success_rate: 0,
      recency: 0,
      context_match: 0,
      diversity: 0,
      quality_impact: 0
    };

    let totalEntries = 0;

    entries.forEach(entry => {
      if (entry.factors) {
        factorImpact.success_rate += entry.factors.successRate || 0;
        factorImpact.recency += entry.factors.recency || 0;
        factorImpact.context_match += entry.factors.contextMatch || 0;
        factorImpact.diversity += entry.factors.diversity || 0;
        factorImpact.quality_impact += entry.factors.qualityImpact || 0;
        totalEntries++;
      }
    });

    if (totalEntries > 0) {
      // Calculate average impact
      Object.keys(factorImpact).forEach(factor => {
        factorImpact[factor] /= totalEntries;
      });
    }

    // Sort by impact
    const sortedFactors = Object.entries(factorImpact)
      .sort(([,a], [,b]) => b - a)
      .map(([factor, impact]) => ({ factor, impact }));

    return {
      factor_impact: factorImpact,
      most_influential_factors: sortedFactors.slice(0, 3),
      least_influential_factors: sortedFactors.slice(-2)
    };
  }

  /**
   * Generate confidence-based recommendations
   */
  async generateConfidenceRecommendations(patternId, entries) {
    if (entries.length === 0) {
      return ['Insufficient data for recommendations'];
    }

    const latestEntry = entries[entries.length - 1];
    const recommendations = [];

    // Confidence level recommendations
    const confidence = latestEntry.confidence_score;
    if (confidence >= 0.8) {
      recommendations.push('Pattern is highly confident - consider auto-application');
    } else if (confidence >= 0.6) {
      recommendations.push('Pattern shows promise - monitor performance closely');
    } else if (confidence < 0.4) {
      recommendations.push('Pattern confidence is low - consider deprecation or review');
    }

    // Trend-based recommendations
    const trend = this.calculateConfidenceTrend(entries);
    if (trend === 'strongly_declining') {
      recommendations.push('Confidence is declining rapidly - investigate root causes');
    } else if (trend === 'strongly_improving') {
      recommendations.push('Confidence is improving strongly - consider expanding usage');
    }

    // Volatility recommendations
    const volatility = this.calculateVolatility(entries);
    if (volatility > 0.15) {
      recommendations.push('High confidence volatility detected - stabilize pattern performance');
    }

    // Factor-based recommendations
    const factorAnalysis = this.analyzeConfidenceFactors(entries);
    const topFactor = factorAnalysis.most_influential_factors[0];

    if (topFactor && topFactor.impact > 0.7) {
      recommendations.push(`Focus on ${topFactor.factor} factor to maintain high confidence`);
    }

    return recommendations;
  }

  /**
   * Get entries from recent days
   */
  getRecentEntriesByDays(entries, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries.filter(entry =>
      new Date(entry.timestamp) > cutoffDate
    );
  }

  /**
   * Update analytics cache
   */
  updateAnalyticsCache(patternId) {
    const cacheKey = `analytics_${patternId}`;
    this.analyticsCache.delete(cacheKey); // Invalidate cache
  }

  /**
   * Get confidence prediction for future applications
   */
  async predictFutureConfidence(patternId, futureApplications = 5) {
    const history = this.trackingData.get(patternId);
    if (!history || history.length === 0) {
      return {
        pattern_id: patternId,
        status: 'insufficient_data',
        message: 'No tracking history available for prediction'
      };
    }

    // Get pattern data (placeholder - would integrate with pattern storage)
    const pattern = await this.getPattern(patternId);
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    // Use confidence calculator for prediction
    const prediction = await this.calculator.predictFutureConfidence(pattern, futureApplications);

    return {
      pattern_id: patternId,
      ...prediction,
      based_on_history_length: history.length,
      prediction_confidence: history.length > 10 ? 'high' : history.length > 5 ? 'medium' : 'low'
    };
  }

  /**
   * Export confidence tracking data
   */
  async exportTrackingData(patternId, format = 'json') {
    const trackingHistory = this.trackingData.get(patternId) || [];
    const adaptationHistory = this.adaptationHistory.get(patternId) || [];

    const exportData = {
      pattern_id: patternId,
      export_timestamp: new Date().toISOString(),
      tracking_history: trackingHistory,
      adaptation_history: adaptationHistory,
      summary: await this.getConfidenceAnalytics(patternId)
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert tracking data to CSV format
   */
  convertToCSV(data) {
    const trackingHeaders = ['timestamp', 'confidence_score', 'confidence_change', 'calculation_method'];
    const trackingRows = data.tracking_history.map(entry => [
      entry.timestamp,
      entry.confidence_score,
      entry.confidence_change || 0,
      entry.calculation_method
    ]);

    const csvContent = [
      'TRACKING_DATA',
      trackingHeaders.join(','),
      ...trackingRows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
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

  /**
   * Cleanup old tracking data
   */
  async cleanup(options = {}) {
    const retentionDays = options.retention_days || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let cleanedEntries = 0;

    // Cleanup tracking data
    for (const [patternId, history] of this.trackingData.entries()) {
      const originalLength = history.length;
      const filteredHistory = history.filter(entry =>
        new Date(entry.timestamp) > cutoffDate
      );

      if (filteredHistory.length < originalLength) {
        this.trackingData.set(patternId, filteredHistory);
        cleanedEntries += (originalLength - filteredHistory.length);
      }
    }

    // Cleanup adaptation history
    for (const [patternId, history] of this.adaptationHistory.entries()) {
      const originalLength = history.length;
      const filteredHistory = history.filter(event =>
        new Date(event.timestamp) > cutoffDate
      );

      if (filteredHistory.length < originalLength) {
        this.adaptationHistory.set(patternId, filteredHistory);
        cleanedEntries += (originalLength - filteredHistory.length);
      }
    }

    // Clear analytics cache
    this.analyticsCache.clear();

    this.emit('cleanup_completed', {
      cleaned_entries: cleanedEntries,
      retention_days: retentionDays
    });

    return cleanedEntries;
  }
}

module.exports = ConfidenceTracker;