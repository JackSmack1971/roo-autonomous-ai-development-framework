/**
 * Context Matcher
 *
 * Matches current project context with relevant patterns using
 * similarity algorithms and relevance scoring
 */

const EventEmitter = require('events');

class ContextMatcher extends EventEmitter {
  constructor(options = {}) {
    super();

    this.similarityThreshold = options.similarityThreshold || 0.6;
    this.maxMatches = options.maxMatches || 10;
    this.relevanceWeight = options.relevanceWeight || 0.7;
    this.confidenceWeight = options.confidenceWeight || 0.3;
    this.patternStorage = options.patternStorage || null;

    // Similarity algorithms available
    this.similarityAlgorithms = {
      cosine: this.cosineSimilarity.bind(this),
      jaccard: this.jaccardSimilarity.bind(this),
      euclidean: this.euclideanSimilarity.bind(this),
      weighted_overlap: this.weightedOverlapSimilarity.bind(this)
    };

    this.defaultAlgorithm = options.defaultAlgorithm || 'weighted_overlap';
  }

  /**
   * Match context with relevant patterns
   */
  async matchContextWithPatterns(context, options = {}) {
    const matchingId = `matching_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const matching = {
      matching_id: matchingId,
      timestamp: new Date().toISOString(),
      context: context,
      algorithm: options.algorithm || this.defaultAlgorithm,
      threshold: options.threshold || this.similarityThreshold,
      matches: [],
      statistics: {},
      metadata: {}
    };

    try {
      // Get all available patterns
      const patterns = await this.getAvailablePatterns(options);

      // Calculate matches for each pattern
      const matches = [];
      for (const pattern of patterns) {
        const match = await this.calculatePatternMatch(pattern, context, options);
        if (match.similarity_score >= matching.threshold) {
          matches.push(match);
        }
      }

      // Sort matches by relevance score
      matches.sort((a, b) => b.relevance_score - a.relevance_score);

      // Apply maximum matches limit
      matching.matches = matches.slice(0, options.maxMatches || this.maxMatches);

      // Calculate matching statistics
      matching.statistics = this.calculateMatchingStatistics(matches, context);

      // Add metadata
      matching.metadata = {
        total_patterns_evaluated: patterns.length,
        matches_found: matching.matches.length,
        average_similarity: this.calculateAverageSimilarity(matching.matches),
        matching_duration_ms: Date.now() - new Date(matching.timestamp).getTime()
      };

      this.emit('context_matched', matching);

      return matching;

    } catch (error) {
      matching.error = error.message;
      this.emit('context_matching_failed', {
        matching_id: matchingId,
        error: error.message,
        context: context
      });
      throw error;
    }
  }

  /**
   * Get available patterns for matching
   */
  async getAvailablePatterns(options = {}) {
    if (this.patternStorage) {
      // Use integrated pattern storage
      const filters = options.filters || {};
      return await this.patternStorage.getPatterns(filters);
    } else {
      // Return empty array if no pattern storage available
      // In a real implementation, this would integrate with the pattern storage system
      return [];
    }
  }

  /**
   * Calculate match between pattern and context
   */
  async calculatePatternMatch(pattern, context, options = {}) {
    const algorithm = options.algorithm || this.defaultAlgorithm;
    const similarityAlgorithm = this.similarityAlgorithms[algorithm];

    if (!similarityAlgorithm) {
      throw new Error(`Unknown similarity algorithm: ${algorithm}`);
    }

    // Calculate similarity score
    const similarityScore = await similarityAlgorithm(pattern, context);

    // Calculate confidence score
    const confidenceScore = pattern.confidence_score || 0;

    // Calculate relevance score (weighted combination)
    const relevanceScore = (
      similarityScore * this.relevanceWeight +
      confidenceScore * this.confidenceWeight
    ) / (this.relevanceWeight + this.confidenceWeight);

    // Create match object
    const match = {
      pattern_id: pattern.id,
      pattern_name: pattern.name,
      similarity_score: similarityScore,
      confidence_score: confidenceScore,
      relevance_score: relevanceScore,
      algorithm_used: algorithm,
      match_factors: this.analyzeMatchFactors(pattern, context),
      context_coverage: this.calculateContextCoverage(pattern, context),
      pattern_characteristics: this.extractPatternCharacteristics(pattern),
      metadata: {
        pattern_type: pattern.metadata?.pattern_type,
        success_rate: pattern.success_rate,
        last_applied: pattern.metadata?.last_applied,
        total_applications: pattern.metadata?.usage_statistics?.total_applications || 0
      }
    };

    return match;
  }

  /**
   * Cosine similarity algorithm
   */
  async cosineSimilarity(pattern, context) {
    // Convert pattern and context to vectors
    const patternVector = this.patternToVector(pattern);
    const contextVector = this.contextToVector(context);

    // Calculate cosine similarity
    const dotProduct = this.dotProduct(patternVector, contextVector);
    const patternMagnitude = this.magnitude(patternVector);
    const contextMagnitude = this.magnitude(contextVector);

    if (patternMagnitude === 0 || contextMagnitude === 0) {
      return 0;
    }

    return dotProduct / (patternMagnitude * contextMagnitude);
  }

  /**
   * Jaccard similarity algorithm
   */
  async jaccardSimilarity(pattern, context) {
    // Convert to sets of features
    const patternFeatures = this.patternToFeatureSet(pattern);
    const contextFeatures = this.contextToFeatureSet(context);

    // Calculate Jaccard similarity
    const intersection = new Set([...patternFeatures].filter(x => contextFeatures.has(x)));
    const union = new Set([...patternFeatures, ...contextFeatures]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }

  /**
   * Euclidean similarity algorithm
   */
  async euclideanSimilarity(pattern, context) {
    const patternVector = this.patternToVector(pattern);
    const contextVector = this.contextToVector(context);

    // Calculate Euclidean distance
    const distance = this.euclideanDistance(patternVector, contextVector);

    // Convert distance to similarity (higher values = more similar)
    const maxPossibleDistance = Math.sqrt(patternVector.length + contextVector.length);
    const similarity = 1 - (distance / maxPossibleDistance);

    return Math.max(0, similarity);
  }

  /**
   * Weighted overlap similarity algorithm
   */
  async weightedOverlapSimilarity(pattern, context) {
    const patternContext = pattern.context_match || {};
    const requiredFields = patternContext.required_fields || [];
    const optionalFields = patternContext.optional_fields || [];
    const excludedFields = patternContext.excluded_fields || [];

    let score = 0;
    let maxScore = 0;

    // Required fields (high weight)
    for (const field of requiredFields) {
      maxScore += 3;
      if (this.contextHasField(context, field)) {
        score += 3;
      }
    }

    // Optional fields (medium weight)
    for (const field of optionalFields) {
      maxScore += 2;
      if (this.contextHasField(context, field)) {
        score += 2;
      }
    }

    // Excluded fields (negative weight)
    for (const field of excludedFields) {
      if (this.contextHasField(context, field)) {
        score -= 2;
        maxScore += 1;
      }
    }

    // Context filters
    const contextFilters = patternContext.context_filters || {};
    const filterScore = this.evaluateContextFilters(contextFilters, context);
    score += filterScore.score * 2;
    maxScore += filterScore.maxScore * 2;

    // Similarity threshold adjustment
    const similarityThreshold = patternContext.similarity_threshold || 0.7;
    const rawScore = maxScore > 0 ? score / maxScore : 0;

    return Math.max(similarityThreshold, rawScore);
  }

  /**
   * Convert pattern to vector representation
   */
  patternToVector(pattern) {
    const vector = [];

    // Technology stack
    const techStack = pattern.metadata?.tags || [];
    techStack.forEach(tech => {
      vector.push(tech.toLowerCase());
    });

    // Pattern type
    if (pattern.metadata?.pattern_type) {
      vector.push(`type_${pattern.metadata.pattern_type}`);
    }

    // Trigger conditions
    const triggers = pattern.trigger_conditions || [];
    triggers.forEach(trigger => {
      vector.push(`trigger_${trigger}`);
    });

    return vector;
  }

  /**
   * Convert context to vector representation
   */
  contextToVector(context) {
    const vector = [];

    // Technology stack
    if (context.technology_stack && Array.isArray(context.technology_stack)) {
      context.technology_stack.forEach(tech => {
        vector.push(tech.toLowerCase());
      });
    }

    // Project characteristics
    ['project_type', 'team_size', 'architecture_pattern'].forEach(field => {
      if (context[field]) {
        vector.push(`${field}_${context[field]}`);
      }
    });

    // Other relevant fields
    ['data_sensitivity', 'deployment_environment', 'security_level'].forEach(field => {
      if (context[field]) {
        vector.push(`${field}_${context[field]}`);
      }
    });

    return vector;
  }

  /**
   * Convert pattern to feature set
   */
  patternToFeatureSet(pattern) {
    const features = new Set();

    // Add pattern metadata
    if (pattern.metadata?.pattern_type) {
      features.add(`type_${pattern.metadata.pattern_type}`);
    }

    // Add trigger conditions
    const triggers = pattern.trigger_conditions || [];
    triggers.forEach(trigger => {
      features.add(`trigger_${trigger}`);
    });

    // Add tags
    const tags = pattern.metadata?.tags || [];
    tags.forEach(tag => {
      features.add(`tag_${tag}`);
    });

    return features;
  }

  /**
   * Convert context to feature set
   */
  contextToFeatureSet(context) {
    const features = new Set();

    // Add technology stack
    if (context.technology_stack && Array.isArray(context.technology_stack)) {
      context.technology_stack.forEach(tech => {
        features.add(`tech_${tech.toLowerCase()}`);
      });
    }

    // Add project characteristics
    ['project_type', 'team_size', 'architecture_pattern', 'data_sensitivity'].forEach(field => {
      if (context[field]) {
        features.add(`${field}_${context[field]}`);
      }
    });

    return features;
  }

  /**
   * Check if context has a specific field
   */
  contextHasField(context, fieldName) {
    const value = context[fieldName];
    return value !== undefined && value !== null && value !== '';
  }

  /**
   * Evaluate context filters
   */
  evaluateContextFilters(filters, context) {
    let score = 0;
    let maxScore = 0;

    // Technology stack filter
    if (filters.technology_stack) {
      maxScore += 2;
      const contextTech = context.technology_stack || [];
      const hasMatchingTech = filters.technology_stack.some(tech =>
        contextTech.some(ctxTech => ctxTech.toLowerCase().includes(tech.toLowerCase()))
      );
      if (hasMatchingTech) {
        score += 2;
      }
    }

    // Project type filter
    if (filters.project_type) {
      maxScore += 1;
      if (filters.project_type.includes(context.project_type)) {
        score += 1;
      }
    }

    // Team size filter
    if (filters.team_size) {
      maxScore += 1;
      if (filters.team_size === context.team_size) {
        score += 1;
      }
    }

    return { score, maxScore };
  }

  /**
   * Analyze match factors
   */
  analyzeMatchFactors(pattern, context) {
    const factors = {
      technology_match: this.calculateTechnologyMatch(pattern, context),
      context_completeness: this.calculateContextCompleteness(pattern, context),
      pattern_maturity: this.calculatePatternMaturity(pattern),
      historical_performance: this.calculateHistoricalPerformance(pattern)
    };

    return factors;
  }

  /**
   * Calculate technology match
   */
  calculateTechnologyMatch(pattern, context) {
    const patternTech = pattern.metadata?.tags || [];
    const contextTech = context.technology_stack || [];

    if (patternTech.length === 0 || contextTech.length === 0) {
      return 0.5; // Neutral score when technology info is missing
    }

    const matches = patternTech.filter(pTech =>
      contextTech.some(cTech => cTech.toLowerCase().includes(pTech.toLowerCase()))
    );

    return matches.length / Math.max(patternTech.length, contextTech.length);
  }

  /**
   * Calculate context completeness
   */
  calculateContextCompleteness(pattern, context) {
    const patternContext = pattern.context_match || {};
    const requiredFields = patternContext.required_fields || [];
    const optionalFields = patternContext.optional_fields || [];

    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach(field => {
      if (this.contextHasField(context, field)) {
        filledRequired++;
      }
    });

    optionalFields.forEach(field => {
      if (this.contextHasField(context, field)) {
        filledOptional++;
      }
    });

    const requiredScore = requiredFields.length > 0 ? filledRequired / requiredFields.length : 1;
    const optionalScore = optionalFields.length > 0 ? filledOptional / optionalFields.length : 1;

    return (requiredScore * 0.7) + (optionalScore * 0.3);
  }

  /**
   * Calculate pattern maturity
   */
  calculatePatternMaturity(pattern) {
    const applications = pattern.metadata?.usage_statistics?.total_applications || 0;
    const age = pattern.metadata?.created_at ?
      (Date.now() - new Date(pattern.metadata.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;

    if (applications >= 10 && age >= 30) {
      return 0.9; // Mature
    } else if (applications >= 5 && age >= 14) {
      return 0.7; // Established
    } else if (applications >= 3 && age >= 7) {
      return 0.5; // Developing
    } else {
      return 0.3; // New
    }
  }

  /**
   * Calculate historical performance
   */
  calculateHistoricalPerformance(pattern) {
    const successRate = pattern.success_rate || 0;
    const totalApplications = pattern.metadata?.usage_statistics?.total_applications || 0;

    if (totalApplications < 3) {
      return 0.5; // Insufficient data
    }

    // Weight recent performance more heavily
    return successRate * 0.8 + (totalApplications / 100) * 0.2;
  }

  /**
   * Calculate context coverage
   */
  calculateContextCoverage(pattern, context) {
    const patternContext = pattern.context_match || {};
    const allFields = [
      ...(patternContext.required_fields || []),
      ...(patternContext.optional_fields || [])
    ];

    if (allFields.length === 0) {
      return 1; // No specific context requirements
    }

    let coveredFields = 0;
    allFields.forEach(field => {
      if (this.contextHasField(context, field)) {
        coveredFields++;
      }
    });

    return coveredFields / allFields.length;
  }

  /**
   * Extract pattern characteristics
   */
  extractPatternCharacteristics(pattern) {
    return {
      pattern_type: pattern.metadata?.pattern_type || 'unknown',
      complexity: this.assessPatternComplexity(pattern),
      risk_level: this.assessPatternRisk(pattern),
      applicability: this.assessPatternApplicability(pattern),
      maintenance_cost: this.assessMaintenanceCost(pattern)
    };
  }

  /**
   * Assess pattern complexity
   */
  assessPatternComplexity(pattern) {
    const triggerCount = pattern.trigger_conditions?.length || 0;
    const actionCount = pattern.auto_apply_actions?.length || 0;
    const qualityGateCount = pattern.quality_gates?.length || 0;

    const complexity = (triggerCount + actionCount + qualityGateCount) / 10;
    return Math.min(1, complexity);
  }

  /**
   * Assess pattern risk
   */
  assessPatternRisk(pattern) {
    let riskScore = 0;

    // Security patterns are higher risk
    if (pattern.metadata?.pattern_type === 'security') {
      riskScore += 0.3;
    }

    // Architecture patterns are higher risk
    if (pattern.metadata?.pattern_type === 'architecture') {
      riskScore += 0.2;
    }

    // Complex patterns are higher risk
    const complexity = this.assessPatternComplexity(pattern);
    riskScore += complexity * 0.2;

    // Low confidence patterns are higher risk
    if (pattern.confidence_score < 0.6) {
      riskScore += 0.2;
    }

    return Math.min(1, riskScore);
  }

  /**
   * Assess pattern applicability
   */
  assessPatternApplicability(pattern) {
    const successRate = pattern.success_rate || 0;
    const confidenceScore = pattern.confidence_score || 0;
    const totalApplications = pattern.metadata?.usage_statistics?.total_applications || 0;

    // Applicability increases with success, confidence, and usage
    const applicability = (
      successRate * 0.4 +
      confidenceScore * 0.4 +
      Math.min(1, totalApplications / 20) * 0.2
    );

    return Math.min(1, applicability);
  }

  /**
   * Assess maintenance cost
   */
  assessMaintenanceCost(pattern) {
    let costScore = 0.5; // Base cost

    // Complex patterns have higher maintenance cost
    const complexity = this.assessPatternComplexity(pattern);
    costScore += complexity * 0.3;

    // Security patterns have higher maintenance cost
    if (pattern.metadata?.pattern_type === 'security') {
      costScore += 0.2;
    }

    // Patterns with many quality gates have higher maintenance cost
    const qualityGateCount = pattern.quality_gates?.length || 0;
    costScore += (qualityGateCount / 10) * 0.2;

    return Math.min(1, costScore);
  }

  /**
   * Calculate matching statistics
   */
  calculateMatchingStatistics(matches, context) {
    if (matches.length === 0) {
      return {
        total_matches: 0,
        average_similarity: 0,
        average_confidence: 0,
        average_relevance: 0,
        pattern_type_distribution: {},
        top_match_factors: []
      };
    }

    const totalMatches = matches.length;
    const averageSimilarity = matches.reduce((sum, match) => sum + match.similarity_score, 0) / totalMatches;
    const averageConfidence = matches.reduce((sum, match) => sum + match.confidence_score, 0) / totalMatches;
    const averageRelevance = matches.reduce((sum, match) => sum + match.relevance_score, 0) / totalMatches;

    // Pattern type distribution
    const patternTypeDistribution = matches.reduce((dist, match) => {
      const type = match.metadata?.pattern_type || 'unknown';
      dist[type] = (dist[type] || 0) + 1;
      return dist;
    }, {});

    // Top match factors
    const topMatchFactors = this.identifyTopMatchFactors(matches);

    return {
      total_matches: totalMatches,
      average_similarity: averageSimilarity,
      average_confidence: averageConfidence,
      average_relevance: averageRelevance,
      pattern_type_distribution: patternTypeDistribution,
      top_match_factors: topMatchFactors
    };
  }

  /**
   * Identify top match factors
   */
  identifyTopMatchFactors(matches) {
    const factorCounts = {};

    matches.forEach(match => {
      const factors = match.match_factors || {};
      Object.keys(factors).forEach(factor => {
        if (factors[factor] > 0.7) { // Only count strong factors
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        }
      });
    });

    return Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([factor, count]) => ({ factor, count, percentage: count / matches.length }));
  }

  /**
   * Calculate average similarity
   */
  calculateAverageSimilarity(matches) {
    if (matches.length === 0) return 0;
    return matches.reduce((sum, match) => sum + match.similarity_score, 0) / matches.length;
  }

  /**
   * Utility functions
   */
  dotProduct(vectorA, vectorB) {
    let product = 0;
    const length = Math.min(vectorA.length, vectorB.length);
    for (let i = 0; i < length; i++) {
      product += vectorA[i] * vectorB[i];
    }
    return product;
  }

  magnitude(vector) {
    let sum = 0;
    for (const value of vector) {
      sum += value * value;
    }
    return Math.sqrt(sum);
  }

  euclideanDistance(vectorA, vectorB) {
    let sum = 0;
    const length = Math.min(vectorA.length, vectorB.length);
    for (let i = 0; i < length; i++) {
      const diff = vectorA[i] - vectorB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}

module.exports = ContextMatcher;