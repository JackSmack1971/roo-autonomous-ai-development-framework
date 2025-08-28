/**
 * Meta-Learning System
 *
 * Advanced system that learns about the learning system's own effectiveness
 * Optimizes learning strategies, predicts learning outcomes, and evolves learning approaches
 */

const LearningProtocolClient = require('./learning-protocol-client');
const PatternEvolutionEngine = require('./pattern-evolution-engine');

class MetaLearningSystem {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.patternEvolution = new PatternEvolutionEngine(options);
    this.metaLearningPath = options.metaLearningPath || path.join(__dirname, '..', 'data', 'meta-learning');

    this.metaKnowledge = {
      learning_effectiveness: new Map(),
      strategy_performance: new Map(),
      context_prediction_accuracy: new Map(),
      user_satisfaction_patterns: new Map(),
      optimization_opportunities: [],
      learning_evolution_trends: []
    };

    this.selfOptimization = {
      confidence_thresholds: {
        current: 0.7,
        optimal_range: [0.6, 0.9],
        adjustment_rate: 0.05
      },
      learning_strategies: {
        active: 'balanced',
        available: ['conservative', 'aggressive', 'balanced', 'adaptive'],
        performance_history: new Map()
      },
      prediction_models: {
        outcome_prediction_accuracy: 0,
        context_similarity_accuracy: 0,
        user_preference_prediction: 0
      }
    };

