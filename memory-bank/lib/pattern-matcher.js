/**
 * Pattern Matcher
 *
 * Main interface for context-aware pattern matching system
 * Integrates context analysis, pattern matching, and decision making
 */

const EventEmitter = require('events');
const ContextAnalyzer = require('./context-analyzer');
const ContextMatcher = require('./context-matcher');

class PatternMatcher extends EventEmitter {
  constructor(options = {}) {
    super();

    // Initialize components
    this.contextAnalyzer = new ContextAnalyzer(options.contextAnalyzer || {});
    this.contextMatcher = new ContextMatcher(options.contextMatcher || {});

    // Configuration
    this.options = {
      enableCaching: options.enableCaching !== false,
      cacheSize: options.cacheSize || 100,
      cacheTTL: options.cacheTTL || 300000, // 5 minutes
      maxConcurrentMatches: options.maxConcurrentMatches || 5,
      decisionThreshold: options.decisionThreshold || 0.7,
      ...options
    };

    // Cache for analysis results
    this.analysisCache = new Map();
    this.matchingCache = new Map();

    // Active matching operations
    this.activeMatches = new Map();

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers from child components
   */
  bindEventHandlers() {
    // Context analyzer events
    this.contextAnalyzer.on('context_analyzed', (analysis) => {
      this.emit('context_analyzed', analysis);
    });

    this.contextAnalyzer.on('context_analysis_failed', (error) => {
      this.emit('context_analysis_failed', error);
    });

    // Context matcher events
    this.contextMatcher.on('context_matched', (matching) => {
      this.emit('context_matched', matching);
    });

    this.contextMatcher.on('context_matching_failed', (error) => {
      this.emit('context_matching_failed', error);
    });
  }

  /**
   * Match patterns for current context
   */
  async matchPatterns(rawContext = {}, options = {}) {
    const matchingId = `pattern_match_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const patternMatching = {
      matching_id: matchingId,
      timestamp: new Date().toISOString(),
      raw_context: rawContext,
      context_analysis: null,
      pattern_matches: null,
      recommendations: [],
      decision: null,
      metadata: {}
    };

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(rawContext);
      if (this.options.enableCaching && this.matchingCache.has(cacheKey)) {
        const cached = this.matchingCache.get(cacheKey);
        if (this.isCacheValid(cached.timestamp)) {
          this.emit('patterns_matched_from_cache', cached);
          return cached;
        }
      }

      // Start matching operation
      this.activeMatches.set(matchingId, patternMatching);

      // Step 1: Analyze context
      patternMatching.context_analysis = await this.contextAnalyzer.analyzeContext(
        rawContext,
        options.contextAnalysis || {}
      );

      // Step 2: Match patterns with context
      patternMatching.pattern_matches = await this.contextMatcher.matchContextWithPatterns(
        patternMatching.context_analysis,
        options.patternMatching || {}
      );

      // Step 3: Generate recommendations
      patternMatching.recommendations = this.generateRecommendations(
        patternMatching.context_analysis,
        patternMatching.pattern_matches,
        options
      );

      // Step 4: Make decision
      patternMatching.decision = this.makeDecision(
        patternMatching.context_analysis,
        patternMatching.pattern_matches,
        patternMatching.recommendations,
        options
      );

      // Add metadata
      patternMatching.metadata = {
        total_patterns_found: patternMatching.pattern_matches.matches.length,
        recommendations_count: patternMatching.recommendations.length,
        decision_confidence: patternMatching.decision.confidence,
        processing_duration_ms: Date.now() - new Date(patternMatching.timestamp).getTime(),
        cache_used: false
      };

      // Cache the result
      if (this.options.enableCaching) {
        this.setCache(cacheKey, patternMatching);
      }

      // Clean up active match
      this.activeMatches.delete(matchingId);

      this.emit('patterns_matched', patternMatching);

      return patternMatching;

    } catch (error) {
      patternMatching.error = error.message;
      this.activeMatches.delete(matchingId);

      this.emit('pattern_matching_failed', {
        matching_id: matchingId,
        error: error.message,
        raw_context: rawContext
      });

      throw error;
    }
  }

  /**
   * Generate recommendations based on context and matches
   */
  generateRecommendations(contextAnalysis, patternMatches, options = {}) {
    const recommendations = [];
    const matches = patternMatches.matches || [];

    // Sort matches by relevance score
    const sortedMatches = [...matches].sort((a, b) => b.relevance_score - a.relevance_score);

    // Generate recommendations for top matches
    const maxRecommendations = options.maxRecommendations || 5;
    const topMatches = sortedMatches.slice(0, maxRecommendations);

    topMatches.forEach((match, index) => {
      const recommendation = this.createRecommendation(match, contextAnalysis, index + 1);
      recommendations.push(recommendation);
    });

    // Add context-based recommendations
    const contextRecommendations = this.generateContextRecommendations(contextAnalysis);
    recommendations.push(...contextRecommendations);

    // Sort recommendations by priority
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations;
  }

  /**
   * Create a recommendation from a pattern match
   */
  createRecommendation(match, contextAnalysis, rank) {
    const pattern = match; // The match object contains pattern info

    const recommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      rank: rank,
      pattern_id: match.pattern_id,
      pattern_name: match.pattern_name,
      confidence_score: match.confidence_score,
      relevance_score: match.relevance_score,
      similarity_score: match.similarity_score,
      priority: this.calculateRecommendationPriority(match, contextAnalysis),
      type: this.determineRecommendationType(match),
      action: this.generateRecommendedAction(match, contextAnalysis),
      rationale: this.generateRecommendationRationale(match, contextAnalysis),
      expected_impact: this.assessExpectedImpact(match, contextAnalysis),
      implementation_complexity: this.assessImplementationComplexity(match),
      risk_assessment: this.assessRecommendationRisk(match, contextAnalysis),
      prerequisites: this.identifyPrerequisites(match, contextAnalysis),
      success_criteria: this.defineSuccessCriteria(match),
      metadata: {
        pattern_type: match.metadata?.pattern_type,
        last_applied: match.metadata?.last_applied,
        total_applications: match.metadata?.total_applications || 0,
        match_factors: match.match_factors,
        context_coverage: match.context_coverage
      }
    };

    return recommendation;
  }

  /**
   * Calculate recommendation priority
   */
  calculateRecommendationPriority(match, contextAnalysis) {
    let priority = 0;

    // Base priority from relevance score
    priority += match.relevance_score * 40;

    // Boost for high confidence patterns
    if (match.confidence_score > 0.8) {
      priority += 20;
    } else if (match.confidence_score > 0.6) {
      priority += 10;
    }

    // Boost for security patterns
    if (match.metadata?.pattern_type === 'security') {
      priority += 15;
    }

    // Boost for architecture patterns
    if (match.metadata?.pattern_type === 'architecture') {
      priority += 10;
    }

    // Context urgency factors
    if (contextAnalysis.context_risks && contextAnalysis.context_risks.length > 0) {
      priority += 10;
    }

    // Implementation complexity penalty
    const complexity = this.assessImplementationComplexity(match);
    if (complexity > 0.7) {
      priority -= 10;
    }

    return Math.max(0, Math.min(100, priority));
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
      default:
        return 'general_improvement';
    }
  }

  /**
   * Generate recommended action
   */
  generateRecommendedAction(match, contextAnalysis) {
    const pattern = match;

    // This would typically come from pattern definition
    // For now, generate based on pattern type and context
    const actions = {
      security: `Implement security pattern: ${pattern.pattern_name}`,
      architecture: `Apply architectural pattern: ${pattern.pattern_name}`,
      performance: `Optimize performance using: ${pattern.pattern_name}`,
      quality: `Enhance quality with: ${pattern.pattern_name}`,
      development: `Adopt development practice: ${pattern.pattern_name}`
    };

    const patternType = match.metadata?.pattern_type;
    return actions[patternType] || `Apply pattern: ${pattern.pattern_name}`;
  }

  /**
   * Generate recommendation rationale
   */
  generateRecommendationRationale(match, contextAnalysis) {
    const factors = [];

    // Similarity factors
    if (match.similarity_score > 0.8) {
      factors.push('High similarity to current context');
    } else if (match.similarity_score > 0.6) {
      factors.push('Moderate similarity to current context');
    }

    // Confidence factors
    if (match.confidence_score > 0.8) {
      factors.push('High confidence based on historical success');
    } else if (match.confidence_score > 0.6) {
      factors.push('Good confidence based on historical performance');
    }

    // Match factors
    const matchFactors = match.match_factors || {};
    if (matchFactors.technology_match > 0.7) {
      factors.push('Strong technology stack alignment');
    }
    if (matchFactors.context_completeness > 0.8) {
      factors.push('Comprehensive context coverage');
    }
    if (matchFactors.pattern_maturity > 0.7) {
      factors.push('Mature, well-tested pattern');
    }

    // Context insights
    const insights = contextAnalysis.context_insights || [];
    insights.forEach(insight => {
      if (insight.relevance > 0.7) {
        factors.push(insight.description);
      }
    });

    return factors.join('. ') + '.';
  }

  /**
   * Assess expected impact
   */
  assessExpectedImpact(match, contextAnalysis) {
    let impact = {
      quality: 0,
      performance: 0,
      security: 0,
      maintainability: 0,
      development_speed: 0
    };

    const patternType = match.metadata?.pattern_type;

    // Base impact by pattern type
    switch (patternType) {
      case 'security':
        impact.security = 0.8;
        impact.quality = 0.6;
        break;
      case 'architecture':
        impact.quality = 0.7;
        impact.maintainability = 0.8;
        impact.performance = 0.5;
        break;
      case 'performance':
        impact.performance = 0.9;
        impact.quality = 0.4;
        break;
      case 'quality':
        impact.quality = 0.8;
        impact.maintainability = 0.6;
        break;
      case 'development':
        impact.development_speed = 0.7;
        impact.quality = 0.5;
        break;
    }

    // Adjust based on context
    const contextQuality = contextAnalysis.context_quality || {};
    if (contextQuality.overall_score < 0.6) {
      // Low quality context - higher potential impact
      Object.keys(impact).forEach(key => {
        impact[key] *= 1.2;
      });
    }

    return impact;
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
  assessRecommendationRisk(match, contextAnalysis) {
    let risk = {
      technical_risk: 0,
      business_risk: 0,
      implementation_risk: 0,
      overall_risk: 0
    };

    // Pattern risk
    const characteristics = match.pattern_characteristics || {};
    risk.technical_risk = characteristics.risk_level;

    // Context risk
    const contextRisks = contextAnalysis.context_risks || [];
    risk.business_risk = contextRisks.length > 0 ? 0.6 : 0.2;

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
  identifyPrerequisites(match, contextAnalysis) {
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

    // Pattern-specific criteria
    const patternType = match.metadata?.pattern_type;
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
   * Generate context-based recommendations
   */
  generateContextRecommendations(contextAnalysis) {
    const recommendations = [];

    // Context quality recommendations
    const contextQuality = contextAnalysis.context_quality || {};
    if (contextQuality.overall_score < 0.7) {
      recommendations.push({
        id: `context_rec_${Date.now()}_quality`,
        type: 'context_improvement',
        priority: 80,
        action: 'Improve context completeness',
        rationale: 'Context analysis shows incomplete information affecting pattern matching accuracy',
        expected_impact: { quality: 0.6, development_speed: 0.4 },
        prerequisites: ['Gather additional project context information']
      });
    }

    // Context risk recommendations
    const contextRisks = contextAnalysis.context_risks || [];
    if (contextRisks.length > 0) {
      recommendations.push({
        id: `context_rec_${Date.now()}_risk`,
        type: 'risk_mitigation',
        priority: 90,
        action: 'Address identified context risks',
        rationale: `Context analysis identified ${contextRisks.length} risk factors that should be addressed`,
        expected_impact: { security: 0.5, quality: 0.4 },
        prerequisites: ['Review and address context risks']
      });
    }

    return recommendations;
  }

  /**
   * Make decision based on analysis and matches
   */
  makeDecision(contextAnalysis, patternMatches, recommendations, options = {}) {
    const decision = {
      decision_id: `decision_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      decision_type: 'pattern_application',
      confidence: 0,
      recommended_patterns: [],
      decision_logic: '',
      rationale: '',
      alternatives_considered: [],
      risk_assessment: {},
      implementation_plan: {}
    };

    // Get top recommendations
    const topRecommendations = recommendations
      .filter(rec => rec.type !== 'context_improvement' && rec.type !== 'risk_mitigation')
      .slice(0, 3);

    if (topRecommendations.length === 0) {
      decision.decision_type = 'no_action';
      decision.confidence = 0.8;
      decision.decision_logic = 'no_suitable_patterns';
      decision.rationale = 'No patterns meet the minimum confidence threshold for application';
      return decision;
    }

    // Primary recommendation
    const primaryRec = topRecommendations[0];
    decision.recommended_patterns = topRecommendations.map(rec => ({
      pattern_id: rec.pattern_id,
      pattern_name: rec.pattern_name,
      confidence_score: rec.confidence_score,
      priority: rec.priority,
      expected_impact: rec.expected_impact
    }));

    // Calculate overall confidence
    decision.confidence = this.calculateDecisionConfidence(topRecommendations, contextAnalysis);

    // Decision logic
    if (decision.confidence > this.options.decisionThreshold) {
      decision.decision_type = 'apply_pattern';
      decision.decision_logic = 'high_confidence_match';
      decision.rationale = `Strong match found with ${primaryRec.pattern_name} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`;
    } else if (decision.confidence > this.options.decisionThreshold * 0.7) {
      decision.decision_type = 'review_pattern';
      decision.decision_logic = 'moderate_confidence_match';
      decision.rationale = `Moderate match found with ${primaryRec.pattern_name} - requires review (confidence: ${(decision.confidence * 100).toFixed(1)}%)`;
    } else {
      decision.decision_type = 'gather_more_context';
      decision.decision_logic = 'insufficient_confidence';
      decision.rationale = 'Insufficient confidence for pattern application - more context needed';
    }

    // Risk assessment
    decision.risk_assessment = this.assessDecisionRisk(topRecommendations, contextAnalysis);

    // Implementation plan
    decision.implementation_plan = this.createImplementationPlan(topRecommendations, contextAnalysis);

    return decision;
  }

