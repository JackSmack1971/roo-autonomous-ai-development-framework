/**
 * Adaptation Trigger
 *
 * Automatically triggers pattern adaptations based on logged performance data
 * and analysis results from the outcome analyzer
 */

const EventEmitter = require('events');

class AdaptationTrigger extends EventEmitter {
  constructor(options = {}) {
    super();

    this.triggerRules = new Map();
    this.activeTriggers = new Map();
    this.triggerHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;

    // Default trigger thresholds
    this.thresholds = {
      success_rate_drop: options.successRateDropThreshold || 0.1,
      confidence_drop: options.confidenceDropThreshold || 0.15,
      failure_rate_threshold: options.failureRateThreshold || 0.3,
      quality_impact_threshold: options.qualityImpactThreshold || -0.2,
      trend_sensitivity: options.trendSensitivity || 0.1,
      min_applications: options.minApplications || 5
    };

    this.loadDefaultTriggerRules();
  }

  /**
   * Load default trigger rules
   */
  loadDefaultTriggerRules() {
    // Success rate decline trigger
    this.triggerRules.set('success_rate_decline', {
      condition: (analysis) => analysis.success_rate < 0.7 && analysis.total_applications >= this.thresholds.min_applications,
      action: 'trigger_pattern_refinement',
      priority: 'high',
      cooldown_hours: 24,
      description: 'Pattern success rate below 70% threshold'
    });

    // Confidence drop trigger
    this.triggerRules.set('confidence_drop', {
      condition: (analysis) => {
        const recentConfidence = analysis.average_confidence;
        const expectedConfidence = 0.75; // Expected baseline confidence
        return (expectedConfidence - recentConfidence) > this.thresholds.confidence_drop;
      },
      action: 'trigger_confidence_analysis',
      priority: 'medium',
      cooldown_hours: 12,
      description: 'Pattern confidence significantly below expected baseline'
    });

    // Failure pattern trigger
    this.triggerRules.set('failure_pattern', {
      condition: (analysis) => analysis.failure_analysis.failure_rate > this.thresholds.failure_rate_threshold,
      action: 'trigger_failure_analysis',
      priority: 'high',
      cooldown_hours: 6,
      description: 'Pattern failure rate above acceptable threshold'
    });

    // Quality impact trigger
    this.triggerRules.set('quality_impact', {
      condition: (analysis) => analysis.average_quality_impact < this.thresholds.quality_impact_threshold,
      action: 'trigger_quality_review',
      priority: 'medium',
      cooldown_hours: 18,
      description: 'Pattern has negative quality impact'
    });

    // Trend decline trigger
    this.triggerRules.set('trend_decline', {
      condition: (analysis) => analysis.trend_analysis.trend === 'declining' && analysis.trend_analysis.confidence > 0.7,
      action: 'trigger_trend_analysis',
      priority: 'medium',
      cooldown_hours: 36,
      description: 'Pattern performance trending downward'
    });

    // Context effectiveness trigger
    this.triggerRules.set('context_ineffectiveness', {
      condition: (analysis) => {
        const effectiveContexts = analysis.context_analysis.effective_contexts;
        const totalContexts = analysis.context_analysis.total_contexts;
        return totalContexts > 3 && (effectiveContexts / totalContexts) < 0.5;
      },
      action: 'trigger_context_refinement',
      priority: 'low',
      cooldown_hours: 48,
      description: 'Pattern ineffective in most contexts'
    });
  }

  /**
   * Evaluate pattern analysis and trigger adaptations
   */
  async evaluateAndTrigger(patternId, analysis, context = {}) {
    const triggers = [];

    // Evaluate each trigger rule
    for (const [ruleId, rule] of this.triggerRules.entries()) {
      if (this.evaluateTriggerRule(rule, analysis)) {
        const trigger = await this.createTrigger(patternId, ruleId, rule, analysis, context);
        if (trigger) {
          triggers.push(trigger);
        }
      }
    }

    // Process triggers
    const processedTriggers = [];
    for (const trigger of triggers) {
      const processed = await this.processTrigger(trigger);
      if (processed) {
        processedTriggers.push(processed);
      }
    }

    // Emit evaluation complete event
    this.emit('evaluation_completed', {
      pattern_id: patternId,
      triggers_evaluated: triggers.length,
      triggers_processed: processedTriggers.length,
      analysis_summary: this.summarizeAnalysis(analysis)
    });

    return {
      pattern_id: patternId,
      triggers_created: triggers.length,
      triggers_processed: processedTriggers.length,
      processed_triggers: processedTriggers
    };
  }

