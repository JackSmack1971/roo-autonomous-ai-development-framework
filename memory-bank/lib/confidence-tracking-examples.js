/**
 * Confidence Tracking System Usage Examples
 *
 * Demonstrates how to use the confidence tracking system for
 * pattern confidence calculation, decision making, and adaptation
 */

const ConfidenceTrackingSystem = require('./confidence-tracking-system');

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
        description: "Design and implement secure authentication mechanism for component handling sensitive user data",
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
  }
];

/**
 * Example 1: Basic Confidence Tracking
 */
async function basicConfidenceTrackingExample() {
  console.log('=== Basic Confidence Tracking Example ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  const pattern = examplePatterns[0];
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    api_endpoints: true
  };

  // Process pattern through confidence tracking system
  const result = await system.processPattern(pattern, context);

  console.log('Pattern processed successfully:');
  console.log('- Confidence Score:', result.stages.confidence_calculation.confidence_score);
  console.log('- Decision:', result.final_decision.type);
  console.log('- Risk Level:', result.stages.decision_making.risk_assessment.level);

  return result;
}

/**
 * Example 2: Confidence Update from Application Outcome
 */
async function confidenceUpdateExample() {
  console.log('\n=== Confidence Update from Application Outcome ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  const pattern = examplePatterns[0];
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true
  };

  console.log('Initial confidence:', pattern.confidence_score);

  // Simulate successful pattern application
  const updateResult = await system.updatePatternConfidence(
    pattern.id,
    true,  // success
    0.1,   // quality impact
    context
  );

  console.log('Confidence updated:');
  console.log('- Previous confidence:', updateResult.previous_confidence);
  console.log('- New confidence:', updateResult.new_confidence);
  console.log('- Confidence change:', updateResult.confidence_change);

  // Simulate failed pattern application
  const failureResult = await system.updatePatternConfidence(
    pattern.id,
    false, // failure
    -0.2,   // negative quality impact
    context
  );

  console.log('After failure:');
  console.log('- New confidence:', failureResult.new_confidence);
  console.log('- Confidence change:', failureResult.confidence_change);

  return { successUpdate: updateResult, failureUpdate: failureResult };
}

/**
 * Example 3: Pattern Analytics and Insights
 */
