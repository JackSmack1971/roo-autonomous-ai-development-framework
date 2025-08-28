/**
 * Decision Engine
 *
 * Makes threshold-based decisions about pattern application
 * using confidence scores, context matching, and business rules
 */

const ConfidenceCalculator = require('./confidence-calculator');
const EventEmitter = require('events');

class DecisionEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.calculator = new ConfidenceCalculator(options);
    this.decisionHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
    this.riskThresholds = options.riskThresholds || {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  /**
   * Initialize the decision engine
   */
  async initialize() {
    await this.calculator.initialize();
  }

  /**
   * Make decision about pattern application
   */
  async makeDecision(pattern, context = {}, options = {}) {
    const decisionContext = {
      pattern_id: pattern.id,
      context: context,
      timestamp: new Date().toISOString(),
      decision_factors: {}
    };

    // Calculate confidence score
    const confidenceResult = await this.calculator.calculateConfidence(pattern, context);
    decisionContext.decision_factors.confidence = confidenceResult;

    // Evaluate decision criteria
    const decisionCriteria = await this.evaluateDecisionCriteria(pattern, context, confidenceResult);
    decisionContext.decision_factors.criteria = decisionCriteria;

    // Determine decision type
    const decision = this.determineDecisionType(pattern, confidenceResult, decisionCriteria, options);
    decisionContext.decision = decision;

    // Calculate risk assessment
    const riskAssessment = this.assessDecisionRisk(pattern, context, decision);
    decisionContext.risk_assessment = riskAssessment;

    // Generate recommendations
    const recommendations = this.generateDecisionRecommendations(pattern, decision, riskAssessment);
    decisionContext.recommendations = recommendations;

    // Store decision in history
    this.storeDecision(decisionContext);

    // Emit decision event
    this.emit('decision_made', decisionContext);

    return decisionContext;
  }

  /**
   * Evaluate decision criteria for pattern application
   */
  async evaluateDecisionCriteria(pattern, context, confidenceResult) {
    const criteria = {
      confidence_threshold_met: false,
      context_match_sufficient: false,
      quality_requirements_met: false,
      risk_tolerance_met: false,
      business_rules_compliant: false
    };

    // Check confidence threshold
    const confidence = confidenceResult.score;
    criteria.confidence_threshold_met = confidence >= 0.4; // Minimum threshold

    // Check context match
    const contextMatch = confidenceResult.factors.contextMatch;
    criteria.context_match_sufficient = contextMatch >= 0.6;

    // Check quality requirements
    criteria.quality_requirements_met = await this.checkQualityRequirements(pattern, context);

    // Check risk tolerance
    criteria.risk_tolerance_met = this.checkRiskTolerance(pattern, confidenceResult);

    // Check business rules
    criteria.business_rules_compliant = this.checkBusinessRules(pattern, context);

    // Calculate overall criteria score
    const criteriaScore = Object.values(criteria).filter(Boolean).length / Object.keys(criteria).length;
    criteria.overall_score = criteriaScore;

    return criteria;
  }

  /**
   * Determine the type of decision to make
   */
  determineDecisionType(pattern, confidenceResult, decisionCriteria, options) {
    const confidence = confidenceResult.score;
    const criteriaScore = decisionCriteria.overall_score;

    let decisionType = 'reject';
    let confidence_level = 'low';
    let rationale = '';

    // Determine confidence level
    if (confidence >= 0.8) {
      confidence_level = 'high';
    } else if (confidence >= 0.6) {
      confidence_level = 'medium';
    } else if (confidence >= 0.4) {
      confidence_level = 'experimental';
    }

    // Determine decision type based on confidence and criteria
    if (confidence >= 0.8 && criteriaScore >= 0.8) {
      decisionType = 'auto_apply';
      rationale = 'High confidence and strong criteria match - safe for automatic application';
    } else if (confidence >= 0.6 && criteriaScore >= 0.7) {
      decisionType = 'recommend';
      rationale = 'Good confidence with acceptable criteria - recommend for application';
    } else if (confidence >= 0.4 && criteriaScore >= 0.6 && !options.conservative_mode) {
      decisionType = 'experiment';
      rationale = 'Moderate confidence with adequate criteria - suitable for experimental application';
    } else if (confidence < 0.4 || criteriaScore < 0.5) {
      decisionType = 'reject';
      rationale = 'Insufficient confidence or criteria match - not recommended for application';
    } else {
      decisionType = 'review_required';
      rationale = 'Borderline case requiring human review before application';
    }

    // Override for high-risk patterns
    if (this.isHighRiskPattern(pattern) && decisionType === 'auto_apply') {
      decisionType = 'recommend';
      rationale += ' (High-risk pattern overridden to recommendation)';
    }

    return {
      type: decisionType,
      confidence_level: confidence_level,
      rationale: rationale,
      confidence_score: confidence,
      criteria_score: criteriaScore
    };
  }

  /**
   * Assess risk of the decision
   */
  assessDecisionRisk(pattern, context, decision) {
    let riskScore = 0;
    const riskFactors = [];

    // Confidence-based risk
    if (decision.confidence_score < 0.6) {
      riskScore += 0.3;
      riskFactors.push('low_confidence');
    }

    // Pattern type risk
    if (pattern.metadata?.pattern_type === 'security') {
      riskScore += 0.2;
      riskFactors.push('security_pattern');
    }

    // Context complexity risk
    const contextComplexity = this.assessContextComplexity(context);
    if (contextComplexity > 0.7) {
      riskScore += 0.2;
      riskFactors.push('complex_context');
    }

    // Historical failure risk
    const failureRate = 1 - (pattern.success_rate || 0);
    if (failureRate > 0.2) {
      riskScore += 0.2;
      riskFactors.push('high_failure_rate');
    }

    // Decision type risk adjustment
    if (decision.type === 'auto_apply') {
      riskScore += 0.1; // Higher risk for automatic application
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
      mitigation_strategies: this.generateRiskMitigations(riskFactors, decision)
    };
  }

  /**
   * Generate decision recommendations
   */
  generateDecisionRecommendations(pattern, decision, riskAssessment) {
    const recommendations = [];

    // Confidence-based recommendations
    if (decision.confidence_level === 'high') {
      recommendations.push({
        type: 'confidence',
        priority: 'low',
        message: 'Pattern has high confidence - consider expanding usage contexts'
      });
    } else if (decision.confidence_level === 'experimental') {
      recommendations.push({
        type: 'confidence',
        priority: 'medium',
        message: 'Monitor pattern performance closely during experimental phase'
      });
    }

    // Risk-based recommendations
    if (riskAssessment.level === 'high') {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        message: 'High-risk pattern - ensure proper monitoring and rollback procedures'
      });
    }

    // Decision-specific recommendations
    if (decision.type === 'auto_apply') {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        message: 'Set up automated monitoring for pattern application outcomes'
      });
    } else if (decision.type === 'recommend') {
      recommendations.push({
        type: 'review',
        priority: 'medium',
        message: 'Schedule review meeting to discuss pattern application'
      });
    }

    // Pattern improvement recommendations
    if (pattern.success_rate && pattern.success_rate < 0.8) {
      recommendations.push({
        type: 'improvement',
        priority: 'low',
        message: 'Consider pattern refinement to improve success rate'
      });
    }

    return recommendations;
  }

  /**
   * Check if pattern meets quality requirements
   */
  async checkQualityRequirements(pattern, context) {
    // Check pattern quality gates
    const qualityGates = pattern.quality_gates || [];
    if (qualityGates.length === 0) {
      return true; // No quality gates defined
    }

    // This would integrate with quality gate enforcement system
    // For now, return true if pattern has reasonable success rate
    return (pattern.success_rate || 0) >= 0.5;
  }

  /**
   * Check if pattern meets risk tolerance
   */
  checkRiskTolerance(pattern, confidenceResult) {
    const confidence = confidenceResult.score;

    // High-risk patterns require higher confidence
    if (this.isHighRiskPattern(pattern)) {
      return confidence >= 0.7;
    }

    // Medium-risk patterns require moderate confidence
    if (this.isMediumRiskPattern(pattern)) {
      return confidence >= 0.5;
    }

    // Low-risk patterns can have lower confidence threshold
    return confidence >= 0.3;
  }

  /**
   * Check business rules compliance
   */
  checkBusinessRules(pattern, context) {
    // Check pattern metadata for compliance flags
    const metadata = pattern.metadata || {};

    // Check if pattern is deprecated
    if (metadata.deprecation_status?.is_deprecated) {
      return false;
    }

    // Check pattern age (very new patterns might need review)
    if (metadata.created_at) {
      const ageDays = this.calculateAge(metadata.created_at);
      if (ageDays < 7) {
        return false; // Require review for very new patterns
      }
    }

    // Check usage statistics
    const usageStats = metadata.usage_statistics || {};
    const totalApplications = usageStats.total_applications || 0;

    // Patterns with very low usage might need review
    if (totalApplications < 3) {
      return false;
    }

    return true;
  }

  /**
   * Assess context complexity
   */
  assessContextComplexity(context) {
    if (!context || Object.keys(context).length === 0) {
      return 0;
    }

    let complexityScore = 0;

    // Number of context fields
    complexityScore += Math.min(Object.keys(context).length / 10, 0.3);

    // Complexity of field values
    Object.values(context).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        complexityScore += 0.1;
      } else if (typeof value === 'string' && value.length > 50) {
        complexityScore += 0.05;
      }
    });

    // Presence of sensitive information
    const sensitiveFields = ['password', 'secret', 'key', 'token', 'credential'];
    const hasSensitiveData = Object.keys(context).some(key =>
      sensitiveFields.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    if (hasSensitiveData) {
      complexityScore += 0.3;
    }

    return Math.min(1, complexityScore);
  }

  /**
   * Check if pattern is high risk
   */
  isHighRiskPattern(pattern) {
    const highRiskTypes = ['security', 'deployment'];
    const patternType = pattern.metadata?.pattern_type;

    return highRiskTypes.includes(patternType) ||
           pattern.name.toLowerCase().includes('security') ||
           pattern.name.toLowerCase().includes('deploy');
  }

  /**
   * Check if pattern is medium risk
   */
  isMediumRiskPattern(pattern) {
    const mediumRiskTypes = ['architecture', 'database'];
    const patternType = pattern.metadata?.pattern_type;

    return mediumRiskTypes.includes(patternType) ||
           pattern.name.toLowerCase().includes('database') ||
           pattern.name.toLowerCase().includes('architecture');
  }

  /**
   * Generate risk mitigation strategies
   */
  generateRiskMitigations(riskFactors, decision) {
    const mitigations = [];

    riskFactors.forEach(factor => {
      switch (factor) {
        case 'low_confidence':
          mitigations.push('Implement additional monitoring and validation');
          mitigations.push('Prepare rollback procedures');
          break;

        case 'security_pattern':
          mitigations.push('Conduct security review before application');
          mitigations.push('Implement additional security monitoring');
          break;

        case 'complex_context':
          mitigations.push('Simplify context or add validation checks');
          mitigations.push('Test in staging environment first');
          break;

        case 'high_failure_rate':
          mitigations.push('Analyze failure patterns and root causes');
          mitigations.push('Implement additional error handling');
          break;
      }
    });

    // Decision-specific mitigations
    if (decision.type === 'auto_apply') {
      mitigations.push('Set up automated alerting for failures');
      mitigations.push('Implement circuit breaker pattern');
    }

    return mitigations;
  }

  /**
   * Calculate age in days
   */
  calculateAge(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Store decision in history
   */
  storeDecision(decisionContext) {
    this.decisionHistory.push(decisionContext);

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
      history = history.filter(d => d.pattern_id === options.pattern_id);
    }

    if (options.decision_type) {
      history = history.filter(d => d.decision.type === options.decision_type);
    }

    if (options.confidence_level) {
      history = history.filter(d => d.decision.confidence_level === options.confidence_level);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(d => new Date(d.timestamp) > sinceDate);
    }

    // Apply sorting
    if (options.sort_by === 'timestamp') {
      history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Apply pagination
    if (options.limit) {
      history = history.slice(0, options.limit);
    }

    return history;
  }

  /**
   * Get decision analytics
   */
  getDecisionAnalytics(options = {}) {
    const history = this.getDecisionHistory(options);

    if (history.length === 0) {
      return {
        status: 'insufficient_data',
        message: 'No decision history available'
      };
    }

    const analytics = {
      total_decisions: history.length,
      decision_types: this.analyzeDecisionTypes(history),
      confidence_levels: this.analyzeConfidenceLevels(history),
      risk_levels: this.analyzeRiskLevels(history),
      success_rates: this.analyzeDecisionSuccess(history),
      trends: this.analyzeDecisionTrends(history)
    };

    return analytics;
  }

  /**
   * Analyze decision types distribution
   */
  analyzeDecisionTypes(history) {
    const types = {};

    history.forEach(decision => {
      const type = decision.decision.type;
      types[type] = (types[type] || 0) + 1;
    });

    return types;
  }

  /**
   * Analyze confidence levels distribution
   */
  analyzeConfidenceLevels(history) {
    const levels = {};

    history.forEach(decision => {
      const level = decision.decision.confidence_level;
      levels[level] = (levels[level] || 0) + 1;
    });

    return levels;
  }

  /**
   * Analyze risk levels distribution
   */
  analyzeRiskLevels(history) {
    const levels = {};

    history.forEach(decision => {
      const level = decision.risk_assessment.level;
      levels[level] = (levels[level] || 0) + 1;
    });

    return levels;
  }

  /**
   * Analyze decision success rates
   */
  analyzeDecisionSuccess(history) {
    // This would require tracking actual outcomes
    // For now, return placeholder based on decision types
    const successRates = {
      auto_apply: 0.85,
      recommend: 0.75,
      experiment: 0.65,
      reject: 0.0
    };

    return successRates;
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

    const recentConfidence = recent.reduce((sum, d) => sum + d.decision.confidence_score, 0) / recent.length;
    const olderConfidence = older.reduce((sum, d) => sum + d.decision.confidence_score, 0) / older.length;

    if (recentConfidence > olderConfidence + 0.05) {
      return 'improving';
    } else if (recentConfidence < olderConfidence - 0.05) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Export decision data
   */
  exportDecisionData(format = 'json') {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      decision_history: this.decisionHistory,
      analytics: this.getDecisionAnalytics()
    };

    if (format === 'csv') {
      return this.convertDecisionsToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert decisions to CSV format
   */
  convertDecisionsToCSV(data) {
    const headers = ['timestamp', 'pattern_id', 'decision_type', 'confidence_level', 'confidence_score', 'risk_level'];
    const rows = data.decision_history.map(decision => [
      decision.timestamp,
      decision.pattern_id,
      decision.decision.type,
      decision.decision.confidence_level,
      decision.decision.confidence_score,
      decision.risk_assessment.level
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = DecisionEngine;