  /**
   * Evaluate if a trigger rule condition is met
   */
  evaluateTriggerRule(rule, analysis) {
    try {
      return rule.condition(analysis);
    } catch (error) {
      console.warn(`Error evaluating trigger rule ${rule}:`, error);
      return false;
    }
  }

  /**
   * Create a trigger instance
   */
  async createTrigger(patternId, ruleId, rule, analysis, context) {
    const triggerId = `trigger_${patternId}_${ruleId}_${Date.now()}`;

    // Check cooldown period
    if (this.isOnCooldown(patternId, ruleId, rule.cooldown_hours)) {
      return null; // Skip trigger due to cooldown
    }

    const trigger = {
      trigger_id: triggerId,
      pattern_id: patternId,
      rule_id: ruleId,
      rule_description: rule.description,
      priority: rule.priority,
      action: rule.action,
      analysis_snapshot: {
        success_rate: analysis.success_rate,
        average_confidence: analysis.average_confidence,
        failure_rate: analysis.failure_analysis.failure_rate,
        trend: analysis.trend_analysis.trend,
        quality_impact: analysis.average_quality_impact
      },
      context: context,
      created_at: new Date().toISOString(),
      status: 'pending',
      cooldown_until: this.calculateCooldownUntil(rule.cooldown_hours)
    };

    // Store active trigger
    this.activeTriggers.set(triggerId, trigger);

    // Emit trigger created event
    this.emit('trigger_created', trigger);

    return trigger;
  }

  /**
   * Process a trigger and execute its action
   */
  async processTrigger(trigger) {
    try {
      trigger.status = 'processing';
      trigger.processing_started_at = new Date().toISOString();

      // Execute trigger action
      const result = await this.executeTriggerAction(trigger);

      trigger.status = 'completed';
      trigger.processing_completed_at = new Date().toISOString();
      trigger.result = result;

      // Move to history
      this.triggerHistory.push(trigger);
      this.activeTriggers.delete(trigger.trigger_id);

      // Maintain history size
      if (this.triggerHistory.length > this.maxHistorySize) {
        this.triggerHistory.shift();
      }

      // Emit trigger completed event
      this.emit('trigger_completed', trigger);

      return trigger;

    } catch (error) {
      trigger.status = 'failed';
      trigger.processing_completed_at = new Date().toISOString();
      trigger.error = error.message;

      // Move to history
      this.triggerHistory.push(trigger);
      this.activeTriggers.delete(trigger.trigger_id);

      // Emit trigger failed event
      this.emit('trigger_failed', trigger);

      return trigger;
    }
  }

  /**
   * Execute trigger action
   */
  async executeTriggerAction(trigger) {
    const action = trigger.action;
    const analysis = trigger.analysis_snapshot;
    const context = trigger.context;

    switch (action) {
      case 'trigger_pattern_refinement':
        return await this.executePatternRefinement(trigger, analysis, context);

      case 'trigger_confidence_analysis':
        return await this.executeConfidenceAnalysis(trigger, analysis, context);

      case 'trigger_failure_analysis':
        return await this.executeFailureAnalysis(trigger, analysis, context);

      case 'trigger_quality_review':
        return await this.executeQualityReview(trigger, analysis, context);

      case 'trigger_trend_analysis':
        return await this.executeTrendAnalysis(trigger, analysis, context);

      case 'trigger_context_refinement':
        return await this.executeContextRefinement(trigger, analysis, context);

      default:
        throw new Error(`Unknown trigger action: ${action}`);
    }
  }

  /**
   * Execute pattern refinement action
   */
  async executePatternRefinement(trigger, analysis, context) {
    const recommendations = [];

    // Analyze common failure reasons
    if (analysis.failure_analysis.common_failure_reasons.length > 0) {
      const topFailure = analysis.failure_analysis.common_failure_reasons[0];
      recommendations.push({
        type: 'condition_refinement',
        description: `Address common failure: ${topFailure.reason}`,
        action: 'refine_pattern_conditions',
        expected_impact: 'high'
      });
    }

    // Check context effectiveness
    if (analysis.context_analysis.effective_contexts < analysis.context_analysis.total_contexts * 0.7) {
      recommendations.push({
        type: 'context_optimization',
        description: 'Improve context matching criteria',
        action: 'update_context_filters',
        expected_impact: 'medium'
      });
    }

    // Generate refinement plan
    return {
      action_type: 'pattern_refinement',
      recommendations: recommendations,
      estimated_effort: recommendations.length > 1 ? 'medium' : 'low',
      priority: trigger.priority,
      rationale: `Pattern success rate of ${(analysis.success_rate * 100).toFixed(1)}% needs improvement`
    };
  }

