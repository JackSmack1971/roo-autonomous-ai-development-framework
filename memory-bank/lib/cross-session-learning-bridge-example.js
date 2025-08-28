/**
 * Cross-Session Learning Bridge Example
 *
 * Demonstrates comprehensive cross-session learning capabilities for
 * long-term pattern evolution and organizational learning
 */

const CrossSessionLearningBridge = require('./cross-session-learning-bridge');
const SessionHandoffManager = require('./session-handoff-manager');

class CrossSessionLearningBridgeExample {
  constructor() {
    this.learningBridge = new CrossSessionLearningBridge({
      knowledgeBasePath: './example-learning-knowledge-base',
      enablePredictiveLearning: true,
      enableCollaborativeFiltering: false,
      learningAggregationInterval: 30000 // 30 seconds for demo
    });

    this.sessionManager = new SessionHandoffManager({
      handoffStoragePath: './example-bridge-sessions'
    });

    this.learningBridge.sessionManager = this.sessionManager;

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.learningBridge.on('learning_bridge_completed', (data) => {
      console.log(`🌉 Learning bridge completed: ${data.bridgeId} (${data.sessionsBridged} sessions)`);
    });

    this.learningBridge.on('pattern_evolved', (data) => {
      console.log(`🔄 Pattern evolved: ${data.patternId} (${data.evolutionStage})`);
    });

    this.learningBridge.on('organizational_learning_updated', (data) => {
      console.log(`📚 Organizational learning updated: ${data.learningDomain}`);
    });

    this.learningBridge.on('cross_session_insight_discovered', (data) => {
      console.log(`💡 Cross-session insight: ${data.insightType} (${data.confidence.toFixed(3)})`);
    });

    this.learningBridge.on('learning_aggregation_completed', (data) => {
      console.log(`📊 Learning aggregation completed: ${data.sessionsProcessed} sessions processed`);
    });

    this.learningBridge.on('analytics_dashboard_created', (data) => {
      console.log(`📈 Analytics dashboard created: ${data.dashboardId} (${data.insightsCount} insights)`);
    });
  }