  /**
   * Calculate decision confidence
   */
  calculateDecisionConfidence(recommendations, contextAnalysis) {
    if (recommendations.length === 0) return 0;

    const primaryRec = recommendations[0];

    let confidence = primaryRec.confidence_score * 0.5;
    confidence += primaryRec.relevance_score * 0.3;
    confidence += (primaryRec.priority / 100) * 0.2;

    // Context quality bonus
    const contextQuality = contextAnalysis.context_quality?.overall_score || 0.5;
    confidence *= (0.8 + contextQuality * 0.4);

    return Math.min(1, confidence);
  }

  /**
   * Assess decision risk
   */
  assessDecisionRisk(recommendations, contextAnalysis) {
    if (recommendations.length === 0) {
      return { overall_risk: 0, risk_factors: [] };
    }

    const primaryRec = recommendations[0];
    const risk = primaryRec.risk_assessment || {};

    // Add context risk factors
    const contextRisks = contextAnalysis.context_risks || [];
    if (contextRisks.length > 0) {
      risk.business_risk = (risk.business_risk || 0) + 0.2;
    }

    // Calculate overall risk
    risk.overall_risk = (
      risk.technical_risk * 0.4 +
      risk.business_risk * 0.3 +
      risk.implementation_risk * 0.3
    );

    return risk;
  }