  /**
   * Execute confidence analysis action
   */
  async executeConfidenceAnalysis(trigger, analysis, context) {
    // Analyze confidence factors
    const confidenceFactors = {
      success_rate_contribution: analysis.success_rate * 0.4,
      context_match_contribution: 0.8 * 0.3, // Assuming good context match
      recency_contribution: 0.9 * 0.2, // Assuming recent applications
      diversity_contribution: 0.7 * 0.1  // Assuming moderate diversity
    };

    const totalConfidence = Object.values(confidenceFactors).reduce((sum, factor) => sum + factor, 0);

    // Identify confidence improvement opportunities
    const opportunities = [];

    if (confidenceFactors.success_rate_contribution < 0.3) {
      opportunities.push({
        factor: 'success_rate',
        current_contribution: confidenceFactors.success_rate_contribution,
        improvement_action: 'Improve pattern success rate through condition refinement'
      });
    }

    if (confidenceFactors.context_match_contribution < 0.2) {
      opportunities.push({
        factor: 'context_match',
        current_contribution: confidenceFactors.context_match_contribution,
        improvement_action: 'Enhance context matching criteria'
      });
    }

    return {
      action_type: 'confidence_analysis',
      current_confidence: analysis.average_confidence,
      calculated_confidence: totalConfidence,
      confidence_factors: confidenceFactors,
      improvement_opportunities: opportunities,
      rationale: `Confidence analysis for pattern with ${(analysis.average_confidence * 100).toFixed(1)}% average confidence`
    };
  }

  /**
   * Execute failure analysis action
   */
  async executeFailureAnalysis(trigger, analysis, context) {
    const failureAnalysis = analysis.failure_analysis;

    // Analyze failure patterns
    const failurePatterns = {
      most_common_failure: failureAnalysis.common_failure_reasons[0],
      failure_categories: failureAnalysis.failure_categories,
      failure_trends: this.analyzeFailureTrends(failureAnalysis),
      context_correlations: this.analyzeFailureContextCorrelations(context)
    };

    // Generate mitigation strategies
    const mitigationStrategies = this.generateFailureMitigations(failurePatterns);

    return {
      action_type: 'failure_analysis',
      failure_rate: failureAnalysis.failure_rate,
      failure_patterns: failurePatterns,
      mitigation_strategies: mitigationStrategies,
      priority_actions: mitigationStrategies.filter(s => s.priority === 'high'),
      rationale: `Failure analysis for pattern with ${(failureAnalysis.failure_rate * 100).toFixed(1)}% failure rate`
    };
  }

  /**
   * Execute quality review action
   */
  async executeQualityReview(trigger, analysis, context) {
    const qualityIssues = [];

    if (analysis.average_quality_impact < -0.1) {
      qualityIssues.push({
        type: 'negative_impact',
        severity: 'high',
        description: `Pattern has negative quality impact (${(analysis.average_quality_impact * 100).toFixed(1)} points)`,
        remediation: 'Review and strengthen quality gates'
      });
    }

    // Check for quality gate failures
    if (context.quality_gate_failures && context.quality_gate_failures.length > 0) {
      qualityIssues.push({
        type: 'gate_failures',
        severity: 'medium',
        description: `${context.quality_gate_failures.length} quality gate failures detected`,
        remediation: 'Address failed quality gates'
      });
    }

    return {
      action_type: 'quality_review',
      quality_impact_score: analysis.average_quality_impact,
      quality_issues: qualityIssues,
      review_recommendations: this.generateQualityRecommendations(qualityIssues),
      rationale: `Quality review for pattern with negative impact`
    };
  }

