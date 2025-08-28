/**
 * Pattern Matcher Example
 *
 * Demonstrates how to use the context-aware pattern matching system
 * for intelligent pattern application and decision making
 */

const PatternMatcher = require('./pattern-matcher');
const PatternStorage = require('./pattern-storage');

class PatternMatcherExample {
  constructor() {
    this.patternMatcher = new PatternMatcher({
      enableCaching: true,
      cacheSize: 50,
      decisionThreshold: 0.7
    });

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers for demonstration
   */
  bindEventHandlers() {
    this.patternMatcher.on('patterns_matched', (result) => {
      console.log('🎯 Patterns matched successfully!');
      this.displayMatchingResults(result);
    });

    this.patternMatcher.on('patterns_matched_from_cache', (result) => {
      console.log('⚡ Patterns matched from cache!');
      this.displayMatchingResults(result);
    });

    this.patternMatcher.on('pattern_matching_failed', (error) => {
      console.error('❌ Pattern matching failed:', error);
    });

    this.patternMatcher.on('context_analyzed', (analysis) => {
      console.log('🔍 Context analyzed:', analysis.analysis_id);
    });

    this.patternMatcher.on('context_matched', (matching) => {
      console.log('🔗 Context matched with patterns:', matching.matching_id);
    });
  }

  /**
   * Example: Match patterns for a Node.js API project
   */
  async exampleNodeJsAPI() {
    console.log('\n🚀 Example: Node.js API Project Pattern Matching');
    console.log('=' .repeat(60));

    const context = {
      // Technical context
      technology_stack: ['nodejs', 'express', 'mongodb', 'jwt'],
      architecture_pattern: 'rest_api',
      infrastructure: 'cloud',

      // Project context
      project_type: 'web_api',
      team_size: 'small',
      timeline: '3_months',
      complexity: 'medium',

      // Environmental context
      deployment_environment: 'aws_lambda',
      compliance_requirements: ['gdpr'],
      geographic_distribution: 'global',

      // Quality context
      quality_requirements: 'high',
      testing_strategy: 'tdd',
      monitoring_needs: 'comprehensive',

      // Security context
      security_level: 'high',
      data_sensitivity: 'personal_data',
      compliance_framework: 'gdpr'
    };

    try {
      const result = await this.patternMatcher.matchPatterns(context, {
        maxRecommendations: 5,
        contextAnalysis: { depth: 'comprehensive' },
        patternMatching: { algorithm: 'weighted_overlap' }
      });

      return result;

    } catch (error) {
      console.error('Pattern matching failed:', error);
      throw error;
    }
  }

  /**
   * Example: Match patterns for a React frontend project
   */
  async exampleReactFrontend() {
    console.log('\n⚛️  Example: React Frontend Project Pattern Matching');
    console.log('=' .repeat(60));

    const context = {
      // Technical context
      technology_stack: ['react', 'typescript', 'redux', 'material-ui'],
      architecture_pattern: 'component_based',
      infrastructure: 'spa',

      // Project context
      project_type: 'frontend',
      team_size: 'medium',
      timeline: '2_months',
      complexity: 'medium',

      // Environmental context
      deployment_environment: 'netlify',
      compliance_requirements: ['accessibility'],
      geographic_distribution: 'web',

      // Quality context
      quality_requirements: 'high',
      testing_strategy: 'unit_integration',
      monitoring_needs: 'basic',

      // Security context
      security_level: 'medium',
      data_sensitivity: 'public_data',
      compliance_framework: 'wcag'
    };

    try {
      const result = await this.patternMatcher.matchPatterns(context, {
        maxRecommendations: 4,
        contextAnalysis: { depth: 'standard' },
        patternMatching: { algorithm: 'cosine' }
      });

      return result;

    } catch (error) {
      console.error('Pattern matching failed:', error);
      throw error;
    }
  }

  /**
   * Example: Match patterns for a high-security financial system
   */
  async exampleFinancialSystem() {
    console.log('\n💰 Example: Financial System Pattern Matching');
    console.log('=' .repeat(60));

    const context = {
      // Technical context
      technology_stack: ['java', 'spring_boot', 'postgresql', 'redis'],
      architecture_pattern: 'microservices',
      infrastructure: 'hybrid_cloud',

      // Project context
      project_type: 'financial_system',
      team_size: 'large',
      timeline: '6_months',
      complexity: 'high',

      // Environmental context
      deployment_environment: 'private_cloud',
      compliance_requirements: ['pci_dss', 'sox', 'gdpr'],
      geographic_distribution: 'regional',

      // Quality context
      quality_requirements: 'critical',
      testing_strategy: 'comprehensive',
      monitoring_needs: 'enterprise',

      // Security context
      security_level: 'critical',
      data_sensitivity: 'financial_data',
      compliance_framework: 'pci_dss'
    };

    try {
      const result = await this.patternMatcher.matchPatterns(context, {
        maxRecommendations: 6,
        contextAnalysis: { depth: 'comprehensive' },
        patternMatching: { algorithm: 'weighted_overlap', threshold: 0.8 }
      });

      return result;

    } catch (error) {
      console.error('Pattern matching failed:', error);
      throw error;
    }
  }

  /**
   * Display matching results
   */
  displayMatchingResults(result) {
    console.log('\n📊 Pattern Matching Results:');
    console.log('-'.repeat(40));

    // Context analysis summary
    const contextAnalysis = result.context_analysis;
    console.log(`📋 Context Analysis ID: ${contextAnalysis.analysis_id}`);
    console.log(`🎯 Context Completeness: ${(contextAnalysis.metadata.context_completeness_score * 100).toFixed(1)}%`);
    console.log(`⚠️  Context Risks: ${contextAnalysis.context_risks.length}`);

    // Pattern matches summary
    const patternMatches = result.pattern_matches;
    console.log(`🔍 Patterns Evaluated: ${patternMatches.metadata.total_patterns_evaluated}`);
    console.log(`✅ Patterns Matched: ${patternMatches.matches.length}`);
    console.log(`📈 Average Similarity: ${(patternMatches.metadata.average_similarity * 100).toFixed(1)}%`);

    // Recommendations
    console.log(`💡 Recommendations: ${result.recommendations.length}`);
    result.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.pattern_name} (Priority: ${rec.priority}, Confidence: ${(rec.confidence_score * 100).toFixed(1)}%)`);
      console.log(`     Type: ${rec.type}`);
      console.log(`     Action: ${rec.action}`);
    });

    // Decision
    const decision = result.decision;
    console.log(`\n🎲 Decision: ${decision.decision_type.toUpperCase()}`);
    console.log(`🎯 Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`📝 Rationale: ${decision.rationale}`);

