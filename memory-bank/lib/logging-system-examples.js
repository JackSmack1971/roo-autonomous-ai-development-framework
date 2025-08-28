/**
 * Pattern Success/Failure Logging System Examples
 *
 * Demonstrates how to use the comprehensive logging system for tracking
 * pattern application outcomes, analyzing performance, and triggering adaptations
 */

const PatternSuccessFailureLogger = require('./pattern-success-failure-logger');

const examplePatterns = [
  {
    id: "auth_mechanism_undefined_v1",
    name: "Authentication Mechanism Undefined",
    confidence_score: 0.85,
    success_rate: 0.92
  },
  {
    id: "n_plus_one_query_v1",
    name: "N+1 Query Pattern",
    confidence_score: 0.88,
    success_rate: 0.94
  },
  {
    id: "experimental_pattern_v1",
    name: "Experimental API Validation",
    confidence_score: 0.45,
    success_rate: 0.75
  }
];

/**
 * Example 1: Basic Pattern Application Logging
 */
async function basicLoggingExample() {
  console.log('=== Basic Pattern Application Logging Example ===');

  const logger = new PatternSuccessFailureLogger({
    adaptationEnabled: true,
    autoAnalysisEnabled: false
  });
  await logger.initialize();

  const pattern = examplePatterns[0];
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    context_match_score: 0.9,
    risk_level: "medium",
    quality_gates_passed: true,
    monitoring_available: true,
    decision_confidence: 0.85,
    execution_time_ms: 1250,
    quality_impact: 0.15
  };

  // Log successful pattern application
  console.log('Logging successful pattern application...');
  const successLog = await logger.logPatternSuccess(pattern.id, context, {
    session_id: "session_123",
    user_feedback: "Pattern applied successfully with good results"
  });
  console.log('Success logged:', successLog.log_type);

  // Log failed pattern application
  console.log('\nLogging failed pattern application...');
  const failureLog = await logger.logPatternFailure(
    pattern.id,
    context,
    "validation_schema_mismatch",
    {
      session_id: "session_124",
      error_stack: "Schema validation failed at line 42",
      recovery_actions: ["update_schema", "revalidate_conditions"],
      impact_assessment: "medium"
    }
  );
  console.log('Failure logged:', failureLog.log_type);

  // Get pattern logs
  const patternLogs = logger.logger.getApplicationLogs({ pattern_id: pattern.id });
  console.log(`\nRetrieved ${patternLogs.length} logs for pattern ${pattern.id}`);

  return { successLog, failureLog, patternLogs };
}

/**
 * Example 2: Pattern Analysis and Insights
 */