  /**
   * Execute trend analysis action
   */
  async executeTrendAnalysis(trigger, analysis, context) {
    const trendAnalysis = analysis.trend_analysis;

    // Analyze trend causes
    const trendCauses = this.identifyTrendCauses(trendAnalysis, context);

    // Generate trend reversal strategies
    const reversalStrategies = this.generateTrendReversalStrategies(trendCauses, trendAnalysis);

    return {
      action_type: 'trend_analysis',
      trend_direction: trendAnalysis.trend,
      trend_confidence: trendAnalysis.confidence,
      change_percentage: trendAnalysis.change_percent,
      identified_causes: trendCauses,
      reversal_strategies: reversalStrategies,
      monitoring_recommendations: this.generateTrendMonitoringRecommendations(trendAnalysis),
      rationale: `Trend analysis for ${trendAnalysis.trend} pattern performance`
    };
  }

  /**
   * Execute context refinement action
   */
  async executeContextRefinement(trigger, analysis, context) {
    const contextAnalysis = analysis.context_analysis;

    // Identify ineffective contexts
    const ineffectiveContexts = contextAnalysis.context_analysis.filter(
      c => c.effectiveness_score < 0.6
    );

    // Generate context refinement recommendations
    const refinements = ineffectiveContexts.map(ctx => ({
      context_key: ctx.context_key,
      current_effectiveness: ctx.effectiveness_score,
      recommended_action: ctx.applications > 5 ? 'restrict_usage' : 'improve_matching',
      rationale: `Context effectiveness ${(ctx.effectiveness_score * 100).toFixed(1)}% below threshold`
    }));

    return {
      action_type: 'context_refinement',
      total_contexts: contextAnalysis.total_contexts,
      effective_contexts: contextAnalysis.effective_contexts,
      ineffectiveness_rate: 1 - (contextAnalysis.effective_contexts / contextAnalysis.total_contexts),
      refinement_recommendations: refinements,
      rationale: `Context refinement for pattern with ${(ineffectiveness_rate * 100).toFixed(1)}% ineffective contexts`
    };
  }

  /**
   * Check if trigger is on cooldown
   */
  isOnCooldown(patternId, ruleId, cooldownHours) {
    const cooldownKey = `${patternId}_${ruleId}`;
    const lastTrigger = this.findLastTriggerForRule(patternId, ruleId);

    if (!lastTrigger) {
      return false;
    }

    const cooldownUntil = new Date(lastTrigger.cooldown_until);
    const now = new Date();

    return now < cooldownUntil;
  }

  /**
   * Calculate cooldown until timestamp
   */
  calculateCooldownUntil(cooldownHours) {
    const cooldownUntil = new Date();
    cooldownUntil.setHours(cooldownUntil.getHours() + cooldownHours);
    return cooldownUntil.toISOString();
  }

