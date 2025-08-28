/**
 * Pattern Application Decision Tree Examples
 *
 * Demonstrates how to use the pattern application decision tree
 * for making intelligent decisions about when to apply patterns
 */

const PatternApplicationDecisionTree = require('./pattern-application-decision-tree');

const examplePatterns = [
  {
    id: "auth_mechanism_undefined_v1",
    name: "Authentication Mechanism Undefined",
    description: "Pattern detects when components handle sensitive data but no authentication mechanism is specified",
    trigger_conditions: ["component_handles_user_data", "no_auth_specified", "security_implications_detected"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "sparc-security-architect",
      task_template: {
        title: "Implement OAuth2/JWT authentication pattern",
        description: "Design and implement secure authentication mechanism",
        acceptance_criteria: ["OAuth2/JWT authentication pattern implemented"],
        priority: "high",
        tags: ["security", "authentication"]
      }
    }],
    success_rate: 0.92,
    confidence_score: 0.85,
    context_match: {
      required_fields: ["component_type", "data_sensitivity"],
      optional_fields: ["user_facing", "api_endpoints"]
    },
    quality_gates: ["security_review"],
    metadata: {
      pattern_type: "security",
      created_at: "2025-08-28T00:30:00.000Z",
      usage_statistics: {
        total_applications: 23,
        successful_applications: 21,
        failed_applications: 2,
        average_quality_impact: 0.15
      }
    }
  },
  {
    id: "n_plus_one_query_v1",
    name: "N+1 Query Pattern",
    description: "Pattern detects multiple sequential database queries that could be optimized",
    trigger_conditions: ["multiple_sequential_queries", "user_facing_operation"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "database-specialist",
      task_template: {
        title: "Optimize N+1 query pattern",
        description: "Refactor sequential database queries into efficient batch operations",
        acceptance_criteria: ["Query optimization implemented"],
        priority: "high",
        tags: ["performance", "database"]
      }
    }],
    success_rate: 0.94,
    confidence_score: 0.88,
    context_match: {
      required_fields: ["query_pattern", "performance_impact"],
      optional_fields: ["scalability_requirements"]
    },
    quality_gates: ["performance_test"],
    metadata: {
      pattern_type: "performance",
      created_at: "2025-08-28T00:15:00.000Z",
      usage_statistics: {
        total_applications: 31,
        successful_applications: 29,
        failed_applications: 2,
        average_quality_impact: 0.25
      }
    }
  },
  {
    id: "experimental_pattern_v1",
    name: "Experimental API Validation",
    description: "Experimental pattern for API input validation",
    trigger_conditions: ["api_endpoint", "user_input"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "sparc-code-implementer",
      task_template: {
        title: "Implement API validation",
        description: "Add input validation to API endpoints",
        acceptance_criteria: ["Validation implemented"],
        priority: "medium",
        tags: ["api", "validation"]
      }
    }],
    success_rate: 0.75,
    confidence_score: 0.45,
    context_match: {
      required_fields: ["api_endpoint"],
      optional_fields: ["user_input"]
    },
    quality_gates: ["integration_test"],
    metadata: {
      pattern_type: "quality",
      created_at: "2025-08-27T20:00:00.000Z",
      usage_statistics: {
        total_applications: 8,
        successful_applications: 6,
        failed_applications: 2,
        average_quality_impact: 0.08
      }
    }
  },
  {
    id: "deprecated_pattern_v0.5",
    name: "Deprecated Logging Pattern",
    description: "Old logging pattern that should be deprecated",
    trigger_conditions: ["logging_required"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "sparc-code-implementer",
      task_template: {
        title: "Implement logging",
        description: "Add logging to component",
        acceptance_criteria: ["Logging implemented"],
        priority: "low",
        tags: ["logging"]
      }
    }],
    success_rate: 0.65,
    confidence_score: 0.18,
    context_match: {
      required_fields: ["logging_required"],
      optional_fields: []
    },
    quality_gates: ["code_review"],
    metadata: {
      pattern_type: "general",
      created_at: "2025-08-01T00:00:00.000Z",
      usage_statistics: {
        total_applications: 45,
        successful_applications: 29,
        failed_applications: 16,
        average_quality_impact: 0.05
      }
    }
  }
];