  /**
   * Example: Complete learning bridge across multiple sessions
   */
  async exampleCompleteLearningBridge() {
    console.log('\n🌉 Example: Complete Learning Bridge Across Sessions');
    console.log('=' .repeat(65));

    try {
      // Step 1: Create multiple sessions with different learning experiences
      const sessions = await this.createMultipleLearningSessions();

      // Step 2: Bridge learning across all sessions
      console.log('\n🌉 Creating learning bridge across all sessions...');
      const bridge = await this.learningBridge.bridgeLearningAcrossSessions(
        sessions.map(s => s.session_id),
        {
          includePatternEvolution: true,
          includeOrganizationalInsights: true,
          includeCrossSessionCorrelations: true,
          enablePredictiveModeling: true
        }
      );

      console.log(`\n📊 Learning Bridge Results:`);
      console.log(`   Bridge ID: ${bridge.bridge_id}`);
      console.log(`   Sessions Bridged: ${bridge.session_ids.length}`);
      console.log(`   Learning Connections: ${bridge.learning_connections.length}`);
      console.log(`   Pattern Evolutions: ${bridge.pattern_evolutions.length}`);
      console.log(`   Organizational Insights: ${bridge.organizational_insights.length}`);
      console.log(`   Cross-Session Correlations: ${bridge.cross_session_correlations.length}`);

      // Step 3: Display learning connections
      if (bridge.learning_connections.length > 0) {
        console.log('\n🔗 Learning Connections:');
        bridge.learning_connections.slice(0, 3).forEach((connection, index) => {
          console.log(`   ${index + 1}. ${connection.type}: ${connection.description}`);
        });
      }

      // Step 4: Display pattern evolutions
      if (bridge.pattern_evolutions.length > 0) {
        console.log('\n🔄 Pattern Evolutions:');
        bridge.pattern_evolutions.slice(0, 3).forEach((evolution, index) => {
          console.log(`   ${index + 1}. ${evolution.pattern_name}: ${evolution.evolution_stages.length} stages`);
        });
      }

      return {
        sessions,
        bridge
      };

    } catch (error) {
      console.error('Complete learning bridge example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Pattern evolution analysis
   */
  async examplePatternEvolutionAnalysis() {
    console.log('\n🔄 Example: Pattern Evolution Analysis');
    console.log('=' .repeat(65));

    try {
      // Create sessions with pattern usage over time
      const evolutionSessions = await this.createPatternEvolutionSessions();

      // Analyze evolution of a specific pattern
      const patternId = 'security-jwt-auth';
      console.log(`\n🔍 Analyzing evolution of pattern: ${patternId}`);

      const evolution = await this.learningBridge.analyzePatternEvolution(patternId, {
        includePredictions: true,
        includeRecommendations: true,
        timeRange: 'all'
      });

      console.log(`\n📊 Pattern Evolution Results:`);
      console.log(`   Evolution ID: ${evolution.evolution_id}`);
      console.log(`   Pattern: ${evolution.pattern_id}`);
      console.log(`   Evolution Stages: ${evolution.evolution_stages.length}`);
      console.log(`   Maturity Assessment: ${evolution.maturity_assessment.level}`);
      console.log(`   Recommendations: ${evolution.recommendations.length}`);

      // Display evolution stages
      if (evolution.evolution_stages.length > 0) {
        console.log('\n📈 Evolution Stages:');
        evolution.evolution_stages.forEach((stage, index) => {
          console.log(`   ${index + 1}. ${stage.stage_name}: ${stage.description}`);
        });
      }

      // Display recommendations
      if (evolution.recommendations.length > 0) {
        console.log('\n💡 Evolution Recommendations:');
        evolution.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.type}: ${rec.description}`);
        });
      }

      return {
        evolutionSessions,
        evolution
      };

    } catch (error) {
      console.error('Pattern evolution analysis example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Organizational learning insights
   */
  async exampleOrganizationalInsights() {
    console.log('\n📚 Example: Organizational Learning Insights');
    console.log('=' .repeat(65));

    try {
      // Create diverse sessions representing different parts of organization
      const organizationalSessions = await this.createOrganizationalSessions();

      // Generate organizational insights for different domains
      const domains = ['code', 'debug', 'architect'];
      const insights = {};

      for (const domain of domains) {
        console.log(`\n📊 Generating organizational insights for: ${domain}`);

        const insight = await this.learningBridge.generateOrganizationalInsights(domain, {
          includePredictiveInsights: true,
          includeActionableRecommendations: true,
          timeRange: '30d'
        });

        insights[domain] = insight;

        console.log(`   Insight ID: ${insight.insight_id}`);
        console.log(`   Learning Patterns: ${insight.learning_patterns.length}`);
        console.log(`   Trend Analysis: ${Object.keys(insight.trend_analysis).length} trends`);
        console.log(`   Actionable Recommendations: ${insight.actionable_recommendations.length}`);

        // Display top recommendations
        if (insight.actionable_recommendations.length > 0) {
          console.log(`   Top Recommendations:`);
          insight.actionable_recommendations.slice(0, 2).forEach((rec, index) => {
            console.log(`     ${index + 1}. ${rec.description} (${rec.priority} priority)`);
          });
        }
      }

      return {
        organizationalSessions,
        insights
      };

    } catch (error) {
      console.error('Organizational insights example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Learning analytics dashboard
   */
  async exampleLearningAnalyticsDashboard() {
    console.log('\n📈 Example: Learning Analytics Dashboard');
    console.log('=' .repeat(65));

    try {
      // Create comprehensive learning sessions
      const analyticsSessions = await this.createAnalyticsSessions();

      // Create learning analytics dashboard
      console.log('\n📊 Creating learning analytics dashboard...');
      const dashboard = await this.learningBridge.createLearningAnalyticsDashboard({
        timeRange: '7d',
        includePredictions: true,
        includeStrategicRecommendations: true
      });

      console.log(`\n📋 Dashboard Results:`);
      console.log(`   Dashboard ID: ${dashboard.dashboard_id}`);
      console.log(`   Time Range: ${dashboard.time_range}`);
      console.log(`   Insights Generated: ${dashboard.insights.length}`);
      console.log(`   Recommendations: ${dashboard.recommendations.length}`);

      // Display analytics
      console.log('\n📊 Key Analytics:');
      console.log(`   Pattern Effectiveness: ${Object.keys(dashboard.analytics.pattern_effectiveness).length} patterns analyzed`);
      console.log(`   Learning Velocity: ${dashboard.analytics.learning_velocity.trend || 'stable'}`);
      console.log(`   Quality Trends: ${dashboard.analytics.quality_trends.overall_trend || 'stable'}`);
      console.log(`   User Engagement: ${(dashboard.analytics.user_engagement.average_score || 0).toFixed(2)}`);

      // Display top insights
      if (dashboard.insights.length > 0) {
        console.log('\n💡 Top Insights:');
        dashboard.insights.slice(0, 3).forEach((insight, index) => {
          console.log(`   ${index + 1}. ${insight.title}: ${insight.description}`);
        });
      }

      // Display strategic recommendations
      if (dashboard.recommendations.length > 0) {
        console.log('\n🎯 Strategic Recommendations:');
        dashboard.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.title}: ${rec.description} (${rec.impact} impact)`);
        });
      }

      return {
        analyticsSessions,
        dashboard
      };

    } catch (error) {
      console.error('Learning analytics dashboard example failed:', error);
      throw error;
      throw error;
    }
  }

  /**
   * Example: Learning strategy optimization
   */
  async exampleLearningStrategyOptimization() {
    console.log('\n🎯 Example: Learning Strategy Optimization');
    console.log('=' .repeat(65));

    try {
      // Create sessions with various learning outcomes
      const optimizationSessions = await this.createOptimizationSessions();

      // Perform learning strategy optimization
      console.log('\n🎯 Optimizing learning strategies...');
      const optimization = await this.learningBridge.optimizeLearningStrategies({
        includePredictiveAnalysis: true,
        includeRiskAssessment: true,
        timeRange: '14d'
      });

      console.log(`\n📊 Optimization Results:`);
      console.log(`   Optimization ID: ${optimization.optimization_id}`);
      console.log(`   Opportunities Identified: ${optimization.optimization_opportunities.length}`);
      console.log(`   Recommended Adjustments: ${optimization.recommended_adjustments.length}`);

      // Display optimization opportunities
      if (optimization.optimization_opportunities.length > 0) {
        console.log('\n🚀 Optimization Opportunities:');
        optimization.optimization_opportunities.forEach((opportunity, index) => {
          console.log(`   ${index + 1}. ${opportunity.title}: ${opportunity.description}`);
          console.log(`      Potential Impact: ${opportunity.potential_impact}`);
        });
      }

      // Display recommended adjustments
      if (optimization.recommended_adjustments.length > 0) {
        console.log('\n🔧 Recommended Adjustments:');
        optimization.recommended_adjustments.forEach((adjustment, index) => {
          console.log(`   ${index + 1}. ${adjustment.strategy}: ${adjustment.description}`);
          console.log(`      Expected Benefit: ${adjustment.expected_benefit}`);
        });
      }

      // Display expected impacts
      console.log('\n📈 Expected Impacts:');
      Object.entries(optimization.expected_impacts).forEach(([metric, impact]) => {
        console.log(`   ${metric}: ${(impact.improvement * 100).toFixed(1)}% improvement`);
      });

      return {
        optimizationSessions,
        optimization
      };

    } catch (error) {
      console.error('Learning strategy optimization example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Real-time learning aggregation
   */
  async exampleRealTimeLearningAggregation() {
    console.log('\n⚡ Example: Real-time Learning Aggregation');
    console.log('=' .repeat(65));

    try {
      // Create continuous learning sessions
      console.log('🎬 Creating continuous learning sessions...');
      const continuousSessions = [];

      for (let i = 0; i < 5; i++) {
        const session = await this.sessionManager.createSession({
          mode: ['code', 'debug', 'architect'][i % 3],
          user_id: 'realtime_demo',
          project_id: 'realtime_test',
          creation_reason: 'realtime_demo'
        });

        // Simulate ongoing learning activities
        await this.simulateContinuousLearningActivities(session.session_id, i);

        continuousSessions.push(session);

        // Small delay to simulate real-time nature
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Created ${continuousSessions.length} continuous learning sessions`);

      // Wait for learning aggregation to occur
      console.log('\n⏳ Waiting for learning aggregation...');
      await new Promise(resolve => setTimeout(resolve, 35000)); // Wait for aggregation cycle

      // Check learning bridge statistics
      const stats = this.learningBridge.getStatistics();
      console.log('\n📊 Learning Bridge Statistics:');
      console.log(`   Knowledge Base Size: ${stats.knowledge_base_size.pattern_evolution} pattern evolutions`);
      console.log(`   Organizational Learning: ${stats.knowledge_base_size.organizational_learning} domains`);
      console.log(`   Cross-Session Insights: ${stats.knowledge_base_size.cross_session_insights} insights`);
      console.log(`   Learning Aggregation: ${stats.learning_aggregation_active ? 'Active' : 'Inactive'}`);

      return {
        continuousSessions,
        statistics: stats
      };

    } catch (error) {
      console.error('Real-time learning aggregation example failed:', error);
      throw error;
    }
  }

  /**
   * Create multiple learning sessions for bridge demonstration
   */
  async createMultipleLearningSessions() {
    const sessions = [];

    // Session 1: Initial development with basic patterns
    const session1 = await this.sessionManager.createSession({
      mode: 'code',
      user_id: 'developer_1',
      project_id: 'project_a',
      creation_reason: 'initial_development'
    });
    await this.simulateBasicLearningActivities(session1.session_id, 'basic');
    sessions.push(session1);

    // Session 2: Debugging session with issue resolution
    const session2 = await this.sessionManager.createSession({
      mode: 'debug',
      user_id: 'developer_2',
      project_id: 'project_a',
      creation_reason: 'bug_fixing'
    });
    await this.simulateBasicLearningActivities(session2.session_id, 'debug');
    sessions.push(session2);

    // Session 3: Architecture session with design patterns
    const session3 = await this.sessionManager.createSession({
      mode: 'architect',
      user_id: 'architect_1',
      project_id: 'project_a',
      creation_reason: 'architecture_design'
    });
    await this.simulateBasicLearningActivities(session3.session_id, 'architect');
    sessions.push(session3);

    // Session 4: Follow-up development with improved patterns
    const session4 = await this.sessionManager.createSession({
      mode: 'code',
      user_id: 'developer_1',
      project_id: 'project_a',
      creation_reason: 'continued_development'
    });
    await this.simulateBasicLearningActivities(session4.session_id, 'advanced');
    sessions.push(session4);

    return sessions;
  }

  /**
   * Create pattern evolution sessions
   */
  async createPatternEvolutionSessions() {
    const sessions = [];

    // Early adoption session
    const earlySession = await this.sessionManager.createSession({
      mode: 'code',
      user_id: 'developer_1',
      project_id: 'evolution_test'
    });
    await this.simulatePatternEvolutionActivities(earlySession.session_id, 'early');
    sessions.push(earlySession);

    // Growing adoption session
    const growingSession = await this.sessionManager.createSession({
      mode: 'code',
      user_id: 'developer_2',
      project_id: 'evolution_test'
    });
    await this.simulatePatternEvolutionActivities(growingSession.session_id, 'growing');
    sessions.push(growingSession);

    // Mature adoption session
    const matureSession = await this.sessionManager.createSession({
      mode: 'code',
      user_id: 'developer_3',
      project_id: 'evolution_test'
    });
    await this.simulatePatternEvolutionActivities(matureSession.session_id, 'mature');
    sessions.push(matureSession);

    return sessions;
  }

  /**
   * Create organizational sessions
   */
  async createOrganizationalSessions() {
    const sessions = [];

    // Different modes and users
    const scenarios = [
      { mode: 'code', user: 'dev1', project: 'web_app' },
      { mode: 'debug', user: 'dev2', project: 'web_app' },
      { mode: 'architect', user: 'arch1', project: 'web_app' },
      { mode: 'code', user: 'dev3', project: 'mobile_app' },
      { mode: 'debug', user: 'dev4', project: 'mobile_app' },
      { mode: 'architect', user: 'arch2', project: 'mobile_app' }
    ];

    for (const scenario of scenarios) {
      const session = await this.sessionManager.createSession({
        mode: scenario.mode,
        user_id: scenario.user,
        project_id: scenario.project,
        creation_reason: 'organizational_demo'
      });
      await this.simulateOrganizationalLearningActivities(session.session_id, scenario);
      sessions.push(session);
    }

    return sessions;
  }

  /**
   * Simulate basic learning activities
   */
  async simulateBasicLearningActivities(sessionId, type) {
    const activities = {
      basic: [
        { pattern_id: 'security-jwt-auth', pattern_name: 'JWT Authentication', confidence_score: 0.8, success: true },
        { pattern_id: 'performance-caching', pattern_name: 'Caching Strategy', confidence_score: 0.7, success: true }
      ],
      debug: [
        { pattern_id: 'debug-logging', pattern_name: 'Debug Logging', confidence_score: 0.9, success: true },
        { pattern_id: 'error-handling', pattern_name: 'Error Handling', confidence_score: 0.8, success: false }
      ],
      architect: [
        { pattern_id: 'microservices-arch', pattern_name: 'Microservices Architecture', confidence_score: 0.85, success: true },
        { pattern_id: 'api-design', pattern_name: 'API Design', confidence_score: 0.9, success: true }
      ],
      advanced: [
        { pattern_id: 'security-jwt-auth', pattern_name: 'JWT Authentication', confidence_score: 0.9, success: true },
        { pattern_id: 'performance-caching', pattern_name: 'Advanced Caching', confidence_score: 0.85, success: true },
        { pattern_id: 'testing-tdd', pattern_name: 'TDD Implementation', confidence_score: 0.8, success: true }
      ]
    };

    const patterns = activities[type] || activities.basic;

    for (const pattern of patterns) {
      await this.sessionManager.updateSession(sessionId, {
        pattern_application: {
          ...pattern,
          timestamp: new Date().toISOString(),
          execution_time_ms: 1000 + Math.random() * 2000,
          context: { type, session_id: sessionId }
        }
      });
    }
  }

  /**
   * Simulate pattern evolution activities
   */
  async simulatePatternEvolutionActivities(sessionId, stage) {
    const evolutionPatterns = {
      early: [
        { pattern_id: 'security-jwt-auth', confidence_score: 0.6, success: false },
        { pattern_id: 'basic-auth', confidence_score: 0.7, success: true }
      ],
      growing: [
        { pattern_id: 'security-jwt-auth', confidence_score: 0.8, success: true },
        { pattern_id: 'security-oauth', confidence_score: 0.7, success: false }
      ],
      mature: [
        { pattern_id: 'security-jwt-auth', confidence_score: 0.95, success: true },
        { pattern_id: 'security-oauth', confidence_score: 0.9, success: true },
        { pattern_id: 'security-mfa', confidence_score: 0.8, success: true }
      ]
    };

    const patterns = evolutionPatterns[stage] || evolutionPatterns.early;

    for (const pattern of patterns) {
      await this.sessionManager.updateSession(sessionId, {
        pattern_application: {
          ...pattern,
          pattern_name: pattern.pattern_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          timestamp: new Date().toISOString(),
          execution_time_ms: 800 + Math.random() * 1200,
          context: { stage, session_id: sessionId }
        }
      });
    }
  }

  /**
   * Simulate organizational learning activities
   */
  async simulateOrganizationalLearningActivities(sessionId, scenario) {
    const patterns = [
      { pattern_id: `${scenario.mode}-pattern-1`, confidence_score: 0.7 + Math.random() * 0.3, success: Math.random() > 0.3 },
      { pattern_id: `${scenario.mode}-pattern-2`, confidence_score: 0.7 + Math.random() * 0.3, success: Math.random() > 0.3 },
      { pattern_id: 'cross-mode-pattern', confidence_score: 0.7 + Math.random() * 0.3, success: Math.random() > 0.3 }
    ];

    for (const pattern of patterns) {
      await this.sessionManager.updateSession(sessionId, {
        pattern_application: {
          ...pattern,
          pattern_name: pattern.pattern_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          timestamp: new Date().toISOString(),
          execution_time_ms: 500 + Math.random() * 1500,
          context: { scenario, session_id: sessionId }
        }
      });
    }
  }

  /**
   * Simulate continuous learning activities
   */
  async simulateContinuousLearningActivities(sessionId, sequence) {
    const patterns = [
      'continuous-pattern-1',
      'continuous-pattern-2',
      'continuous-pattern-3'
    ];

    const pattern = patterns[sequence % patterns.length];

    await this.sessionManager.updateSession(sessionId, {
      pattern_application: {
        pattern_id: pattern,
        pattern_name: pattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        confidence_score: 0.7 + Math.random() * 0.3,
        success: Math.random() > 0.2,
        timestamp: new Date().toISOString(),
        execution_time_ms: 300 + Math.random() * 700,
        context: { sequence, session_id: sessionId }
      }
    });
  }

  // Placeholder methods for other session creation
  async createAnalyticsSessions() { return []; }
  async createOptimizationSessions() { return []; }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🌉 Running Cross-Session Learning Bridge Examples');
    console.log('=' .repeat(70));

    try {
      // Run examples
      await this.exampleCompleteLearningBridge();
      await this.examplePatternEvolutionAnalysis();
      await this.exampleOrganizationalInsights();
      await this.exampleLearningAnalyticsDashboard();
      await this.exampleLearningStrategyOptimization();
      await this.exampleRealTimeLearningAggregation();

      // Display final statistics
      const finalStats = this.learningBridge.getStatistics();
      console.log('\n📈 Final Learning Bridge Statistics:');
      console.log(`   Pattern Evolution Knowledge: ${finalStats.knowledge_base_size.pattern_evolution}`);
      console.log(`   Organizational Learning: ${finalStats.knowledge_base_size.organizational_learning}`);
      console.log(`   Cross-Session Insights: ${finalStats.knowledge_base_size.cross_session_insights}`);
      console.log(`   Learning Trends: ${finalStats.knowledge_base_size.learning_trends}`);
      console.log(`   Active Aggregators: ${finalStats.active_aggregators}`);
      console.log(`   Pattern Maturity Models: ${finalStats.pattern_maturity_models}`);
      console.log(`   Predictive Models: ${finalStats.predictive_models}`);

    } catch (error) {
      console.error('Example execution failed:', error);
    } finally {
      // Cleanup
      await this.learningBridge.cleanup();
      await this.sessionManager.cleanup();
    }
  }

  /**
   * Health check for learning bridge system
   */
  async healthCheck() {
    console.log('🏥 Cross-Session Learning Bridge Health Check');
    console.log('=' .repeat(55));

    try {
      const stats = this.learningBridge.getStatistics();

      console.log(`✅ System Status: Healthy`);
      console.log(`🌉 Knowledge Base: ${stats.knowledge_base_size.pattern_evolution} pattern evolutions`);
      console.log(`📚 Organizational Learning: ${stats.knowledge_base_size.organizational_learning} domains`);
      console.log(`💡 Cross-Session Insights: ${stats.knowledge_base_size.cross_session_insights} insights`);
      console.log(`📈 Learning Trends: ${stats.knowledge_base_size.learning_trends} trends`);
      console.log(`⚡ Learning Aggregation: ${stats.learning_aggregation_active ? 'Active' : 'Inactive'}`);

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
module.exports = CrossSessionLearningBridgeExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new CrossSessionLearningBridgeExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--health')) {
    example.healthCheck();
  } else if (args.includes('--bridge')) {
    example.initializeProtocolClients().then(() => example.exampleCompleteLearningBridge());
  } else if (args.includes('--evolution')) {
    example.initializeProtocolClients().then(() => example.examplePatternEvolutionAnalysis());
  } else if (args.includes('--insights')) {
    example.initializeProtocolClients().then(() => example.exampleOrganizationalInsights());
  } else if (args.includes('--analytics')) {
    example.initializeProtocolClients().then(() => example.exampleLearningAnalyticsDashboard());
  } else if (args.includes('--optimization')) {
    example.initializeProtocolClients().then(() => example.exampleLearningStrategyOptimization());
  } else if (args.includes('--realtime')) {
    example.initializeProtocolClients().then(() => example.exampleRealTimeLearningAggregation());
  } else {
    // Run all examples by default
    example.runAllExamples().catch(console.error);
  }
}