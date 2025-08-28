/**
 * Pattern Storage System Usage Examples
 *
 * This file demonstrates how to use the actionable pattern storage system
 * for storing, retrieving, and managing patterns with auto-apply functionality.
 */

const PatternManager = require('./pattern-manager');
const path = require('path');

/**
 * Example 1: Basic Pattern Storage and Retrieval
 */
async function basicPatternExample() {
  console.log('=== Basic Pattern Storage Example ===');

  // Initialize pattern manager
  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data'),
    autoApplyEnabled: true,
    recommendationEnabled: true
  });

  await manager.initialize();

  // Create a new pattern
  const newPattern = {
    name: "Database Connection Pool Optimization",
    description: "Pattern detects database operations without connection pooling",
    trigger_conditions: [
      "database_operations_detected",
      "no_connection_pool_configured",
      "high_connection_count"
    ],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "database-specialist",
      task_template: {
        title: "Implement database connection pooling",
        description: "Configure connection pool with appropriate settings for the database workload",
        acceptance_criteria: [
          "Connection pool configured with optimal settings",
          "Connection monitoring implemented",
          "Performance benchmarks validate improvements"
        ],
        priority: "medium",
        tags: ["database", "performance", "connection_pool"]
      }
    }],
    success_rate: 0.88,
    confidence_score: 0.82,
    context_match: {
      required_fields: ["database_type", "connection_pattern"],
      optional_fields: ["workload_type", "scalability_requirements"]
    },
    quality_gates: ["performance_test", "database_review"],
    metadata: {
      pattern_type: "performance",
      tags: ["database", "connection_pool", "optimization"]
    }
  };

  // Store the pattern
  const storedPattern = await manager.createPattern(newPattern);
  console.log('Pattern created:', storedPattern.id);

  // Retrieve the pattern
  const retrievedPattern = await manager.storage.getPattern(storedPattern.id);
  console.log('Pattern retrieved:', retrievedPattern.name);

  // Search for patterns
  const searchResults = await manager.searchPatterns('database');
  console.log('Search results:', searchResults.length, 'patterns found');

  return storedPattern;
}

/**
 * Example 2: Context-Aware Pattern Matching
 */
async function contextMatchingExample() {
  console.log('\n=== Context-Aware Pattern Matching Example ===');

  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data')
  });

  await manager.initialize();

  // Define current context
  const context = {
    component_type: "authentication",
    data_sensitivity: "high",
    user_facing: true,
    api_endpoints: true,
    technology_stack: ["nodejs", "express", "mongodb"],
    project_type: "web_app",
    team_size: "small_team"
  };

  // Find matching patterns
  const matchingPatterns = await manager.findMatchingPatterns(context, {
    confidenceThreshold: 0.7,
    limit: 5
  });

  console.log('Matching patterns:', matchingPatterns.length);
  matchingPatterns.forEach(pattern => {
    console.log(`- ${pattern.name} (confidence: ${pattern.confidence_score})`);
  });

  // Get auto-apply patterns
  const autoApplyPatterns = await manager.getAutoApplyPatterns(context);
  console.log('Auto-apply patterns:', autoApplyPatterns.length);

  // Get recommendations
  const recommendations = await manager.getRecommendations(context, 3);
  console.log('Recommendations:', recommendations.length);

  return { matchingPatterns, autoApplyPatterns, recommendations };
}

/**
 * Example 3: Pattern Application and Learning
 */
async function patternApplicationExample() {
  console.log('\n=== Pattern Application and Learning Example ===');

  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data'),
    learningEnabled: true
  });

  await manager.initialize();

  // Find a pattern to apply
  const patterns = await manager.storage.getPatterns({
    confidence_threshold: 0.8,
    limit: 1
  });

  if (patterns.length === 0) {
    console.log('No patterns available for application');
    return;
  }

  const pattern = patterns[0];
  console.log('Applying pattern:', pattern.name);

  // Apply the pattern
  const context = {
    component_type: "user_management",
    data_sensitivity: "high",
    user_facing: true
  };

  const results = await manager.applyPattern(pattern.id, context, true);
  console.log('Pattern application results:', results.length, 'actions executed');

  // Update pattern confidence based on success
  const newConfidence = await manager.updatePatternConfidence(pattern.id, true, 0.1);
  console.log('Updated confidence:', newConfidence);

  return results;
}

/**
 * Example 4: Pattern Analytics and Reporting
 */