/**
 * Example 1: Basic Pattern Decision Making
 */
async function basicDecisionMakingExample() {
  console.log('=== Basic Pattern Decision Making Example ===');

  const decisionTree = new PatternApplicationDecisionTree();
  await decisionTree.initialize();

  const pattern = examplePatterns[0]; // High confidence security pattern
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    api_endpoints: true,
    context_match_score: 0.9,
    risk_level: "medium",
    quality_gates_passed: true,
    monitoring_available: true,
    is_production: false,
    timeline_pressure: "medium"
  };

  // Make decision about pattern application
  const decision = await decisionTree.makeDecision(pattern, context);

  console.log('Pattern Decision:');
  console.log('- Pattern:', pattern.name);
  console.log('- Decision:', decision.decision);
  console.log('- Confidence:', decision.confidence);
  console.log('- Reasoning:', decision.reasoning);
  console.log('- Risk Level:', decision.risk_assessment.level);
  console.log('- Recommendations:', decision.recommendations.length);

  return decision;
}

/**
 * Example 2: Decision Making with Different Confidence Levels
 */
async function confidenceLevelExample() {
  console.log('\n=== Decision Making with Different Confidence Levels ===');

  const decisionTree = new PatternApplicationDecisionTree();
  await decisionTree.initialize();

  const contexts = [
    {
      name: "High Confidence Context",
      context: {
        component_type: "authentication",
        data_sensitivity: "high",
        user_facing: true,
        context_match_score: 0.9,
        risk_level: "low",
        quality_gates_passed: true,
        monitoring_available: true
      }
    },
    {
      name: "Medium Confidence Context",
      context: {
        component_type: "database",
        data_sensitivity: "medium",
        user_facing: true,
        context_match_score: 0.7,
        risk_level: "medium",
        quality_gates_passed: true,
        monitoring_available: true
      }
    },
    {
      name: "Low Confidence Context",
      context: {
        component_type: "logging",
        data_sensitivity: "low",
        user_facing: false,
        context_match_score: 0.5,
        risk_level: "low",
        quality_gates_passed: true,
        monitoring_available: true
      }
    },
    {
      name: "Deprecated Pattern Context",
      context: {
        component_type: "legacy",
        data_sensitivity: "low",
        user_facing: false,
        context_match_score: 0.3,
        risk_level: "low",
        quality_gates_passed: false,
        monitoring_available: false
      }
    }
  ];

  const results = {};

  for (const { name, context } of contexts) {
    console.log(`\n--- ${name} ---`);

    // Test with high confidence pattern
    const highConfidenceDecision = await decisionTree.makeDecision(examplePatterns[0], context);
    console.log(`High Confidence Pattern: ${highConfidenceDecision.decision} (${highConfidenceDecision.confidence})`);

    // Test with medium confidence pattern
    const mediumConfidenceDecision = await decisionTree.makeDecision(examplePatterns[1], context);
    console.log(`Medium Confidence Pattern: ${mediumConfidenceDecision.decision} (${mediumConfidenceDecision.confidence})`);

    // Test with experimental pattern
    const experimentalDecision = await decisionTree.makeDecision(examplePatterns[2], context);
    console.log(`Experimental Pattern: ${experimentalDecision.decision} (${experimentalDecision.confidence})`);

    // Test with deprecated pattern
    const deprecatedDecision = await decisionTree.makeDecision(examplePatterns[3], context);
    console.log(`Deprecated Pattern: ${deprecatedDecision.decision} (${deprecatedDecision.confidence})`);

    results[name] = {
      highConfidence: highConfidenceDecision,
      mediumConfidence: mediumConfidenceDecision,
      experimental: experimentalDecision,
      deprecated: deprecatedDecision
    };
  }

  return results;
}

/**
 * Example 3: Risk Assessment and Mitigation
 */
