/**
 * Confidence Calculator
 *
 * Core algorithms for calculating pattern confidence scores based on
 * success rates, context matching, recency, and other factors
 */

const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');

class ConfidenceCalculator {
  constructor(options = {}) {
    this.configPath = options.configPath || path.join(__dirname, '..', 'config', 'confidence-algorithm.yaml');
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize the confidence calculator with configuration
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.loadConfiguration();
    this.initialized = true;
  }

  /**
   * Load confidence algorithm configuration
   */
  async loadConfiguration() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = yaml.load(configContent);
    } catch (error) {
      throw new Error(`Failed to load confidence configuration: ${error.message}`);
    }
  }

  /**
   * Calculate overall confidence score for a pattern
   */
  async calculateConfidence(pattern, context = {}, options = {}) {
    await this.initialize();

    const factors = {
      successRate: this.calculateSuccessRateFactor(pattern),
      recency: this.calculateRecencyFactor(pattern),
      contextMatch: this.calculateContextMatchFactor(pattern, context),
      diversity: this.calculateDiversityFactor(pattern),
      qualityImpact: this.calculateQualityImpactFactor(pattern)
    };

    // Apply weights from configuration
    const weights = this.config.confidence_algorithm;

    let confidence = (
      factors.successRate * (weights.context_weight || 0.3) +
      factors.recency * (weights.recency_weight || 0.2) +
      factors.contextMatch * (weights.context_weight || 0.3) +
      factors.diversity * (weights.diversity_weight || 0.1) +
      factors.qualityImpact * 0.1
    );

    // Apply confidence decay if pattern hasn't been used recently
    confidence = this.applyConfidenceDecay(confidence, pattern);

    // Bound confidence within configured limits
    confidence = Math.max(
      this.config.confidence_algorithm.min_confidence,
      Math.min(this.config.confidence_algorithm.max_confidence, confidence)
    );

    return {
      score: confidence,
      factors: factors,
      calculation_method: 'weighted_average',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate success rate factor
   */
  calculateSuccessRateFactor(pattern) {
    const successRate = pattern.success_rate || 0;
    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;

    // Apply minimum applications threshold
    if (applications < 3) {
      return this.config.confidence_algorithm.initial_confidence;
    }

    // Success rate factor with diminishing returns for very high success rates
    let factor = successRate;
    if (successRate > 0.95) {
      factor = 0.95 + (successRate - 0.95) * 0.5; // Diminish returns above 95%
    }

    return factor;
  }

  /**
   * Calculate recency factor based on recent usage
   */
  calculateRecencyFactor(pattern) {
    const lastApplied = pattern.metadata?.last_applied;
    if (!lastApplied) {
      return 0.5; // Neutral score for never-used patterns
    }

    const daysSinceLastUse = this.calculateDaysDifference(lastApplied);
    const recencyWeights = this.config.confidence_decay?.recency_weights || {
      last_7_days: 1.0,
      last_30_days: 0.8,
      last_90_days: 0.6,
      older_than_90: 0.4
    };

    if (daysSinceLastUse <= 7) return recencyWeights.last_7_days;
    if (daysSinceLastUse <= 30) return recencyWeights.last_30_days;
    if (daysSinceLastUse <= 90) return recencyWeights.last_90_days;
    return recencyWeights.older_than_90;
  }

  /**
   * Calculate context match factor
   */
  calculateContextMatchFactor(pattern, context) {
    if (!context || Object.keys(context).length === 0) {
      return 0.5; // Neutral score when no context provided
    }

    const contextMatch = pattern.context_match || {};
    const requiredFields = contextMatch.required_fields || [];
    const optionalFields = contextMatch.optional_fields || [];
    const excludedFields = contextMatch.excluded_fields || [];

    let score = 0;
    let maxScore = 0;

    // Check required fields (high weight)
    for (const field of requiredFields) {
      maxScore += 2;
      if (context[field] !== undefined && context[field] !== null) {
        score += 2;
      }
    }

    // Check optional fields (medium weight)
    for (const field of optionalFields) {
      maxScore += 1;
      if (context[field] !== undefined && context[field] !== null) {
        score += 1;
      }
    }

    // Check excluded fields (negative weight)
    for (const field of excludedFields) {
      if (context[field] !== undefined && context[field] !== null) {
        score -= 1;
        maxScore += 1;
      }
    }

    // Calculate similarity score
    const similarityThreshold = contextMatch.similarity_threshold || 0.7;
    const rawScore = maxScore > 0 ? score / maxScore : 0.5;

    // Apply similarity threshold
    return Math.max(similarityThreshold, rawScore);
  }

  /**
   * Calculate diversity factor based on application contexts
   */
  calculateDiversityFactor(pattern) {
    // This would analyze the diversity of contexts where the pattern has been applied
    // For now, use a simple heuristic based on application count and success consistency
    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;
    const successRate = pattern.success_rate || 0;

    if (applications < 5) {
      return 0.5; // Insufficient data for diversity analysis
    }

    // Higher diversity score for patterns that work across different contexts
    // This is a simplified calculation - in practice, this would analyze context clusters
    const diversityScore = Math.min(1.0, applications / 10) * successRate;

    return diversityScore;
  }

  /**
   * Calculate quality impact factor
   */
  calculateQualityImpactFactor(pattern) {
    const qualityImpact = pattern.metadata?.usage_statistics?.average_quality_impact || 0;

    // Convert quality impact to a 0-1 scale
    // Assuming quality impact ranges from -1 (very negative) to +1 (very positive)
    const normalizedImpact = (qualityImpact + 1) / 2;

    return Math.max(0, Math.min(1, normalizedImpact));
  }

  /**
   * Apply confidence decay based on usage patterns
   */
  applyConfidenceDecay(confidence, pattern) {
    const decayConfig = this.config.confidence_decay;
    if (!decayConfig?.enabled) {
      return confidence;
    }

    const lastApplied = pattern.metadata?.last_applied;
    if (!lastApplied) {
      return confidence * 0.8; // Reduce confidence for never-used patterns
    }

    const daysSinceLastUse = this.calculateDaysDifference(lastApplied);
    const usageThreshold = decayConfig.usage_threshold_days || 30;

    if (daysSinceLastUse > usageThreshold) {
      const decayRate = decayConfig.decay_rate || 0.02;
      const decayPeriods = Math.floor(daysSinceLastUse / 30); // Monthly decay
      const decayFactor = Math.pow(1 - decayRate, decayPeriods);

      confidence *= decayFactor;
    }

    return Math.max(decayConfig.min_decay_confidence || 0.1, confidence);
  }

  /**
   * Update confidence based on application outcome
   */
  async updateConfidenceFromOutcome(pattern, success, qualityImpact = 0, context = {}) {
    await this.initialize();

    const currentConfidence = pattern.confidence_score;
    const algorithm = this.config.confidence_algorithm;

    let confidenceAdjustment = 0;

    // Base adjustment based on success/failure
    if (success) {
      confidenceAdjustment = algorithm.success_increment;

      // Bonus for high quality impact
      if (qualityImpact > 0.1) {
        confidenceAdjustment += algorithm.success_increment * 0.5;
      }
    } else {
      confidenceAdjustment = -algorithm.failure_decrement;

      // Penalty for negative quality impact
      if (qualityImpact < -0.1) {
        confidenceAdjustment -= algorithm.failure_decrement * 0.5;
      }
    }

    // Apply context match bonus/penalty
    const contextMatchFactor = this.calculateContextMatchFactor(pattern, context);
    if (contextMatchFactor > 0.8) {
      confidenceAdjustment *= 1.1; // 10% bonus for good context match
    } else if (contextMatchFactor < 0.5) {
      confidenceAdjustment *= 0.9; // 10% penalty for poor context match
    }

    // Calculate new confidence
    let newConfidence = currentConfidence + confidenceAdjustment;

    // Apply adaptation rate (gradual change)
    const adaptationRate = algorithm.adaptation_rate;
    newConfidence = currentConfidence + (newConfidence - currentConfidence) * adaptationRate;

    // Bound confidence within limits
    newConfidence = Math.max(
      algorithm.min_confidence,
      Math.min(algorithm.max_confidence, newConfidence)
    );

    return {
      previous_confidence: currentConfidence,
      new_confidence: newConfidence,
      adjustment: confidenceAdjustment,
      factors: {
        success: success,
        quality_impact: qualityImpact,
        context_match: contextMatchFactor
      },
      calculation_method: 'outcome_based_update',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determine if pattern should be auto-applied based on confidence
   */
  shouldAutoApply(pattern, context = {}) {
    const confidenceThreshold = this.config.decision_thresholds?.auto_apply || 0.8;
    return pattern.confidence_score >= confidenceThreshold;
  }

  /**
   * Determine if pattern should be recommended
   */
  shouldRecommend(pattern, context = {}) {
    const confidenceThreshold = this.config.decision_thresholds?.recommend || 0.6;
    return pattern.confidence_score >= confidenceThreshold;
  }

  /**
   * Determine if pattern is suitable for experimental application
   */
  shouldExperiment(pattern, context = {}) {
    const confidenceThreshold = this.config.decision_thresholds?.experimental || 0.4;
    return pattern.confidence_score >= confidenceThreshold;
  }

  /**
   * Check if pattern should be deprecated
   */
  shouldDeprecate(pattern) {
    const deprecationThreshold = this.config.decision_thresholds?.deprecated || 0.2;
    return pattern.confidence_score < deprecationThreshold;
  }

  /**
   * Calculate days difference between two dates
   */
  calculateDaysDifference(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get confidence analytics for a pattern
   */
  async getConfidenceAnalytics(pattern) {
    await this.initialize();

    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;
    const successfulApplications = pattern.metadata?.usage_statistics?.successful_applications || 0;
    const failedApplications = pattern.metadata?.usage_statistics?.failed_applications || 0;

    const successRate = applications > 0 ? successfulApplications / applications : 0;
    const failureRate = applications > 0 ? failedApplications / applications : 0;

    // Calculate confidence trend (simplified)
    const recentApplications = Math.min(applications, 10);
    const recentSuccessRate = recentApplications > 0 ?
      (successfulApplications / applications) : 0;

    let trend = 'stable';
    if (recentSuccessRate > successRate + 0.1) {
      trend = 'improving';
    } else if (recentSuccessRate < successRate - 0.1) {
      trend = 'declining';
    }

    return {
      current_confidence: pattern.confidence_score,
      success_rate: successRate,
      failure_rate: failureRate,
      total_applications: applications,
      trend: trend,
      volatility: this.calculateConfidenceVolatility(pattern),
      recommendation: this.getConfidenceRecommendation(pattern)
    };
  }

  /**
   * Calculate confidence volatility (how much confidence changes)
   */
  calculateConfidenceVolatility(pattern) {
    // This would analyze confidence changes over time
    // For now, return a placeholder calculation
    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;

    if (applications < 5) {
      return 0.5; // High volatility for new patterns
    } else if (applications < 20) {
      return 0.3; // Medium volatility for moderately used patterns
    } else {
      return 0.1; // Low volatility for well-established patterns
    }
  }

  /**
   * Get confidence-based recommendation for pattern usage
   */
  getConfidenceRecommendation(pattern) {
    const confidence = pattern.confidence_score;

    if (confidence >= 0.8) {
      return {
        action: 'auto_apply',
        confidence: 'high',
        rationale: 'Pattern has proven highly effective with strong confidence'
      };
    } else if (confidence >= 0.6) {
      return {
        action: 'recommend',
        confidence: 'medium',
        rationale: 'Pattern shows promise but should be reviewed before application'
      };
    } else if (confidence >= 0.4) {
      return {
        action: 'experiment',
        confidence: 'low',
        rationale: 'Pattern may be useful but requires careful monitoring'
      };
    } else {
      return {
        action: 'avoid',
        confidence: 'very_low',
        rationale: 'Pattern has low confidence and should be avoided or deprecated'
      };
    }
  }

  /**
   * Calculate confidence prediction for future applications
   */
  async predictFutureConfidence(pattern, futureApplications = 1) {
    const currentConfidence = pattern.confidence_score;
    const successRate = pattern.success_rate || 0.5;

    // Simple prediction model
    let predictedConfidence = currentConfidence;

    for (let i = 0; i < futureApplications; i++) {
      // Assume future applications follow historical success rate
      const success = Math.random() < successRate;
      const adjustment = success ?
        this.config.confidence_algorithm.success_increment :
        -this.config.confidence_algorithm.failure_decrement;

      predictedConfidence += adjustment;
      predictedConfidence = Math.max(
        this.config.confidence_algorithm.min_confidence,
        Math.min(this.config.confidence_algorithm.max_confidence, predictedConfidence)
      );
    }

    return {
      current_confidence: currentConfidence,
      predicted_confidence: predictedConfidence,
      confidence_change: predictedConfidence - currentConfidence,
      applications_simulated: futureApplications,
      prediction_method: 'monte_carlo_simulation'
    };
  }
}

module.exports = ConfidenceCalculator;