  /**
   * Find last trigger for a specific rule
   */
  findLastTriggerForRule(patternId, ruleId) {
    // Search in active triggers
    for (const [triggerId, trigger] of this.activeTriggers.entries()) {
      if (trigger.pattern_id === patternId && trigger.rule_id === ruleId) {
        return trigger;
      }
    }

    // Search in history
    const historicalTriggers = this.triggerHistory
      .filter(trigger => trigger.pattern_id === patternId && trigger.rule_id === ruleId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return historicalTriggers[0] || null;
  }

  /**
   * Helper methods for analysis
   */
  analyzeFailureTrends(failureAnalysis) {
    // Simplified trend analysis
    return {
      trend: 'stable',
      confidence: 0.5,
      description: 'Failure patterns show no significant trends'
    };
  }

  analyzeFailureContextCorrelations(context) {
    // Simplified context correlation analysis
    return {
      correlations: [],
      strength: 'weak',
      description: 'No significant context correlations identified'
    };
  }

  generateFailureMitigations(failurePatterns) {
    const mitigations = [];

    if (failurePatterns.most_common_failure) {
      mitigations.push({
        type: 'root_cause',
        priority: 'high',
        description: `Address root cause: ${failurePatterns.most_common_failure.reason}`,
        action: 'implement_specific_fix'
      });
    }

    mitigations.push({
      type: 'monitoring',
      priority: 'medium',
      description: 'Implement additional monitoring for failure patterns',
      action: 'add_failure_monitoring'
    });

    return mitigations;
  }

  generateQualityRecommendations(qualityIssues) {
    return qualityIssues.map(issue => ({
      issue_type: issue.type,
      recommendation: issue.remediation,
      priority: issue.severity === 'high' ? 'high' : 'medium'
    }));
  }

  identifyTrendCauses(trendAnalysis, context) {
    const causes = [];

    if (trendAnalysis.change_percent > 0.2) {
      causes.push({
        cause: 'significant_change',
        likelihood: 0.8,
        description: 'Large performance change indicates significant environmental or pattern changes'
      });
    }

    if (context.is_production) {
      causes.push({
        cause: 'production_environment',
        likelihood: 0.6,
        description: 'Production environment may have different characteristics'
      });
    }

    return causes;
  }

  generateTrendReversalStrategies(causes, trendAnalysis) {
    const strategies = [];

    strategies.push({
      strategy: 'monitoring_increase',
      description: 'Increase monitoring frequency to identify trend causes',
      effort: 'low'
    });

    if (trendAnalysis.change_percent > 0.15) {
      strategies.push({
        strategy: 'pattern_review',
        description: 'Conduct comprehensive pattern review',
        effort: 'medium'
      });
    }

    return strategies;
  }

  generateTrendMonitoringRecommendations(trendAnalysis) {
    return [
      {
        metric: 'success_rate',
        frequency: 'hourly',
        threshold: 0.75,
        action: 'alert_on_drop'
      },
      {
        metric: 'confidence_score',
        frequency: 'daily',
        threshold: 0.7,
        action: 'weekly_report'
      }
    ];
  }

  /**
   * Summarize analysis for events
   */
  summarizeAnalysis(analysis) {
    return {
      success_rate: analysis.success_rate,
      average_confidence: analysis.average_confidence,
      failure_rate: analysis.failure_analysis.failure_rate,
      trend: analysis.trend_analysis.trend,
      quality_impact: analysis.average_quality_impact,
      insights_count: analysis.insights.length,
      recommendations_count: analysis.recommendations.length
    };
  }

  /**
   * Get trigger statistics
   */
  getTriggerStatistics() {
    const stats = {
      total_triggers: this.triggerHistory.length,
      active_triggers: this.activeTriggers.size,
      triggers_by_rule: {},
      triggers_by_status: {},
      triggers_by_priority: {},
      recent_activity: this.getRecentTriggerActivity()
    };

    // Analyze trigger history
    this.triggerHistory.forEach(trigger => {
      // By rule
      stats.triggers_by_rule[trigger.rule_id] = (stats.triggers_by_rule[trigger.rule_id] || 0) + 1;

      // By status
      stats.triggers_by_status[trigger.status] = (stats.triggers_by_status[trigger.status] || 0) + 1;

      // By priority
      stats.triggers_by_priority[trigger.priority] = (stats.triggers_by_priority[trigger.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get recent trigger activity
   */
  getRecentTriggerActivity(hours = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const recentTriggers = this.triggerHistory.filter(
      trigger => new Date(trigger.created_at) > cutoffDate
    );

    return {
      hours: hours,
      total_triggers: recentTriggers.length,
      completed_triggers: recentTriggers.filter(t => t.status === 'completed').length,
      failed_triggers: recentTriggers.filter(t => t.status === 'failed').length,
      success_rate: recentTriggers.length > 0 ?
        (recentTriggers.filter(t => t.status === 'completed').length / recentTriggers.length) : 0
    };
  }

  /**
   * Export trigger data
   */
  exportTriggerData(format = 'json') {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      active_triggers: Array.from(this.activeTriggers.values()),
      trigger_history: this.triggerHistory,
      trigger_rules: Object.fromEntries(this.triggerRules),
      statistics: this.getTriggerStatistics()
    };

    if (format === 'csv') {
      return this.convertTriggersToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert triggers to CSV format
   */
  convertTriggersToCSV(data) {
    let csv = 'TRIGGER_ID,PATTERN_ID,RULE_ID,PRIORITY,STATUS,CREATED_AT\n';

    // Add active triggers
    data.active_triggers.forEach(trigger => {
      csv += `${trigger.trigger_id},${trigger.pattern_id},${trigger.rule_id},${trigger.priority},${trigger.status},${trigger.created_at}\n`;
    });

    // Add historical triggers
    data.trigger_history.forEach(trigger => {
      csv += `${trigger.trigger_id},${trigger.pattern_id},${trigger.rule_id},${trigger.priority},${trigger.status},${trigger.created_at}\n`;
    });

    return csv;
  }
}

module.exports = AdaptationTrigger;