async function patternAnalyticsExample() {
  console.log('\n=== Pattern Analytics Example ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  // Process multiple patterns to build analytics
  for (const pattern of examplePatterns) {
    const context = {
      component_type: pattern.metadata.pattern_type === 'security' ? 'authentication' : 'database',
      data_sensitivity: pattern.metadata.pattern_type === 'security' ? 'high' : 'medium',
      user_facing: true
    };

    await system.processPattern(pattern, context);
  }

  // Get analytics for first pattern
  const analytics = await system.getPatternAnalytics(examplePatterns[0].id);

  console.log('Pattern Analytics:');
  console.log('- Current confidence:', analytics.confidence_analytics?.current_confidence || 'N/A');
  console.log('- Confidence trend:', analytics.confidence_analytics?.confidence_trend || 'N/A');
  console.log('- Volatility:', analytics.confidence_analytics?.volatility || 'N/A');
  console.log('- Total decisions:', analytics.decision_analytics?.total_decisions || 0);

  return analytics;
}

/**
 * Example 4: Decision Making with Risk Assessment
 */
async function decisionMakingExample() {
  console.log('\n=== Decision Making with Risk Assessment ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  const highRiskContext = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    api_endpoints: true,
    compliance_requirements: ["gdpr", "hipaa"],
    team_size: "small_team",
    timeline_pressure: "high"
  };

  const lowRiskContext = {
    component_type: "logging",
    data_sensitivity: "low",
    user_facing: false,
    team_size: "large_team",
    timeline_pressure: "low"
  };

  console.log('High-risk context decision:');
  const highRiskDecision = await system.decisionEngine.makeDecision(
    examplePatterns[0],
    highRiskContext
  );
  console.log('- Decision type:', highRiskDecision.decision.type);
  console.log('- Risk level:', highRiskDecision.risk_assessment.level);
  console.log('- Confidence level:', highRiskDecision.decision.confidence_level);

  console.log('\nLow-risk context decision:');
  const lowRiskDecision = await system.decisionEngine.makeDecision(
    examplePatterns[1],
    lowRiskContext
  );
  console.log('- Decision type:', lowRiskDecision.decision.type);
  console.log('- Risk level:', lowRiskDecision.risk_assessment.level);
  console.log('- Confidence level:', lowRiskDecision.decision.confidence_level);

  return { highRiskDecision, lowRiskDecision };
}

/**
 * Example 5: Pattern Adaptation Analysis
 */
async function patternAdaptationExample() {
  console.log('\n=== Pattern Adaptation Analysis ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  const pattern = examplePatterns[0];
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true
  };

  // Create mock performance data
  const performanceData = {
    recent_success_rate: 0.95,
    context_match_score: 0.85,
    recent_quality_impact: 0.2,
    application_frequency: 5
  };

  // Analyze pattern performance and adaptation opportunities
  const analysis = await system.adaptationManager.analyzePatternPerformance(
    pattern,
    performanceData,
    context
  );

  console.log('Adaptation Analysis:');
  console.log('- Adaptation opportunities:', analysis.adaptation_opportunities.length);
  console.log('- Recommended adaptations:', analysis.recommended_adaptations.length);

  if (analysis.recommended_adaptations.length > 0) {
    const topRecommendation = analysis.recommended_adaptations[0];
    console.log('- Top recommendation:', topRecommendation.opportunity_type);
    console.log('- Priority:', topRecommendation.priority);
    console.log('- Expected impact:', topRecommendation.expected_impact);

    // Apply the adaptation
    const adaptationResult = await system.applyPatternAdaptation(
      pattern.id,
      topRecommendation
    );

    console.log('- Adaptation applied:', adaptationResult.status);
    console.log('- Actions taken:', adaptationResult.actions_taken.length);
  }

  return analysis;
}

/**
 * Example 6: System Health and Monitoring
 */
async function systemHealthExample() {
  console.log('\n=== System Health and Monitoring ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  // Get system health status
  const health = await system.getSystemHealth();
  console.log('System Health:');
  console.log('- Status:', health.status);
  console.log('- Components:', Object.entries(health.component_status)
    .map(([component, status]) => `${component}: ${status}`)
    .join(', '));

  // Get system metrics
  const metrics = await system.getSystemMetrics();
  console.log('\nSystem Metrics:');
  console.log('- Patterns processed:', metrics.patterns_processed);
  console.log('- Decisions made:', metrics.decisions_made);
  console.log('- Adaptations applied:', metrics.adaptations_applied);
  console.log('- System uptime:', Math.round(metrics.system_uptime), 'seconds');
  console.log('- Memory usage:', Math.round(metrics.memory_usage.heapUsed / 1024 / 1024), 'MB');

  return { health, metrics };
}

/**
 * Example 7: Event-Driven Confidence Tracking
 */
async function eventDrivenExample() {
  console.log('\n=== Event-Driven Confidence Tracking ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  // Listen for confidence tracking events
  const events = [];

  system.on('confidence_tracked', (data) => {
    events.push({ type: 'confidence_tracked', data });
    console.log('Confidence tracked event:', data.pattern.name);
  });

  system.on('decision_made', (data) => {
    events.push({ type: 'decision_made', data });
    console.log('Decision made event:', data.decision.type);
  });

  system.on('confidence_adapted', (data) => {
    events.push({ type: 'confidence_adapted', data });
    console.log('Confidence adapted event:', data.adaptation_event.adaptation_type);
  });

  // Process patterns to trigger events
  for (const pattern of examplePatterns) {
    const context = {
      component_type: pattern.metadata.pattern_type === 'security' ? 'authentication' : 'database',
      data_sensitivity: pattern.metadata.pattern_type === 'security' ? 'high' : 'medium',
      user_facing: true
    };

    await system.processPattern(pattern, context);

    // Simulate some confidence updates
    await system.updatePatternConfidence(pattern.id, true, 0.1, context);
  }

  console.log('\nEvents captured:', events.length);
  console.log('Event types:', [...new Set(events.map(e => e.type))]);

  return events;
}

/**
 * Example 8: Export and Reporting
 */
async function exportReportingExample() {
  console.log('\n=== Export and Reporting Example ===');

  const system = new ConfidenceTrackingSystem();
  await system.initialize();

  // Process some patterns first
  for (const pattern of examplePatterns) {
    const context = {
      component_type: pattern.metadata.pattern_type === 'security' ? 'authentication' : 'database',
      data_sensitivity: pattern.metadata.pattern_type === 'security' ? 'high' : 'medium',
      user_facing: true
    };

    await system.processPattern(pattern, context);
  }

  // Export system data
  const jsonExport = await system.exportSystemData('json');
  console.log('JSON export length:', jsonExport.length, 'characters');

  const csvExport = await system.exportSystemData('csv');
  console.log('CSV export lines:', csvExport.split('\n').length);

  // Export pattern analytics
  const patternAnalytics = await system.getPatternAnalytics(examplePatterns[0].id);
  console.log('Pattern analytics keys:', Object.keys(patternAnalytics));

  return {
    jsonExport,
    csvExport,
    patternAnalytics
  };
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('Starting Confidence Tracking System Examples...\n');

    // Run all examples sequentially
    await basicConfidenceTrackingExample();
    await confidenceUpdateExample();
    await patternAnalyticsExample();
    await decisionMakingExample();
    await patternAdaptationExample();
    await systemHealthExample();
    await eventDrivenExample();
    await exportReportingExample();

    console.log('\n✅ All confidence tracking examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
    throw error;
  }
}

// Export examples for individual execution
module.exports = {
  basicConfidenceTrackingExample,
  confidenceUpdateExample,
  patternAnalyticsExample,
  decisionMakingExample,
  patternAdaptationExample,
  systemHealthExample,
  eventDrivenExample,
  exportReportingExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}