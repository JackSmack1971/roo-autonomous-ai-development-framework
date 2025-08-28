/**
 * Pattern Protocol Example
 *
 * Demonstrates how modes use the Pattern Application Protocol
 * to interact with the learning system for enhanced capabilities
 */

const PatternProtocolClient = require('./pattern-protocol-client');

class PatternProtocolExample {
  constructor() {
    this.clients = new Map();
  }

  /**
   * Initialize clients for different modes
   */
  async initializeClients() {
    console.log('🔧 Initializing Pattern Protocol Clients...');

    // Initialize Code mode client
    this.clients.set('code', PatternProtocolClient.createCodeClient({
      enableCaching: true,
      timeout: 10000
    }));

    // Initialize Debug mode client
    this.clients.set('debug', PatternProtocolClient.createDebugClient({
      enableCaching: true,
      timeout: 15000
    }));

    // Initialize Architect mode client
    this.clients.set('architect', PatternProtocolClient.createArchitectClient({
      enableCaching: true,
      timeout: 20000
    }));

    // Initialize clients
    for (const [mode, client] of this.clients) {
      try {
        await client.initialize();
        console.log(`✅ ${mode} client initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${mode} client:`, error.message);
      }
    }
  }

  /**
   * Example: Code mode using pattern protocol
   */
  async exampleCodeMode() {
    console.log('\n🚀 Example: Code Mode Pattern Protocol Usage');
    console.log('=' .repeat(60));

    const codeClient = this.clients.get('code');
    if (!codeClient) {
      console.error('Code client not initialized');
      return;
    }

    const context = {
      technology_stack: ['react', 'typescript', 'redux'],
      project_type: 'frontend',
      team_size: 'medium',
      complexity: 'medium',
      security_level: 'medium',
      quality_requirements: 'high'
    };

    const task = {
      type: 'component_creation',
      description: 'Create a user authentication component',
      requirements: ['form validation', 'error handling', 'security']
    };

    try {
      // Step 1: Discover relevant patterns
      console.log('🔍 Discovering patterns...');
      const discovery = await codeClient.discoverPatterns(context, {
        maxPatterns: 5,
        confidenceThreshold: 0.7
      });

      console.log(`📋 Found ${discovery.result.matches.length} matching patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
      });

      // Step 2: Get recommendations
      console.log('\n💡 Getting recommendations...');
      const recommendations = await codeClient.getRecommendations(
        context,
        discovery.result,
        { maxRecommendations: 3 }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
      });

      // Step 3: Apply top recommendation
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🔧 Applying pattern: ${topRec.pattern_name}`);

        const application = await codeClient.applyPattern(
          topRec.pattern_id,
          topRec,
          context,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Pattern applied successfully: ${application.result.message}`);

        // Step 4: Execute quality gates
        console.log('\n🏗️ Executing quality gates...');
        const qualityCheck = await codeClient.executeQualityGates(
          {
            id: `code_output_${application.request_id}`,
            type: 'code_output',
            content: application.result,
            context: context
          },
          context
        );

        console.log(`📊 Quality Score: ${(qualityCheck.result.summary.quality_score * 100).toFixed(1)}%`);
        console.log(`✅ Gates Passed: ${qualityCheck.result.summary.passed_gates}/${qualityCheck.result.summary.total_gates}`);

        // Step 5: Report feedback
        console.log('\n📝 Reporting feedback...');
        const feedback = {
          success: application.result.success,
          score: topRec.confidence_score,
          metrics: application.result.metrics,
          quality_score: qualityCheck.result.summary.quality_score,
          user_satisfaction: 0.9 // Simulated user feedback
        };

        await codeClient.reportFeedback(topRec.pattern_id, feedback, context);
        console.log('✅ Feedback reported');
      }

      return {
        discovery,
        recommendations,
        application: application || null,
        qualityCheck: qualityCheck || null
      };

    } catch (error) {
      console.error('Code mode example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Debug mode using pattern protocol
   */
  async exampleDebugMode() {
    console.log('\n🐛 Example: Debug Mode Pattern Protocol Usage');
    console.log('=' .repeat(60));

    const debugClient = this.clients.get('debug');
    if (!debugClient) {
      console.error('Debug client not initialized');
      return;
    }

    const context = {
      technology_stack: ['nodejs', 'express', 'mongodb'],
      project_type: 'web_api',
      team_size: 'small',
      complexity: 'low',
      issue_type: 'runtime_error'
    };

    const issue = {
      description: 'API endpoint returning 500 error',
      stack_trace: 'Error: Cannot read property \'id\' of null\n    at userController.js:45:23',
      reproduction_steps: ['POST /api/users', 'Send empty JSON body'],
      affected_components: ['userController', 'userModel'],
      severity: 'high'
    };

    try {
      // Step 1: Discover debugging patterns
      console.log('🔍 Discovering debugging patterns...');
      const discovery = await debugClient.discoverPatterns(context, {
        categories: ['debugging_strategies', 'common_bug_patterns'],
        maxPatterns: 5
      });

      console.log(`📋 Found ${discovery.result.matches.length} debugging patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
      });

      // Step 2: Get debugging recommendations
      console.log('\n💡 Getting debugging recommendations...');
      const recommendations = await debugClient.getRecommendations(
        context,
        discovery.result,
        { maxRecommendations: 3 }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
      });

