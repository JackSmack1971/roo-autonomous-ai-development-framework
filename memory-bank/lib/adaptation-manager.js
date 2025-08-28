/**
 * Adaptation Manager
 *
 * Manages pattern evolution and context adaptation based on
 * performance data, changing contexts, and learning outcomes
 */

const EventEmitter = require('events');

class AdaptationManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.adaptationRules = new Map();
    this.contextClusters = new Map();
    this.patternEvolution = new Map();
    this.adaptationHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;

    // Load default adaptation rules
    this.loadDefaultAdaptationRules();
  }

  /**
   * Load default adaptation rules
   */
  loadDefaultAdaptationRules() {
    // Success rate adaptation rules
    this.adaptationRules.set('success_rate_adaptation', {
      trigger: 'success_rate_change',
      threshold: 0.1,
      action: 'adjust_confidence',
      parameters: {
        increase_factor: 0.05,
        decrease_factor: 0.1
      }
    });

    // Context drift adaptation rules
    this.adaptationRules.set('context_drift_adaptation', {
      trigger: 'context_similarity_decline',
      threshold: 0.2,
      action: 'expand_context_matching',
      parameters: {
        expansion_rate: 0.1,
        max_expansion: 0.3
      }
    });

    // Performance degradation adaptation rules
    this.adaptationRules.set('performance_degradation', {
      trigger: 'quality_impact_decline',
      threshold: 0.15,
      action: 'refine_pattern_conditions',
      parameters: {
        condition_strictness: 0.1,
        validation_strength: 'medium'
      }
    });

    // Usage pattern adaptation rules
    this.adaptationRules.set('usage_pattern_adaptation', {
      trigger: 'application_frequency_change',
      threshold: 0.5,
      action: 'adjust_application_thresholds',
      parameters: {
        frequency_weight: 0.2,
        recency_bonus: 0.1
      }
    });
  }

  /**
   * Analyze pattern performance and trigger adaptations
   */
  async analyzePatternPerformance(pattern, performanceData, context = {}) {
    const analysis = {
      pattern_id: pattern.id,
      timestamp: new Date().toISOString(),
      performance_metrics: performanceData,
      adaptation_opportunities: [],
      recommended_adaptations: []
    };

    // Analyze success rate trends
    const successRateAnalysis = this.analyzeSuccessRateTrend(pattern, performanceData);
    if (successRateAnalysis.needs_adaptation) {
      analysis.adaptation_opportunities.push(successRateAnalysis);
    }

    // Analyze context effectiveness
    const contextAnalysis = this.analyzeContextEffectiveness(pattern, context, performanceData);
    if (contextAnalysis.needs_adaptation) {
      analysis.adaptation_opportunities.push(contextAnalysis);
    }

    // Analyze quality impact trends
    const qualityAnalysis = this.analyzeQualityImpact(pattern, performanceData);
    if (qualityAnalysis.needs_adaptation) {
      analysis.adaptation_opportunities.push(qualityAnalysis);
    }

    // Generate adaptation recommendations
    analysis.recommended_adaptations = this.generateAdaptationRecommendations(
      pattern,
      analysis.adaptation_opportunities
    );

    // Store analysis
    this.storeAdaptationAnalysis(analysis);

    // Emit analysis event
    this.emit('pattern_analyzed', analysis);

    return analysis;
  }

  /**
   * Analyze success rate trends
   */
  analyzeSuccessRateTrend(pattern, performanceData) {
    const currentSuccessRate = pattern.success_rate || 0;
    const recentSuccessRate = performanceData.recent_success_rate || currentSuccessRate;

    const change = recentSuccessRate - currentSuccessRate;
    const changePercent = Math.abs(change / currentSuccessRate);

    const analysis = {
      type: 'success_rate_trend',
      current_rate: currentSuccessRate,
      recent_rate: recentSuccessRate,
      change: change,
      change_percent: changePercent,
      needs_adaptation: false,
      adaptation_reason: null
    };

    // Check if adaptation is needed
    const rule = this.adaptationRules.get('success_rate_adaptation');
    if (changePercent >= rule.threshold) {
      analysis.needs_adaptation = true;
      analysis.adaptation_reason = change > 0 ?
        'success_rate_improving' : 'success_rate_declining';
    }

    return analysis;
  }

  /**
   * Analyze context effectiveness
   */
  analyzeContextEffectiveness(pattern, context, performanceData) {
    const contextMatch = performanceData.context_match_score || 0.5;
    const contextSimilarity = performanceData.context_similarity || 1.0;

    const analysis = {
      type: 'context_effectiveness',
      context_match_score: contextMatch,
      context_similarity: contextSimilarity,
      needs_adaptation: false,
      adaptation_reason: null
    };

    // Check for context drift
    const rule = this.adaptationRules.get('context_drift_adaptation');
    if (contextSimilarity < (1 - rule.threshold)) {
      analysis.needs_adaptation = true;
      analysis.adaptation_reason = 'context_drift_detected';
    }

    // Check for poor context matching
    if (contextMatch < 0.6) {
      analysis.needs_adaptation = true;
      analysis.adaptation_reason = 'poor_context_matching';
    }

    return analysis;
  }

  /**
   * Analyze quality impact trends
   */
  analyzeQualityImpact(pattern, performanceData) {
    const currentQualityImpact = pattern.metadata?.usage_statistics?.average_quality_impact || 0;
    const recentQualityImpact = performanceData.recent_quality_impact || currentQualityImpact;

    const change = recentQualityImpact - currentQualityImpact;
    const changePercent = Math.abs(change / (currentQualityImpact || 1));

    const analysis = {
      type: 'quality_impact_trend',
      current_impact: currentQualityImpact,
      recent_impact: recentQualityImpact,
      change: change,
      change_percent: changePercent,
      needs_adaptation: false,
      adaptation_reason: null
    };

    // Check if adaptation is needed
    const rule = this.adaptationRules.get('performance_degradation');
    if (changePercent >= rule.threshold && change < 0) {
      analysis.needs_adaptation = true;
      analysis.adaptation_reason = 'quality_impact_declining';
    }

    return analysis;
  }

  /**
   * Generate adaptation recommendations
   */
  generateAdaptationRecommendations(pattern, adaptationOpportunities) {
    const recommendations = [];

    adaptationOpportunities.forEach(opportunity => {
      const recommendation = {
        pattern_id: pattern.id,
        opportunity_type: opportunity.type,
        reason: opportunity.adaptation_reason,
        priority: this.calculateAdaptationPriority(opportunity),
        suggested_actions: this.generateSuggestedActions(opportunity),
        expected_impact: this.estimateAdaptationImpact(opportunity),
        implementation_complexity: this.assessImplementationComplexity(opportunity)
      };

      recommendations.push(recommendation);
    });

    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations;
  }

  /**
   * Calculate adaptation priority
   */
  calculateAdaptationPriority(opportunity) {
    let priority = 0.5; // Base priority

    // Adjust based on opportunity type and severity
    switch (opportunity.type) {
      case 'success_rate_trend':
        priority += opportunity.change_percent * 0.5;
        if (opportunity.change < 0) priority += 0.2; // Higher priority for declining success
        break;

      case 'context_effectiveness':
        if (opportunity.adaptation_reason === 'context_drift_detected') {
          priority += 0.3;
        } else if (opportunity.adaptation_reason === 'poor_context_matching') {
          priority += 0.2;
        }
        break;

      case 'quality_impact_trend':
        priority += opportunity.change_percent * 0.4;
        priority += 0.2; // Quality issues are generally high priority
        break;
    }

    return Math.min(1.0, priority);
  }

  /**
   * Generate suggested actions for adaptation
   */
  generateSuggestedActions(opportunity) {
    const actions = [];

    switch (opportunity.adaptation_reason) {
      case 'success_rate_improving':
        actions.push({
          action: 'expand_application_scope',
          description: 'Consider applying pattern to additional contexts',
          effort: 'low'
        });
        break;

      case 'success_rate_declining':
        actions.push({
          action: 'refine_conditions',
          description: 'Review and refine pattern trigger conditions',
          effort: 'medium'
        });
        actions.push({
          action: 'add_validation',
          description: 'Add additional validation checks',
          effort: 'medium'
        });
        break;

      case 'context_drift_detected':
        actions.push({
          action: 'update_context_matching',
          description: 'Update context matching criteria to handle drift',
          effort: 'medium'
        });
        actions.push({
          action: 'expand_context_fields',
          description: 'Consider adding new context fields for better matching',
          effort: 'high'
        });
        break;

      case 'poor_context_matching':
        actions.push({
          action: 'simplify_conditions',
          description: 'Simplify or clarify pattern conditions',
          effort: 'low'
        });
        actions.push({
          action: 'add_examples',
          description: 'Add more context examples to pattern definition',
          effort: 'low'
        });
        break;

      case 'quality_impact_declining':
        actions.push({
          action: 'review_quality_gates',
          description: 'Review and strengthen quality gates',
          effort: 'medium'
        });
        actions.push({
          action: 'add_monitoring',
          description: 'Add additional monitoring for quality metrics',
          effort: 'low'
        });
        break;
    }

    return actions;
  }

  /**
   * Estimate adaptation impact
   */
  estimateAdaptationImpact(opportunity) {
    // Estimate potential impact of adaptation
    let impact = 0.5; // Base impact

    switch (opportunity.type) {
      case 'success_rate_trend':
        impact += Math.abs(opportunity.change_percent) * 0.3;
        break;

      case 'context_effectiveness':
        impact += (1 - opportunity.context_match_score) * 0.4;
        break;

      case 'quality_impact_trend':
        impact += Math.abs(opportunity.change_percent) * 0.5;
        break;
    }

    return Math.min(1.0, impact);
  }

  /**
   * Assess implementation complexity
   */
  assessImplementationComplexity(opportunity) {
    // Assess complexity based on opportunity type
    switch (opportunity.adaptation_reason) {
      case 'success_rate_improving':
        return 'low';
      case 'success_rate_declining':
        return 'medium';
      case 'context_drift_detected':
        return 'high';
      case 'poor_context_matching':
        return 'low';
      case 'quality_impact_declining':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Apply pattern adaptation
   */
  async applyAdaptation(pattern, adaptationRecommendation) {
    const adaptation = {
      pattern_id: pattern.id,
      timestamp: new Date().toISOString(),
      adaptation_type: adaptationRecommendation.opportunity_type,
      reason: adaptationRecommendation.reason,
      actions_taken: [],
      expected_impact: adaptationRecommendation.expected_impact,
      status: 'in_progress'
    };

    try {
      // Apply the suggested actions
      for (const action of adaptationRecommendation.suggested_actions) {
        const result = await this.executeAdaptationAction(pattern, action);
        adaptation.actions_taken.push({
          action: action.action,
          success: result.success,
          details: result.details
        });
      }

      adaptation.status = 'completed';

      // Store adaptation in history
      this.storeAdaptationEvent(adaptation);

      // Emit adaptation event
      this.emit('adaptation_applied', {
        pattern: pattern,
        adaptation: adaptation,
        recommendation: adaptationRecommendation
      });

      return adaptation;

    } catch (error) {
      adaptation.status = 'failed';
      adaptation.error = error.message;

      this.storeAdaptationEvent(adaptation);

      this.emit('adaptation_failed', {
        pattern: pattern,
        adaptation: adaptation,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Execute a specific adaptation action
   */
  async executeAdaptationAction(pattern, action) {
    switch (action.action) {
      case 'expand_application_scope':
        return await this.expandApplicationScope(pattern);

      case 'refine_conditions':
        return await this.refinePatternConditions(pattern);

      case 'add_validation':
        return await this.addPatternValidation(pattern);

      case 'update_context_matching':
        return await this.updateContextMatching(pattern);

      case 'expand_context_fields':
        return await this.expandContextFields(pattern);

      case 'simplify_conditions':
        return await this.simplifyConditions(pattern);

      case 'add_examples':
        return await this.addContextExamples(pattern);

      case 'review_quality_gates':
        return await this.reviewQualityGates(pattern);

      case 'add_monitoring':
        return await this.addMonitoring(pattern);

      default:
        return {
          success: false,
          details: `Unknown adaptation action: ${action.action}`
        };
    }
  }

  /**
   * Placeholder methods for adaptation actions
   * These would integrate with the pattern storage system
   */
  async expandApplicationScope(pattern) {
    // Placeholder - would update pattern scope
    return { success: true, details: 'Application scope expanded' };
  }

  async refinePatternConditions(pattern) {
    // Placeholder - would refine pattern conditions
    return { success: true, details: 'Pattern conditions refined' };
  }

  async addPatternValidation(pattern) {
    // Placeholder - would add validation checks
    return { success: true, details: 'Validation checks added' };
  }

  async updateContextMatching(pattern) {
    // Placeholder - would update context matching
    return { success: true, details: 'Context matching updated' };
  }

  async expandContextFields(pattern) {
    // Placeholder - would expand context fields
    return { success: true, details: 'Context fields expanded' };
  }

  async simplifyConditions(pattern) {
    // Placeholder - would simplify conditions
    return { success: true, details: 'Conditions simplified' };
  }

  async addContextExamples(pattern) {
    // Placeholder - would add context examples
    return { success: true, details: 'Context examples added' };
  }

  async reviewQualityGates(pattern) {
    // Placeholder - would review quality gates
    return { success: true, details: 'Quality gates reviewed' };
  }

  async addMonitoring(pattern) {
    // Placeholder - would add monitoring
    return { success: true, details: 'Monitoring added' };
  }

  /**
   * Store adaptation analysis
   */
  storeAdaptationAnalysis(analysis) {
    this.adaptationHistory.push(analysis);

    // Maintain history size
    if (this.adaptationHistory.length > this.maxHistorySize) {
      this.adaptationHistory.shift();
    }
  }

  /**
   * Store adaptation event
   */
  storeAdaptationEvent(adaptation) {
    this.adaptationHistory.push(adaptation);

    // Maintain history size
    if (this.adaptationHistory.length > this.maxHistorySize) {
      this.adaptationHistory.shift();
    }
  }

  /**
   * Get adaptation history for a pattern
   */
  getAdaptationHistory(patternId, options = {}) {
    let history = this.adaptationHistory.filter(event =>
      event.pattern_id === patternId
    );

    // Apply filters
    if (options.adaptation_type) {
      history = history.filter(event =>
        event.adaptation_type === options.adaptation_type
      );
    }

    if (options.status) {
      history = history.filter(event =>
        event.status === options.status
      );
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(event =>
        new Date(event.timestamp) > sinceDate
      );
    }

    // Apply sorting
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    if (options.limit) {
      history = history.slice(0, options.limit);
    }

    return history;
  }

  /**
   * Get adaptation analytics
   */
  getAdaptationAnalytics(patternId, options = {}) {
    const history = this.getAdaptationHistory(patternId, options);

    if (history.length === 0) {
      return {
        pattern_id: patternId,
        status: 'no_adaptation_history',
        message: 'No adaptation history available'
      };
    }

    const analytics = {
      pattern_id: patternId,
      total_adaptations: history.length,
      successful_adaptations: history.filter(h => h.status === 'completed').length,
      failed_adaptations: history.filter(h => h.status === 'failed').length,
      adaptation_types: this.analyzeAdaptationTypes(history),
      success_rate: this.calculateAdaptationSuccessRate(history),
      average_impact: this.calculateAverageAdaptationImpact(history),
      trends: this.analyzeAdaptationTrends(history)
    };

    return analytics;
  }

  /**
   * Analyze adaptation types distribution
   */
  analyzeAdaptationTypes(history) {
    const types = {};

    history.forEach(event => {
      const type = event.adaptation_type;
      types[type] = (types[type] || 0) + 1;
    });

    return types;
  }

  /**
   * Calculate adaptation success rate
   */
  calculateAdaptationSuccessRate(history) {
    const completed = history.filter(h => h.status === 'completed').length;
    return history.length > 0 ? completed / history.length : 0;
  }

  /**
   * Calculate average adaptation impact
   */
  calculateAverageAdaptationImpact(history) {
    const adaptationsWithImpact = history.filter(h => h.expected_impact !== undefined);
    if (adaptationsWithImpact.length === 0) {
      return 0;
    }

    const totalImpact = adaptationsWithImpact.reduce((sum, h) => sum + h.expected_impact, 0);
    return totalImpact / adaptationsWithImpact.length;
  }

  /**
   * Analyze adaptation trends
   */
  analyzeAdaptationTrends(history) {
    if (history.length < 3) {
      return 'insufficient_data';
    }

    // Simple trend analysis based on success rate over time
    const recent = history.slice(0, Math.floor(history.length / 2));
    const older = history.slice(Math.floor(history.length / 2));

    const recentSuccessRate = this.calculateAdaptationSuccessRate(recent);
    const olderSuccessRate = this.calculateAdaptationSuccessRate(older);

    if (recentSuccessRate > olderSuccessRate + 0.1) {
      return 'improving';
    } else if (recentSuccessRate < olderSuccessRate - 0.1) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Export adaptation data
   */
  exportAdaptationData(patternId, format = 'json') {
    const history = this.getAdaptationHistory(patternId);
    const analytics = this.getAdaptationAnalytics(patternId);

    const exportData = {
      pattern_id: patternId,
      export_timestamp: new Date().toISOString(),
      adaptation_history: history,
      analytics: analytics
    };

    if (format === 'csv') {
      return this.convertAdaptationToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert adaptation data to CSV
   */
  convertAdaptationToCSV(data) {
    const headers = ['timestamp', 'adaptation_type', 'reason', 'status', 'expected_impact'];
    const rows = data.adaptation_history.map(event => [
      event.timestamp,
      event.adaptation_type,
      event.reason,
      event.status,
      event.expected_impact || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = AdaptationManager;