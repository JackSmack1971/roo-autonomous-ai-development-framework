/**
 * Decision Tree Engine
 *
 * Core engine for building and evaluating decision trees used in pattern application
 * Provides flexible decision tree construction and evaluation capabilities
 */

const EventEmitter = require('events');

class DecisionNode {
  constructor(nodeId, nodeType = 'decision') {
    this.nodeId = nodeId;
    this.nodeType = nodeType; // 'decision', 'action', 'terminal'
    this.condition = null;
    this.conditionEvaluator = null;
    this.trueBranch = null;
    this.falseBranch = null;
    this.action = null;
    this.metadata = {};
    this.evaluationCount = 0;
    this.successCount = 0;
  }

  /**
   * Set condition for this decision node
   */
  setCondition(condition, evaluator = null) {
    this.condition = condition;
    this.conditionEvaluator = evaluator || this.defaultConditionEvaluator;
    return this;
  }

  /**
   * Set branches for true/false outcomes
   */
  setBranches(trueBranch, falseBranch = null) {
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
    return this;
  }

  /**
   * Set action for action nodes
   */
  setAction(action) {
    this.action = action;
    this.nodeType = 'action';
    return this;
  }

  /**
   * Mark as terminal node with outcome
   */
  setTerminal(outcome) {
    this.nodeType = 'terminal';
    this.action = outcome;
    return this;
  }

  /**
   * Default condition evaluator
   */
  defaultConditionEvaluator(condition, context) {
    if (typeof condition === 'function') {
      return condition(context);
    }

    if (typeof condition === 'string') {
      // Simple property check: "confidence > 0.8"
      const match = condition.match(/^(\w+)\s*([><=]+)\s*(.+)$/);
      if (match) {
        const [_, property, operator, value] = match;
        const contextValue = this.getNestedValue(context, property);
        const numericValue = parseFloat(value);

        switch (operator) {
          case '>': return contextValue > numericValue;
          case '<': return contextValue < numericValue;
          case '>=': return contextValue >= numericValue;
          case '<=': return contextValue <= numericValue;
          case '=':
          case '==': return contextValue == value; // eslint-disable-line eqeqeq
          case '===': return contextValue === value;
        }
      }
    }

    return Boolean(condition);
  }

