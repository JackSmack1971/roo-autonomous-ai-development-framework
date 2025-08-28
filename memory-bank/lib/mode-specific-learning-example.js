/**
 * Mode-Specific Learning Integration Example
 *
 * Demonstrates how different AI modes use specialized learning integration
 * to adapt their behavior based on experience and context
 */

const ModeSpecificLearningIntegration = require('./mode-specific-learning');

class ModeSpecificLearningExample {
  constructor() {
    this.learningIntegrations = new Map();
  }

  /**
   * Initialize learning integrations for different modes
   */
  async initializeLearningIntegrations() {
    console.log('🧠 Initializing Mode-Specific Learning Integrations...');

    const modes = ['code', 'debug', 'architect', 'security', 'performance'];

    for (const mode of modes) {
      try {
        const learningIntegration = new ModeSpecificLearningIntegration(mode);
        await learningIntegration.initialize();
        this.learningIntegrations.set(mode, learningIntegration);
        console.log(`✅ ${mode} mode learning integration initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${mode} learning integration:`, error.message);
      }
    }
  }

  /**
   * Example: Code mode learning integration
   */
  async exampleCodeModeLearning() {
    console.log('\n🚀 Example: Code Mode Learning Integration');
    console.log('=' .repeat(60));

    const codeLearning = this.learningIntegrations.get('code');
    if (!codeLearning) {
      console.error('Code learning integration not initialized');
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

    try {
      // Step 1: Discover patterns with learning enhancement
      console.log('🔍 Discovering patterns with learning enhancement...');
      const discovery = await codeLearning.discoverPatternsWithLearning(context, {
        maxPatterns: 5,
        confidenceThreshold: 0.7
      });

      console.log(`📋 Found ${discovery.result.matches.length} enhanced patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
        if (match.learning_factors) {
          console.log(`     Learning factors:`, match.learning_factors);
        }
      });

      // Step 2: Generate recommendations with learning
      console.log('\n💡 Generating recommendations with learning...');
      const recommendations = await codeLearning.generateRecommendationsWithLearning(
        context,
        discovery.result,
        { maxRecommendations: 3 }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} enhanced recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
        console.log(`     Mode-specific score: ${(rec.mode_specific_score * 100).toFixed(1)}%`);
      });

      // Step 3: Apply pattern with learning feedback
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🔧 Applying pattern with learning: ${topRec.pattern_name}`);

        const application = await codeLearning.applyPatternWithLearning(
          topRec.pattern_id,
          topRec,
          context,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Pattern applied with learning feedback: ${application.result.success}`);
        console.log(`📊 Execution time: ${application.result.metrics.execution_time_ms}ms`);
      }

      // Step 4: Get mode-specific learning insights
      console.log('\n📊 Getting code mode learning insights...');
      const insights = await codeLearning.getModeLearningInsights(context);

      console.log('Learning profile:', insights.result.insights.mode_specific.learning_profile.name);
      console.log('Adaptation readiness:', (insights.result.insights.adaptation_readiness.readiness_score * 100).toFixed(1) + '%');

      return {
        discovery,
        recommendations,
        insights
      };

    } catch (error) {
      console.error('Code mode learning example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Debug mode learning integration
   */
  async exampleDebugModeLearning() {
    console.log('\n🐛 Example: Debug Mode Learning Integration');
    console.log('=' .repeat(60));

    const debugLearning = this.learningIntegrations.get('debug');
    if (!debugLearning) {
      console.error('Debug learning integration not initialized');
      return;
    }

    const context = {
      technology_stack: ['nodejs', 'express', 'mongodb'],
      project_type: 'web_api',
      team_size: 'small',
      complexity: 'low',
      issue_type: 'runtime_error',
      severity_level: 'high'
    };

    const issue = {
      description: 'API endpoint returning 500 error intermittently',
      stack_trace: 'Error: Cannot read property \'id\' of null\n    at userController.js:45:23',
      reproduction_steps: ['POST /api/users with empty JSON body'],
      affected_components: ['userController', 'userModel']
    };

    try {
      // Step 1: Discover debugging patterns with learning
      console.log('🔍 Discovering debugging patterns with learning...');
      const debugContext = {
        ...context,
        issue_description: issue.description,
        error_patterns: this.extractErrorPatterns(issue),
        reproduction_complexity: this.assessReproductionComplexity(issue)
      };

      const discovery = await debugLearning.discoverPatternsWithLearning(debugContext, {
        categories: ['debugging_strategies', 'common_bug_patterns'],
        maxPatterns: 5
      });

      console.log(`📋 Found ${discovery.result.matches.length} enhanced debugging patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
        if (match.learning_factors) {
          console.log(`     Issue type match: ${(match.learning_factors.issue_type_match * 100).toFixed(1)}%`);
        }
      });

      // Step 2: Generate debugging recommendations
      console.log('\n💡 Generating debugging recommendations...');
      const recommendations = await debugLearning.generateRecommendationsWithLearning(
        debugContext,
        discovery.result,
        { maxRecommendations: 3 }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} debugging recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
      });

