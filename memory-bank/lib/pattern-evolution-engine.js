/**
 * Pattern Evolution Engine
 *
 * Advanced system for evolving patterns across contexts and creating new patterns
 * Implements context similarity scoring, pattern fragmentation/consolidation, and anti-pattern detection
 */

const LearningProtocolClient = require('./learning-protocol-client');
const fs = require('fs').promises;
const path = require('path');

class PatternEvolutionEngine {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.evolutionPath = options.evolutionPath || path.join(__dirname, '..', 'data', 'pattern-evolution');
    this.similarityThreshold = options.similarityThreshold || 0.7;
    this.confidenceThreshold = options.confidenceThreshold || 0.6;

    this.evolutionRules = {
      pattern_fragmentation: {
        trigger_conditions: ['context_divergence > 0.8', 'success_rate_drop > 0.2'],
        min_applications: 10,
        context_similarity_threshold: 0.5
      },
      pattern_consolidation: {
        trigger_conditions: ['context_similarity > 0.9', 'success_rate_stable', 'redundancy_score > 0.7'],
        min_applications: 5,
        consolidation_threshold: 0.8
      },
      anti_pattern_detection: {
        trigger_conditions: ['consistent_failure_rate > 0.7', 'negative_business_impact'],
        min_applications: 8,
        warning_threshold: 0.6
      },
      new_pattern_creation: {
        trigger_conditions: ['novel_solution_success', 'repeated_context_without_pattern'],
        min_occurrences: 3,
        confidence_requirement: 0.75
      }
    };
  }

  /**
   * Calculate context similarity between two contexts
   */
  calculateContextSimilarity(context1, context2) {
    const factors = {
      technology_stack: this.calculateTechnologySimilarity(context1.technology_stack, context2.technology_stack),
      domain: this.calculateDomainSimilarity(context1.domain, context2.domain),
      complexity: this.calculateComplexitySimilarity(context1.complexity, context2.complexity),
      business_context: this.calculateBusinessSimilarity(context1.business_context, context2.business_context),
      team_maturity: this.calculateTeamSimilarity(context1.team_maturity, context2.team_maturity)
    };

    // Weighted similarity calculation
    const weights = {
      technology_stack: 0.3,
      domain: 0.25,
      complexity: 0.15,
      business_context: 0.2,
      team_maturity: 0.1
    };

    let totalSimilarity = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      if (factors[factor] !== null) {
        totalSimilarity += factors[factor] * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
  }

  /**
   * Calculate technology stack similarity
   */
  calculateTechnologySimilarity(stack1, stack2) {
    if (!stack1 || !stack2) return null;

    const set1 = new Set(stack1);
    const set2 = new Set(stack2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate domain similarity
   */
  calculateDomainSimilarity(domain1, domain2) {
    if (!domain1 || !domain2) return null;

    // Domain hierarchy matching
    const domainHierarchy = {
      'e-commerce': ['retail', 'shopping', 'commerce'],
      'healthcare': ['medical', 'clinical', 'patient-care'],
      'finance': ['banking', 'payments', 'trading'],
      'education': ['learning', 'teaching', 'academic'],
      'entertainment': ['media', 'gaming', 'content']
    };

    if (domain1 === domain2) return 1.0;

    // Check if domains are related
    for (const [parent, children] of Object.entries(domainHierarchy)) {
      if ((domain1 === parent && children.includes(domain2)) ||
          (domain2 === parent && children.includes(domain1))) {
        return 0.8;
      }
    }

    return 0.3; // Unrelated domains
  }

  /**
   * Calculate complexity similarity
   */
  calculateComplexitySimilarity(complexity1, complexity2) {
    if (!complexity1 || !complexity2) return null;

    const complexityLevels = ['low', 'medium', 'high', 'critical'];
    const index1 = complexityLevels.indexOf(complexity1);
    const index2 = complexityLevels.indexOf(complexity2);

    if (index1 === -1 || index2 === -1) return 0.5;

    const difference = Math.abs(index1 - index2);
    return Math.max(0, 1 - (difference * 0.25));
  }

  /**
   * Calculate business context similarity
   */
  calculateBusinessSimilarity(context1, context2) {
    if (!context1 || !context2) return null;

    const factors = ['user_base_size', 'regulatory_requirements', 'performance_requirements', 'security_requirements'];

    let similarity = 0;
    let validFactors = 0;

    for (const factor of factors) {
      if (context1[factor] && context2[factor]) {
        if (context1[factor] === context2[factor]) {
          similarity += 1.0;
        } else {
          similarity += 0.5; // Partial similarity
        }
        validFactors++;
      }
    }

    return validFactors > 0 ? similarity / validFactors : null;
  }

  /**
   * Calculate team maturity similarity
   */
  calculateTeamSimilarity(maturity1, maturity2) {
    if (!maturity1 || !maturity2) return null;

    const maturityLevels = ['junior', 'intermediate', 'senior', 'expert'];
    const index1 = maturityLevels.indexOf(maturity1);
    const index2 = maturityLevels.indexOf(maturity2);

    if (index1 === -1 || index2 === -1) return 0.5;

    const difference = Math.abs(index1 - index2);
    return Math.max(0, 1 - (difference * 0.2));
  }

  /**
   * Evolve existing pattern based on new context
   */
  async evolvePattern(patternId, newContext, newOutcome, newConfidence) {
    try {
      const pattern = await this.learningClient.getPattern(patternId);
      const currentContext = pattern.context_match || {};

      // Calculate context similarity
      const similarity = this.calculateContextSimilarity(currentContext, newContext);

      if (similarity < this.similarityThreshold) {
        // Context is different enough - consider fragmentation
        return await this.handlePatternFragmentation(pattern, newContext, newOutcome, newConfidence);
      } else {
        // Context is similar - evolve existing pattern
        return await this.handlePatternEvolution(pattern, newContext, newOutcome, newConfidence);
      }
    } catch (error) {
      console.warn(`⚠️ [Pattern Evolution] Failed to evolve pattern ${patternId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Handle pattern fragmentation when contexts diverge significantly
   */
  async handlePatternFragmentation(pattern, newContext, newOutcome, newConfidence) {
    console.log(`🔀 [Pattern Evolution] Considering fragmentation for pattern: ${pattern.name}`);

    const fragmentation = {
      original_pattern: pattern.id,
      new_context: newContext,
      outcome_difference: newOutcome !== pattern.success_rate > 0.5 ? 'significant' : 'minor',
      confidence_difference: Math.abs(newConfidence - pattern.confidence_score),
      similarity_score: this.calculateContextSimilarity(pattern.context_match, newContext)
    };

    // Check fragmentation rules
    const shouldFragment = this.shouldFragmentPattern(pattern, fragmentation);

    if (shouldFragment) {
      return await this.createFragmentedPattern(pattern, newContext, newOutcome, newConfidence);
    }

    return null;
  }

  /**
   * Determine if pattern should be fragmented
   */
  shouldFragmentPattern(pattern, fragmentation) {
    const rules = this.evolutionRules.pattern_fragmentation;

    // Check minimum applications
    if (!pattern.metadata?.usage_statistics?.total_applications >= rules.min_applications) {
      return false;
    }

    // Check context divergence
    if (fragmentation.similarity_score >= rules.context_similarity_threshold) {
      return false;
    }

    // Check success rate drop
    const successRateChange = Math.abs(fragmentation.outcome_difference === 'significant' ? 0.5 : 0);
    if (successRateChange < rules.trigger_conditions.find(c => c.includes('success_rate_drop'))?.split('>')[1]) {
      return false;
    }

    return true;
  }

  /**
   * Create fragmented pattern for different context
   */
  async createFragmentedPattern(originalPattern, newContext, newOutcome, newConfidence) {
    const fragmentId = `${originalPattern.id}_${Date.now()}`;

    const fragmentedPattern = {
      id: fragmentId,
      name: `${originalPattern.name} (${this.getContextDescriptor(newContext)})`,
      description: `${originalPattern.description} - Specialized for ${this.getContextDescriptor(newContext)} context`,
      trigger_conditions: [...originalPattern.trigger_conditions, `context:${this.getContextDescriptor(newContext)}`],
      auto_apply_actions: originalPattern.auto_apply_actions,
      success_rate: newOutcome === 'success' ? 1.0 : 0.0,
      confidence_score: newConfidence,
      context_match: newContext,
      quality_gates: originalPattern.quality_gates,
      metadata: {
        ...originalPattern.metadata,
        created_at: new Date().toISOString(),
        parent_pattern: originalPattern.id,
        fragmentation_reason: 'context_divergence',
        specialization_context: this.getContextDescriptor(newContext)
      }
    };

    console.log(`✨ [Pattern Evolution] Created fragmented pattern: ${fragmentedPattern.name}`);
    return fragmentedPattern;
  }

  /**
   * Handle pattern evolution within similar context
   */
  async handlePatternEvolution(pattern, newContext, newOutcome, newConfidence) {
    // Update pattern statistics
    const updatedPattern = { ...pattern };

    // Update success rate (moving average)
    const currentSuccessRate = pattern.success_rate || 0;
    const newSuccessRate = newOutcome === 'success' ? 1.0 : 0.0;
    updatedPattern.success_rate = (currentSuccessRate * 0.9) + (newSuccessRate * 0.1);

    // Update confidence score
    updatedPattern.confidence_score = (pattern.confidence_score * 0.95) + (newConfidence * 0.05);

    // Update context match with new information
    updatedPattern.context_match = this.mergeContexts(pattern.context_match, newContext);

    // Update metadata
    updatedPattern.metadata = {
      ...pattern.metadata,
      last_applied: new Date().toISOString(),
      last_outcome: newOutcome,
      evolution_count: (pattern.metadata?.evolution_count || 0) + 1,
      last_confidence_adjustment: newConfidence - pattern.confidence_score
    };

    console.log(`🔬 [Pattern Evolution] Evolved pattern ${pattern.name}: confidence ${pattern.confidence_score.toFixed(3)} → ${updatedPattern.confidence_score.toFixed(3)}`);

    return updatedPattern;
  }

  /**
   * Merge two contexts for pattern evolution
   */
  mergeContexts(context1, context2) {
    const merged = { ...context1 };

    // Merge technology stacks
    if (context2.technology_stack) {
      merged.technology_stack = [...new Set([...(context1.technology_stack || []), ...context2.technology_stack])];
    }

    // Merge other context attributes with weighted averaging
    const mergeAttributes = ['complexity', 'domain', 'business_context'];
    for (const attr of mergeAttributes) {
      if (context2[attr] && context1[attr]) {
        // Keep the more recent/prevalent value
        merged[attr] = context2[attr];
      } else if (context2[attr]) {
        merged[attr] = context2[attr];
      }
    }

    return merged;
  }

  /**
   * Detect anti-patterns automatically
   */
  async detectAntiPatterns() {
    console.log(`🔍 [Pattern Evolution] Scanning for anti-patterns...`);

    const antiPatterns = [];

    try {
      // Get all patterns
      const allPatterns = await this.learningClient.getPatterns({});

      for (const pattern of allPatterns) {
        const antiPatternAnalysis = await this.analyzeAntiPattern(pattern);

        if (antiPatternAnalysis.isAntiPattern) {
          antiPatterns.push({
            pattern_id: pattern.id,
            pattern_name: pattern.name,
            anti_pattern_type: antiPatternAnalysis.type,
            risk_level: antiPatternAnalysis.riskLevel,
            evidence: antiPatternAnalysis.evidence,
            recommended_action: antiPatternAnalysis.recommendation
          });
        }
      }

      console.log(`🚨 [Pattern Evolution] Detected ${antiPatterns.length} anti-patterns`);

      return antiPatterns;
    } catch (error) {
      console.warn(`⚠️ [Pattern Evolution] Failed to detect anti-patterns: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze if a pattern is an anti-pattern
   */
  async analyzeAntiPattern(pattern) {
    const analysis = {
      isAntiPattern: false,
      type: null,
      riskLevel: 'low',
      evidence: [],
      recommendation: null
    };

    // Check consistent failure rate
    if (pattern.success_rate < 0.3 && (pattern.metadata?.usage_statistics?.total_applications || 0) >= 8) {
      analysis.isAntiPattern = true;
      analysis.type = 'consistent_failure';
      analysis.riskLevel = pattern.success_rate < 0.1 ? 'critical' : 'high';
      analysis.evidence.push(`Success rate: ${(pattern.success_rate * 100).toFixed(1)}% over ${pattern.metadata.usage_statistics.total_applications} applications`);
      analysis.recommendation = 'Deprecate or redesign pattern';
    }

    // Check for patterns that increase complexity without benefit
    if (pattern.metadata?.usage_statistics?.average_quality_impact < -0.2) {
      analysis.isAntiPattern = true;
      analysis.type = 'negative_impact';
      analysis.riskLevel = 'medium';
      analysis.evidence.push(`Average quality impact: ${(pattern.metadata.usage_statistics.average_quality_impact * 100).toFixed(1)}%`);
      analysis.recommendation = 'Review and potentially restrict application';
    }

    // Check for patterns that are frequently overridden
    const overrideRate = (pattern.metadata?.usage_statistics?.manual_overrides || 0) /
                        (pattern.metadata?.usage_statistics?.total_applications || 1);

    if (overrideRate > 0.7) {
      analysis.isAntiPattern = true;
      analysis.type = 'frequently_overridden';
      analysis.riskLevel = 'low';
      analysis.evidence.push(`Override rate: ${(overrideRate * 100).toFixed(1)}%`);
      analysis.recommendation = 'Consider making pattern more flexible or context-aware';
    }

    return analysis;
  }

  /**
   * Create new pattern from repeated successful solutions
   */
  async createNewPatternFromObservations(context, solution, outcome, confidence) {
    console.log(`🆕 [Pattern Evolution] Analyzing potential new pattern...`);

    // Check if this context/solution combination has occurred multiple times
    const similarObservations = await this.findSimilarObservations(context, solution);

    if (similarObservations.length >= this.evolutionRules.new_pattern_creation.min_occurrences) {
      const averageConfidence = similarObservations.reduce((sum, obs) => sum + obs.confidence, 0) / similarObservations.length;
      const successRate = similarObservations.filter(obs => obs.outcome === 'success').length / similarObservations.length;

      if (averageConfidence >= this.evolutionRules.new_pattern_creation.confidence_requirement &&
          successRate >= 0.8) {

        return await this.createNewPattern(context, solution, averageConfidence, successRate, similarObservations);
      }
    }

    return null;
  }

  /**
   * Create a new pattern from observed successful solutions
   */
  async createNewPattern(context, solution, confidence, successRate, observations) {
    const patternId = `emergent_pattern_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newPattern = {
      id: patternId,
      name: `Emergent Pattern: ${this.getContextDescriptor(context)} Solution`,
      description: `Automatically discovered successful approach for ${this.getContextDescriptor(context)} based on ${observations.length} observations`,
      trigger_conditions: [
        `context:${this.getContextDescriptor(context)}`,
        `problem_type:${solution.problem_type || 'general'}`,
        `success_criteria_met`
      ],
      auto_apply_actions: [
        {
          action_type: 'apply_emergent_solution',
          solution_template: solution,
          confidence_threshold: confidence * 0.9
        }
      ],
      success_rate: successRate,
      confidence_score: confidence,
      context_match: context,
      quality_gates: ['emergent_pattern_validation', 'peer_review'],
      metadata: {
        created_at: new Date().toISOString(),
        pattern_type: 'emergent',
        discovery_method: 'observation_correlation',
        observation_count: observations.length,
        average_confidence: confidence,
        success_rate: successRate,
        source_observations: observations.map(obs => obs.id)
      }
    };

    console.log(`✨ [Pattern Evolution] Created emergent pattern: ${newPattern.name}`);
    return newPattern;
  }

  /**
   * Get human-readable context descriptor
   */
  getContextDescriptor(context) {
    if (!context) return 'general';

    const descriptors = [];

    if (context.domain) descriptors.push(context.domain);
    if (context.technology_stack?.length > 0) descriptors.push(context.technology_stack[0]);
    if (context.complexity) descriptors.push(`${context.complexity}_complexity`);

    return descriptors.join('_') || 'general';
  }

  /**
   * Find similar observations for pattern creation
   */
  async findSimilarObservations(context, solution) {
    // This would query the learning system's observation database
    // For now, return empty array as this requires integration with the main learning system
    return [];
  }

  /**
   * Get evolution statistics
   */
  getEvolutionStatistics() {
    return {
      evolution_rules: this.evolutionRules,
      similarity_threshold: this.similarityThreshold,
      confidence_threshold: this.confidenceThreshold,
      context_similarity_factors: {
        technology_stack: 0.3,
        domain: 0.25,
        complexity: 0.15,
        business_context: 0.2,
        team_maturity: 0.1
      }
    };
  }
}

module.exports = PatternEvolutionEngine;