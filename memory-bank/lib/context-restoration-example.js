/**
 * Context Restoration Example
 *
 * Demonstrates advanced context restoration with conflict resolution,
 * incremental building, and optimization capabilities
 */

const ContextRestorationManager = require('./context-restoration-manager');
const SessionHandoffManager = require('./session-handoff-manager');

class ContextRestorationExample {
  constructor() {
    this.restorationManager = new ContextRestorationManager({
      enableConflictResolution: true,
      enableIncrementalBuilding: true,
      enableOptimization: true,
      conflictResolutionStrategy: 'latest_wins',
      restorationQualityThreshold: 0.8
    });

    this.sessionManager = new SessionHandoffManager({
      handoffStoragePath: './example-context-restoration'
    });

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.restorationManager.on('restoration_started', (data) => {
      console.log(`🔄 Context restoration started: ${data.restorationId}`);
    });

    this.restorationManager.on('restoration_completed', (data) => {
      console.log(`✅ Context restoration completed: ${data.restorationId} (${Math.round(data.quality * 100)}% quality)`);
    });

    this.restorationManager.on('conflict_detected', (data) => {
      console.log(`⚠️  Conflict detected: ${data.conflictId} (${data.conflictType})`);
    });

    this.restorationManager.on('conflict_resolved', (data) => {
      console.log(`🔧 Conflict resolved: ${data.conflictId} (${data.resolutionStrategy})`);
    });

    this.restorationManager.on('incremental_restoration_completed', (data) => {
      console.log(`📈 Incremental restoration completed: ${data.restorationId} (${data.incrementsApplied} increments)`);
    });
  }