      // Step 3: Apply debugging pattern with learning
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🔧 Applying debugging pattern: ${topRec.pattern_name}`);

        const application = await debugLearning.applyPatternWithLearning(
          topRec.pattern_id,
          topRec,
          debugContext,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Debugging pattern applied: ${application.result.success}`);
        console.log(`⏱️  Resolution time: ${application.result.metrics.execution_time_ms}ms`);
      }

      // Step 4: Get debug mode learning insights
      console.log('\n📊 Getting debug mode learning insights...');
      const insights = await debugLearning.getModeLearningInsights(debugContext);

      console.log('Learning profile:', insights.result.insights.mode_specific.learning_profile.name);
      console.log('Pattern performance:', insights.result.insights.mode_specific.pattern_performance);

      return {
        discovery,
        recommendations,
        insights
      };

    } catch (error) {
      console.error('Debug mode learning example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Architect mode learning integration
   */
  async exampleArchitectModeLearning() {
    console.log('\n🏗️ Example: Architect Mode Learning Integration');
    console.log('=' .repeat(60));

    const architectLearning = this.learningIntegrations.get('architect');
    if (!architectLearning) {
      console.error('Architect learning integration not initialized');
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
      constraints: ['cloud deployment', 'microservices friendly'],
      architectural_characteristics: ['scalability', 'maintainability', 'security']
    };

    try {
      // Step 1: Discover architectural patterns with learning
      console.log('🔍 Discovering architectural patterns with learning...');
      const archContext = {
        ...context,
        functional_requirements: requirements.functional,
        non_functional_requirements: requirements.non_functional,
        architectural_drivers: this.identifyArchitecturalDrivers(requirements)
      };

      const discovery = await architectLearning.discoverPatternsWithLearning(archContext, {
        categories: ['architectural_styles', 'scalability_patterns', 'security_architectures'],
        maxPatterns: 5
      });

      console.log(`📋 Found ${discovery.result.matches.length} enhanced architectural patterns`);
      discovery.result.matches.slice(0, 3).forEach(match => {
        console.log(`   • ${match.pattern_name} (${(match.confidence_score * 100).toFixed(1)}% confidence)`);
        if (match.learning_factors) {
          console.log(`     Architectural fitness: ${(match.learning_factors.architectural_fitness * 100).toFixed(1)}%`);
        }
      });

      // Step 2: Generate architectural recommendations
      console.log('\n💡 Generating architectural recommendations...');
      const recommendations = await architectLearning.generateRecommendationsWithLearning(
        archContext,
        discovery.result,
        {
          maxRecommendations: 3,
          algorithm: 'business_value'
        }
      );

      console.log(`🎯 Generated ${recommendations.result.recommendations.length} architectural recommendations`);
      recommendations.result.recommendations.forEach(rec => {
        console.log(`   • ${rec.pattern_name} (Priority: ${rec.priority})`);
        console.log(`     Scalability alignment: ${(rec.learning_factors?.scalability_alignment * 100).toFixed(1)}%`);
      });

      // Step 3: Apply architectural pattern with learning
      if (recommendations.result.recommendations.length > 0) {
        const topRec = recommendations.result.recommendations[0];
        console.log(`\n🏗️ Applying architectural pattern: ${topRec.pattern_name}`);

        const application = await architectLearning.applyPatternWithLearning(
          topRec.pattern_id,
          topRec,
          archContext,
          {
            validateQuality: true,
            logApplication: true,
            updateConfidence: true
          }
        );

        console.log(`✅ Architectural pattern applied: ${application.result.success}`);
        console.log(`🏗️ Architectural fitness: ${(application.result.metrics.scalability * 100).toFixed(1)}%`);
      }

      // Step 4: Get architect mode learning insights
      console.log('\n📊 Getting architect mode learning insights...');
      const insights = await architectLearning.getModeLearningInsights(archContext);

      console.log('Learning profile:', insights.result.insights.mode_specific.learning_profile.name);
      console.log('Architectural fitness trends:', insights.result.insights.mode_specific.architectural_fitness_trends);

      return {
        discovery,
        recommendations,
        insights
      };

    } catch (error) {
      console.error('Architect mode learning example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Learning adaptation demonstration
   */
  async exampleLearningAdaptation() {
    console.log('\n🔄 Example: Learning Adaptation Demonstration');
    console.log('=' .repeat(60));

    const codeLearning = this.learningIntegrations.get('code');

    // Simulate multiple pattern applications to trigger adaptation
    const contexts = [
      {
        technology_stack: ['react', 'javascript'],
        project_type: 'frontend',
        quality_requirements: 'low',
        complexity: 'low'
      },
      {
        technology_stack: ['react', 'typescript'],
        project_type: 'frontend',
        quality_requirements: 'high',
        complexity: 'high'
      },
      {
        technology_stack: ['vue', 'javascript'],
        project_type: 'frontend',
        quality_requirements: 'medium',
        complexity: 'medium'
      }
    ];

    try {
      console.log('🔧 Applying patterns across different contexts to trigger learning adaptation...');

      for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        console.log(`\n📝 Context ${i + 1}: ${context.technology_stack.join('+')} | ${context.quality_requirements} quality`);

        // Discover patterns
        const discovery = await codeLearning.discoverPatternsWithLearning(context, {
          maxPatterns: 3,
          confidenceThreshold: 0.6
        });

        if (discovery.result.matches.length > 0) {
          const topPattern = discovery.result.matches[0];

          // Apply pattern with simulated results
          const application = await codeLearning.applyPatternWithLearning(
            topPattern.pattern_id,
            topPattern,
            context,
            {
              validateQuality: true,
              logApplication: true,
              updateConfidence: true
            }
          );

          console.log(`   ✅ Applied: ${topPattern.pattern_name} | Success: ${application.result.success}`);
        }
      }

      // Check adaptation readiness
      console.log('\n🎯 Checking adaptation readiness...');
      const insights = await codeLearning.getModeLearningInsights(contexts[0]);
      const adaptationReadiness = insights.result.insights.adaptation_readiness;

      console.log(`Adaptation readiness: ${(adaptationReadiness.readiness_score * 100).toFixed(1)}%`);
      console.log('Recommended adaptations:', adaptationReadiness.recommended_adaptations.length);

      // Get learning statistics
      const stats = codeLearning.getLearningStatistics();
      console.log('\n📈 Learning Statistics:');
      console.log(`   Pattern count: ${stats.pattern_count}`);
      console.log(`   Learning history: ${stats.learning_history_length}`);
      console.log(`   Adaptations: ${stats.adaptation_count}`);
      console.log(`   Average pattern success: ${(stats.average_pattern_success * 100).toFixed(1)}%`);
      console.log(`   Learning effectiveness: ${(stats.learning_effectiveness_score * 100).toFixed(1)}%`);

      return {
        adaptationReadiness,
        statistics: stats
      };

    } catch (error) {
      console.error('Learning adaptation example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Cross-mode learning comparison
   */
  async exampleCrossModeComparison() {
    console.log('\n🔍 Example: Cross-Mode Learning Comparison');
    console.log('=' .repeat(60));

    const modes = ['code', 'debug', 'architect'];
    const context = {
      technology_stack: ['react', 'nodejs', 'postgresql'],
      project_type: 'web_application',
      team_size: 'medium',
      complexity: 'medium'
    };

    const results = {};

    try {
      for (const mode of modes) {
        const learningIntegration = this.learningIntegrations.get(mode);
        console.log(`\n📊 ${mode.toUpperCase()} Mode Analysis:`);

        // Get learning insights
        const insights = await learningIntegration.getModeLearningInsights(context);
        const modeInsights = insights.result.insights.mode_specific;

        console.log(`   Learning profile: ${modeInsights.learning_profile.name}`);
        console.log(`   Pattern performance: ${Object.keys(modeInsights.pattern_performance || {}).length} patterns analyzed`);
        console.log(`   Learning effectiveness: ${(modeInsights.learning_effectiveness || 0 * 100).toFixed(1)}%`);

        // Get learning statistics
        const stats = learningIntegration.getLearningStatistics();
        console.log(`   Pattern success rate: ${(stats.average_pattern_success * 100).toFixed(1)}%`);
        console.log(`   Learning history: ${stats.learning_history_length} entries`);

        results[mode] = {
          insights: modeInsights,
          statistics: stats
        };
      }

      // Compare learning effectiveness
      console.log('\n🏆 Learning Effectiveness Comparison:');
      const effectiveness = Object.entries(results).map(([mode, data]) => ({
        mode,
        effectiveness: data.statistics.learning_effectiveness_score,
        pattern_success: data.statistics.average_pattern_success
      })).sort((a, b) => b.effectiveness - a.effectiveness);

      effectiveness.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.mode}: ${(entry.effectiveness * 100).toFixed(1)}% effectiveness, ${(entry.pattern_success * 100).toFixed(1)}% pattern success`);
      });

      return results;

    } catch (error) {
      console.error('Cross-mode comparison failed:', error);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  extractErrorPatterns(issue) {
    const patterns = [];
    const description = issue.description || '';

    if (description.includes('null')) patterns.push('null_pointer');
    if (description.includes('undefined')) patterns.push('undefined_variable');
    if (description.includes('timeout')) patterns.push('timeout_error');
    if (description.includes('connection')) patterns.push('connection_error');

    return patterns;
  }

  assessReproductionComplexity(issue) {
    let complexity = 1;

    if (issue.reproduction_steps?.length > 3) complexity += 1;
    if (issue.affected_components?.length > 2) complexity += 1;
    if (issue.description?.includes('intermittent')) complexity += 1;

    return complexity;
  }

  identifyArchitecturalDrivers(requirements) {
    const drivers = [];

    if (requirements.non_functional?.includes('high availability')) drivers.push('availability');
    if (requirements.non_functional?.includes('performance')) drivers.push('performance');
    if (requirements.functional?.length > 5) drivers.push('complexity');
    if (requirements.constraints?.includes('scalability')) drivers.push('scalability');

    return drivers;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧠 Running Mode-Specific Learning Integration Examples');
    console.log('=' .repeat(70));

    try {
      // Initialize all learning integrations
      await this.initializeLearningIntegrations();

      // Run examples
      await this.exampleCodeModeLearning();
      await this.exampleDebugModeLearning();
      await this.exampleArchitectModeLearning();
      await this.exampleLearningAdaptation();
      await this.exampleCrossModeComparison();

      // Display overall statistics
      console.log('\n📈 Overall Learning Integration Statistics:');
      for (const [mode, integration] of this.learningIntegrations) {
        const stats = integration.getLearningStatistics();
        console.log(`   ${mode}: ${stats.pattern_count} patterns, ${(stats.average_pattern_success * 100).toFixed(1)}% success rate`);
      }

    } catch (error) {
      console.error('Example execution failed:', error);
    }
  }

  /**
   * Health check for all learning integrations
   */
  async healthCheckAll() {
    console.log('🏥 Mode-Specific Learning Health Check');
    console.log('=' .repeat(50));

    const results = {};

    for (const [mode, integration] of this.learningIntegrations) {
      try {
        const stats = integration.getLearningStatistics();
        results[mode] = {
          status: 'healthy',
          statistics: stats
        };
        console.log(`   ${mode}: ✅ Healthy (${stats.pattern_count} patterns, ${(stats.learning_effectiveness_score * 100).toFixed(1)}% effectiveness)`);
      } catch (error) {
        results[mode] = {
          status: 'unhealthy',
          error: error.message
        };
        console.log(`   ${mode}: ❌ Error - ${error.message}`);
      }
    }

    return results;
  }
}

// Export for use in other modules
module.exports = ModeSpecificLearningExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new ModeSpecificLearningExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--health')) {
    example.initializeLearningIntegrations().then(() => example.healthCheckAll());
  } else if (args.includes('--code')) {
    example.initializeLearningIntegrations().then(() => example.exampleCodeModeLearning());
  } else if (args.includes('--debug')) {
    example.initializeLearningIntegrations().then(() => example.exampleDebugModeLearning());
  } else if (args.includes('--architect')) {
    example.initializeLearningIntegrations().then(() => example.exampleArchitectModeLearning());
  } else if (args.includes('--adaptation')) {
    example.initializeLearningIntegrations().then(() => example.exampleLearningAdaptation());
  } else if (args.includes('--comparison')) {
    example.initializeLearningIntegrations().then(() => example.exampleCrossModeComparison());
  } else {
    // Run all examples by default
    example.runAllExamples().catch(console.error);
  }
}