async function riskAssessmentExample() {
  console.log('\n=== Risk Assessment and Mitigation Example ===');

  const decisionTree = new PatternApplicationDecisionTree();
  await decisionTree.initialize();

  const riskContexts = [
    {
      name: "High Risk Context",
      context: {
        component_type: "authentication",
        data_sensitivity: "high",
        user_facing: true,
        api_endpoints: true,
        context_match_score: 0.9,
        risk_level: "high",
        quality_gates_passed: true,
        monitoring_available: true,
        is_production: true,
        emergency_mode: false,
        timeline_pressure: "high"
      }
    },
    {
      name: "Medium Risk Context",
      context: {
        component_type: "database",
        data_sensitivity: "medium",
        user_facing: true,
        context_match_score: 0.8,
        risk_level: "medium",
        quality_gates_passed: true,
        monitoring_available: true,
        is_production: true,
        emergency_mode: false,
        timeline_pressure: "medium"
      }
    },
    {
      name: "Low Risk Context",
      context: {
        component_type: "logging",
        data_sensitivity: "low",
        user_facing: false,
        context_match_score: 0.6,
        risk_level: "low",
        quality_gates_passed: true,
        monitoring_available: true,
        is_production: false,
        emergency_mode: false,
        timeline_pressure: "low"
      }
    }
  ];

  const pattern = examplePatterns[0]; // High confidence security pattern

  for (const { name, context } of riskContexts) {
    console.log(`\n--- ${name} ---`);

    const decision = await decisionTree.makeDecision(pattern, context);

    console.log(`Decision: ${decision.decision}`);
    console.log(`Risk Score: ${decision.risk_assessment.score}`);
    console.log(`Risk Level: ${decision.risk_assessment.level}`);
    console.log(`Risk Factors: ${decision.risk_assessment.factors.join(', ')}`);
    console.log(`Mitigation Strategies: ${decision.risk_assessment.mitigation_strategies.length}`);
    console.log(`Recommendations: ${decision.recommendations.length}`);
  }
}

/**
 * Example 4: Decision Tree Customization
 */
async function decisionTreeCustomizationExample() {
  console.log('\n=== Decision Tree Customization Example ===');

  const decisionTree = new PatternApplicationDecisionTree({
    autoApplyThreshold: 0.9,      // Higher threshold for auto-apply
    recommendThreshold: 0.7,      // Higher threshold for recommendation
    experimentalThreshold: 0.5,   // Higher threshold for experimental
    deprecatedThreshold: 0.15     // Lower threshold for deprecation
  });
  await decisionTree.initialize();

  // Create custom decision tree with stricter criteria
  const customTreeConfig = {
    metadata: {
      type: 'pattern_application',
      description: 'Strict decision tree for high-risk environments',
      version: '1.0.0',
      created_at: new Date().toISOString()
    },
    rootNode: 'strict_eligibility_check',
    nodes: {
      strict_eligibility_check: {
        type: 'decision',
        condition: (context) => context.confidence_score >= 0.8 && context.quality_gates_passed === true,
        branches: {
          true: 'production_readiness_check',
          false: 'strict_reject'
        },
        metadata: {
          description: 'Strict eligibility check requiring high confidence and passed quality gates'
        }
      },
      strict_reject: {
        type: 'terminal',
        terminal: 'strict_reject',
        metadata: {
          description: 'Pattern rejected due to strict criteria'
        }
      },
      production_readiness_check: {
        type: 'decision',
        condition: (context) => !context.is_production || context.monitoring_available === true,
        branches: {
          true: 'auto_apply_outcome',
          false: 'production_review_required'
        },
        metadata: {
          description: 'Check production readiness requirements'
        }
      },
      auto_apply_outcome: {
        type: 'terminal',
        terminal: 'auto_apply',
        metadata: {
          description: 'Pattern approved for automatic application'
        }
      },
      production_review_required: {
        type: 'terminal',
        terminal: 'production_review_required',
        metadata: {
          description: 'Production deployment requires additional review'
        }
      }
    }
  };

  const customTree = decisionTree.decisionEngine.createDecisionTree('strict_production_tree', customTreeConfig);

  const pattern = examplePatterns[0];
  const productionContext = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    context_match_score: 0.9,
    risk_level: "high",
    quality_gates_passed: true,
    monitoring_available: true,
    is_production: true,
    emergency_mode: false
  };

  // Test with default tree
  const defaultDecision = await decisionTree.makeDecision(pattern, productionContext, {
    treeId: 'pattern_application_default'
  });

  // Test with custom strict tree
  const strictDecision = await decisionTree.makeDecision(pattern, productionContext, {
    treeId: 'strict_production_tree'
  });

  console.log('Default Tree Decision:', defaultDecision.decision);
  console.log('Strict Tree Decision:', strictDecision.decision);
  console.log('Decision Difference:', defaultDecision.decision !== strictDecision.decision);

  return { defaultDecision, strictDecision, customTree };
}