  /**
   * Get nested value from context object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Evaluate this node with given context
   */
  async evaluate(context, path = []) {
    this.evaluationCount++;

    const currentPath = [...path, this.nodeId];

    try {
      if (this.nodeType === 'terminal') {
        return {
          outcome: this.action,
          path: currentPath,
          confidence: 1.0,
          reasoning: `Terminal node reached: ${this.action}`
        };
      }

      if (this.nodeType === 'action') {
        const result = await this.executeAction(this.action, context);
        return {
          outcome: result,
          path: currentPath,
          confidence: 0.9,
          reasoning: `Action executed: ${JSON.stringify(result)}`
        };
      }

      // Decision node
      const conditionResult = await this.evaluateCondition(context);

      if (conditionResult) {
        if (this.trueBranch) {
          return await this.trueBranch.evaluate(context, currentPath);
        }
        return {
          outcome: 'default_true',
          path: currentPath,
          confidence: 0.5,
          reasoning: 'Condition true, no true branch defined'
        };
      } else {
        if (this.falseBranch) {
          return await this.falseBranch.evaluate(context, currentPath);
        }
        return {
          outcome: 'default_false',
          path: currentPath,
          confidence: 0.5,
          reasoning: 'Condition false, no false branch defined'
        };
      }

    } catch (error) {
      return {
        outcome: 'error',
        path: currentPath,
        confidence: 0.0,
        reasoning: `Evaluation error: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Evaluate condition for this node
   */
  async evaluateCondition(context) {
    if (!this.condition) {
      return true; // No condition means always true
    }

    return await this.conditionEvaluator.call(this, this.condition, context);
  }

  /**
   * Execute action for action nodes
   */
  async executeAction(action, context) {
    if (typeof action === 'function') {
      return await action(context);
    }

    if (typeof action === 'string') {
      // Simple action strings
      return { action: action, context: context };
    }

    return action;
  }

  /**
   * Get node statistics
   */
  getStatistics() {
    return {
      nodeId: this.nodeId,
      nodeType: this.nodeType,
      evaluationCount: this.evaluationCount,
      successCount: this.successCount,
      successRate: this.evaluationCount > 0 ? this.successCount / this.evaluationCount : 0,
      metadata: this.metadata
    };
  }

  /**
   * Update node statistics
   */
  updateStatistics(success) {
    if (success) {
      this.successCount++;
    }
  }
}

class DecisionTree {
  constructor(treeId, rootNode = null) {
    this.treeId = treeId;
    this.rootNode = rootNode;
    this.metadata = {};
    this.evaluationHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Set root node
   */
  setRoot(rootNode) {
    this.rootNode = rootNode;
    return this;
  }

  /**
   * Evaluate the decision tree with context
   */
  async evaluate(context, options = {}) {
    if (!this.rootNode) {
      throw new Error('Decision tree has no root node');
    }

    const startTime = Date.now();
    const result = await this.rootNode.evaluate(context);

    const evaluation = {
      timestamp: new Date().toISOString(),
      context: options.includeContext ? context : undefined,
      result: result,
      evaluationTime: Date.now() - startTime,
      treeId: this.treeId
    };

    this.evaluationHistory.push(evaluation);

    if (this.evaluationHistory.length > this.maxHistorySize) {
      this.evaluationHistory.shift();
    }

    return result;
  }

  /**
   * Get tree statistics
   */
  getStatistics() {
    const evaluations = this.evaluationHistory;
    const outcomes = evaluations.map(e => e.result.outcome);
    const outcomeCounts = outcomes.reduce((acc, outcome) => {
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {});

    return {
      treeId: this.treeId,
      totalEvaluations: evaluations.length,
      averageEvaluationTime: evaluations.length > 0 ?
        evaluations.reduce((sum, e) => sum + e.evaluationTime, 0) / evaluations.length : 0,
      outcomeDistribution: outcomeCounts,
      successRate: this.calculateSuccessRate(evaluations),
      metadata: this.metadata
    };
  }

  /**
   * Calculate success rate from evaluations
   */
  calculateSuccessRate(evaluations) {
    if (evaluations.length === 0) return 0;

    const successfulOutcomes = ['auto_apply', 'recommend', 'experimental'];
    const successCount = evaluations.filter(e =>
      successfulOutcomes.includes(e.result.outcome)
    ).length;

    return successCount / evaluations.length;
  }

  /**
   * Get evaluation history
   */
  getEvaluationHistory(options = {}) {
    let history = [...this.evaluationHistory];

    if (options.limit) {
      history = history.slice(-options.limit);
    }

    if (options.outcome) {
      history = history.filter(e => e.result.outcome === options.outcome);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(e => new Date(e.timestamp) > sinceDate);
    }

    return history;
  }

  /**
   * Export tree structure
   */
  exportTree() {
    return {
      treeId: this.treeId,
      metadata: this.metadata,
      structure: this.exportNode(this.rootNode),
      statistics: this.getStatistics()
    };
  }

  /**
   * Export node structure recursively
   */
  exportNode(node) {
    if (!node) return null;

    const nodeData = {
      nodeId: node.nodeId,
      nodeType: node.nodeType,
      condition: node.condition,
      metadata: node.metadata,
      statistics: node.getStatistics()
    };

    if (node.trueBranch) {
      nodeData.trueBranch = this.exportNode(node.trueBranch);
    }

    if (node.falseBranch) {
      nodeData.falseBranch = this.exportNode(node.falseBranch);
    }

    if (node.action) {
      nodeData.action = node.action;
    }

    return nodeData;
  }
}

class DecisionTreeBuilder {
  constructor() {
    this.nodes = new Map();
    this.trees = new Map();
  }

  /**
   * Create a new decision node
   */
  createNode(nodeId, nodeType = 'decision') {
    const node = new DecisionNode(nodeId, nodeType);
    this.nodes.set(nodeId, node);
    return node;
  }

  /**
   * Create a decision tree from configuration
   */
  createTreeFromConfig(treeId, config) {
    const tree = new DecisionTree(treeId);

    if (config.metadata) {
      tree.metadata = config.metadata;
    }

    if (config.nodes) {
      // Create all nodes first
      for (const [nodeId, nodeConfig] of Object.entries(config.nodes)) {
        const node = this.createNode(nodeId, nodeConfig.type || 'decision');

        if (nodeConfig.condition) {
          node.setCondition(nodeConfig.condition);
        }

        if (nodeConfig.action) {
          node.setAction(nodeConfig.action);
        }

        if (nodeConfig.terminal) {
          node.setTerminal(nodeConfig.terminal);
        }

        if (nodeConfig.metadata) {
          node.metadata = nodeConfig.metadata;
        }
      }

      // Set up branches
      for (const [nodeId, nodeConfig] of Object.entries(config.nodes)) {
        const node = this.nodes.get(nodeId);

        if (nodeConfig.branches) {
          const trueBranch = nodeConfig.branches.true ?
            this.nodes.get(nodeConfig.branches.true) : null;
          const falseBranch = nodeConfig.branches.false ?
            this.nodes.get(nodeConfig.branches.false) : null;

          node.setBranches(trueBranch, falseBranch);
        }
      }

      // Set root node
      if (config.rootNode && this.nodes.has(config.rootNode)) {
        tree.setRoot(this.nodes.get(config.rootNode));
      }
    }

    this.trees.set(treeId, tree);
    return tree;
  }

  /**
   * Build pattern application decision tree
   */
  buildPatternApplicationTree(treeId) {
    // Root decision: Check if pattern is deprecated
    const rootNode = this.createNode('check_deprecated', 'decision');
    rootNode.setCondition('confidence_score > 0.2');

    // Deprecated branch
    const deprecatedNode = this.createNode('deprecated_outcome', 'terminal');
    deprecatedNode.setTerminal('deprecated');

    // Active pattern branch
    const activeRoot = this.createNode('check_confidence_high', 'decision');
    activeRoot.setCondition('confidence_score >= 0.8');

    // High confidence branch
    const highConfidenceNode = this.createNode('check_risk_high_confidence', 'decision');
    highConfidenceNode.setCondition('risk_level != "high"');

    const autoApplyNode = this.createNode('auto_apply_outcome', 'terminal');
    autoApplyNode.setTerminal('auto_apply');

    const highRiskOverrideNode = this.createNode('high_risk_recommend', 'terminal');
    highRiskOverrideNode.setTerminal('recommend');

    // Medium confidence branch
    const mediumConfidenceNode = this.createNode('check_context_match', 'decision');
    mediumConfidenceNode.setCondition('context_match_score >= 0.7');

    const recommendNode = this.createNode('recommend_outcome', 'terminal');
    recommendNode.setTerminal('recommend');

    const reviewNode = this.createNode('review_outcome', 'terminal');
    reviewNode.setTerminal('review_required');

    // Low confidence branch
    const lowConfidenceNode = this.createNode('check_experimental_eligible', 'decision');
    lowConfidenceNode.setCondition('confidence_score >= 0.4');

    const experimentalNode = this.createNode('experimental_outcome', 'terminal');
    experimentalNode.setTerminal('experimental');

    const rejectNode = this.createNode('reject_outcome', 'terminal');
    rejectNode.setTerminal('reject');

    // Set up branches
    rootNode.setBranches(activeRoot, deprecatedNode);
    activeRoot.setBranches(highConfidenceNode, mediumConfidenceNode);
    highConfidenceNode.setBranches(autoApplyNode, highRiskOverrideNode);
    mediumConfidenceNode.setBranches(recommendNode, reviewNode);
    lowConfidenceNode.setBranches(experimentalNode, rejectNode);

    // Create tree
    const tree = new DecisionTree(treeId);
    tree.setRoot(rootNode);
    tree.metadata = {
      type: 'pattern_application',
      description: 'Decision tree for pattern application based on confidence and risk',
      version: '1.0.0'
    };

    this.trees.set(treeId, tree);
    return tree;
  }

  /**
   * Get tree by ID
   */
  getTree(treeId) {
    return this.trees.get(treeId);
  }

  /**
   * Get all trees
   */
  getAllTrees() {
    return Array.from(this.trees.values());
  }

  /**
   * Export all trees
   */
  exportAllTrees() {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      trees: {}
    };

    for (const [treeId, tree] of this.trees.entries()) {
      exportData.trees[treeId] = tree.exportTree();
    }

    return exportData;
  }
}

class DecisionTreeEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.builder = new DecisionTreeBuilder();
    this.activeTrees = new Map();
    this.evaluationStats = {
      totalEvaluations: 0,
      averageEvaluationTime: 0,
      successRate: 0
    };
  }

  /**
   * Initialize the decision tree engine
   */
  async initialize() {
    // Create default pattern application tree
    const defaultTree = this.builder.buildPatternApplicationTree('pattern_application_default');
    this.activeTrees.set('pattern_application_default', defaultTree);

    this.emit('engine_initialized', {
      timestamp: new Date().toISOString(),
      activeTrees: this.activeTrees.size
    });
  }

  /**
   * Evaluate pattern using decision tree
   */
  async evaluatePattern(pattern, context, treeId = 'pattern_application_default') {
    const tree = this.activeTrees.get(treeId) || this.builder.getTree(treeId);

    if (!tree) {
      throw new Error(`Decision tree ${treeId} not found`);
    }

    const startTime = Date.now();

    // Prepare evaluation context
    const evaluationContext = {
      confidence_score: pattern.confidence_score,
      success_rate: pattern.success_rate,
      context_match_score: context.context_match_score || 0.5,
      risk_level: context.risk_level || 'medium',
      pattern_type: pattern.metadata?.pattern_type || 'general',
      applications: pattern.metadata?.usage_statistics?.total_applications || 0,
      ...context
    };

    const result = await tree.evaluate(evaluationContext, { includeContext: false });

    const evaluationTime = Date.now() - startTime;
    this.updateEvaluationStats(evaluationTime, result.outcome !== 'error');

    this.emit('pattern_evaluated', {
      pattern_id: pattern.id,
      tree_id: treeId,
      result: result,
      evaluation_time: evaluationTime,
      context: evaluationContext
    });

    return result;
  }

  /**
   * Create custom decision tree
   */
  createDecisionTree(treeId, config) {
    const tree = this.builder.createTreeFromConfig(treeId, config);
    this.activeTrees.set(treeId, tree);

    this.emit('tree_created', {
      tree_id: treeId,
      timestamp: new Date().toISOString()
    });

    return tree;
  }

  /**
   * Get tree statistics
   */
  getTreeStatistics(treeId = null) {
    if (treeId) {
      const tree = this.activeTrees.get(treeId);
      return tree ? tree.getStatistics() : null;
    }

    const allStats = {};
    for (const [id, tree] of this.activeTrees.entries()) {
      allStats[id] = tree.getStatistics();
    }

    return allStats;
  }

  /**
   * Get engine statistics
   */
  getEngineStatistics() {
    return {
      ...this.evaluationStats,
      activeTrees: this.activeTrees.size,
      availableTrees: this.builder.getAllTrees().length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update evaluation statistics
   */
  updateEvaluationStats(evaluationTime, success) {
    this.evaluationStats.totalEvaluations++;

    // Update average evaluation time
    const currentAvg = this.evaluationStats.averageEvaluationTime;
    const newAvg = (currentAvg * (this.evaluationStats.totalEvaluations - 1) + evaluationTime) /
                   this.evaluationStats.totalEvaluations;
    this.evaluationStats.averageEvaluationTime = newAvg;

    // Update success rate (simplified - consider non-error outcomes as success)
    const currentSuccessRate = this.evaluationStats.successRate;
    const newSuccessRate = (currentSuccessRate * (this.evaluationStats.totalEvaluations - 1) + (success ? 1 : 0)) /
                           this.evaluationStats.totalEvaluations;
    this.evaluationStats.successRate = newSuccessRate;
  }

  /**
   * Export engine state
   */
  exportEngineState() {
    return {
      export_timestamp: new Date().toISOString(),
      evaluation_stats: this.evaluationStats,
      active_trees: Array.from(this.activeTrees.keys()),
      builder_state: this.builder.exportAllTrees()
    };
  }
}

module.exports = {
  DecisionNode,
  DecisionTree,
  DecisionTreeBuilder,
  DecisionTreeEngine
};