async function patternAnalysisExample() {
  console.log('\n=== Pattern Analysis and Insights Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Generate some test data
  const pattern = examplePatterns[0];
  for (let i = 0; i < 8; i++) {
    const context = {
      component_type: "authentication",
      data_sensitivity: i % 2 === 0 ? "high" : "medium",
      user_facing: true,
      context_match_score: 0.8 + Math.random() * 0.2,
      risk_level: i % 3 === 0 ? "high" : "medium",
      quality_gates_passed: i < 7, // One failure
      decision_confidence: 0.8 + Math.random() * 0.15,
      execution_time_ms: 1000 + Math.random() * 1000,
      quality_impact: (Math.random() - 0.5) * 0.4
    };

    const outcome = i < 7 ? 'success' : 'failure';
    const details = outcome === 'failure' ? {
      failure_reason: "context_mismatch",
      error_stack: "Context validation failed"
    } : {};

    await logger.logPatternApplication(pattern.id, context, outcome, details);
  }

  // Perform pattern analysis
  console.log('Performing pattern analysis...');
  const analysis = await logger.performPatternAnalysis(pattern.id);

  console.log('Analysis Results:');
  console.log('- Patterns analyzed:', analysis.patterns_analyzed.size);
  console.log('- Insights generated:', analysis.insights.length);
  console.log('- Recommendations:', analysis.recommendations.length);
  console.log('- Risk indicators:', analysis.risk_indicators.length);

  if (analysis.insights.length > 0) {
    console.log('\nTop Insights:');
    analysis.insights.slice(0, 2).forEach((insight, index) => {
      console.log(`${index + 1}. ${insight.message} (${insight.level})`);
    });
  }

  return analysis;
}

/**
 * Example 3: System-Wide Analysis
 */
async function systemAnalysisExample() {
  console.log('\n=== System-Wide Analysis Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Generate test data for multiple patterns
  for (const pattern of examplePatterns) {
    for (let i = 0; i < 5; i++) {
      const context = {
        component_type: pattern.id.includes('auth') ? 'authentication' :
                       pattern.id.includes('query') ? 'database' : 'api',
        data_sensitivity: Math.random() > 0.5 ? 'high' : 'medium',
        user_facing: Math.random() > 0.3,
        context_match_score: 0.7 + Math.random() * 0.3,
        risk_level: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        quality_gates_passed: Math.random() > 0.2,
        decision_confidence: pattern.confidence_score * (0.9 + Math.random() * 0.2),
        execution_time_ms: 800 + Math.random() * 1200,
        quality_impact: (Math.random() - 0.5) * 0.6
      };

      const outcome = Math.random() > 0.2 ? 'success' : 'failure';
      await logger.logPatternApplication(pattern.id, context, outcome);
    }
  }

  // Perform system-wide analysis
  console.log('Performing system-wide analysis...');
  const systemAnalysis = await logger.performSystemAnalysis();

  console.log('System Analysis Results:');
  console.log('- Total patterns analyzed:', systemAnalysis.patterns_analyzed.size);
  console.log('- System success rate:', (systemAnalysis.trend_analysis.system_success_rate * 100).toFixed(1) + '%');
  console.log('- Insights generated:', systemAnalysis.insights.length);
  console.log('- Risk indicators:', systemAnalysis.risk_indicators.length);

  console.log('\nPerformance Clusters:');
  console.log('- High performing patterns:', systemAnalysis.trend_analysis.performance_clusters.high_performing.length);
  console.log('- Medium performing patterns:', systemAnalysis.trend_analysis.performance_clusters.medium_performing.length);
  console.log('- Low performing patterns:', systemAnalysis.trend_analysis.performance_clusters.low_performing.length);

  return systemAnalysis;
}

/**
 * Example 4: Adaptation Trigger System
 */
async function adaptationTriggerExample() {
  console.log('\n=== Adaptation Trigger System Example ===');

  const logger = new PatternSuccessFailureLogger({
    adaptationEnabled: true
  });
  await logger.initialize();

  // Generate data that should trigger adaptations
  const pattern = examplePatterns[2]; // Experimental pattern with lower confidence

  // Generate multiple failures to trigger adaptation
  for (let i = 0; i < 6; i++) {
    const context = {
      component_type: "api",
      data_sensitivity: "medium",
      user_facing: true,
      context_match_score: 0.5 + Math.random() * 0.3,
      risk_level: "medium",
      quality_gates_passed: i < 5, // One failure
      decision_confidence: 0.4 + Math.random() * 0.2,
      execution_time_ms: 600 + Math.random() * 800,
      quality_impact: -0.1 + Math.random() * 0.3
    };

    const outcome = i < 5 ? 'success' : 'failure';
    const details = outcome === 'failure' ? {
      failure_reason: "validation_error",
      error_stack: "Input validation failed"
    } : {};

    await logger.logPatternApplication(pattern.id, context, outcome, details);
  }

  // Trigger analysis which should trigger adaptations
  console.log('Triggering pattern analysis for adaptation...');
  const analysis = await logger.performPatternAnalysis(pattern.id);

  console.log('Adaptation Analysis:');
  console.log('- Adaptation opportunities:', analysis.patterns_analyzed.get(pattern.id)?.adaptation_opportunities?.length || 0);
  console.log('- Recommended adaptations:', analysis.patterns_analyzed.get(pattern.id)?.recommended_adaptations?.length || 0);

  // Check for triggered adaptations
  const triggerStats = logger.trigger.getTriggerStatistics();
  console.log('\nAdaptation Triggers:');
  console.log('- Total triggers:', triggerStats.total_triggers);
  console.log('- Active triggers:', triggerStats.active_triggers);

  return { analysis, triggerStats };
}

/**
 * Example 5: Performance Metrics and Monitoring
 */
async function performanceMetricsExample() {
  console.log('\n=== Performance Metrics and Monitoring Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Generate diverse performance data
  for (const pattern of examplePatterns) {
    for (let i = 0; i < 10; i++) {
      const context = {
        component_type: pattern.id.includes('auth') ? 'authentication' :
                       pattern.id.includes('query') ? 'database' : 'api',
        data_sensitivity: Math.random() > 0.5 ? 'high' : 'medium',
        user_facing: Math.random() > 0.4,
        context_match_score: 0.6 + Math.random() * 0.4,
        risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        quality_gates_passed: Math.random() > 0.15,
        decision_confidence: pattern.confidence_score * (0.8 + Math.random() * 0.4),
        execution_time_ms: 500 + Math.random() * 2000,
        quality_impact: (Math.random() - 0.5) * 0.8
      };

      const outcome = Math.random() > 0.25 ? 'success' : 'failure';
      await logger.logPatternApplication(pattern.id, context, outcome);
    }
  }

  // Get pattern metrics
  console.log('Getting pattern metrics...');
  const patternMetrics = await logger.getPatternMetrics(examplePatterns[0].id);

  console.log('Pattern Metrics:');
  console.log('- Total applications:', patternMetrics.total_applications);
  console.log('- Success rate:', (patternMetrics.success_rate * 100).toFixed(1) + '%');
  console.log('- Average confidence:', (patternMetrics.average_confidence * 100).toFixed(1) + '%');
  console.log('- Average quality impact:', (patternMetrics.average_quality_impact * 100).toFixed(1) + ' points');

  // Get system metrics
  console.log('\nGetting system metrics...');
  const systemMetrics = await logger.getSystemMetrics();

  console.log('System Metrics:');
  console.log('- Total applications logged:', systemMetrics.total_applications_logged);
  console.log('- Total failures logged:', systemMetrics.total_failures_logged);
  console.log('- Overall success rate:', (systemMetrics.success_rate * 100).toFixed(1) + '%');
  console.log('- Average processing time:', Math.round(systemMetrics.average_processing_time), 'ms');

  return { patternMetrics, systemMetrics };
}

/**
 * Example 6: Data Export and Reporting
 */
async function dataExportExample() {
  console.log('\n=== Data Export and Reporting Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Generate some test data
  for (const pattern of examplePatterns.slice(0, 2)) {
    for (let i = 0; i < 3; i++) {
      const context = {
        component_type: pattern.id.includes('auth') ? 'authentication' : 'database',
        data_sensitivity: 'medium',
        user_facing: true,
        context_match_score: 0.8,
        risk_level: 'low',
        quality_gates_passed: true,
        decision_confidence: pattern.confidence_score,
        execution_time_ms: 1000,
        quality_impact: 0.1
      };

      await logger.logPatternApplication(pattern.id, context, 'success');
    }
  }

  // Export logging data in different formats
  console.log('Exporting logging data...');

  const jsonExport = await logger.exportLoggingData('json');
  console.log('JSON export length:', jsonExport.length, 'characters');

  const csvExport = await logger.exportLoggingData('csv');
  console.log('CSV export lines:', csvExport.split('\n').length);

  // Get logger statistics
  const loggerStats = logger.logger.getStatistics();
  console.log('\nLogger Statistics:');
  console.log('- Application logs:', loggerStats.application_logs.total);
  console.log('- Failure logs:', loggerStats.failure_logs.total);
  console.log('- Audit logs:', loggerStats.audit_logs.total);

  return { jsonExport, csvExport, loggerStats };
}

/**
 * Example 7: Event-Driven Logging and Monitoring
 */
async function eventDrivenExample() {
  console.log('\n=== Event-Driven Logging and Monitoring Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Set up event listeners
  const events = [];

  logger.on('pattern_application_logged', (data) => {
    events.push({ type: 'pattern_application_logged', data });
    console.log(`Pattern application logged: ${data.pattern_id}`);
  });

  logger.on('pattern_failure_logged', (data) => {
    events.push({ type: 'pattern_failure_logged', data });
    console.log(`Pattern failure logged: ${data.pattern_id} - ${data.failure_reason}`);
  });

  logger.on('pattern_analysis_completed', (data) => {
    events.push({ type: 'pattern_analysis_completed', data });
    console.log(`Pattern analysis completed: ${data.pattern_id}`);
  });

  logger.on('adaptation_trigger_created', (data) => {
    events.push({ type: 'adaptation_trigger_created', data });
    console.log(`Adaptation trigger created: ${data.pattern_id} - ${data.rule_id}`);
  });

  // Generate events by logging pattern applications
  for (const pattern of examplePatterns) {
    const context = {
      component_type: pattern.id.includes('auth') ? 'authentication' : 'database',
      data_sensitivity: 'medium',
      user_facing: true,
      context_match_score: 0.8,
      risk_level: 'low',
      quality_gates_passed: true,
      decision_confidence: pattern.confidence_score,
      execution_time_ms: 1000,
      quality_impact: 0.05
    };

    // Log success
    await logger.logPatternApplication(pattern.id, context, 'success');

    // Occasionally log failure
    if (Math.random() > 0.7) {
      await logger.logPatternApplication(pattern.id, context, 'failure', {
        failure_reason: 'context_mismatch'
      });
    }
  }

  console.log('\nEvents captured:', events.length);
  console.log('Event types:', [...new Set(events.map(e => e.type))]);

  return events;
}

/**
 * Example 8: Cleanup and Maintenance
 */
async function cleanupExample() {
  console.log('\n=== Cleanup and Maintenance Example ===');

  const logger = new PatternSuccessFailureLogger();
  await logger.initialize();

  // Generate some historical data
  for (let i = 0; i < 20; i++) {
    const pattern = examplePatterns[i % examplePatterns.length];
    const context = {
      component_type: 'test',
      data_sensitivity: 'low',
      user_facing: false,
      context_match_score: 0.7,
      risk_level: 'low',
      quality_gates_passed: true,
      decision_confidence: 0.8,
      execution_time_ms: 500,
      quality_impact: 0.0
    };

    await logger.logPatternApplication(pattern.id, context, 'success');
  }

  // Get initial statistics
  const initialStats = await logger.getSystemMetrics();
  console.log('Initial state:');
  console.log('- Application logs:', initialStats.total_applications_logged);
  console.log('- Failure logs:', initialStats.total_failures_logged);

  // Perform cleanup
  console.log('\nPerforming cleanup (30 day retention)...');
  const cleanupResults = await logger.cleanup({ retention_days: 30 });

  console.log('Cleanup Results:');
  console.log('- Logger cleanup:', cleanupResults.logger_cleanup);
  console.log('- Analysis cleanup:', cleanupResults.analysis_cleanup);

  // Get final statistics
  const finalStats = await logger.getSystemMetrics();
  console.log('\nFinal state:');
  console.log('- Application logs:', finalStats.total_applications_logged);
  console.log('- Failure logs:', finalStats.total_failures_logged);

  return { initialStats, cleanupResults, finalStats };
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('Starting Pattern Success/Failure Logging System Examples...\n');

    // Run all examples sequentially
    await basicLoggingExample();
    await patternAnalysisExample();
    await systemAnalysisExample();
    await adaptationTriggerExample();
    await performanceMetricsExample();
    await dataExportExample();
    await eventDrivenExample();
    await cleanupExample();

    console.log('\n✅ All logging system examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
    throw error;
  }
}

// Export examples for individual execution
module.exports = {
  basicLoggingExample,
  patternAnalysisExample,
  systemAnalysisExample,
  adaptationTriggerExample,
  performanceMetricsExample,
  dataExportExample,
  eventDrivenExample,
  cleanupExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}