      // Step 3: Apply debugging pattern
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🔧 Applying debugging pattern: ${topRec.pattern_name}`);

        const application = await debugClient.applyPattern(
          topRec.pattern_id,
          topRec,
          context,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Debugging pattern applied: ${application.result.message}`);

        // Step 4: Report debugging outcome
        const feedback = {
          success: application.result.success,
          score: topRec.confidence_score,
          metrics: {
            ...application.result.metrics,
            resolution_time_minutes: 15,
            root_cause_found: true
          },
          debugging_effectiveness: 0.85
        };

        await debugClient.reportFeedback(topRec.pattern_id, feedback, context);
        console.log('✅ Debugging feedback reported');
      }

      return {
        discovery,
        recommendations,
        application: application || null
      };

    } catch (error) {
      console.error('Debug mode example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Architect mode using pattern protocol
   */
  async exampleArchitectMode() {
    console.log('\n🏗️ Example: Architect Mode Pattern Protocol Usage');
    console.log('=' .repeat(60));

    const architectClient = this.clients.get('architect');
    if (!architectClient) {
      console.error('Architect client not initialized');
      return;
    }

    const context = {
      technology_stack: ['react', 'nodejs', 'postgresql'],
      project_type: 'web_application',
      team_size: 'medium',
      timeline: '4_months',
      scalability_requirements: 'high',
      security_level: 'high',
      budget: 'medium'
    };

    const requirements = {
      functional: ['user management', 'data visualization', 'real-time updates'],
      non_functional: ['high availability', 'data security', 'performance'],
      constraints: ['cloud deployment', 'microservices friendly']
    };

    try {
      // Step 1: Discover architectural patterns
      console.log('🔍 Discovering architectural patterns...');
      const discovery = await architectClient.discoverPatterns(context, {
        categories: ['architectural_styles', 'scalability_patterns', 'security_architectures'],
        maxPatterns: 5
      });

      console.log(`📋 Found ${discovery.result.matches.length} architectural patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
      });

      // Step 2: Get architectural recommendations
      console.log('\n💡 Getting architectural recommendations...');
      const recommendations = await architectClient.getRecommendations(
        context,
        discovery.result,
        {
          maxRecommendations: 3,
          algorithm: 'business_value'
        }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
      });

      // Step 3: Apply architectural pattern
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🏗️ Applying architectural pattern: ${topRec.pattern_name}`);

        const application = await architectClient.applyPattern(
          topRec.pattern_id,
          topRec,
          context,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Architectural pattern applied: ${application.result.message}`);

        // Step 4: Execute architecture quality gates
        console.log('\n📋 Executing architecture quality gates...');
        const qualityCheck = await architectClient.executeQualityGates(
          {
            id: `architecture_${application.request_id}`,
            type: 'architectural_design',
            content: application.result,
            context: context
          },
          context
        );

        console.log(`📊 Architecture Quality Score: ${(qualityCheck.result.summary.quality_score * 100).toFixed(1)}%`);

        // Step 5: Report architectural feedback
        const feedback = {
          success: application.result.success,
          score: topRec.confidence_score,
          metrics: {
            ...application.result.metrics,
            stakeholder_satisfaction: 0.9,
            implementation_feasibility: 0.85
          },
          architectural_impact: 'high'
        };

        await architectClient.reportFeedback(topRec.pattern_id, feedback, context);
        console.log('✅ Architectural feedback reported');
      }

      return {
        discovery,
        recommendations,
        application: application || null,
        qualityCheck: qualityCheck || null
      };

    } catch (error) {
      console.error('Architect mode example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Cross-mode coordination using pattern protocol
   */
  async exampleCrossModeCoordination() {
    console.log('\n🤝 Example: Cross-Mode Coordination');
    console.log('=' .repeat(60));

    const codeClient = this.clients.get('code');
    const debugClient = this.clients.get('debug');
    const architectClient = this.clients.get('architect');

    const context = {
      technology_stack: ['react', 'typescript', 'nodejs'],
      project_type: 'web_application',
      team_size: 'small',
      complexity: 'medium'
    };

    try {
      // Step 1: Architect mode discovers overall architecture
      console.log('🏗️ Architect mode: Discovering architectural patterns...');
      const archDiscovery = await architectClient.discoverPatterns(context);
      const archRecommendations = await architectClient.getRecommendations(context, archDiscovery.result);

      // Step 2: Code mode discovers implementation patterns
      console.log('🚀 Code mode: Discovering implementation patterns...');
      const codeDiscovery = await codeClient.discoverPatterns(context);
      const codeRecommendations = await codeClient.getRecommendations(context, codeDiscovery.result);

      // Step 3: Debug mode prepares debugging strategies
      console.log('🐛 Debug mode: Discovering debugging patterns...');
      const debugDiscovery = await debugClient.discoverPatterns(context);
      const debugRecommendations = await debugClient.getRecommendations(context, debugDiscovery.result);

      // Step 4: Batch operations for efficiency
      console.log('📦 Executing batch operations...');
      const batchResults = await codeClient.batchOperations([
        {
          type: 'apply',
          pattern_id: codeRecommendations.result.recommendations[0]?.pattern_id,
          pattern_data: codeRecommendations.result.recommendations[0],
          context: context
        },
        {
          type: 'apply',
          pattern_id: debugRecommendations.result.recommendations[0]?.pattern_id,
          pattern_data: debugRecommendations.result.recommendations[0],
          context: context
        }
      ], context);

      console.log(`📊 Batch Results: ${batchResults.summary.successful}/${batchResults.summary.total} successful`);

      // Step 5: Share learning insights across modes
      console.log('📚 Sharing learning insights...');
      const codeInsights = await codeClient.getLearningInsights(context);
      const debugInsights = await debugClient.getLearningInsights(context);
      const archInsights = await architectClient.getLearningInsights(context);

      console.log('✅ Cross-mode coordination completed');

      return {
        architect: { discovery: archDiscovery, recommendations: archRecommendations },
        code: { discovery: codeDiscovery, recommendations: codeRecommendations, insights: codeInsights },
        debug: { discovery: debugDiscovery, recommendations: debugRecommendations, insights: debugInsights },
        batch: batchResults
      };

    } catch (error) {
      console.error('Cross-mode coordination failed:', error);
      throw error;
    }
  }

  /**
   * Example: Enhanced pattern discovery and application
   */
  async exampleEnhancedDiscovery() {
    console.log('\n⚡ Example: Enhanced Pattern Discovery & Application');
    console.log('=' .repeat(60));

    const codeClient = this.clients.get('code');

    const context = {
      technology_stack: ['python', 'django', 'postgresql'],
      project_type: 'web_api',
      team_size: 'small',
      security_level: 'high',
      quality_requirements: 'high'
    };

    try {
      console.log('🚀 Starting enhanced pattern discovery and application...');

      const result = await codeClient.discoverAndApplyPatterns(context, {
        discovery: { maxPatterns: 5, confidenceThreshold: 0.7 },
        recommendations: { maxRecommendations: 3, algorithm: 'weighted_score' },
        application: { validateQuality: true, logApplication: true },
        quality: { failOnCritical: true },
        feedback: { updateConfidence: true },
        insights: { includePatternPerformance: true }
      });

      console.log(`🔍 Patterns discovered: ${result.discovery.result.matches.length}`);
      console.log(`💡 Recommendations generated: ${result.recommendations.result.recommendations.length}`);
      console.log(`🔧 Patterns applied: ${result.applications.length}`);
      console.log(`✅ Quality checks passed: ${result.quality_checks.filter(q => q.result.summary.overall_status === 'passed').length}`);
      console.log(`📝 Feedback reports sent: ${result.feedback.length}`);

      // Display learning insights
      if (result.insights) {
        console.log('\n📊 Learning Insights:');
        const insights = result.insights.result.insights;
        if (insights.pattern_performance) {
          console.log(`   🏆 Top Pattern: ${insights.pattern_performance.top_performing_patterns[0]?.pattern_id}`);
        }
      }

      return result;

    } catch (error) {
      console.error('Enhanced discovery failed:', error);
      throw error;
    }
  }

  /**
   * Example: Quick pattern application
   */
  async exampleQuickApply() {
    console.log('\n⚡ Example: Quick Pattern Application');
    console.log('=' .repeat(60));

    const codeClient = this.clients.get('code');

    const patternData = {
      pattern_id: 'security-input-validation',
      pattern_name: 'Input Validation Pattern',
      confidence_score: 0.85,
      metadata: {
        pattern_type: 'security',
        security_level: 'high'
      }
    };

    const context = {
      technology_stack: ['nodejs', 'express'],
      project_type: 'api',
      security_level: 'high'
    };

    try {
      console.log('🚀 Quick applying pattern...');

      const result = await codeClient.quickApply(
        patternData.pattern_id,
        patternData,
        context,
        (applicationResult) => {
          console.log('✅ Success callback executed');
          console.log(`   📊 Execution time: ${applicationResult.metrics.execution_time_ms}ms`);
        }
      );

      console.log(`✅ Quick apply completed: ${result.application.result.success}`);
      console.log(`📊 Quality score: ${(result.quality_check.result.summary.quality_score * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('Quick apply failed:', error);
      throw error;
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧪 Running Pattern Protocol Examples');
    console.log('=' .repeat(70));

    try {
      // Initialize all clients
      await this.initializeClients();

      // Run examples
      await this.exampleCodeMode();
      await this.exampleDebugMode();
      await this.exampleArchitectMode();
      await this.exampleCrossModeCoordination();
      await this.exampleEnhancedDiscovery();
      await this.exampleQuickApply();

      // Display client statistics
      console.log('\n📈 Client Statistics:');
      for (const [mode, client] of this.clients) {
        const stats = client.getStatistics();
        console.log(`   ${mode}: ${stats.requestsSent} requests, ${(stats.averageResponseTime).toFixed(1)}ms avg response`);
      }

    } catch (error) {
      console.error('Example execution failed:', error);
    }
  }

  /**
   * Health check for all clients
   */
  async healthCheckAll() {
    console.log('🏥 Pattern Protocol Health Check');
    console.log('=' .repeat(40));

    const results = {};

    for (const [mode, client] of this.clients) {
      try {
        const health = await client.healthCheck();
        results[mode] = health;
        console.log(`   ${mode}: ${health.status.toUpperCase()}`);
      } catch (error) {
        results[mode] = { status: 'error', error: error.message };
        console.log(`   ${mode}: ERROR - ${error.message}`);
      }
    }

    return results;
  }
}

// Export for use in other modules
module.exports = PatternProtocolExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new PatternProtocolExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--health')) {
    example.initializeClients().then(() => example.healthCheckAll());
  } else if (args.includes('--code')) {
    example.initializeClients().then(() => example.exampleCodeMode());
  } else if (args.includes('--debug')) {
    example.initializeClients().then(() => example.exampleDebugMode());
  } else if (args.includes('--architect')) {
    example.initializeClients().then(() => example.exampleArchitectMode());
  } else if (args.includes('--coordination')) {
    example.initializeClients().then(() => example.exampleCrossModeCoordination());
  } else if (args.includes('--enhanced')) {
    example.initializeClients().then(() => example.exampleEnhancedDiscovery());
  } else if (args.includes('--quick')) {
    example.initializeClients().then(() => example.exampleQuickApply());
  } else {
    // Run all examples by default
    example.runAllExamples().catch(console.error);
  }
}