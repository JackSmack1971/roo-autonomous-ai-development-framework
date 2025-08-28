/**
 * Recommendation Engine Example
 *
 * Demonstrates advanced recommendation generation with multiple algorithms,
 * business rules, and external insights integration
 */

const RecommendationEngine = require('./recommendation-engine');
const PatternMatcher = require('./pattern-matcher');

class RecommendationEngineExample {
  constructor() {
    this.recommendationEngine = new RecommendationEngine({
      maxRecommendations: 8,
      minConfidenceThreshold: 0.6,
      prioritizationStrategy: 'weighted_score',
      enableBusinessRules: true,
      enableExternalSources: true,
      recommendationCacheSize: 50
    });

    // Add external recommendation sources
    this.addExternalSources();

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Add external recommendation sources
   */
  addExternalSources() {
    // Mock external source: Industry best practices
    this.recommendationEngine.addExternalSource('industry_practices', {
      gatherInsights: async (recommendation, context) => {
        const insights = {
          industry_adoption: Math.random() * 0.5 + 0.5,
          trend_alignment: Math.random() * 0.4 + 0.3,
          competitor_usage: Math.random() * 0.6 + 0.2
        };

        return {
          type: 'industry_analysis',
          data: insights,
          summary: `${Math.round(insights.industry_adoption * 100)}% industry adoption rate`
        };
      }
    });

    // Mock external source: Community feedback
    this.recommendationEngine.addExternalSource('community_feedback', {
      gatherInsights: async (recommendation, context) => {
        const feedback = {
          rating: Math.random() * 2 + 3, // 3-5 star rating
          reviews_count: Math.floor(Math.random() * 50) + 10,
          success_stories: Math.floor(Math.random() * 20) + 5
        };

        return {
          type: 'community_feedback',
          data: feedback,
          summary: `${feedback.rating.toFixed(1)}/5 stars from ${feedback.reviews_count} reviews`
        };
      }
    });

    // Mock external source: Cost analysis
    this.recommendationEngine.addExternalSource('cost_analysis', {
      gatherInsights: async (recommendation, context) => {
        const costAnalysis = {
          implementation_cost: recommendation.estimated_effort * (50 + Math.random() * 50),
          maintenance_cost: recommendation.estimated_effort * (10 + Math.random() * 20),
          roi_estimate: Math.random() * 200 + 100,
          payback_period: Math.random() * 12 + 3
        };

        return {
          type: 'cost_analysis',
          data: costAnalysis,
          summary: `$${Math.round(costAnalysis.implementation_cost)} implementation cost, ${Math.round(costAnalysis.roi_estimate)}% ROI`
        };
      }
    });
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.recommendationEngine.on('recommendations_generated', (result) => {
      console.log('🎯 Recommendations generated successfully!');
      this.displayRecommendationResults(result);
    });

    this.recommendationEngine.on('recommendations_generated_from_cache', (result) => {
      console.log('⚡ Recommendations generated from cache!');
      this.displayRecommendationResults(result);
    });

    this.recommendationEngine.on('recommendation_generation_failed', (error) => {
      console.error('❌ Recommendation generation failed:', error);
    });

    this.recommendationEngine.on('external_source_added', (data) => {
      console.log(`🔗 External source added: ${data.name}`);
    });

    this.recommendationEngine.on('cache_cleared', () => {
      console.log('🧹 Recommendation cache cleared');
    });
  }

  /**
   * Example: Generate recommendations for a Node.js API project
   */
  async exampleNodeJsAPI() {
    console.log('\n🚀 Example: Node.js API Project Recommendations');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['nodejs', 'express', 'mongodb', 'jwt'],
      architecture_pattern: 'rest_api',
      infrastructure: 'cloud',
      project_type: 'web_api',
      team_size: 'small',
      timeline: '3_months',
      complexity: 'medium',
      deployment_environment: 'aws_lambda',
      compliance_requirements: ['gdpr'],
      geographic_distribution: 'global',
      quality_requirements: 'high',
      testing_strategy: 'tdd',
      monitoring_needs: 'comprehensive',
      security_level: 'high',
      data_sensitivity: 'personal_data',
      compliance_framework: 'gdpr'
    };

    // Mock pattern matches (in real implementation, this would come from PatternMatcher)
    const patternMatches = this.createMockPatternMatches(context);

    try {
      const result = await this.recommendationEngine.generateRecommendations(
        context,
        patternMatches,
        {
          algorithm: 'hybrid_approach',
          maxRecommendations: 5,
          prioritizationStrategy: 'weighted_score'
        }
      );

      return result;

    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw error;
    }
  }

