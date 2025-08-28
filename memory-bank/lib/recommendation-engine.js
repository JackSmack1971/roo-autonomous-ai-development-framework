/**
 * Recommendation Engine
 *
 * Advanced recommendation generation system that creates prioritized,
 * actionable recommendations based on pattern analysis and context
 */

const EventEmitter = require('events');

class RecommendationEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxRecommendations: options.maxRecommendations || 10,
      minConfidenceThreshold: options.minConfidenceThreshold || 0.6,
      prioritizationStrategy: options.prioritizationStrategy || 'weighted_score',
      enableBusinessRules: options.enableBusinessRules !== false,
      enableExternalSources: options.enableExternalSources || false,
      recommendationCacheSize: options.recommendationCacheSize || 100,
      ...options
    };

    // Recommendation algorithms
    this.algorithms = {
      collaborative_filtering: this.collaborativeFiltering.bind(this),
      content_based: this.contentBasedFiltering.bind(this),
      hybrid_approach: this.hybridApproach.bind(this),
      context_driven: this.contextDrivenApproach.bind(this),
      business_value: this.businessValueApproach.bind(this)
    };

    // Business rules engine
    this.businessRules = this.loadBusinessRules();

    // External recommendation sources
    this.externalSources = new Map();

    // Recommendation cache
    this.recommendationCache = new Map();

    // Recommendation history for learning
    this.recommendationHistory = [];
  }

  /**
   * Generate recommendations based on context and pattern matches
   */
  async generateRecommendations(context, patternMatches, options = {}) {
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const recommendation = {
      recommendation_id: recommendationId,
      timestamp: new Date().toISOString(),
      context: context,
      algorithm: options.algorithm || 'hybrid_approach',
      recommendations: [],
      prioritization: {},
      business_context: {},
      external_insights: [],
      metadata: {}
    };

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context, patternMatches);
      if (this.recommendationCache.has(cacheKey)) {
        const cached = this.recommendationCache.get(cacheKey);
        if (this.isCacheValid(cached.timestamp)) {
          this.emit('recommendations_generated_from_cache', cached);
          return cached;
        }
      }

      // Generate base recommendations
      const baseRecommendations = await this.generateBaseRecommendations(context, patternMatches, options);

      // Apply recommendation algorithms
      const algorithmRecommendations = await this.applyRecommendationAlgorithm(
        baseRecommendations,
        context,
        patternMatches,
        options
      );

      // Apply business rules
      const businessFilteredRecommendations = this.options.enableBusinessRules ?
        await this.applyBusinessRules(algorithmRecommendations, context) :
        algorithmRecommendations;

      // Prioritize recommendations
      const prioritizedRecommendations = this.prioritizeRecommendations(
        businessFilteredRecommendations,
        context,
        options
      );

      // Apply limits
      const limitedRecommendations = this.applyRecommendationLimits(
        prioritizedRecommendations,
        options
      );

      // Enhance with external insights
      const enhancedRecommendations = this.options.enableExternalSources ?
        await this.enhanceWithExternalInsights(limitedRecommendations, context) :
        limitedRecommendations;

      // Finalize recommendations
      recommendation.recommendations = enhancedRecommendations;
      recommendation.prioritization = this.analyzePrioritization(enhancedRecommendations);
      recommendation.business_context = this.extractBusinessContext(context);

      // Add metadata
      recommendation.metadata = {
        total_base_recommendations: baseRecommendations.length,
        algorithm_used: recommendation.algorithm,
        business_rules_applied: this.options.enableBusinessRules,
        external_sources_used: this.options.enableExternalSources,
        generation_duration_ms: Date.now() - new Date(recommendation.timestamp).getTime(),
        cache_used: false
      };

      // Cache the result
      this.setCache(cacheKey, recommendation);

      // Store in history
      this.storeRecommendationHistory(recommendation);

      this.emit('recommendations_generated', recommendation);

      return recommendation;

    } catch (error) {
      recommendation.error = error.message;
      this.emit('recommendation_generation_failed', {
        recommendation_id: recommendationId,
        error: error.message,
        context: context
      });
      throw error;
    }
  }

  /**
   * Generate base recommendations from pattern matches
   */
  async generateBaseRecommendations(context, patternMatches, options = {}) {
    const recommendations = [];
    const matches = patternMatches.matches || [];

    for (const match of matches) {
      if (match.confidence_score >= this.options.minConfidenceThreshold) {
        const recommendation = await this.createDetailedRecommendation(match, context, patternMatches);
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Create detailed recommendation from pattern match
   */
  async createDetailedRecommendation(match, context, patternMatches) {
    const recommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      pattern_id: match.pattern_id,
      pattern_name: match.pattern_name,
      pattern_type: match.metadata?.pattern_type || 'unknown',
      confidence_score: match.confidence_score,
      relevance_score: match.relevance_score,
      similarity_score: match.similarity_score,
      priority_score: 0, // Will be calculated later
      recommendation_type: this.determineRecommendationType(match),
      action: this.generateActionDescription(match, context),
      rationale: this.generateDetailedRationale(match, context, patternMatches),
      expected_impact: this.calculateExpectedImpact(match, context),
      implementation_complexity: this.assessImplementationComplexity(match),
      risk_assessment: this.assessRecommendationRisk(match, context),
      prerequisites: this.identifyPrerequisites(match, context),
      success_criteria: this.defineSuccessCriteria(match),
      implementation_steps: this.generateImplementationSteps(match, context),
      estimated_effort: this.estimateEffort(match, context),
      dependencies: this.identifyDependencies(match, context),
      alternatives: this.identifyAlternatives(match, patternMatches),
      contextual_factors: this.extractContextualFactors(match, context),
      metadata: {
        match_factors: match.match_factors,
        context_coverage: match.context_coverage,
        pattern_characteristics: match.pattern_characteristics,
        last_applied: match.metadata?.last_applied,
        total_applications: match.metadata?.total_applications || 0,
        success_rate: match.metadata?.success_rate
      }
    };

    return recommendation;
  }

  /**
   * Apply recommendation algorithm
   */
  async applyRecommendationAlgorithm(recommendations, context, patternMatches, options = {}) {
    const algorithm = options.algorithm || this.options.prioritizationStrategy;
    const algorithmFunction = this.algorithms[algorithm];

    if (!algorithmFunction) {
      throw new Error(`Unknown recommendation algorithm: ${algorithm}`);
    }

    return await algorithmFunction(recommendations, context, patternMatches, options);
  }

  /**
   * Collaborative filtering algorithm
   */
  async collaborativeFiltering(recommendations, context, patternMatches, options = {}) {
    // This would typically use historical data from similar contexts
    // For now, implement a basic version based on pattern co-occurrence

    const patternCooccurrence = this.calculatePatternCooccurrence(patternMatches);

    return recommendations.map(rec => ({
      ...rec,
      collaborative_score: patternCooccurrence[rec.pattern_id] || 0,
      priority_score: rec.priority_score + (patternCooccurrence[rec.pattern_id] || 0) * 0.2
    }));
  }

  /**
   * Content-based filtering algorithm
   */
  async contentBasedFiltering(recommendations, context, patternMatches, options = {}) {
    // Filter and score based on content similarity to context

    return recommendations.map(rec => {
      const contentSimilarity = this.calculateContentSimilarity(rec, context);
      return {
        ...rec,
        content_similarity: contentSimilarity,
        priority_score: rec.priority_score + contentSimilarity * 0.3
      };
    });
  }

  /**
   * Hybrid approach combining multiple algorithms
   */
  async hybridApproach(recommendations, context, patternMatches, options = {}) {
    // Apply multiple algorithms and combine scores

    const collaborative = await this.collaborativeFiltering(recommendations, context, patternMatches);
    const contentBased = await this.contentBasedFiltering(recommendations, context, patternMatches);

    return recommendations.map((rec, index) => {
      const collabScore = collaborative[index].collaborative_score || 0;
      const contentScore = contentBased[index].content_similarity || 0;

      return {
        ...rec,
        hybrid_score: (collabScore + contentScore) / 2,
        priority_score: rec.priority_score + (collabScore * 0.15) + (contentScore * 0.15)
      };
    });
  }

  /**
   * Context-driven approach
   */
  async contextDrivenApproach(recommendations, context, patternMatches, options = {}) {
    // Prioritize based on context urgency and importance

    const contextUrgency = this.assessContextUrgency(context);
    const contextImportance = this.assessContextImportance(context);

    return recommendations.map(rec => {
      const contextRelevance = this.calculateContextRelevance(rec, context);
      const urgencyBonus = contextUrgency * contextRelevance;
      const importanceBonus = contextImportance * rec.expected_impact.quality;

      return {
        ...rec,
        context_relevance: contextRelevance,
        urgency_bonus: urgencyBonus,
        importance_bonus: importanceBonus,
        priority_score: rec.priority_score + urgencyBonus + importanceBonus
      };
    });
  }

  /**
   * Business value approach
   */
  async businessValueApproach(recommendations, context, patternMatches, options = {}) {
    // Prioritize based on business value and ROI

    return recommendations.map(rec => {
      const businessValue = this.calculateBusinessValue(rec, context);
      const roi = this.calculateROI(rec, context);

      return {
        ...rec,
        business_value: businessValue,
        roi: roi,
        priority_score: rec.priority_score + (businessValue * 0.2) + (roi * 0.1)
      };
    });
  }

  /**
   * Apply business rules to filter and score recommendations
   */
  async applyBusinessRules(recommendations, context) {
    let filteredRecommendations = [...recommendations];

    // Apply each business rule
    for (const rule of this.businessRules) {
      filteredRecommendations = await this.applyBusinessRule(filteredRecommendations, rule, context);
    }

    return filteredRecommendations;
  }

  /**
   * Apply a single business rule
   */
  async applyBusinessRule(recommendations, rule, context) {
    switch (rule.type) {
      case 'filter':
        return this.applyFilterRule(recommendations, rule, context);
      case 'score':
        return this.applyScoreRule(recommendations, rule, context);
      case 'reorder':
        return this.applyReorderRule(recommendations, rule, context);
      default:
        return recommendations;
    }
  }

  /**
   * Apply filter rule
   */
  applyFilterRule(recommendations, rule, context) {
    return recommendations.filter(rec => {
      // Apply rule conditions
      return this.evaluateRuleCondition(rec, rule.condition, context);
    });
  }

  /**
   * Apply score rule
   */
  applyScoreRule(recommendations, rule, context) {
    return recommendations.map(rec => {
      if (this.evaluateRuleCondition(rec, rule.condition, context)) {
        return {
          ...rec,
          priority_score: rec.priority_score + rule.score_bonus
        };
      }
      return rec;
    });
  }

  /**
   * Apply reorder rule
   */
  applyReorderRule(recommendations, rule, context) {
    // This would implement custom reordering logic
    return recommendations;
  }

  /**
   * Prioritize recommendations
   */
  prioritizeRecommendations(recommendations, context, options = {}) {
    const strategy = options.prioritizationStrategy || this.options.prioritizationStrategy;

    switch (strategy) {
      case 'confidence_first':
        return this.prioritizeByConfidence(recommendations);
      case 'impact_first':
        return this.prioritizeByImpact(recommendations);
      case 'risk_adjusted':
        return this.prioritizeByRiskAdjusted(recommendations);
      case 'business_value':
        return this.prioritizeByBusinessValue(recommendations);
      case 'weighted_score':
      default:
        return this.prioritizeByWeightedScore(recommendations);
    }
  }

  /**
   * Prioritize by confidence score
   */
  prioritizeByConfidence(recommendations) {
    return recommendations.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Prioritize by expected impact
   */
  prioritizeByImpact(recommendations) {
    return recommendations.sort((a, b) => {
      const impactA = Object.values(a.expected_impact).reduce((sum, val) => sum + val, 0);
      const impactB = Object.values(b.expected_impact).reduce((sum, val) => sum + val, 0);
      return impactB - impactA;
    });
  }

  /**
   * Prioritize by risk-adjusted score
   */
  prioritizeByRiskAdjusted(recommendations) {
    return recommendations.sort((a, b) => {
      const riskAdjustedA = a.confidence_score * (1 - a.risk_assessment.overall_risk);
      const riskAdjustedB = b.confidence_score * (1 - b.risk_assessment.overall_risk);
      return riskAdjustedB - riskAdjustedA;
    });
  }

  /**
   * Prioritize by business value
   */
  prioritizeByBusinessValue(recommendations) {
    return recommendations.map(rec => ({
      ...rec,
      business_value_score: this.calculateBusinessValue(rec, {})
    })).sort((a, b) => b.business_value_score - a.business_value_score);
  }

  /**
   * Prioritize by weighted score
   */
  prioritizeByWeightedScore(recommendations) {
    const weights = {
      confidence: 0.4,
      relevance: 0.3,
      impact: 0.2,
      risk: 0.1
    };

    return recommendations.map(rec => {
      const impactScore = Object.values(rec.expected_impact).reduce((sum, val) => sum + val, 0);
      const riskScore = rec.risk_assessment.overall_risk;

      const weightedScore =
        rec.confidence_score * weights.confidence +
        rec.relevance_score * weights.relevance +
        impactScore * weights.impact +
        (1 - riskScore) * weights.risk;

      return {
        ...rec,
        weighted_score: weightedScore,
        priority_score: weightedScore
      };
    }).sort((a, b) => b.weighted_score - a.weighted_score);
  }

  /**
   * Apply recommendation limits
   */
  applyRecommendationLimits(recommendations, options = {}) {
    const maxRecommendations = options.maxRecommendations || this.options.maxRecommendations;
    return recommendations.slice(0, maxRecommendations);
  }

  /**
   * Enhance recommendations with external insights
   */
  async enhanceWithExternalInsights(recommendations, context) {
    if (this.externalSources.size === 0) {
      return recommendations;
    }

    const enhancedRecommendations = [];

    for (const recommendation of recommendations) {
      const externalInsights = await this.gatherExternalInsights(recommendation, context);
      enhancedRecommendations.push({
        ...recommendation,
        external_insights: externalInsights
      });
    }

    return enhancedRecommendations;
  }

  /**
   * Gather external insights for a recommendation
   */
  async gatherExternalInsights(recommendation, context) {
    const insights = [];

    for (const [sourceName, source] of this.externalSources) {
      try {
        const insight = await source.gatherInsights(recommendation, context);
        if (insight) {
          insights.push({
            source: sourceName,
            ...insight
          });
        }
      } catch (error) {
        console.warn(`Failed to gather insights from ${sourceName}:`, error.message);
      }
    }

    return insights;
  }

  /**
   * Determine recommendation type
   */
  determineRecommendationType(match) {
    const patternType = match.metadata?.pattern_type;

    switch (patternType) {
      case 'security':
        return 'security_improvement';
      case 'architecture':
        return 'architectural_decision';
      case 'performance':
        return 'performance_optimization';
      case 'quality':
        return 'quality_enhancement';
      case 'development':
        return 'development_practice';
      case 'testing':
        return 'testing_strategy';
      case 'deployment':
        return 'deployment_improvement';
      default:
        return 'general_improvement';
    }
  }

  /**
   * Generate action description
   */
  generateActionDescription(match, context) {
    const patternType = match.metadata?.pattern_type;
    const patternName = match.pattern_name;

    const actions = {
      security: `Implement security pattern: ${patternName}`,
      architecture: `Apply architectural pattern: ${patternName}`,
      performance: `Optimize performance using: ${patternName}`,
      quality: `Enhance quality with: ${patternName}`,
      development: `Adopt development practice: ${patternName}`,
      testing: `Implement testing strategy: ${patternName}`,
      deployment: `Improve deployment with: ${patternName}`
    };

    return actions[patternType] || `Apply pattern: ${patternName}`;
  }

  /**
   * Generate detailed rationale
   */
  generateDetailedRationale(match, context, patternMatches) {
    const factors = [];

    // Confidence factors
    if (match.confidence_score > 0.8) {
      factors.push('High confidence based on extensive successful applications');
    } else if (match.confidence_score > 0.6) {
      factors.push('Good confidence based on positive historical performance');
    }

    // Similarity factors
    if (match.similarity_score > 0.8) {
      factors.push('Excellent match with current project context');
    } else if (match.similarity_score > 0.6) {
      factors.push('Strong alignment with project characteristics');
    }

    // Match factors
    const matchFactors = match.match_factors || {};
    if (matchFactors.technology_match > 0.7) {
      factors.push('Technology stack compatibility');
    }
    if (matchFactors.context_completeness > 0.8) {
      factors.push('Comprehensive context coverage');
    }
    if (matchFactors.pattern_maturity > 0.7) {
      factors.push('Mature, well-established pattern');
    }

    // Context insights
    const contextInsights = patternMatches.context_analysis?.context_insights || [];
    contextInsights.forEach(insight => {
      if (insight.relevance > 0.7) {
        factors.push(insight.description);
      }
    });

    // Business context
    if (context.project_type) {
      factors.push(`Aligned with ${context.project_type} project requirements`);
    }

    return factors.join('. ') + '.';
  }

  /**
   * Calculate expected impact
   */
  calculateExpectedImpact(match, context) {
    const patternType = match.metadata?.pattern_type;
    const baseImpact = { quality: 0, performance: 0, security: 0, maintainability: 0, development_speed: 0 };

    // Base impact by pattern type
    switch (patternType) {
      case 'security':
        baseImpact.security = 0.8;
        baseImpact.quality = 0.6;
        break;
      case 'architecture':
        baseImpact.quality = 0.7;
        baseImpact.maintainability = 0.8;
        baseImpact.performance = 0.5;
        break;
      case 'performance':
        baseImpact.performance = 0.9;
        baseImpact.quality = 0.4;
        break;
      case 'quality':
        baseImpact.quality = 0.8;
        baseImpact.maintainability = 0.6;
        break;
      case 'development':
        baseImpact.development_speed = 0.7;
        baseImpact.quality = 0.5;
        break;
      case 'testing':
        baseImpact.quality = 0.7;
        baseImpact.maintainability = 0.5;
        break;
    }

    // Adjust based on context
    const contextQuality = context.quality_requirements === 'high' ? 1.2 :
                          context.quality_requirements === 'critical' ? 1.4 : 1.0;

    const securityLevel = context.security_level === 'high' ? 1.3 :
                         context.security_level === 'critical' ? 1.5 : 1.0;

    // Apply adjustments
    Object.keys(baseImpact).forEach(key => {
      if (key === 'quality') baseImpact[key] *= contextQuality;
      if (key === 'security') baseImpact[key] *= securityLevel;
      baseImpact[key] = Math.min(1, baseImpact[key]);
    });

    return baseImpact;
  }

  /**
   * Assess implementation complexity
   */
  assessImplementationComplexity(match) {
    let complexity = 0.5; // Base complexity

    // Pattern characteristics
    const characteristics = match.pattern_characteristics || {};
    complexity += characteristics.complexity * 0.3;
    complexity += characteristics.risk_level * 0.2;

    // Pattern type complexity
    const patternType = match.metadata?.pattern_type;
    switch (patternType) {
      case 'architecture':
        complexity += 0.3;
        break;
      case 'security':
        complexity += 0.2;
        break;
      case 'performance':
        complexity += 0.1;
        break;
    }

    return Math.min(1, complexity);
  }

  /**
   * Assess recommendation risk
   */
  assessRecommendationRisk(match, context) {
    const risk = {
      technical_risk: 0,
      business_risk: 0,
      implementation_risk: 0,
      overall_risk: 0
    };

    // Pattern risk
    const characteristics = match.pattern_characteristics || {};
    risk.technical_risk = characteristics.risk_level;

    // Context risk
    if (context.security_level === 'critical') {
      risk.business_risk += 0.3;
    }
    if (context.project_type === 'financial_system') {
      risk.business_risk += 0.2;
    }

    // Implementation risk
    const complexity = this.assessImplementationComplexity(match);
    risk.implementation_risk = complexity * 0.7;

    // Overall risk
    risk.overall_risk = (
      risk.technical_risk * 0.4 +
      risk.business_risk * 0.3 +
      risk.implementation_risk * 0.3
    );

    return risk;
  }

  /**
   * Identify prerequisites
   */
  identifyPrerequisites(match, context) {
    const prerequisites = [];

    // Technology prerequisites
    const technologyMatch = match.match_factors?.technology_match || 0;
    if (technologyMatch < 0.5) {
      prerequisites.push('Technology stack alignment may be required');
    }

    // Context completeness prerequisites
    const contextCompleteness = match.match_factors?.context_completeness || 0;
    if (contextCompleteness < 0.7) {
      prerequisites.push('Additional context information needed for optimal application');
    }

    // Pattern-specific prerequisites
    const patternType = match.metadata?.pattern_type;
    switch (patternType) {
      case 'security':
        prerequisites.push('Security review and approval required');
        break;
      case 'architecture':
        prerequisites.push('Architecture review and stakeholder alignment required');
        break;
    }

    return prerequisites;
  }

  /**
   * Define success criteria
   */
  defineSuccessCriteria(match) {
    const criteria = [];
    const patternType = match.metadata?.pattern_type;

    // Pattern-specific criteria
    switch (patternType) {
      case 'security':
        criteria.push('Security vulnerabilities reduced');
        criteria.push('Compliance requirements met');
        break;
      case 'architecture':
        criteria.push('System scalability improved');
        criteria.push('Code maintainability enhanced');
        break;
      case 'performance':
        criteria.push('Performance metrics improved by target percentage');
        criteria.push('Resource utilization optimized');
        break;
      case 'quality':
        criteria.push('Quality metrics meet or exceed targets');
        criteria.push('Defect rates reduced');
        break;
    }

    // General criteria
    criteria.push('Pattern successfully applied without errors');
    criteria.push('Team feedback positive or addressed');

    return criteria;
  }

  /**
   * Generate implementation steps
   */
  generateImplementationSteps(match, context) {
    const steps = [];
    const patternType = match.metadata?.pattern_type;

    // Generate steps based on pattern type
    switch (patternType) {
      case 'security':
        steps.push('Review security requirements and compliance');
        steps.push('Assess current security posture');
        steps.push('Design security implementation');
        steps.push('Implement security controls');
        steps.push('Test security implementation');
        steps.push('Document security changes');
        break;

      case 'architecture':
        steps.push('Analyze current architecture');
        steps.push('Design architectural changes');
        steps.push('Create implementation plan');
        steps.push('Implement architectural changes');
        steps.push('Update documentation');
        steps.push('Review with stakeholders');
        break;

      case 'performance':
        steps.push('Profile current performance');
        steps.push('Identify performance bottlenecks');
        steps.push('Design optimizations');
        steps.push('Implement performance improvements');
        steps.push('Test performance gains');
        steps.push('Monitor ongoing performance');
        break;

      default:
        steps.push('Review pattern requirements');
        steps.push('Plan implementation approach');
        steps.push('Implement pattern');
        steps.push('Test implementation');
        steps.push('Document changes');
    }

    return steps;
  }

  /**
   * Estimate effort
   */
  estimateEffort(match, context) {
    const baseEffort = 8; // Base hours
    const complexity = this.assessImplementationComplexity(match);
    const patternType = match.metadata?.pattern_type;

    let multiplier = 1;

    // Adjust by pattern type
    switch (patternType) {
      case 'architecture':
        multiplier = 1.5;
        break;
      case 'security':
        multiplier = 1.3;
        break;
      case 'performance':
        multiplier = 1.2;
        break;
    }

    // Adjust by complexity
    multiplier *= (1 + complexity * 0.5);

    // Adjust by team size
    if (context.team_size === 'large') {
      multiplier *= 0.8; // Large teams can parallelize work
    } else if (context.team_size === 'small') {
      multiplier *= 1.2; // Small teams may need more time
    }

    return Math.round(baseEffort * multiplier);
  }

  /**
   * Identify dependencies
   */
  identifyDependencies(match, context) {
    const dependencies = [];

    // Technology dependencies
    if (context.technology_stack) {
      context.technology_stack.forEach(tech => {
        dependencies.push(`Technology: ${tech}`);
      });
    }

    // Team dependencies
    if (context.team_size) {
      dependencies.push(`Team size: ${context.team_size}`);
    }

    // Infrastructure dependencies
    if (context.deployment_environment) {
      dependencies.push(`Infrastructure: ${context.deployment_environment}`);
    }

    return dependencies;
  }

  /**
   * Identify alternatives
   */
  identifyAlternatives(match, patternMatches) {
    const alternatives = [];
    const matches = patternMatches.matches || [];

    // Find similar patterns with different approaches
    matches.forEach(otherMatch => {
      if (otherMatch.pattern_id !== match.pattern_id &&
          otherMatch.metadata?.pattern_type === match.metadata?.pattern_type &&
          otherMatch.confidence_score > 0.5) {
        alternatives.push({
          pattern_id: otherMatch.pattern_id,
          pattern_name: otherMatch.pattern_name,
          confidence_score: otherMatch.confidence_score,
          rationale: `Alternative approach with ${Math.round(otherMatch.confidence_score * 100)}% confidence`
        });
      }
    });

    return alternatives;
  }

  /**
   * Extract contextual factors
   */
  extractContextualFactors(match, context) {
    const factors = {};

    // Technology alignment
    factors.technology_alignment = match.match_factors?.technology_match || 0;

    // Context completeness
    factors.context_completeness = match.match_factors?.context_completeness || 0;

    // Project characteristics
    factors.project_type = context.project_type;
    factors.team_size = context.team_size;
    factors.timeline = context.timeline;

    // Quality requirements
    factors.quality_requirements = context.quality_requirements;
    factors.security_level = context.security_level;

    return factors;
  }

  /**
   * Load business rules
   */
  loadBusinessRules() {
    // This would typically load from configuration files
    // For now, return some example rules
    return [
      {
        id: 'high_priority_security',
        type: 'score',
        condition: { pattern_type: 'security', security_level: 'high' },
        score_bonus: 20
      },
      {
        id: 'filter_low_confidence',
        type: 'filter',
        condition: { confidence_score: { $lt: 0.5 } }
      },
      {
        id: 'boost_architecture_large_team',
        type: 'score',
        condition: { pattern_type: 'architecture', team_size: 'large' },
        score_bonus: 15
      }
    ];
  }

  /**
   * Evaluate rule condition
   */
  evaluateRuleCondition(recommendation, condition, context) {
    // Simple condition evaluation
    for (const [key, value] of Object.entries(condition)) {
      if (typeof value === 'object' && value.$lt !== undefined) {
        if (recommendation[key] >= value.$lt) {
          return false;
        }
      } else if (recommendation[key] !== value && context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate pattern co-occurrence
   */
  calculatePatternCooccurrence(patternMatches) {
    // This would typically use historical data
    // For now, return mock data
    const cooccurrence = {};
    const matches = patternMatches.matches || [];

    matches.forEach(match => {
      cooccurrence[match.pattern_id] = Math.random() * 0.5 + 0.5;
    });

    return cooccurrence;
  }

  /**
   * Calculate content similarity
   */
  calculateContentSimilarity(recommendation, context) {
    // Simple similarity based on pattern type and context
    let similarity = 0.5;

    const patternType = recommendation.pattern_type;
    if (patternType === 'security' && context.security_level === 'high') {
      similarity += 0.3;
    }
    if (patternType === 'performance' && context.quality_requirements === 'high') {
      similarity += 0.2;
    }

    return Math.min(1, similarity);
  }

  /**
   * Assess context urgency
   */
  assessContextUrgency(context) {
    let urgency = 0.5;

    if (context.timeline === '1_month') {
      urgency += 0.3;
    }
    if (context.security_level === 'critical') {
      urgency += 0.2;
    }
    if (context.quality_requirements === 'critical') {
      urgency += 0.2;
    }

    return Math.min(1, urgency);
  }

  /**
   * Assess context importance
   */
  assessContextImportance(context) {
    let importance = 0.5;

    if (context.project_type === 'financial_system') {
      importance += 0.3;
    }
    if (context.data_sensitivity === 'financial_data') {
      importance += 0.2;
    }
    if (context.compliance_requirements?.length > 0) {
      importance += 0.2;
    }

    return Math.min(1, importance);
  }

  /**
   * Calculate context relevance
   */
  calculateContextRelevance(recommendation, context) {
    let relevance = 0.5;

    // Pattern type relevance
    const patternType = recommendation.pattern_type;
    if (patternType === 'security' && context.security_level !== 'basic') {
      relevance += 0.3;
    }
    if (patternType === 'performance' && context.quality_requirements === 'high') {
      relevance += 0.2;
    }

    return Math.min(1, relevance);
  }

  /**
   * Calculate business value
   */
  calculateBusinessValue(recommendation, context) {
    const impact = recommendation.expected_impact;
    const effort = recommendation.estimated_effort;

    // Simple business value calculation
    const impactScore = Object.values(impact).reduce((sum, val) => sum + val, 0);
    const efficiency = impactScore / effort;

    return efficiency * 100; // Scale to 0-100
  }

  /**
   * Calculate ROI
   */
  calculateROI(recommendation, context) {
    const businessValue = this.calculateBusinessValue(recommendation, context);
    const effort = recommendation.estimated_effort;

    // Assume some cost per hour
    const costPerHour = 50;
    const totalCost = effort * costPerHour;

    return businessValue > 0 ? (businessValue / totalCost) * 100 : 0;
  }

  /**
   * Analyze prioritization
   */
  analyzePrioritization(recommendations) {
    if (recommendations.length === 0) {
      return { strategy: 'none', distribution: {} };
    }

    const distribution = {};
    recommendations.forEach(rec => {
      const priority = rec.priority_score > 70 ? 'high' :
                      rec.priority_score > 40 ? 'medium' : 'low';
      distribution[priority] = (distribution[priority] || 0) + 1;
    });

    return {
      strategy: this.options.prioritizationStrategy,
      distribution,
      average_priority: recommendations.reduce((sum, rec) => sum + rec.priority_score, 0) / recommendations.length
    };
  }

  /**
   * Extract business context
   */
  extractBusinessContext(context) {
    return {
      project_type: context.project_type,
      team_size: context.team_size,
      timeline: context.timeline,
      budget: context.budget,
      compliance_requirements: context.compliance_requirements,
      business_objectives: context.business_objectives,
      risk_tolerance: context.risk_tolerance
    };
  }

  /**
   * Generate cache key
   */
  generateCacheKey(context, patternMatches) {
    const contextKey = JSON.stringify(context);
    const patternKey = patternMatches.matches?.map(m => m.pattern_id).sort().join(',') || '';
    return require('crypto').createHash('md5').update(contextKey + patternKey).digest('hex');
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(timestamp) {
    const age = Date.now() - new Date(timestamp).getTime();
    return age < (this.options.cacheTTL || 300000); // 5 minutes default
  }

  /**
   * Set cache entry
   */
  setCache(key, value) {
    if (this.recommendationCache.size >= this.options.recommendationCacheSize) {
      const firstKey = this.recommendationCache.keys().next().value;
      this.recommendationCache.delete(firstKey);
    }
    this.recommendationCache.set(key, value);
  }

  /**
   * Store recommendation history
   */
  storeRecommendationHistory(recommendation) {
    this.recommendationHistory.push({
      id: recommendation.recommendation_id,
      timestamp: recommendation.timestamp,
      context: recommendation.context,
      recommendations_count: recommendation.recommendations.length,
      top_recommendation: recommendation.recommendations[0]?.pattern_name
    });

    // Keep only recent history
    if (this.recommendationHistory.length > 100) {
      this.recommendationHistory.shift();
    }
  }

  /**
   * Get recommendation statistics
   */
  getStatistics() {
    return {
      cache_size: this.recommendationCache.size,
      history_size: this.recommendationHistory.length,
      external_sources_count: this.externalSources.size,
      business_rules_count: this.businessRules.length
    };
  }

  /**
   * Add external recommendation source
   */
  addExternalSource(name, source) {
    this.externalSources.set(name, source);
    this.emit('external_source_added', { name, source });
  }

  /**
   * Remove external recommendation source
   */
  removeExternalSource(name) {
    const removed = this.externalSources.delete(name);
    if (removed) {
      this.emit('external_source_removed', { name });
    }
    return removed;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.recommendationCache.clear();
    this.emit('cache_cleared');
  }

  /**
   * Get recommendation history
   */
  getRecommendationHistory(limit = 10) {
    return this.recommendationHistory.slice(-limit);
  }
}

module.exports = RecommendationEngine;