  /**
   * Create implementation plan
   */
  createImplementationPlan(recommendations, contextAnalysis) {
    if (recommendations.length === 0) {
      return { steps: [], estimated_effort: 0, dependencies: [] };
    }

    const primaryRec = recommendations[0];
    const plan = {
      steps: [],
      estimated_effort: 0,
      dependencies: primaryRec.prerequisites || [],
      success_criteria: primaryRec.success_criteria || []
    };

    // Generate implementation steps based on pattern type
    const patternType = primaryRec.metadata?.pattern_type;
    switch (patternType) {
      case 'security':
        plan.steps = [
          'Review security requirements and compliance',
          'Assess current security posture',
          'Design security implementation',
          'Implement security controls',
          'Test security implementation',
          'Document security changes'
        ];
        plan.estimated_effort = 16; // hours
        break;

      case 'architecture':
        plan.steps = [
          'Analyze current architecture',
          'Design architectural changes',
          'Create implementation plan',
          'Implement architectural changes',
          'Update documentation',
          'Review with stakeholders'
        ];
        plan.estimated_effort = 24; // hours
        break;

      case 'performance':
        plan.steps = [
          'Profile current performance',
          'Identify performance bottlenecks',
          'Design optimizations',
          'Implement performance improvements',
          'Test performance gains',
          'Monitor ongoing performance'
        ];
        plan.estimated_effort = 12; // hours
        break;

      default:
        plan.steps = [
          'Review pattern requirements',
          'Plan implementation approach',
          'Implement pattern',
          'Test implementation',
          'Document changes'
        ];
        plan.estimated_effort = 8; // hours
    }

    return plan;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(context) {
    const key = JSON.stringify(context);
    return require('crypto').createHash('md5').update(key).digest('hex');
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(timestamp) {
    const age = Date.now() - new Date(timestamp).getTime();
    return age < this.options.cacheTTL;
  }

  /**
   * Set cache entry
   */
  setCache(key, value) {
    // Implement LRU-style cache eviction
    if (this.matchingCache.size >= this.options.cacheSize) {
      const firstKey = this.matchingCache.keys().next().value;
      this.matchingCache.delete(firstKey);
    }
    this.matchingCache.set(key, value);
  }

  /**
   * Get matching statistics
   */
  getStatistics() {
    return {
      cache_size: this.matchingCache.size,
      active_matches: this.activeMatches.size,
      cache_hit_rate: this.calculateCacheHitRate(),
      average_processing_time: this.calculateAverageProcessingTime()
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    // This would require tracking cache hits/misses
    // For now, return a placeholder
    return 0.75;
  }

  /**
   * Calculate average processing time
   */
  calculateAverageProcessingTime() {
    // This would require tracking processing times
    // For now, return a placeholder
    return 150; // milliseconds
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.matchingCache.clear();
    this.analysisCache.clear();
    this.emit('cache_cleared');
  }

  /**
   * Get active matching operations
   */
  getActiveMatches() {
    return Array.from(this.activeMatches.values());
  }
}

module.exports = PatternMatcher;