  /**
   * Example: Generate recommendations for a React frontend project
   */
  async exampleReactFrontend() {
    console.log('\n⚛️  Example: React Frontend Project Recommendations');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['react', 'typescript', 'redux', 'material-ui'],
      architecture_pattern: 'component_based',
      infrastructure: 'spa',
      project_type: 'frontend',
      team_size: 'medium',
      timeline: '2_months',
      complexity: 'medium',
      deployment_environment: 'netlify',
      compliance_requirements: ['accessibility'],
      geographic_distribution: 'web',
      quality_requirements: 'high',
      testing_strategy: 'unit_integration',
      monitoring_needs: 'basic',
      security_level: 'medium',
      data_sensitivity: 'public_data',
      compliance_framework: 'wcag'
    };

    const patternMatches = this.createMockPatternMatches(context);

    try {
      const result = await this.recommendationEngine.generateRecommendations(
        context,
        patternMatches,
        {
          algorithm: 'context_driven',
          maxRecommendations: 4,
          prioritizationStrategy: 'business_value'
        }
      );

      return result;

    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw error;
    }
  }

  /**
   * Example: Generate recommendations for a high-security financial system
   */
  async exampleFinancialSystem() {
    console.log('\n💰 Example: Financial System Recommendations');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['java', 'spring_boot', 'postgresql', 'redis'],
      architecture_pattern: 'microservices',
      infrastructure: 'hybrid_cloud',
      project_type: 'financial_system',
      team_size: 'large',
      timeline: '6_months',
      complexity: 'high',
      deployment_environment: 'private_cloud',
      compliance_requirements: ['pci_dss', 'sox', 'gdpr'],
      geographic_distribution: 'regional',
      quality_requirements: 'critical',
      testing_strategy: 'comprehensive',
      monitoring_needs: 'enterprise',
      security_level: 'critical',
      data_sensitivity: 'financial_data',
      compliance_framework: 'pci_dss'
    };

    const patternMatches = this.createMockPatternMatches(context);

    try {
      const result = await this.recommendationEngine.generateRecommendations(
        context,
        patternMatches,
        {
          algorithm: 'business_value',
          maxRecommendations: 6,
          prioritizationStrategy: 'risk_adjusted'
        }
      );

      return result;

    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw error;
    }
  }

  /**
   * Example: Compare different recommendation algorithms
   */
  async compareAlgorithms() {
    console.log('\n🔬 Algorithm Comparison');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['python', 'django', 'postgresql', 'docker'],
      project_type: 'web_application',
      team_size: 'medium',
      security_level: 'high',
      quality_requirements: 'high'
    };

    const patternMatches = this.createMockPatternMatches(context);
    const algorithms = ['hybrid_approach', 'context_driven', 'business_value', 'collaborative_filtering'];

    const results = {};

    for (const algorithm of algorithms) {
      console.log(`\n📊 Algorithm: ${algorithm.toUpperCase()}`);
      try {
        const result = await this.recommendationEngine.generateRecommendations(
          context,
          patternMatches,
          {
            algorithm,
            maxRecommendations: 3,
            prioritizationStrategy: 'weighted_score'
          }
        );

        results[algorithm] = result;

        console.log(`   ✅ Generated ${result.recommendations.length} recommendations`);
        if (result.recommendations.length > 0) {
          const topRec = result.recommendations[0];
          console.log(`   🏆 Top: ${topRec.pattern_name} (Priority: ${topRec.priority_score.toFixed(1)})`);
        }

      } catch (error) {
        console.error(`   ❌ Algorithm ${algorithm} failed:`, error.message);
      }
    }

    return results;
  }

  /**
   * Example: Demonstrate business rules in action
   */
  async demonstrateBusinessRules() {
    console.log('\n📋 Business Rules Demonstration');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['react', 'node.js', 'mongodb'],
      project_type: 'startup_mvp',
      team_size: 'small',
      timeline: '1_month',
      security_level: 'basic',
      quality_requirements: 'medium'
    };

    const patternMatches = this.createMockPatternMatches(context);

    console.log('Context: Small team, tight timeline, basic security');

    try {
      const result = await this.recommendationEngine.generateRecommendations(
        context,
        patternMatches,
        {
          algorithm: 'context_driven',
          maxRecommendations: 5,
          prioritizationStrategy: 'weighted_score'
        }
      );

      console.log(`\n🎯 Business rules applied: ${result.metadata.business_rules_applied ? 'Yes' : 'No'}`);
      console.log(`🔗 External sources used: ${result.metadata.external_sources_used ? 'Yes' : 'No'}`);

      return result;

    } catch (error) {
      console.error('Business rules demonstration failed:', error);
      throw error;
    }
  }

  /**
   * Create mock pattern matches for demonstration
   */
  createMockPatternMatches(context) {
    const patterns = [
      {
        pattern_id: 'security-jwt-auth',
        pattern_name: 'JWT Authentication Pattern',
        confidence_score: 0.85,
        relevance_score: 0.8,
        similarity_score: 0.75,
        metadata: {
          pattern_type: 'security',
          success_rate: 0.92,
          total_applications: 45,
          last_applied: '2024-01-15T10:30:00Z'
        },
        match_factors: {
          technology_match: 0.9,
          context_completeness: 0.8,
          pattern_maturity: 0.85,
          historical_performance: 0.88
        },
        pattern_characteristics: {
          complexity: 0.6,
          risk_level: 0.4,
          applicability: 0.9,
          maintenance_cost: 0.5
        }
      },
      {
        pattern_id: 'architecture-mvc',
        pattern_name: 'MVC Architecture Pattern',
        confidence_score: 0.78,
        relevance_score: 0.85,
        similarity_score: 0.82,
        metadata: {
          pattern_type: 'architecture',
          success_rate: 0.88,
          total_applications: 120,
          last_applied: '2024-01-20T14:15:00Z'
        },
        match_factors: {
          technology_match: 0.7,
          context_completeness: 0.9,
          pattern_maturity: 0.9,
          historical_performance: 0.85
        },
        pattern_characteristics: {
          complexity: 0.7,
          risk_level: 0.5,
          applicability: 0.85,
          maintenance_cost: 0.6
        }
      },
      {
        pattern_id: 'performance-caching',
        pattern_name: 'Redis Caching Strategy',
        confidence_score: 0.82,
        relevance_score: 0.75,
        similarity_score: 0.7,
        metadata: {
          pattern_type: 'performance',
          success_rate: 0.91,
          total_applications: 78,
          last_applied: '2024-01-18T09:45:00Z'
        },
        match_factors: {
          technology_match: 0.8,
          context_completeness: 0.75,
          pattern_maturity: 0.8,
          historical_performance: 0.9
        },
        pattern_characteristics: {
          complexity: 0.5,
          risk_level: 0.3,
          applicability: 0.88,
          maintenance_cost: 0.4
        }
      },
      {
        pattern_id: 'testing-tdd',
        pattern_name: 'Test-Driven Development',
        confidence_score: 0.75,
        relevance_score: 0.9,
        similarity_score: 0.85,
        metadata: {
          pattern_type: 'development',
          success_rate: 0.85,
          total_applications: 95,
          last_applied: '2024-01-22T11:20:00Z'
        },
        match_factors: {
          technology_match: 0.6,
          context_completeness: 0.95,
          pattern_maturity: 0.85,
          historical_performance: 0.82
        },
        pattern_characteristics: {
          complexity: 0.8,
          risk_level: 0.6,
          applicability: 0.8,
          maintenance_cost: 0.7
        }
      },
      {
        pattern_id: 'monitoring-observability',
        pattern_name: 'Comprehensive Monitoring',
        confidence_score: 0.7,
        relevance_score: 0.8,
        similarity_score: 0.78,
        metadata: {
          pattern_type: 'quality',
          success_rate: 0.79,
          total_applications: 35,
          last_applied: '2024-01-25T16:30:00Z'
        },
        match_factors: {
          technology_match: 0.65,
          context_completeness: 0.82,
          pattern_maturity: 0.7,
          historical_performance: 0.75
        },
        pattern_characteristics: {
          complexity: 0.9,
          risk_level: 0.7,
          applicability: 0.75,
          maintenance_cost: 0.8
        }
      },
      {
        pattern_id: 'deployment-ci-cd',
        pattern_name: 'CI/CD Pipeline',
        confidence_score: 0.88,
        relevance_score: 0.7,
        similarity_score: 0.68,
        metadata: {
          pattern_type: 'deployment',
          success_rate: 0.94,
          total_applications: 150,
          last_applied: '2024-01-28T13:10:00Z'
        },
        match_factors: {
          technology_match: 0.7,
          context_completeness: 0.78,
          pattern_maturity: 0.95,
          historical_performance: 0.92
        },
        pattern_characteristics: {
          complexity: 0.6,
          risk_level: 0.4,
          applicability: 0.9,
          maintenance_cost: 0.5
        }
      }
    ];

    // Filter patterns based on context
    const filteredPatterns = patterns.filter(pattern => {
      // Technology match threshold
      if (pattern.match_factors.technology_match < 0.5) return false;

      // Security level alignment
      if (context.security_level === 'critical' && pattern.metadata.pattern_type === 'security') {
        return true; // Always include security for critical systems
      }

      // Quality requirements alignment
      if (context.quality_requirements === 'critical' && pattern.confidence_score < 0.7) {
        return false;
      }

      return true;
    });

    return {
      matches: filteredPatterns,
      context_analysis: {
        context_quality: { overall_score: 0.85 },
        context_risks: [],
        context_insights: [
          {
            description: 'Strong technology stack alignment detected',
            relevance: 0.9
          },
          {
            description: 'Security requirements well-defined',
            relevance: 0.8
          }
        ]
      },
      metadata: {
        total_patterns_evaluated: patterns.length,
        matches_found: filteredPatterns.length,
        average_similarity: filteredPatterns.reduce((sum, p) => sum + p.similarity_score, 0) / filteredPatterns.length,
        matching_duration_ms: 150
      }
    };
  }

  /**
   * Display recommendation results
   */
  displayRecommendationResults(result) {
    console.log('\n📊 Recommendation Results:');
    console.log('-'.repeat(50));

    // Summary statistics
    const recommendations = result.recommendations;
    console.log(`💡 Total Recommendations: ${recommendations.length}`);
    console.log(`🎯 Algorithm Used: ${result.algorithm}`);
    console.log(`📋 Business Rules Applied: ${result.metadata.business_rules_applied ? 'Yes' : 'No'}`);
    console.log(`🔗 External Sources Used: ${result.metadata.external_sources_used ? 'Yes' : 'No'}`);

    // Prioritization analysis
    const prioritization = result.prioritization;
    console.log(`\n📈 Prioritization Strategy: ${prioritization.strategy}`);
    console.log(`📊 Priority Distribution:`, prioritization.distribution);
    console.log(`📉 Average Priority: ${prioritization.average_priority.toFixed(1)}`);

    // Display recommendations
    console.log('\n🏆 Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.pattern_name}`);
      console.log(`   📋 Type: ${rec.recommendation_type}`);
      console.log(`   🎯 Priority Score: ${rec.priority_score.toFixed(1)}`);
      console.log(`   💪 Confidence: ${(rec.confidence_score * 100).toFixed(1)}%`);
      console.log(`   🎲 Relevance: ${(rec.relevance_score * 100).toFixed(1)}%`);
      console.log(`   ⏱️  Estimated Effort: ${rec.estimated_effort}h`);
      console.log(`   🎬 Action: ${rec.action}`);

      // Expected impact
      const impact = rec.expected_impact;
      const topImpact = Object.entries(impact)
        .sort(([,a], [,b]) => b - a)[0];
      console.log(`   📈 Expected Impact: ${topImpact[0]} (${(topImpact[1] * 100).toFixed(1)}%)`);

      // Risk assessment
      const risk = rec.risk_assessment;
      console.log(`   ⚠️  Overall Risk: ${(risk.overall_risk * 100).toFixed(1)}%`);

      // Prerequisites
      if (rec.prerequisites.length > 0) {
        console.log(`   📝 Prerequisites: ${rec.prerequisites.join(', ')}`);
      }

      // External insights
      if (rec.external_insights && rec.external_insights.length > 0) {
        console.log(`   🔗 External Insights:`);
        rec.external_insights.forEach(insight => {
          console.log(`      ${insight.source}: ${insight.summary}`);
        });
      }

      // Implementation steps (show first 3)
      if (rec.implementation_steps && rec.implementation_steps.length > 0) {
        console.log(`   📋 Implementation Steps:`);
        rec.implementation_steps.slice(0, 3).forEach((step, stepIndex) => {
          console.log(`      ${stepIndex + 1}. ${step}`);
        });
        if (rec.implementation_steps.length > 3) {
          console.log(`      ... and ${rec.implementation_steps.length - 3} more steps`);
        }
      }
    });

    // Business context
    const businessContext = result.business_context;
    console.log('\n💼 Business Context:');
    console.log(`   Project Type: ${businessContext.project_type || 'N/A'}`);
    console.log(`   Team Size: ${businessContext.team_size || 'N/A'}`);
    console.log(`   Timeline: ${businessContext.timeline || 'N/A'}`);

    console.log(`\n⏱️  Generation Time: ${result.metadata.generation_duration_ms}ms`);
    console.log('='.repeat(70));
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧪 Running Recommendation Engine Examples');
    console.log('=' .repeat(70));

    try {
      // Example 1: Node.js API
      await this.exampleNodeJsAPI();

      // Example 2: React Frontend
      await this.exampleReactFrontend();

      // Example 3: Financial System
      await this.exampleFinancialSystem();

      // Example 4: Algorithm Comparison
      await this.compareAlgorithms();

      // Example 5: Business Rules
      await this.demonstrateBusinessRules();

      // Display system statistics
      const stats = this.recommendationEngine.getStatistics();
      console.log('\n📈 System Statistics:');
      console.log(`   Cache Size: ${stats.cache_size}`);
      console.log(`   History Size: ${stats.history_size}`);
      console.log(`   External Sources: ${stats.external_sources_count}`);
      console.log(`   Business Rules: ${stats.business_rules_count}`);

    } catch (error) {
      console.error('Example execution failed:', error);
    }
  }

  /**
   * Demonstrate caching capabilities
   */
  async demonstrateCaching() {
    console.log('\n⚡ Caching Demonstration');
    console.log('=' .repeat(70));

    const context = {
      technology_stack: ['react', 'typescript', 'redux'],
      project_type: 'frontend',
      team_size: 'medium',
      security_level: 'medium'
    };

    const patternMatches = this.createMockPatternMatches(context);

    console.log('First request (will compute)...');
    const start1 = Date.now();
    await this.recommendationEngine.generateRecommendations(context, patternMatches);
    const time1 = Date.now() - start1;

    console.log('Second request (will use cache)...');
    const start2 = Date.now();
    await this.recommendationEngine.generateRecommendations(context, patternMatches);
    const time2 = Date.now() - start2;

    console.log(`\n⏱️  First request: ${time1}ms`);
    console.log(`⏱️  Second request: ${time2}ms`);
    console.log(`🚀 Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);

    // Clear cache
    this.recommendationEngine.clearCache();
    console.log('🧹 Cache cleared');
  }
}

// Export for use in other modules
module.exports = RecommendationEngineExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new RecommendationEngineExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    example.runAllExamples();
  } else if (args.includes('--cache')) {
    example.demonstrateCaching();
  } else if (args.includes('--compare')) {
    example.compareAlgorithms();
  } else if (args.includes('--rules')) {
    example.demonstrateBusinessRules();
  } else {
    // Run Node.js API example by default
    example.exampleNodeJsAPI().catch(console.error);
  }
}