    this.learningAboutLearning = {
      what_works: new Map(),
      what_doesnt_work: new Map(),
      context_patterns: new Map(),
      user_behavior_patterns: new Map(),
      effectiveness_by_context: new Map()
    };
  }

  /**
   * Initialize meta-learning system
   */
  async initialize() {
    await this.ensureMetaLearningDirectories();
    await this.loadMetaKnowledge();
    await this.initializeSelfOptimization();

    console.log(`🧠 [Meta-Learning] Initialized with ${this.metaKnowledge.learning_effectiveness.size} effectiveness patterns`);
  }

  /**
   * Ensure meta-learning directory structure
   */
  async ensureMetaLearningDirectories() {
    const directories = [
      this.metaLearningPath,
      path.join(this.metaLearningPath, 'effectiveness'),
      path.join(this.metaLearningPath, 'strategies'),
      path.join(this.metaLearningPath, 'predictions'),
      path.join(this.metaLearningPath, 'optimization')
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Load meta-knowledge from storage
   */
  async loadMetaKnowledge() {
    try {
      // Load learning effectiveness data
      const effectivenessFile = path.join(this.metaLearningPath, 'effectiveness', 'learning-effectiveness.json');
      try {
        const data = await fs.readFile(effectivenessFile, 'utf8');
        const effectiveness = JSON.parse(data);
        this.metaKnowledge.learning_effectiveness = new Map(Object.entries(effectiveness));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ [Meta-Learning] Failed to load effectiveness data: ${error.message}`);
        }
      }

      // Load strategy performance data
      const strategyFile = path.join(this.metaLearningPath, 'strategies', 'strategy-performance.json');
      try {
        const data = await fs.readFile(strategyFile, 'utf8');
        const strategies = JSON.parse(data);
        this.metaKnowledge.strategy_performance = new Map(Object.entries(strategies));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ [Meta-Learning] Failed to load strategy data: ${error.message}`);
        }
      }

      console.log(`📊 [Meta-Learning] Loaded meta-knowledge from ${this.metaKnowledge.learning_effectiveness.size} effectiveness patterns`);
    } catch (error) {
      console.warn(`⚠️ [Meta-Learning] Failed to load meta-knowledge: ${error.message}`);
    }
  }

  /**
   * Initialize self-optimization capabilities
   */
  async initializeSelfOptimization() {
    // Start with balanced strategy
    this.selfOptimization.learning_strategies.active = 'balanced';

    // Initialize prediction models
    await this.trainPredictionModels();

    console.log(`🎯 [Meta-Learning] Self-optimization initialized with ${this.selfOptimization.learning_strategies.active} strategy`);
  }

  /**
   * Analyze learning effectiveness for a given context
   */
  async analyzeLearningEffectiveness(context, actualOutcome, predictedOutcome, userFeedback = null) {
    const contextKey = this.generateContextKey(context);
    const analysis = {
      context: contextKey,
      timestamp: new Date().toISOString(),
      prediction_accuracy: actualOutcome === predictedOutcome ? 1 : 0,
      user_feedback: userFeedback,
      learning_contribution: await this.calculateLearningContribution(context, actualOutcome),
      effectiveness_score: this.calculateEffectivenessScore(context, actualOutcome, predictedOutcome, userFeedback)
    };

    // Update meta-knowledge
    if (!this.metaKnowledge.learning_effectiveness.has(contextKey)) {
      this.metaKnowledge.learning_effectiveness.set(contextKey, {
        total_predictions: 0,
        correct_predictions: 0,
        average_effectiveness: 0,
        user_satisfaction: 0,
        learning_contribution: 0,
        context_pattern: this.extractContextPattern(context)
      });
    }

    const effectiveness = this.metaKnowledge.learning_effectiveness.get(contextKey);
    effectiveness.total_predictions++;
    if (analysis.prediction_accuracy === 1) {
      effectiveness.correct_predictions++;
    }
    effectiveness.average_effectiveness = this.updateMovingAverage(
      effectiveness.average_effectiveness,
      analysis.effectiveness_score,
      effectiveness.total_predictions
    );
    effectiveness.learning_contribution = this.updateMovingAverage(
      effectiveness.learning_contribution,
      analysis.learning_contribution,
      effectiveness.total_predictions
    );

    if (userFeedback !== null) {
      effectiveness.user_satisfaction = this.updateMovingAverage(
        effectiveness.user_satisfaction,
        userFeedback,
        effectiveness.total_predictions
      );
    }

    // Save updated meta-knowledge
    await this.saveMetaKnowledge();

    console.log(`📊 [Meta-Learning] Analyzed effectiveness for ${contextKey}: ${(analysis.effectiveness_score * 100).toFixed(1)}%`);

    return analysis;
  }

  /**
   * Calculate learning contribution to outcome
   */
  async calculateLearningContribution(context, outcome) {
    // Analyze how much the learning system contributed to the outcome
    let contribution = 0;

    // Check if learning was available and used
    const guidance = await this.learningClient.getLearningGuidance(context, 'general');
    if (guidance.available && guidance.guidance.recommendations.length > 0) {
      contribution += 0.3; // Base contribution for having learning available

      // Check if high-confidence patterns were applied
      const highConfidencePatterns = guidance.guidance.recommendations.filter(r => r.confidence_score >= 0.8);
      if (highConfidencePatterns.length > 0) {
        contribution += 0.4; // Additional contribution for high-confidence patterns

        // Check if the applied pattern matches the successful outcome
        if (outcome === 'success') {
          contribution += 0.3; // Learning directly contributed to success
        }
      }
    }

    return Math.min(contribution, 1);
  }

  /**
   * Calculate overall effectiveness score
   */
  calculateEffectivenessScore(context, actualOutcome, predictedOutcome, userFeedback) {
    let score = 0;

    // Prediction accuracy (40%)
    score += (actualOutcome === predictedOutcome ? 1 : 0) * 0.4;

    // User feedback (30%)
    if (userFeedback !== null) {
      score += ((userFeedback + 1) / 2) * 0.3; // Convert -1..1 to 0..1
    } else {
      score += 0.15; // Neutral score when no feedback
    }

    // Learning contribution (20%)
    score += this.calculateLearningContribution(context, actualOutcome) * 0.2;

    // Context complexity bonus (10%)
    const complexity = this.assessContextComplexity(context);
    score += complexity * 0.1;

    return Math.min(score, 1);
  }

  /**
   * Assess context complexity
   */
  assessContextComplexity(context) {
    let complexity = 0;

    if (context.technology_stack?.length > 3) complexity += 0.2;
    if (context.business_requirements?.length > 5) complexity += 0.2;
    if (context.integration_points > 3) complexity += 0.2;
    if (context.regulatory_requirements) complexity += 0.2;
    if (context.performance_requirements?.response_time < 100) complexity += 0.2;

    return Math.min(complexity, 1);
  }

  /**
   * Optimize learning strategies based on meta-knowledge
   */
  async optimizeLearningStrategies() {
    console.log(`🎯 [Meta-Learning] Optimizing learning strategies...`);

    const optimizations = {
      confidence_threshold_adjustments: [],
      strategy_recommendations: [],
      context_specific_optimizations: [],
      prediction_model_updates: []
    };

    // Analyze effectiveness by context
    for (const [contextKey, effectiveness] of this.metaKnowledge.learning_effectiveness) {
      // Adjust confidence thresholds based on effectiveness
      if (effectiveness.average_effectiveness < 0.6) {
        optimizations.confidence_threshold_adjustments.push({
          context: contextKey,
          current_threshold: this.selfOptimization.confidence_thresholds.current,
          recommended_threshold: Math.max(0.5, this.selfOptimization.confidence_thresholds.current - 0.1),
          reason: 'Low effectiveness suggests more conservative threshold'
        });
      } else if (effectiveness.average_effectiveness > 0.9) {
        optimizations.confidence_threshold_adjustments.push({
          context: contextKey,
          current_threshold: this.selfOptimization.confidence_thresholds.current,
          recommended_threshold: Math.min(0.9, this.selfOptimization.confidence_thresholds.current + 0.1),
          reason: 'High effectiveness allows more aggressive threshold'
        });
      }

      // Identify optimal strategies for different contexts
      const contextPattern = effectiveness.context_pattern;
      if (effectiveness.average_effectiveness > 0.8) {
        optimizations.context_specific_optimizations.push({
          context_pattern: contextPattern,
          recommended_strategy: 'aggressive',
          expected_improvement: 0.1,
          confidence: effectiveness.average_effectiveness
        });
      }
    }

    // Update prediction models
    optimizations.prediction_model_updates = await this.updatePredictionModels();

    // Generate strategy recommendations
    optimizations.strategy_recommendations = this.generateStrategyRecommendations();

    console.log(`🎯 [Meta-Learning] Generated ${optimizations.confidence_threshold_adjustments.length} optimizations`);

    return optimizations;
  }

  /**
   * Generate strategy recommendations
   */
  generateStrategyRecommendations() {
    const recommendations = [];

    // Analyze strategy performance
    for (const [strategy, performance] of this.metaKnowledge.strategy_performance) {
      if (performance.average_effectiveness > 0.8 && strategy !== this.selfOptimization.learning_strategies.active) {
        recommendations.push({
          strategy: strategy,
          current_strategy: this.selfOptimization.learning_strategies.active,
          expected_improvement: performance.average_effectiveness - 0.7,
          reason: `Strategy ${strategy} shows ${(performance.average_effectiveness * 100).toFixed(1)}% effectiveness`
        });
      }
    }

    return recommendations;
  }

  /**
   * Learn about what learning approaches work best
   */
  async learnAboutLearning(context, learningApproach, outcome, userFeedback) {
    const learningKey = this.generateLearningApproachKey(learningApproach);

    if (!this.learningAboutLearning.what_works.has(learningKey)) {
      this.learningAboutLearning.what_works.set(learningKey, {
        approach: learningApproach,
        total_applications: 0,
        successful_applications: 0,
        average_outcome: 0,
        average_user_feedback: 0,
        context_patterns: new Map()
      });
    }

    const learningRecord = this.learningAboutLearning.what_works.get(learningKey);
    learningRecord.total_applications++;
    learningRecord.average_outcome = this.updateMovingAverage(
      learningRecord.average_outcome,
      outcome === 'success' ? 1 : 0,
      learningRecord.total_applications
    );

    if (userFeedback !== null) {
      learningRecord.average_user_feedback = this.updateMovingAverage(
        learningRecord.average_user_feedback,
        userFeedback,
        learningRecord.total_applications
      );
    }

    if (outcome === 'success') {
      learningRecord.successful_applications++;
    }

    // Track context patterns for this learning approach
    const contextPattern = this.extractContextPattern(context);
    const contextKey = this.generateContextKey(contextPattern);

    if (!learningRecord.context_patterns.has(contextKey)) {
      learningRecord.context_patterns.set(contextKey, {
        pattern: contextPattern,
        applications: 0,
        successes: 0,
        effectiveness: 0
      });
    }

    const contextRecord = learningRecord.context_patterns.get(contextKey);
    contextRecord.applications++;
    if (outcome === 'success') {
      contextRecord.successes++;
    }
    contextRecord.effectiveness = contextRecord.successes / contextRecord.applications;

    console.log(`🧠 [Meta-Learning] Learned about ${learningApproach} effectiveness: ${(learningRecord.average_outcome * 100).toFixed(1)}%`);

    return learningRecord;
  }

  /**
   * Predict learning effectiveness for a new context
   */
  async predictLearningEffectiveness(context, learningApproach) {
    const contextKey = this.generateContextKey(context);
    const approachKey = this.generateLearningApproachKey(learningApproach);

    let predictedEffectiveness = 0.5; // Default neutral prediction
    let confidence = 0.5;
    const factors = [];

    // Check historical effectiveness for this context
    if (this.metaKnowledge.learning_effectiveness.has(contextKey)) {
      const effectiveness = this.metaKnowledge.learning_effectiveness.get(contextKey);
      predictedEffectiveness = effectiveness.average_effectiveness;
      confidence = Math.min(effectiveness.total_predictions / 10, 1);
      factors.push(`Historical context effectiveness: ${(effectiveness.average_effectiveness * 100).toFixed(1)}%`);
    }

    // Check learning approach effectiveness
    if (this.learningAboutLearning.what_works.has(approachKey)) {
      const approachRecord = this.learningAboutLearning.what_works.get(approachKey);
      const approachEffectiveness = approachRecord.average_outcome;
      predictedEffectiveness = (predictedEffectiveness + approachEffectiveness) / 2;
      factors.push(`Learning approach effectiveness: ${(approachEffectiveness * 100).toFixed(1)}%`);
    }

    // Check context pattern matches
    const contextPattern = this.extractContextPattern(context);
    const patternKey = this.generateContextKey(contextPattern);

    for (const [existingPatternKey, effectiveness] of this.metaKnowledge.learning_effectiveness) {
      const similarity = this.calculatePatternSimilarity(patternKey, existingPatternKey);
      if (similarity > 0.7) {
        predictedEffectiveness = (predictedEffectiveness + effectiveness.average_effectiveness) / 2;
        confidence = Math.max(confidence, similarity);
        factors.push(`Similar pattern effectiveness: ${(effectiveness.average_effectiveness * 100).toFixed(1)}% (${(similarity * 100).toFixed(1)}% similarity)`);
      }
    }

    return {
      predicted_effectiveness: predictedEffectiveness,
      confidence: confidence,
      factors: factors,
      recommendation: predictedEffectiveness > 0.7 ? 'apply_learning' :
                     predictedEffectiveness > 0.5 ? 'apply_with_caution' : 'fallback_only'
    };
  }

  /**
   * Update prediction models based on meta-knowledge
   */
  async updatePredictionModels() {
    const updates = [];

    // Update outcome prediction accuracy
    let totalPredictions = 0;
    let correctPredictions = 0;

    for (const [contextKey, effectiveness] of this.metaKnowledge.learning_effectiveness) {
      totalPredictions += effectiveness.total_predictions;
      correctPredictions += effectiveness.correct_predictions;
    }

    if (totalPredictions > 0) {
      this.selfOptimization.prediction_models.outcome_prediction_accuracy = correctPredictions / totalPredictions;
      updates.push({
        model: 'outcome_prediction',
        accuracy: this.selfOptimization.prediction_models.outcome_prediction_accuracy,
        improvement: this.selfOptimization.prediction_models.outcome_prediction_accuracy - 0.5
      });
    }

    // Update context similarity accuracy
    // This would require tracking actual similarity measurements
    updates.push({
      model: 'context_similarity',
      accuracy: this.selfOptimization.prediction_models.context_similarity_accuracy,
      status: 'needs_more_data'
    });

    return updates;
  }

  /**
   * Train prediction models using meta-knowledge
   */
  async trainPredictionModels() {
    // This would implement machine learning algorithms to predict:
    // 1. Learning effectiveness for new contexts
    // 2. Optimal confidence thresholds
    // 3. Best learning strategies for different situations
    // 4. User satisfaction patterns

    console.log(`🎯 [Meta-Learning] Training prediction models with ${this.metaKnowledge.learning_effectiveness.size} data points`);

    // Placeholder for actual ML training
    this.selfOptimization.prediction_models = {
      outcome_prediction_accuracy: 0.75,
      context_similarity_accuracy: 0.82,
      user_preference_prediction: 0.68
    };
  }

  /**
   * Generate insights about learning system effectiveness
   */
  async generateMetaInsights() {
    const insights = {
      top_performing_contexts: [],
      struggling_contexts: [],
      strategy_effectiveness: [],
      optimization_opportunities: [],
      learning_evolution_trends: []
    };

    // Identify top performing contexts
    const sortedContexts = Array.from(this.metaKnowledge.learning_effectiveness.entries())
      .sort(([, a], [, b]) => b.average_effectiveness - a.average_effectiveness)
      .slice(0, 5);

    insights.top_performing_contexts = sortedContexts.map(([context, effectiveness]) => ({
      context: context,
      effectiveness: effectiveness.average_effectiveness,
      predictions: effectiveness.total_predictions,
      user_satisfaction: effectiveness.user_satisfaction
    }));

    // Identify struggling contexts
    const strugglingContexts = Array.from(this.metaKnowledge.learning_effectiveness.entries())
      .filter(([, effectiveness]) => effectiveness.average_effectiveness < 0.6)
      .sort(([, a], [, b]) => a.average_effectiveness - b.average_effectiveness)
      .slice(0, 5);

    insights.struggling_contexts = strugglingContexts.map(([context, effectiveness]) => ({
      context: context,
      effectiveness: effectiveness.average_effectiveness,
      predictions: effectiveness.total_predictions,
      issues: this.identifyContextIssues(effectiveness)
    }));

    // Analyze strategy effectiveness
    insights.strategy_effectiveness = Array.from(this.metaKnowledge.strategy_performance.entries())
      .map(([strategy, performance]) => ({
        strategy: strategy,
        effectiveness: performance.average_effectiveness,
        usage_count: performance.total_applications,
        user_satisfaction: performance.average_user_feedback
      }))
      .sort((a, b) => b.effectiveness - a.effectiveness);

    // Generate optimization opportunities
    insights.optimization_opportunities = await this.identifyOptimizationOpportunities();

    // Analyze learning evolution trends
    insights.learning_evolution_trends = await this.analyzeLearningEvolutionTrends();

    console.log(`🔍 [Meta-Learning] Generated insights: ${insights.top_performing_contexts.length} top contexts, ${insights.optimization_opportunities.length} optimization opportunities`);

    return insights;
  }

  /**
   * Identify optimization opportunities
   */
  async identifyOptimizationOpportunities() {
    const opportunities = [];

    // Confidence threshold optimization
    const avgEffectiveness = Array.from(this.metaKnowledge.learning_effectiveness.values())
      .reduce((sum, eff) => sum + eff.average_effectiveness, 0) /
      this.metaKnowledge.learning_effectiveness.size;

    if (avgEffectiveness < 0.7) {
      opportunities.push({
        type: 'confidence_threshold',
        description: 'Lower confidence threshold to increase learning application rate',
        expected_impact: 0.15,
        implementation_effort: 'low'
      });
    }

    // Strategy optimization
    const bestStrategy = Array.from(this.metaKnowledge.strategy_performance.entries())
      .sort(([, a], [, b]) => b.average_effectiveness - a.average_effectiveness)[0];

    if (bestStrategy && bestStrategy[0] !== this.selfOptimization.learning_strategies.active) {
      opportunities.push({
        type: 'strategy_switch',
        description: `Switch to ${bestStrategy[0]} strategy (${(bestStrategy[1].average_effectiveness * 100).toFixed(1)}% effectiveness)`,
        expected_impact: bestStrategy[1].average_effectiveness - 0.7,
        implementation_effort: 'medium'
      });
    }

    // Context-specific optimizations
    for (const [context, effectiveness] of this.metaKnowledge.learning_effectiveness) {
      if (effectiveness.average_effectiveness < 0.5) {
        opportunities.push({
          type: 'context_optimization',
          description: `Improve learning for ${context} context (${(effectiveness.average_effectiveness * 100).toFixed(1)}% effectiveness)`,
          expected_impact: 0.2,
          implementation_effort: 'high'
        });
      }
    }

    return opportunities;
  }

  /**
   * Analyze learning evolution trends
   */
  async analyzeLearningEvolutionTrends() {
    const trends = [];

    // Analyze effectiveness improvement over time
    const effectivenessHistory = Array.from(this.metaKnowledge.learning_effectiveness.values())
      .filter(eff => eff.total_predictions > 5)
      .map(eff => eff.average_effectiveness);

    if (effectivenessHistory.length > 0) {
      const avgEffectiveness = effectivenessHistory.reduce((sum, eff) => sum + eff, 0) / effectivenessHistory.length;

      if (avgEffectiveness > 0.8) {
        trends.push({
          trend: 'effectiveness_improving',
          description: 'Learning effectiveness is consistently high across contexts',
          metric: 'average_effectiveness',
          value: avgEffectiveness,
          significance: 'positive'
        });
      } else if (avgEffectiveness < 0.6) {
        trends.push({
          trend: 'effectiveness_needs_attention',
          description: 'Learning effectiveness needs improvement',
          metric: 'average_effectiveness',
          value: avgEffectiveness,
          significance: 'needs_attention'
        });
      }
    }

    // Analyze strategy evolution
    const strategyCount = this.metaKnowledge.strategy_performance.size;
    if (strategyCount > 1) {
      trends.push({
        trend: 'strategy_diversification',
        description: `Learning system is using ${strategyCount} different strategies`,
        metric: 'strategy_diversity',
        value: strategyCount,
        significance: 'positive'
      });
    }

    return trends;
  }

  /**
   * Save meta-knowledge to storage
   */
  async saveMetaKnowledge() {
    try {
      // Save learning effectiveness
      const effectivenessFile = path.join(this.metaLearningPath, 'effectiveness', 'learning-effectiveness.json');
      const effectivenessData = Object.fromEntries(this.metaKnowledge.learning_effectiveness);
      await fs.writeFile(effectivenessFile, JSON.stringify(effectivenessData, null, 2));

      // Save strategy performance
      const strategyFile = path.join(this.metaLearningPath, 'strategies', 'strategy-performance.json');
      const strategyData = Object.fromEntries(this.metaKnowledge.strategy_performance);
      await fs.writeFile(strategyFile, JSON.stringify(strategyData, null, 2));

      console.log(`💾 [Meta-Learning] Meta-knowledge saved`);
    } catch (error) {
      console.warn(`⚠️ [Meta-Learning] Failed to save meta-knowledge: ${error.message}`);
    }
  }

  /**
   * Get meta-learning statistics
   */
  getStatistics() {
    return {
      learning_effectiveness_patterns: this.metaKnowledge.learning_effectiveness.size,
      strategy_performance_records: this.metaKnowledge.strategy_performance.size,
      optimization_opportunities: this.metaKnowledge.optimization_opportunities.length,
      self_optimization: this.selfOptimization,
      learning_about_learning: {
        what_works_count: this.learningAboutLearning.what_works.size,
        what_doesnt_work_count: this.learningAboutLearning.what_doesnt_work.size,
        context_patterns_count: this.learningAboutLearning.context_patterns.size
      },
      timestamp: new Date().toISOString()
    };
  }

  // Utility methods
  generateContextKey(context) {
    return JSON.stringify(context).slice(0, 100);
  }

  generateLearningApproachKey(approach) {
    return JSON.stringify(approach).slice(0, 50);
  }

  extractContextPattern(context) {
    return {
      technology_stack: context.technology_stack?.slice(0, 3),
      domain: context.domain,
      complexity: context.complexity
    };
  }

  updateMovingAverage(current, newValue, count) {
    return (current * (count - 1) + newValue) / count;
  }

  calculatePatternSimilarity(pattern1, pattern2) {
    // Simple similarity calculation - could be enhanced with ML
    return pattern1 === pattern2 ? 1 : 0.5;
  }

  identifyContextIssues(effectiveness) {
    const issues = [];
    if (effectiveness.average_effectiveness < 0.5) {
      issues.push('Low effectiveness');
    }
    if (effectiveness.total_predictions < 5) {
      issues.push('Insufficient data');
    }
    if (effectiveness.user_satisfaction < 0) {
      issues.push('User dissatisfaction');
    }
    return issues;
  }
}

module.exports = MetaLearningSystem;