/**
 * Example 5: Decision History and Analytics
 */
async function decisionHistoryExample() {
  console.log('\n=== Decision History and Analytics Example ===');

  const decisionTree = new PatternApplicationDecisionTree();
  await decisionTree.initialize();

  // Make several decisions to build history
  const decisions = [];
  for (let i = 0; i < 10; i++) {
    const pattern = examplePatterns[i % examplePatterns.length];
    const context = {
      component_type: pattern.metadata.pattern_type === 'security' ? 'authentication' : 'database',
      data_sensitivity: pattern.metadata.pattern_type === 'security' ? 'high' : 'medium',
      user_facing: Math.random() > 0.5,
      context_match_score: 0.6 + Math.random() * 0.4,
      risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      quality_gates_passed: Math.random() > 0.2,
      monitoring_available: Math.random() > 0.3,
      is_production: Math.random() > 0.8,
      timeline_pressure: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    };

    const decision = await decisionTree.makeDecision(pattern, context);
    decisions.push(decision);
  }

  // Get decision statistics
  const statistics = decisionTree.getDecisionStatistics();
  console.log('Decision Statistics:');
  console.log('- Total Decisions:', statistics.total_decisions);
  console.log('- Average Confidence:', statistics.average_confidence?.toFixed(3));
  console.log('- Success Rate:', statistics.success_rate?.toFixed(3));
  console.log('- Decision Distribution:', statistics.decision_distribution);

  // Get recent decision history
  const recentHistory = decisionTree.getDecisionHistory({ limit: 5 });
  console.log('\nRecent Decision History:');
  recentHistory.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.pattern.name}: ${entry.decision.decision} (${entry.decision.confidence})`);
  });

  return { statistics, recentHistory, decisions };
}

/**
 * Example 6: Real-time Decision Monitoring
 */
async function realTimeMonitoringExample() {
  console.log('\n=== Real-time Decision Monitoring Example ===');

  const decisionTree = new PatternApplicationDecisionTree();
  await decisionTree.initialize();

  // Set up event listeners for real-time monitoring
  const events = [];

  decisionTree.on('decision_made', (decision) => {
    events.push({ type: 'decision_made', decision });
    console.log(`Decision made: ${decision.pattern_id} -> ${decision.decision}`);
  });

  decisionTree.on('initialized', (data) => {
    events.push({ type: 'initialized', data });
    console.log('Decision tree initialized');
  });

  // Make decisions to trigger events
  for (const pattern of examplePatterns.slice(0, 3)) {
    const context = {
      component_type: pattern.metadata.pattern_type === 'security' ? 'authentication' : 'database',
      data_sensitivity: pattern.metadata.pattern_type === 'security' ? 'high' : 'medium',
      user_facing: true,
      context_match_score: 0.8,
      risk_level: "medium",
      quality_gates_passed: true,
      monitoring_available: true
    };

    await decisionTree.makeDecision(pattern, context);
  }

  console.log('\nEvents captured:', events.length);
  console.log('Event types:', [...new Set(events.map(e => e.type))]);

  return events;
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('Starting Pattern Application Decision Tree Examples...\n');

    // Run all examples sequentially
    await basicDecisionMakingExample();
    await confidenceLevelExample();
    await riskAssessmentExample();
    await decisionTreeCustomizationExample();
    await decisionHistoryExample();
    await realTimeMonitoringExample();

    console.log('\n✅ All decision tree examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
    throw error;
  }
}

// Export examples for individual execution
module.exports = {
  basicDecisionMakingExample,
  confidenceLevelExample,
  riskAssessmentExample,
  decisionTreeCustomizationExample,
  decisionHistoryExample,
  realTimeMonitoringExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}