async function analyticsExample() {
  console.log('\n=== Pattern Analytics Example ===');

  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data')
  });

  await manager.initialize();

  // Get pattern statistics
  const stats = await manager.getPatternAnalytics();
  console.log('Pattern Statistics:');
  console.log('- Total patterns:', stats.total_patterns);
  console.log('- Average confidence:', stats.average_confidence?.toFixed(3));
  console.log('- Average success rate:', stats.average_success_rate?.toFixed(3));
  console.log('- Total applications:', stats.total_applications);

  // Get top performing patterns
  const topPatterns = await manager.getTopPerformingPatterns(3);
  console.log('\nTop Performing Patterns:');
  topPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern.name} (success: ${(pattern.success_rate * 100).toFixed(1)}%, confidence: ${(pattern.confidence_score * 100).toFixed(1)}%)`);
  });

  // Get recent activity
  const recentActivity = await manager.getRecentActivity(7);
  console.log('\nRecent Activity (last 7 days):', recentActivity.length, 'events');

  return stats;
}

/**
 * Example 5: Pattern Import/Export
 */
async function importExportExample() {
  console.log('\n=== Pattern Import/Export Example ===');

  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data')
  });

  await manager.initialize();

  // Export patterns to JSON
  const jsonExport = await manager.exportPatterns('json');
  console.log('Exported patterns to JSON:', jsonExport.length, 'characters');

  // Export patterns to CSV
  const csvExport = await manager.exportPatterns('csv');
  console.log('Exported patterns to CSV:', csvExport.split('\n').length, 'lines');

  // Create a new pattern for import
  const newPattern = {
    name: "Test Import Pattern",
    description: "Pattern created for import testing",
    trigger_conditions: ["test_condition"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "sparc-code-implementer",
      task_template: {
        title: "Test task from import",
        description: "Task created during pattern import test",
        acceptance_criteria: ["Test completed"],
        priority: "low",
        tags: ["test", "import"]
      }
    }],
    success_rate: 0.9,
    confidence_score: 0.8,
    context_match: {
      required_fields: ["test_field"]
    },
    quality_gates: ["test_gate"],
    metadata: {
      pattern_type: "general",
      tags: ["test", "import"]
    }
  };

  // Import the pattern
  const importResults = await manager.importPatterns([newPattern]);
  console.log('Import results:', importResults);

  return { jsonExport, csvExport, importResults };
}

/**
 * Example 6: Event-Driven Pattern Management
 */
async function eventDrivenExample() {
  console.log('\n=== Event-Driven Pattern Management Example ===');

  const manager = new PatternManager({
    storagePath: path.join(__dirname, '..', 'data')
  });

  await manager.initialize();

  // Listen for pattern events
  manager.on('pattern_created', (pattern) => {
    console.log('Pattern created event:', pattern.id);
  });

  manager.on('pattern_applied', (data) => {
    console.log('Pattern applied event:', data.pattern.name);
  });

  manager.on('event_logged', (event) => {
    console.log('Event logged:', event.event_type);
  });

  // Create a pattern to trigger events
  const testPattern = {
    name: "Event Test Pattern",
    description: "Pattern for testing event system",
    trigger_conditions: ["event_test"],
    auto_apply_actions: [{
      action_type: "task_creation",
      target_mode: "sparc-code-implementer",
      task_template: {
        title: "Event test task",
        description: "Task created for event testing",
        acceptance_criteria: ["Event test completed"],
        priority: "low",
        tags: ["test", "event"]
      }
    }],
    success_rate: 0.95,
    confidence_score: 0.85,
    context_match: {
      required_fields: ["test_context"]
    },
    quality_gates: ["test_review"],
    metadata: {
      pattern_type: "general",
      tags: ["test", "event"]
    }
  };

  const createdPattern = await manager.createPattern(testPattern);

  // Apply the pattern to trigger more events
  await manager.applyPattern(createdPattern.id, { test_context: true }, true);

  // Get event log
  const events = manager.getEventLog({ limit: 10 });
  console.log('Recent events:', events.length);

  return events;
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('Starting Pattern Storage System Examples...\n');

    // Run all examples sequentially
    await basicPatternExample();
    await contextMatchingExample();
    await patternApplicationExample();
    await analyticsExample();
    await importExportExample();
    await eventDrivenExample();

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
    throw error;
  }
}

// Export examples for individual execution
module.exports = {
  basicPatternExample,
  contextMatchingExample,
  patternApplicationExample,
  analyticsExample,
  importExportExample,
  eventDrivenExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}