  /**
   * Example: Complete context restoration with conflict resolution
   */
  async exampleCompleteRestoration() {
    console.log('\n🔄 Example: Complete Context Restoration');
    console.log('=' .repeat(60));

    try {
      // Create a session with learning context
      const sessionData = {
        mode: 'code',
        user_id: 'developer_123',
        project_id: 'ecommerce_api',
        creation_reason: 'feature_development'
      };

      const sourceContext = {
        technology_stack: ['react', 'nodejs', 'mongodb'],
        project_type: 'web_application',
        team_size: 'small',
        security_level: 'medium',
        quality_requirements: 'high',
        architecture_pattern: 'microservices',
        deployment_environment: 'aws',
        compliance_requirements: ['gdpr']
      };

      console.log('🎬 Creating session with source context...');
      const session = await this.sessionManager.createSession(sessionData, sourceContext);

      // Simulate learning activities
      await this.simulateLearningActivities(session.session_id, sourceContext);

      // Create handoff
      console.log('\n📤 Creating session handoff...');
      const handoff = await this.sessionManager.initiateHandoff(session.session_id, 'context_restoration_demo');

      // Simulate context changes (target context)
      const targetContext = {
        technology_stack: ['react', 'typescript', 'postgresql'], // Changed from mongodb to postgresql
        project_type: 'web_application',
        team_size: 'medium', // Same
        security_level: 'high', // Changed from medium to high
        quality_requirements: 'critical', // Changed from high to critical
        architecture_pattern: 'monolithic', // Changed from microservices to monolithic
        deployment_environment: 'azure', // Changed from aws to azure
        compliance_requirements: ['gdpr', 'ccpa'] // Added ccpa
      };

      console.log('\n🎯 Target context (current environment):');
      console.log(`   Technology: ${targetContext.technology_stack.join(', ')}`);
      console.log(`   Security: ${targetContext.security_level}`);
      console.log(`   Quality: ${targetContext.quality_requirements}`);
      console.log(`   Architecture: ${targetContext.architecture_pattern}`);
      console.log(`   Deployment: ${targetContext.deployment_environment}`);

      // Perform complete context restoration
      console.log('\n🔄 Performing complete context restoration...');
      const restoration = await this.restorationManager.restoreContext(
        handoff.handoff_id,
        targetContext,
        {
          conflictResolutionStrategy: 'latest_wins',
          enableOptimization: true
        }
      );

      console.log(`\n📊 Restoration Results:`);
      console.log(`   Quality Score: ${(restoration.quality_score * 100).toFixed(1)}%`);
      console.log(`   Conflicts Resolved: ${restoration.conflicts_resolved}`);
      console.log(`   Restored Context:`);
      console.log(`     Technology: ${restoration.context.technology_stack.join(', ')}`);
      console.log(`     Security: ${restoration.context.security_level}`);
      console.log(`     Quality: ${restoration.context.quality_requirements}`);
      console.log(`     Architecture: ${restoration.context.architecture_pattern}`);

      return {
        session,
        handoff,
        restoration
      };

    } catch (error) {
      console.error('Complete restoration example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Incremental context restoration
   */
  async exampleIncrementalRestoration() {
    console.log('\n📈 Example: Incremental Context Restoration');
    console.log('=' .repeat(60));

    try {
      // Create session with complex context
      const sessionData = {
        mode: 'architect',
        user_id: 'architect_456',
        project_id: 'enterprise_system',
        creation_reason: 'system_design'
      };

      const complexContext = {
        technology_stack: ['java', 'spring_boot', 'kubernetes', 'postgresql', 'redis', 'elasticsearch'],
        project_type: 'enterprise_system',
        team_size: 'large',
        security_level: 'critical',
        quality_requirements: 'critical',
        architecture_pattern: 'microservices',
        deployment_environment: 'hybrid_cloud',
        compliance_requirements: ['gdpr', 'pci_dss', 'sox'],
        business_objectives: ['scalability', 'reliability', 'cost_optimization'],
        stakeholder_concerns: ['security', 'compliance', 'performance'],
        constraints: ['cloud_vendor_lock_in', 'budget_limits', 'timeline_constraints']
      };

      console.log('🎬 Creating session with complex context...');
      const session = await this.sessionManager.createSession(sessionData, complexContext);

      // Simulate extensive learning activities
      await this.simulateExtensiveLearningActivities(session.session_id, complexContext);

      // Create handoff
      const handoff = await this.sessionManager.initiateHandoff(session.session_id, 'incremental_demo');

      // Start with minimal target context
      const minimalTargetContext = {
        technology_stack: ['java'],
        project_type: 'enterprise_system'
      };

      console.log('\n🎯 Starting with minimal context and building incrementally...');
      console.log(`   Initial Technology: ${minimalTargetContext.technology_stack.join(', ')}`);

      // Perform incremental restoration
      const incrementalRestoration = await this.restorationManager.incrementalRestoreContext(
        handoff.handoff_id,
        minimalTargetContext,
        {
          handoffId: handoff.handoff_id,
          maxIncrements: 10
        }
      );

      console.log(`\n📊 Incremental Restoration Results:`);
      console.log(`   Increments Applied: ${incrementalRestoration.increments_applied}`);
      console.log(`   Final Quality Score: ${(incrementalRestoration.quality_score * 100).toFixed(1)}%`);
      console.log(`   Quality Evolution: ${incrementalRestoration.quality_evolution.map(q => `${(q.quality_score * 100).toFixed(0)}%`).join(' → ')}`);

      console.log(`\n🏗️ Final Restored Context:`);
      console.log(`   Technology: ${incrementalRestoration.context.technology_stack.join(', ')}`);
      console.log(`   Security: ${incrementalRestoration.context.security_level}`);
      console.log(`   Architecture: ${incrementalRestoration.context.architecture_pattern}`);
      console.log(`   Compliance: ${incrementalRestoration.context.compliance_requirements.join(', ')}`);

      return {
        session,
        handoff,
        incrementalRestoration
      };

    } catch (error) {
      console.error('Incremental restoration example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Conflict resolution strategies
   */
  async exampleConflictResolutionStrategies() {
    console.log('\n⚖️ Example: Conflict Resolution Strategies');
    console.log('=' .repeat(60));

    const strategies = ['latest_wins', 'source_wins', 'merge_arrays'];
    const results = {};

    for (const strategy of strategies) {
      console.log(`\n🔧 Testing ${strategy.toUpperCase()} strategy...`);

      try {
        // Create session with conflicting context
        const sessionData = {
          mode: 'code',
          user_id: 'conflict_demo',
          project_id: 'conflict_test'
        };

        const sourceContext = {
          technology_stack: ['react', 'nodejs', 'mongodb'],
          security_level: 'medium',
          quality_requirements: 'high',
          compliance_requirements: ['gdpr']
        };

        const session = await this.sessionManager.createSession(sessionData, sourceContext);
        const handoff = await this.sessionManager.initiateHandoff(session.session_id, `conflict_${strategy}`);

        // Create conflicting target context
        const targetContext = {
          technology_stack: ['vue', 'python', 'postgresql'], // Completely different tech stack
          security_level: 'high', // Higher security
          quality_requirements: 'critical', // Higher quality
          compliance_requirements: ['gdpr', 'ccpa'] // Additional compliance
        };

        // Restore with specific strategy
        const restoration = await this.restorationManager.restoreContext(
          handoff.handoff_id,
          targetContext,
          {
            conflictResolutionStrategy: strategy,
            enableOptimization: false // Focus on conflict resolution
          }
        );

        console.log(`   📊 Conflicts Resolved: ${restoration.conflicts_resolved}`);
        console.log(`   🎯 Quality Score: ${(restoration.quality_score * 100).toFixed(1)}%`);
        console.log(`   🔧 Final Technology: ${restoration.context.technology_stack.join(', ')}`);
        console.log(`   🔒 Final Security: ${restoration.context.security_level}`);
        console.log(`   📋 Final Compliance: ${restoration.context.compliance_requirements.join(', ')}`);

        results[strategy] = restoration;

      } catch (error) {
        console.error(`   ❌ ${strategy} strategy failed:`, error.message);
        results[strategy] = { error: error.message };
      }
    }

    // Compare strategies
    console.log('\n🏆 Strategy Comparison:');
    const validResults = Object.entries(results).filter(([, result]) => !result.error);

    validResults.forEach(([strategy, result]) => {
      console.log(`   ${strategy}: ${result.conflicts_resolved} conflicts, ${(result.quality_score * 100).toFixed(1)}% quality`);
    });

    return results;
  }

  /**
   * Example: Context restoration optimization
   */
  async exampleRestorationOptimization() {
    console.log('\n⚡ Example: Context Restoration Optimization');
    console.log('=' .repeat(60));

    try {
      // Create session with extensive context
      const sessionData = {
        mode: 'architect',
        user_id: 'optimization_demo',
        project_id: 'optimization_test'
      };

      const extensiveContext = {
        technology_stack: ['react', 'typescript', 'nodejs', 'postgresql', 'redis', 'nginx', 'docker', 'kubernetes'],
        project_type: 'enterprise_system',
        team_size: 'large',
        security_level: 'critical',
        quality_requirements: 'critical',
        architecture_pattern: 'microservices',
        deployment_environment: 'hybrid_cloud',
        compliance_requirements: ['gdpr', 'pci_dss', 'sox', 'hipaa'],
        business_objectives: ['scalability', 'reliability', 'cost_optimization', 'security'],
        stakeholder_concerns: ['security', 'compliance', 'performance', 'maintainability'],
        constraints: ['cloud_vendor_lock_in', 'budget_limits', 'timeline_constraints', 'skill_availability'],
        performance_requirements: ['response_time_<200ms', 'throughput_>1000req/s', 'availability_>99.9%'],
        monitoring_requirements: ['real_time_monitoring', 'log_aggregation', 'alerting', 'reporting'],
        backup_recovery: ['automated_backups', 'disaster_recovery', 'data_replication']
      };

      console.log('🎬 Creating session with extensive context...');
      const session = await this.sessionManager.createSession(sessionData, extensiveContext);

      // Create handoff
      const handoff = await this.sessionManager.initiateHandoff(session.session_id, 'optimization_demo');

      // Target context with different priorities
      const targetContext = {
        technology_stack: ['vue', 'javascript'], // Simplified tech stack
        project_type: 'enterprise_system',
        team_size: 'medium', // Smaller team
        security_level: 'high' // Lower security requirements
      };

      console.log('\n🎯 Optimizing for smaller team with simplified requirements...');

      // Restore with optimization enabled
      const optimizedRestoration = await this.restorationManager.restoreContext(
        handoff.handoff_id,
        targetContext,
        {
          enableOptimization: true,
          conflictResolutionStrategy: 'merge_arrays'
        }
      );

      console.log(`\n📊 Optimization Results:`);
      console.log(`   Quality Score: ${(optimizedRestoration.quality_score * 100).toFixed(1)}%`);
      console.log(`   Conflicts Resolved: ${optimizedRestoration.conflicts_resolved}`);
      console.log(`   Optimized Technology: ${optimizedRestoration.context.technology_stack.join(', ')}`);
      console.log(`   Optimized Security: ${optimizedRestoration.context.security_level}`);
      console.log(`   Retained Compliance: ${optimizedRestoration.context.compliance_requirements?.join(', ') || 'none'}`);

      // Compare with non-optimized restoration
      console.log('\n🔄 Comparing with non-optimized restoration...');
      const nonOptimizedRestoration = await this.restorationManager.restoreContext(
        handoff.handoff_id,
        targetContext,
        {
          enableOptimization: false,
          conflictResolutionStrategy: 'merge_arrays'
        }
      );

      console.log(`   Optimized Quality: ${(optimizedRestoration.quality_score * 100).toFixed(1)}%`);
      console.log(`   Non-optimized Quality: ${(nonOptimizedRestoration.quality_score * 100).toFixed(1)}%`);
      console.log(`   Quality Improvement: ${((optimizedRestoration.quality_score - nonOptimizedRestoration.quality_score) * 100).toFixed(1)}%`);

      return {
        optimized: optimizedRestoration,
        nonOptimized: nonOptimizedRestoration
      };

    } catch (error) {
      console.error('Optimization example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Context restoration with quality assessment
   */
  async exampleQualityAssessment() {
    console.log('\n📊 Example: Context Restoration Quality Assessment');
    console.log('=' .repeat(60));

    try {
      // Create multiple sessions with different quality levels
      const scenarios = [
        {
          name: 'High Quality Source',
          context: {
            technology_stack: ['react', 'typescript', 'nodejs', 'postgresql'],
            project_type: 'web_application',
            team_size: 'medium',
            security_level: 'high',
            quality_requirements: 'high',
            architecture_pattern: 'microservices'
          },
          learning_quality: 'high'
        },
        {
          name: 'Medium Quality Source',
          context: {
            technology_stack: ['react', 'javascript'],
            project_type: 'web_application',
            team_size: 'small',
            security_level: 'medium'
          },
          learning_quality: 'medium'
        },
        {
          name: 'Low Quality Source',
          context: {
            technology_stack: ['jquery', 'php'],
            project_type: 'legacy_system',
            team_size: 'small'
          },
          learning_quality: 'low'
        }
      ];

      const results = {};

      for (const scenario of scenarios) {
        console.log(`\n🔍 Testing ${scenario.name}...`);

        const sessionData = {
          mode: 'code',
          user_id: 'quality_demo',
          project_id: `quality_${scenario.learning_quality}`
        };

        const session = await this.sessionManager.createSession(sessionData, scenario.context);

        // Simulate learning activities based on quality level
        await this.simulateQualityBasedLearning(session.session_id, scenario.context, scenario.learning_quality);

        const handoff = await this.sessionManager.initiateHandoff(session.session_id, `quality_${scenario.learning_quality}`);

        // Restore context
        const restoration = await this.restorationManager.restoreContext(
          handoff.handoff_id,
          scenario.context,
          {
            enableOptimization: true
          }
        );

        console.log(`   📊 Quality Score: ${(restoration.quality_score * 100).toFixed(1)}%`);
        console.log(`   🔍 Completeness: ${(restoration.metadata.quality_assessment.completeness * 100).toFixed(1)}%`);
        console.log(`   🎯 Accuracy: ${(restoration.metadata.quality_assessment.accuracy * 100).toFixed(1)}%`);
        console.log(`   📌 Relevance: ${(restoration.metadata.quality_assessment.relevance * 100).toFixed(1)}%`);

        results[scenario.name] = restoration;
      }

      // Compare quality assessment results
      console.log('\n🏆 Quality Assessment Comparison:');
      Object.entries(results).forEach(([name, result]) => {
        const qa = result.metadata.quality_assessment;
        console.log(`   ${name}: ${(result.quality_score * 100).toFixed(1)}% overall (${(qa.completeness * 100).toFixed(0)}% complete, ${(qa.accuracy * 100).toFixed(0)}% accurate, ${(qa.relevance * 100).toFixed(0)}% relevant)`);
      });

      return results;

    } catch (error) {
      console.error('Quality assessment example failed:', error);
      throw error;
    }
  }

  /**
   * Simulate learning activities for session
   */
  async simulateLearningActivities(sessionId, context) {
    const updates = [
      {
        pattern_application: {
          pattern_id: 'security-jwt-auth',
          pattern_name: 'JWT Authentication',
          confidence_score: 0.85,
          success: true,
          execution_time_ms: 1200,
          context: context
        }
      },
      {
        confidence_update: {
          pattern_id: 'security-jwt-auth',
          confidence_score: 0.87,
          reason: 'successful_application'
        }
      },
      {
        quality_metrics: {
          code_quality_score: 0.82,
          test_coverage: 0.78,
          performance_score: 0.85
        }
      },
      {
        user_feedback: {
          rating: 4.2,
          comments: 'Good security implementation',
          suggestions: 'Consider additional validation'
        }
      }
    ];

    for (const update of updates) {
      await this.sessionManager.updateSession(sessionId, update);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Simulate extensive learning activities
   */
  async simulateExtensiveLearningActivities(sessionId, context) {
    const patterns = [
      'microservices-architecture',
      'security-oauth2',
      'performance-caching',
      'monitoring-observability',
      'deployment-ci-cd',
      'testing-tdd',
      'documentation-api',
      'scalability-auto-scaling'
    ];

    for (const pattern of patterns) {
      await this.sessionManager.updateSession(sessionId, {
        pattern_application: {
          pattern_id: pattern,
          pattern_name: pattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          confidence_score: 0.7 + Math.random() * 0.25,
          success: Math.random() > 0.2,
          execution_time_ms: 500 + Math.random() * 2000,
          context: context
        }
      });
    }

    // Add quality metrics
    await this.sessionManager.updateSession(sessionId, {
      quality_metrics: {
        architecture_quality_score: 0.88,
        security_posture: 0.92,
        performance_efficiency: 0.85,
        scalability_score: 0.90,
        maintainability_index: 0.82
      }
    });
  }

  /**
   * Simulate quality-based learning activities
   */
  async simulateQualityBasedLearning(sessionId, context, qualityLevel) {
    const qualityMultipliers = {
      high: 1.0,
      medium: 0.7,
      low: 0.4
    };

    const multiplier = qualityMultipliers[qualityLevel];

    // Simulate learning activities with quality-based success rates
    const activities = [
      {
        pattern_application: {
          pattern_id: 'code-quality',
          pattern_name: 'Code Quality Pattern',
          confidence_score: 0.8 * multiplier,
          success: Math.random() < (0.8 * multiplier),
          execution_time_ms: 800,
          context: context
        }
      },
      {
        quality_metrics: {
          code_quality_score: 0.7 + (0.25 * multiplier),
          test_coverage: 0.6 + (0.35 * multiplier),
          performance_score: 0.65 + (0.3 * multiplier)
        }
      }
    ];

    for (const activity of activities) {
      await this.sessionManager.updateSession(sessionId, activity);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🔄 Running Context Restoration Examples');
    console.log('=' .repeat(70));

    try {
      // Run examples
      await this.exampleCompleteRestoration();
      await this.exampleIncrementalRestoration();
      await this.exampleConflictResolutionStrategies();
      await this.exampleRestorationOptimization();
      await this.exampleQualityAssessment();

      // Display final statistics
      const stats = this.restorationManager.getRestorationStatistics();
      console.log('\n📈 Final Context Restoration Statistics:');
      console.log(`   Active Restorations: ${stats.active_restorations}`);
      console.log(`   Restoration History: ${stats.restoration_history_length}`);
      console.log(`   Average Quality Score: ${(stats.average_quality_score * 100).toFixed(1)}%`);
      console.log(`   Average Conflicts: ${stats.average_conflicts_per_restoration}`);
      console.log(`   Success Rate: ${(stats.restoration_success_rate * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('Example execution failed:', error);
    } finally {
      // Cleanup
      await this.restorationManager.cleanup();
      await this.sessionManager.cleanup();
    }
  }

  /**
   * Health check for context restoration system
   */
  async healthCheck() {
    console.log('🏥 Context Restoration Health Check');
    console.log('=' .repeat(50));

    try {
      const stats = this.restorationManager.getRestorationStatistics();

      console.log(`✅ System Status: Healthy`);
      console.log(`🔄 Active Restorations: ${stats.active_restorations}`);
      console.log(`📚 Restoration History: ${stats.restoration_history_length}`);
      console.log(`🎯 Avg Quality Score: ${(stats.average_quality_score * 100).toFixed(1)}%`);
      console.log(`⚖️  Avg Conflicts: ${stats.average_conflicts_per_restoration}`);
      console.log(`✅ Success Rate: ${(stats.restoration_success_rate * 100).toFixed(1)}%`);

      return {
        status: 'healthy',
        statistics: stats
      };

    } catch (error) {
      console.log(`❌ System Status: Unhealthy - ${error.message}`);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export for use in other modules
module.exports = ContextRestorationExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new ContextRestorationExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--health')) {
    example.healthCheck();
  } else if (args.includes('--complete')) {
    example.initializeProtocolClients().then(() => example.exampleCompleteRestoration());
  } else if (args.includes('--incremental')) {
    example.initializeProtocolClients().then(() => example.exampleIncrementalRestoration());
  } else if (args.includes('--conflict')) {
    example.initializeProtocolClients().then(() => example.exampleConflictResolutionStrategies());
  } else if (args.includes('--optimization')) {
    example.initializeProtocolClients().then(() => example.exampleRestorationOptimization());
  } else if (args.includes('--quality')) {
    example.initializeProtocolClients().then(() => example.exampleQualityAssessment());
  } else {
    // Run all examples by default
    example.runAllExamples().catch(console.error);
  }
}