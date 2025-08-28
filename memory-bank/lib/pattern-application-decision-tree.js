/**
 * Pattern Application Decision Tree
 *
 * Specialized decision tree for determining when to auto-apply, recommend,
 * or ignore patterns based on confidence thresholds and contextual factors
 */

const { DecisionTreeEngine, DecisionNode } = require('./decision-tree-engine');
const ConfidenceTrackingSystem = require('./confidence-tracking-system');
const EventEmitter = require('events');

class PatternApplicationDecisionTree extends EventEmitter {
  constructor(options = {}) {
    super();

    this.decisionEngine = new DecisionTreeEngine(options);
    this.confidenceSystem = new ConfidenceTrackingSystem(options);
    this.decisionHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;

    // Decision tree configuration
    this.decisionTrees = new Map();
    this.activeTreeId = null;

    // Thresholds and configuration
    this.thresholds = {
      auto_apply: options.autoApplyThreshold || 0.8,
      recommend: options.recommendThreshold || 0.6,
      experimental: options.experimentalThreshold || 0.4,
      deprecated: options.deprecatedThreshold || 0.2
    };

    this.riskThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Initialize the pattern application decision tree
   */
  async initialize() {
    await this.decisionEngine.initialize();
    await this.confidenceSystem.initialize();

    // Create default pattern application decision tree
    await this.createDefaultDecisionTree();

    this.emit('initialized', {
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds
    });
  }

  /**
   * Create the default pattern application decision tree
   */
  async createDefaultDecisionTree() {
    const treeConfig = {
      metadata: {
        type: 'pattern_application',
        description: 'Default decision tree for pattern application',
        version: '1.0.0',
        created_at: new Date().toISOString()
      },
      rootNode: 'check_pattern_eligibility',
      nodes: {
        check_pattern_eligibility: {
          type: 'decision',
          condition: (context) => this.isPatternEligible(context),
          branches: {
            true: 'evaluate_confidence_level',
            false: 'ineligible_outcome'
          },
          metadata: {
            description: 'Check if pattern is eligible for application'
          }
        },
        ineligible_outcome: {
          type: 'terminal',
          terminal: 'ineligible',
          metadata: {
            description: 'Pattern is not eligible for application'
          }
        },
        evaluate_confidence_level: {
          type: 'decision',
          condition: (context) => context.confidence_score >= this.thresholds.auto_apply,
          branches: {
            true: 'check_high_confidence_criteria',
            false: 'evaluate_medium_confidence'
          },
          metadata: {
            description: 'Evaluate confidence level against auto-apply threshold'
          }
        },
        check_high_confidence_criteria: {
          type: 'decision',
          condition: (context) => this.evaluateHighConfidenceCriteria(context),
          branches: {
            true: 'auto_apply_outcome',
            false: 'high_confidence_override'
          },
          metadata: {
            description: 'Check additional criteria for high confidence patterns'
          }
        },
        auto_apply_outcome: {
          type: 'terminal',
          terminal: 'auto_apply',
          metadata: {
            description: 'Pattern qualifies for automatic application'
          }
        },
        high_confidence_override: {
          type: 'decision',
          condition: (context) => this.shouldOverrideHighConfidence(context),
          branches: {
            true: 'recommend_outcome',
            false: 'auto_apply_outcome'
          },
          metadata: {
            description: 'Determine if high confidence should be overridden'
          }
        },
        evaluate_medium_confidence: {
          type: 'decision',
          condition: (context) => context.confidence_score >= this.thresholds.recommend,
          branches: {
            true: 'check_recommendation_criteria',
            false: 'evaluate_experimental_confidence'
          },
          metadata: {
            description: 'Evaluate confidence level against recommendation threshold'
          }
        },
        check_recommendation_criteria: {
          type: 'decision',
          condition: (context) => this.evaluateRecommendationCriteria(context),
          branches: {
            true: 'recommend_outcome',
            false: 'review_required_outcome'
          },
          metadata: {
            description: 'Check criteria for pattern recommendation'
          }
        },
        recommend_outcome: {
          type: 'terminal',
          terminal: 'recommend',
          metadata: {
            description: 'Pattern recommended for application'
          }
        },
        review_required_outcome: {
          type: 'terminal',
          terminal: 'review_required',
          metadata: {
            description: 'Pattern requires human review before application'
          }
        },
        evaluate_experimental_confidence: {
          type: 'decision',
          condition: (context) => context.confidence_score >= this.thresholds.experimental,
          branches: {
            true: 'check_experimental_criteria',
            false: 'evaluate_deprecated_status'
          },
          metadata: {
            description: 'Evaluate confidence level against experimental threshold'
          }
        },
        check_experimental_criteria: {
          type: 'decision',
          condition: (context) => this.evaluateExperimentalCriteria(context),
          branches: {
            true: 'experimental_outcome',
            false: 'reject_outcome'
          },
          metadata: {
            description: 'Check criteria for experimental pattern application'
          }
        },
        experimental_outcome: {
          type: 'terminal',
          terminal: 'experimental',
          metadata: {
            description: 'Pattern suitable for experimental application'
          }
        },
        evaluate_deprecated_status: {
          type: 'decision',
          condition: (context) => context.confidence_score < this.thresholds.deprecated,
          branches: {
            true: 'deprecated_outcome',
            false: 'reject_outcome'
          },
          metadata: {
            description: 'Check if pattern should be deprecated'
          }
        },
        deprecated_outcome: {
          type: 'terminal',
          terminal: 'deprecated',
          metadata: {
            description: 'Pattern confidence too low, should be deprecated'
          }
        },
        reject_outcome: {
          type: 'terminal',
          terminal: 'reject',
          metadata: {
            description: 'Pattern does not meet minimum criteria for application'
          }
        }
      }
    };

    const tree = this.decisionEngine.createDecisionTree('pattern_application_default', treeConfig);
    this.decisionTrees.set('pattern_application_default', tree);
    this.activeTreeId = 'pattern_application_default';

    return tree;
  }

  /**
   * Make decision about pattern application
   */
  async makeDecision(pattern, context = {}, options = {}) {
    await this.initialize();

    const decisionContext = {
      pattern_id: pattern.id,
      timestamp: new Date().toISOString(),
      pattern: pattern,
      context: context,
      options: options
    };

    try {
      // Enrich context with additional factors
      const enrichedContext = await this.enrichDecisionContext(pattern, context);

      // Get active decision tree
      const treeId = options.treeId || this.activeTreeId;
      const tree = this.decisionTrees.get(treeId);

      if (!tree) {
        throw new Error(`Decision tree ${treeId} not found`);
      }

      // Evaluate pattern using decision tree
      const decisionResult = await this.decisionEngine.evaluatePattern(pattern, enrichedContext, treeId);

      // Create comprehensive decision response
      const decision = {
        pattern_id: pattern.id,
        decision: decisionResult.outcome,
        confidence: decisionResult.confidence,
        reasoning: decisionResult.reasoning,
        decision_path: decisionResult.path,
        context_factors: enrichedContext,
        risk_assessment: await this.assessDecisionRisk(pattern, enrichedContext),
        recommendations: this.generateDecisionRecommendations(decisionResult.outcome, pattern, enrichedContext),
        metadata: {
          tree_id: treeId,
          evaluation_time: decisionResult.evaluation_time,
          decision_version: '1.0.0'
        }
      };

      // Store decision in history
      this.storeDecision(decisionContext, decision);

      this.emit('decision_made', decision);

      return decision;

    } catch (error) {
      const errorDecision = {
        pattern_id: pattern.id,
        decision: 'error',
        confidence: 0.0,
        reasoning: `Decision error: ${error.message}`,
        error: error.message,
        context_factors: context
      };

      this.storeDecision(decisionContext, errorDecision);
      this.emit('decision_error', errorDecision);

      throw error;
    }
  }

  /**
   * Enrich decision context with additional factors
   */
  async enrichDecisionContext(pattern, context) {
    const enrichedContext = {
      ...context,
      confidence_score: pattern.confidence_score,
      success_rate: pattern.success_rate,
      context_match_score: context.context_match_score || 0.5,
      risk_level: context.risk_level || 'medium',
      pattern_type: pattern.metadata?.pattern_type || 'general',
      applications: pattern.metadata?.usage_statistics?.total_applications || 0,
      last_applied: pattern.metadata?.last_applied,
      quality_gates_passed: context.quality_gates_passed !== false,
      human_override: context.human_override || false,
      emergency_mode: context.emergency_mode || false
    };

    // Add time-based factors
    enrichedContext.hours_since_last_application = this.calculateHoursSinceLastApplication(pattern);
    enrichedContext.is_recently_applied = enrichedContext.hours_since_last_application < 24;

    // Add pattern maturity factors
    enrichedContext.pattern_maturity = this.assessPatternMaturity(pattern);
    enrichedContext.is_mature_pattern = enrichedContext.pattern_maturity === 'mature';

    // Add contextual risk factors
    enrichedContext.context_risk_level = this.assessContextRisk(context);
    enrichedContext.is_high_risk_context = enrichedContext.context_risk_level === 'high';

    return enrichedContext;
  }

  /**
   * Check if pattern is eligible for application
   */
  isPatternEligible(context) {
    // Pattern must not be deprecated
    if (context.confidence_score < this.thresholds.deprecated) {
      return false;
    }

    // Pattern must have minimum applications for consideration
    if (context.applications < 1) {
      return false;
    }

    // Pattern must pass quality gates (unless in emergency mode)
    if (!context.quality_gates_passed && !context.emergency_mode) {
      return false;
    }

    // Pattern must not be recently applied (unless override)
    if (context.is_recently_applied && !context.human_override) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate high confidence criteria
   */
  evaluateHighConfidenceCriteria(context) {
    // High confidence patterns need strong context match
    if (context.context_match_score < 0.8) {
      return false;
    }

    // High confidence patterns should not be in high-risk contexts (unless emergency)
    if (context.is_high_risk_context && !context.emergency_mode) {
      return false;
    }

    // High confidence patterns should be mature
    if (!context.is_mature_pattern) {
      return false;
    }

    return true;
  }

  /**
   * Determine if high confidence should be overridden
   */
  shouldOverrideHighConfidence(context) {
    // Override if context risk is too high
    if (context.context_risk_level === 'high' && !context.emergency_mode) {
      return true;
    }

    // Override if pattern is security-related and context is sensitive
    if (context.pattern_type === 'security' && context.context_risk_level !== 'low') {
      return true;
    }

    // Override if human override is requested
    if (context.human_override) {
      return true;
    }

    return false;
  }

  /**
   * Evaluate recommendation criteria
   */
  evaluateRecommendationCriteria(context) {
    // Medium confidence patterns need reasonable context match
    if (context.context_match_score < 0.6) {
      return false;
    }

    // Check if pattern has been successful in similar contexts
    if (context.applications > 0 && context.success_rate < 0.7) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate experimental criteria
   */
  evaluateExperimentalCriteria(context) {
    // Experimental patterns need monitoring capability
    if (!context.monitoring_available) {
      return false;
    }

    // Experimental patterns should not be in critical contexts
    if (context.context_risk_level === 'high' && !context.emergency_mode) {
      return false;
    }

    // Experimental patterns need reasonable context match
    if (context.context_match_score < 0.4) {
      return false;
    }

    return true;
  }

  /**
   * Assess decision risk
   */
  async assessDecisionRisk(pattern, context) {
    let riskScore = 0;
    const riskFactors = [];

    // Confidence-based risk
    if (context.confidence_score < 0.6) {
      riskScore += 0.3;
      riskFactors.push('low_confidence');
    }

    // Context risk
    if (context.context_risk_level === 'high') {
      riskScore += 0.3;
      riskFactors.push('high_risk_context');
    } else if (context.context_risk_level === 'medium') {
      riskScore += 0.2;
      riskFactors.push('medium_risk_context');
    }

    // Pattern type risk
    if (pattern.metadata?.pattern_type === 'security') {
      riskScore += 0.2;
      riskFactors.push('security_pattern');
    } else if (pattern.metadata?.pattern_type === 'architecture') {
      riskScore += 0.1;
      riskFactors.push('architecture_pattern');
    }

    // Maturity risk
    if (!context.is_mature_pattern) {
      riskScore += 0.1;
      riskFactors.push('immature_pattern');
    }

    // Recent application risk
    if (context.is_recently_applied) {
      riskScore += 0.1;
      riskFactors.push('recently_applied');
    }

    // Bound risk score
    riskScore = Math.max(0, Math.min(1, riskScore));

    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= this.riskThresholds.high) {
      riskLevel = 'high';
    } else if (riskScore >= this.riskThresholds.medium) {
      riskLevel = 'medium';
    }

    return {
      score: riskScore,
      level: riskLevel,
      factors: riskFactors,
      mitigation_strategies: this.generateRiskMitigations(riskFactors, context)
    };
  }

  /**
   * Generate risk mitigation strategies
   */
  generateRiskMitigations(riskFactors, context) {
    const mitigations = [];

    riskFactors.forEach(factor => {
      switch (factor) {
        case 'low_confidence':
          mitigations.push('Implement additional monitoring and validation');
          mitigations.push('Prepare rollback procedures');
          break;

        case 'high_risk_context':
          mitigations.push('Require human approval for application');
          mitigations.push('Implement additional safety checks');
          break;

        case 'security_pattern':
          mitigations.push('Conduct security review before application');
          mitigations.push('Implement additional security monitoring');
          break;

        case 'immature_pattern':
          mitigations.push('Apply pattern with enhanced monitoring');
          mitigations.push('Limit scope of application');
          break;

        case 'recently_applied':
          mitigations.push('Ensure sufficient time has passed since last application');
          mitigations.push('Verify previous application outcomes');
          break;
      }
    });

    return mitigations;
  }

  /**
   * Generate decision recommendations
   */
  generateDecisionRecommendations(decision, pattern, context) {
    const recommendations = [];

    switch (decision) {
      case 'auto_apply':
        recommendations.push({
          type: 'monitoring',
          priority: 'medium',
          message: 'Set up automated monitoring for pattern application outcomes'
        });
        break;

      case 'recommend':
        recommendations.push({
          type: 'review',
          priority: 'medium',
          message: 'Schedule review meeting to discuss pattern application'
        });
        break;

      case 'experimental':
        recommendations.push({
          type: 'monitoring',
          priority: 'high',
          message: 'Implement comprehensive monitoring for experimental application'
        });
        recommendations.push({
          type: 'rollback',
          priority: 'high',
          message: 'Prepare detailed rollback procedures'
        });
        break;

      case 'review_required':
        recommendations.push({
          type: 'analysis',
          priority: 'high',
          message: 'Conduct thorough analysis before considering application'
        });
        break;

      case 'deprecated':
        recommendations.push({
          type: 'cleanup',
          priority: 'low',
          message: 'Consider removing or archiving the pattern'
        });
        break;
    }

    return recommendations;
  }

  /**
   * Calculate hours since last application
   */
  calculateHoursSinceLastApplication(pattern) {
    const lastApplied = pattern.metadata?.last_applied;
    if (!lastApplied) {
      return Infinity;
    }

    const lastAppliedDate = new Date(lastApplied);
    const now = new Date();
    const diffMs = now - lastAppliedDate;
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Assess pattern maturity
   */
  assessPatternMaturity(pattern) {
    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;
    const successRate = pattern.success_rate || 0;
    const ageDays = this.calculateAgeDays(pattern.metadata?.created_at);

    if (applications >= 10 && successRate >= 0.8 && ageDays >= 30) {
      return 'mature';
    } else if (applications >= 5 && successRate >= 0.7 && ageDays >= 14) {
      return 'established';
    } else if (applications >= 3 && ageDays >= 7) {
      return 'developing';
    } else {
      return 'new';
    }
  }

  /**
   * Assess context risk level
   */
  assessContextRisk(context) {
    let riskScore = 0;

    // Risk based on context factors
    if (context.emergency_mode) riskScore += 0.3;
    if (context.is_production) riskScore += 0.2;
    if (context.has_sensitive_data) riskScore += 0.3;
    if (context.is_customer_facing) riskScore += 0.2;
    if (context.timeline_pressure === 'high') riskScore += 0.2;

    if (riskScore >= 0.6) return 'high';
    if (riskScore >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * Calculate age in days
   */
  calculateAgeDays(dateString) {
    if (!dateString) return 0;

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Store decision in history
   */
  storeDecision(decisionContext, decision) {
    const historyEntry = {
      ...decisionContext,
      decision: decision,
      processed_at: new Date().toISOString()
    };

    this.decisionHistory.push(historyEntry);

    // Maintain history size
    if (this.decisionHistory.length > this.maxHistorySize) {
      this.decisionHistory.shift();
    }
  }

  /**
   * Get decision history
   */
  getDecisionHistory(options = {}) {
    let history = [...this.decisionHistory];

    // Apply filters
    if (options.pattern_id) {
      history = history.filter(h => h.pattern_id === options.pattern_id);
    }

    if (options.decision) {
      history = history.filter(h => h.decision.decision === options.decision);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(h => new Date(h.timestamp) > sinceDate);
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
   * Get decision statistics
   */
  getDecisionStatistics(options = {}) {
    const history = this.getDecisionHistory(options);

    if (history.length === 0) {
      return {
        status: 'no_decisions',
        message: 'No decision history available'
      };
    }

    const decisions = history.map(h => h.decision.decision);
    const decisionCounts = decisions.reduce((acc, decision) => {
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {});

    const confidenceScores = history.map(h => h.decision.confidence);
    const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    return {
      total_decisions: history.length,
      decision_distribution: decisionCounts,
      average_confidence: averageConfidence,
      success_rate: this.calculateDecisionSuccessRate(history),
      risk_distribution: this.analyzeRiskDistribution(history),
      trend_analysis: this.analyzeDecisionTrends(history)
    };
  }

  /**
   * Calculate decision success rate
   */
  calculateDecisionSuccessRate(history) {
    const successfulDecisions = ['auto_apply', 'recommend', 'experimental'];
    const successCount = history.filter(h =>
      successfulDecisions.includes(h.decision.decision)
    ).length;

    return history.length > 0 ? successCount / history.length : 0;
  }

  /**
   * Analyze risk distribution
   */
  analyzeRiskDistribution(history) {
    const riskLevels = history.map(h => h.decision.risk_assessment?.level || 'unknown');
    const riskCounts = riskLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return riskCounts;
  }

  /**
   * Analyze decision trends
   */
  analyzeDecisionTrends(history) {
    if (history.length < 5) {
      return 'insufficient_data';
    }

    // Simple trend analysis
    const recent = history.slice(0, Math.floor(history.length / 2));
    const older = history.slice(Math.floor(history.length / 2));

    const recentConfidence = recent.reduce((sum, h) => sum + h.decision.confidence, 0) / recent.length;
    const olderConfidence = older.reduce((sum, h) => sum + h.decision.confidence, 0) / older.length;

    if (recentConfidence > olderConfidence + 0.05) {
      return 'improving';
    } else if (recentConfidence < olderConfidence - 0.05) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Export decision tree state
   */
  exportDecisionTreeState() {
    return {
      export_timestamp: new Date().toISOString(),
      active_tree_id: this.activeTreeId,
      thresholds: this.thresholds,
      decision_history: this.decisionHistory,
      statistics: this.getDecisionStatistics(),
      tree_configurations: this.decisionEngine.exportEngineState()
    };
  }
}

module.exports = PatternApplicationDecisionTree;