    if (decision.recommended_patterns.length > 0) {
      console.log(`🏆 Top Recommendation: ${decision.recommended_patterns[0].pattern_name}`);
    }

    // Implementation plan
    if (decision.implementation_plan.steps) {
      console.log(`\n📋 Implementation Plan (${decision.implementation_plan.estimated_effort}h):`);
      decision.implementation_plan.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
    }

    console.log(`\n⏱️  Processing Time: ${result.metadata.processing_duration_ms}ms`);
    console.log('='.repeat(60));
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧪 Running Pattern Matcher Examples');
    console.log('=' .repeat(60));

    try {
      // Example 1: Node.js API
      await this.exampleNodeJsAPI();

      // Example 2: React Frontend
      await this.exampleReactFrontend();

      // Example 3: Financial System
      await this.exampleFinancialSystem();

      // Display system statistics
      const stats = this.patternMatcher.getStatistics();
      console.log('\n📈 System Statistics:');
      console.log(`   Cache Size: ${stats.cache_size}`);
      console.log(`   Active Matches: ${stats.active_matches}`);
      console.log(`   Cache Hit Rate: ${(stats.cache_hit_rate * 100).toFixed(1)}%`);
      console.log(`   Avg Processing Time: ${stats.average_processing_time}ms`);

    } catch (error) {
      console.error('Example execution failed:', error);
    }
  }

  /**
   * Demonstrate real-time pattern matching
   */
  async demonstrateRealTimeMatching() {
    console.log('\n⚡ Real-time Pattern Matching Demonstration');
    console.log('=' .repeat(60));

    const contexts = [
      {
        name: 'Startup MVP',
        context: {
          technology_stack: ['react', 'node.js', 'mongodb'],
          project_type: 'mvp',
          team_size: 'small',
          timeline: '1_month',
          security_level: 'basic'
        }
      },
      {
        name: 'Enterprise System',
        context: {
          technology_stack: ['java', 'kubernetes', 'postgresql'],
          project_type: 'enterprise',
          team_size: 'large',
          timeline: '12_months',
          security_level: 'critical'
        }
      },
      {
        name: 'Mobile App',
        context: {
          technology_stack: ['react_native', 'firebase'],
          project_type: 'mobile_app',
          team_size: 'medium',
          timeline: '4_months',
          security_level: 'medium'
        }
      }
    ];

    for (const { name, context } of contexts) {
      console.log(`\n🔄 Matching patterns for: ${name}`);
      try {
        const result = await this.patternMatcher.matchPatterns(context, {
          maxRecommendations: 3
        });

        const topPattern = result.recommendations[0];
        if (topPattern) {
          console.log(`   🏆 Top Pattern: ${topPattern.pattern_name}`);
          console.log(`   🎯 Confidence: ${(topPattern.confidence_score * 100).toFixed(1)}%`);
          console.log(`   📋 Decision: ${result.decision.decision_type}`);
        }
      } catch (error) {
        console.error(`   ❌ Failed for ${name}:`, error.message);
      }
    }
  }

  /**
   * Demonstrate pattern matching with different algorithms
   */
  async compareMatchingAlgorithms() {
    console.log('\n🔬 Algorithm Comparison Demonstration');
    console.log('=' .repeat(60));

    const context = {
      technology_stack: ['python', 'django', 'postgresql', 'redis'],
      project_type: 'web_application',
      team_size: 'medium',
      security_level: 'high',
      deployment_environment: 'aws'
    };

    const algorithms = ['cosine', 'jaccard', 'euclidean', 'weighted_overlap'];

    for (const algorithm of algorithms) {
      console.log(`\n📊 Algorithm: ${algorithm.toUpperCase()}`);
      try {
        const result = await this.patternMatcher.matchPatterns(context, {
          maxRecommendations: 2,
          patternMatching: { algorithm, threshold: 0.5 }
        });

        console.log(`   ✅ Matches Found: ${result.pattern_matches.matches.length}`);
        if (result.recommendations.length > 0) {
          const topRec = result.recommendations[0];
          console.log(`   🏆 Top Pattern: ${topRec.pattern_name}`);
          console.log(`   🎯 Similarity: ${(topRec.similarity_score * 100).toFixed(1)}%`);
        }
      } catch (error) {
        console.error(`   ❌ Algorithm ${algorithm} failed:`, error.message);
      }
    }
  }
}

// Export for use in other modules
module.exports = PatternMatcherExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new PatternMatcherExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    example.runAllExamples();
  } else if (args.includes('--realtime')) {
    example.demonstrateRealTimeMatching();
  } else if (args.includes('--compare')) {
    example.compareMatchingAlgorithms();
  } else {
    // Run Node.js API example by default
    example.exampleNodeJsAPI().catch(console.error);
  }
}