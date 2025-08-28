/**
 * Session Handoff Example
 *
 * Demonstrates comprehensive session handoff capabilities for maintaining
 * learning continuity across work sessions
 */

const SessionHandoffManager = require('./session-handoff-manager');
const PatternProtocolClient = require('./pattern-protocol-client');

class SessionHandoffExample {
  constructor() {
    this.handoffManager = new SessionHandoffManager({
      handoffStoragePath: './example-session-handoffs',
      maxStoredSessions: 20,
      compressionEnabled: true,
      autoSaveInterval: 60000, // 1 minute for demo
      sessionTimeout: 300000 // 5 minutes for demo
    });

    this.protocolClients = new Map();
    this.activeSessions = new Map();

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.handoffManager.on('session_created', (data) => {
      console.log(`🎬 Session created: ${data.sessionId} (${data.mode})`);
    });

    this.handoffManager.on('session_handoff_initiated', (data) => {
      console.log(`📤 Handoff initiated: ${data.sessionId}`);
    });

    this.handoffManager.on('session_handoff_completed', (data) => {
      console.log(`✅ Handoff completed: ${data.sessionId} -> ${data.handoffId}`);
    });

    this.handoffManager.on('session_restored', (data) => {
      console.log(`🔄 Session restored: ${data.sessionId} from ${data.handoffId}`);
    });

    this.handoffManager.on('auto_save_completed', (data) => {
      console.log(`💾 Auto-saved ${data.sessionCount} sessions`);
    });
  }

  /**
   * Initialize protocol clients for different modes
   */
  async initializeProtocolClients() {
    console.log('🔧 Initializing protocol clients...');

    const modes = ['code', 'debug', 'architect'];

    for (const mode of modes) {
      const client = PatternProtocolClient.createCodeClient({
        enableCaching: true,
        timeout: 10000
      });

      await client.initialize();
      this.protocolClients.set(mode, client);
      console.log(`✅ ${mode} protocol client initialized`);
    }
  }

  /**
   * Example: Complete session lifecycle with handoff
   */
  async exampleSessionLifecycle() {
    console.log('\n🔄 Example: Complete Session Lifecycle');
    console.log('=' .repeat(60));

    const sessionData = {
      mode: 'code',
      user_id: 'developer_123',
      project_id: 'ecommerce_api',
      creation_reason: 'feature_development',
      priority_level: 'high',
      tags: ['react', 'typescript', 'api']
    };

    const context = {
      technology_stack: ['react', 'typescript', 'redux'],
      project_type: 'frontend',
      team_size: 'medium',
      complexity: 'medium',
      security_level: 'medium',
      quality_requirements: 'high'
    };

    try {
      // Step 1: Create a new session
      console.log('🎬 Creating new session...');
      const session = await this.handoffManager.createSession(sessionData, context);
      this.activeSessions.set(session.session_id, session);

      console.log(`✅ Session created: ${session.session_id}`);
      console.log(`   Mode: ${session.mode}`);
      console.log(`   Project: ${session.project_id}`);
      console.log(`   Priority: ${session.context.session_metadata.priority_level}`);

      // Step 2: Simulate learning activities
      console.log('\n🧠 Simulating learning activities...');
      await this.simulateLearningActivities(session.session_id, context);

      // Step 3: Initiate session handoff
      console.log('\n📤 Initiating session handoff...');
      const handoff = await this.handoffManager.initiateHandoff(
        session.session_id,
        'end_of_day',
        {
          priority: 'high',
          include_learning_context: true,
          preserve_adaptation_state: true
        }
      );

      console.log(`✅ Handoff created: ${handoff.handoff_id}`);
      console.log(`   Status: ${handoff.status}`);
      console.log(`   Data completeness: ${(handoff.handoff_metadata.data_completeness_score * 100).toFixed(1)}%`);

      // Step 4: Simulate session interruption (cleanup)
      console.log('\n⏸️  Simulating session end...');
      this.activeSessions.delete(session.session_id);

      // Step 5: Restore session from handoff
      console.log('\n🔄 Restoring session from handoff...');
      const restoredSession = await this.handoffManager.restoreSession(handoff.handoff_id);

      console.log(`✅ Session restored: ${restoredSession.session_id}`);
      console.log(`   Original session: ${handoff.session_id}`);
      console.log(`   Restoration time: ${new Date(restoredSession.metadata.restoration_timestamp).toLocaleTimeString()}`);

      // Step 6: Continue learning with restored context
      console.log('\n🧠 Continuing learning with restored context...');
      await this.simulateRestoredLearningActivities(restoredSession.session_id, restoredSession);

      return {
        originalSession: session,
        handoff: handoff,
        restoredSession: restoredSession
      };

    } catch (error) {
      console.error('Session lifecycle example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Multiple session handoffs and management
   */
  async exampleMultipleHandoffs() {
    console.log('\n📚 Example: Multiple Session Handoffs');
    console.log('=' .repeat(60));

    const sessions = [];

    try {
      // Create multiple sessions
      console.log('🎬 Creating multiple sessions...');
      for (let i = 0; i < 3; i++) {
        const sessionData = {
          mode: ['code', 'debug', 'architect'][i],
          user_id: `user_${i + 1}`,
          project_id: `project_${i + 1}`,
          creation_reason: 'demo',
          tags: [`session_${i + 1}`]
        };

        const session = await this.handoffManager.createSession(sessionData);
        sessions.push(session);

        // Simulate some activity
        await this.simulateMinimalActivity(session.session_id);
      }

      console.log(`✅ Created ${sessions.length} sessions`);

      // Create handoffs for all sessions
      console.log('\n📤 Creating handoffs for all sessions...');
      const handoffs = [];
      for (const session of sessions) {
        const handoff = await this.handoffManager.initiateHandoff(
          session.session_id,
          'batch_demo'
        );
        handoffs.push(handoff);
      }

      console.log(`✅ Created ${handoffs.length} handoffs`);

      // List available handoffs
      console.log('\n📋 Listing available handoffs...');
      const availableHandoffs = await this.handoffManager.listHandoffs({
        status: 'completed'
      });

      console.log(`📚 Found ${availableHandoffs.length} available handoffs:`);
      availableHandoffs.forEach((handoff, index) => {
        console.log(`   ${index + 1}. ${handoff.handoff_id} (${handoff.session_data.mode}) - ${handoff.reason}`);
      });

      // Restore sessions selectively
      console.log('\n🔄 Selectively restoring sessions...');
      const restoredSessions = [];

      for (const handoff of handoffs.slice(0, 2)) { // Restore first 2
        const restored = await this.handoffManager.restoreSession(handoff.handoff_id);
        restoredSessions.push(restored);
        console.log(`   ✅ Restored: ${handoff.session_data.mode} session`);
      }

      return {
        sessions: sessions,
        handoffs: handoffs,
        availableHandoffs: availableHandoffs,
        restoredSessions: restoredSessions
      };

    } catch (error) {
      console.error('Multiple handoffs example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Session handoff with different priorities
   */
  async examplePriorityHandoffs() {
    console.log('\n🎯 Example: Priority-Based Session Handoffs');
    console.log('=' .repeat(60));

    const priorities = ['low', 'medium', 'high', 'critical'];
    const handoffs = [];

    try {
      // Create sessions with different priorities
      for (const priority of priorities) {
        console.log(`\n📝 Creating ${priority} priority session...`);

        const sessionData = {
          mode: 'code',
          user_id: 'priority_demo',
          project_id: 'priority_test',
          creation_reason: 'priority_demo',
          priority_level: priority,
          tags: [priority, 'demo']
        };

        const session = await this.handoffManager.createSession(sessionData);

        // Add priority-specific context
        await this.addPriorityContext(session.session_id, priority);

        // Create handoff with appropriate priority
        const handoff = await this.handoffManager.initiateHandoff(
          session.session_id,
          `priority_${priority}`,
          {
            priority: priority,
            include_learning_context: priority === 'high' || priority === 'critical',
            preserve_adaptation_state: priority === 'critical'
          }
        );

        handoffs.push(handoff);

        console.log(`   ✅ ${priority} priority handoff: ${handoff.handoff_id}`);
        console.log(`   📊 Data completeness: ${(handoff.handoff_metadata.data_completeness_score * 100).toFixed(1)}%`);
      }

      // List handoffs by priority
      console.log('\n📋 Handoffs by priority:');
      for (const priority of priorities) {
        const priorityHandoffs = handoffs.filter(h => h.handoff_metadata.priority_level === priority);
        console.log(`   ${priority}: ${priorityHandoffs.length} handoff(s)`);
      }

      // Demonstrate priority-based restoration
      console.log('\n🔄 Priority-based restoration (critical first)...');
      const criticalHandoffs = handoffs.filter(h => h.handoff_metadata.priority_level === 'critical');

      if (criticalHandoffs.length > 0) {
        const restored = await this.handoffManager.restoreSession(criticalHandoffs[0].handoff_id);
        console.log(`   🚨 Restored critical session: ${restored.session_id}`);
      }

      return handoffs;

    } catch (error) {
      console.error('Priority handoffs example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Session handoff cleanup and management
   */
  async exampleHandoffManagement() {
    console.log('\n🧹 Example: Session Handoff Management');
    console.log('=' .repeat(60));

    try {
      // Create several sessions for management demo
      console.log('🎬 Creating sessions for management demo...');
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        const session = await this.handoffManager.createSession({
          mode: 'code',
          user_id: 'management_demo',
          project_id: 'management_test',
          creation_reason: 'cleanup_demo'
        });
        sessions.push(session);
      }

      // Create handoffs
      console.log('\n📤 Creating handoffs...');
      for (const session of sessions) {
        await this.handoffManager.initiateHandoff(session.session_id, 'management_demo');
      }

      // Get statistics
      console.log('\n📊 Current statistics:');
      const stats = this.handoffManager.getSessionStatistics();
      console.log(`   Active sessions: ${stats.active_sessions}`);
      console.log(`   Stored handoffs: ${stats.stored_handoffs}`);
      console.log(`   Handoff queue: ${stats.handoff_queue_length}`);
      console.log(`   Sessions by mode:`, stats.sessions_by_mode);

      // List handoffs with filters
      console.log('\n📋 Filtered handoff listing:');
      const recentHandoffs = await this.handoffManager.listHandoffs({
        status: 'completed',
        mode: 'code'
      });
      console.log(`   Recent code mode handoffs: ${recentHandoffs.length}`);

      // Cleanup old handoffs
      console.log('\n🧹 Cleaning up old handoffs...');
      const deletedCount = await this.handoffManager.cleanupOldHandoffs(0); // Delete all for demo
      console.log(`   Deleted ${deletedCount} old handoffs`);

      // Final statistics
      const finalStats = this.handoffManager.getSessionStatistics();
      console.log('\n📊 Final statistics:');
      console.log(`   Active sessions: ${finalStats.active_sessions}`);
      console.log(`   Stored handoffs: ${finalStats.stored_handoffs}`);

      return {
        initialStats: stats,
        finalStats: finalStats,
        deletedCount: deletedCount
      };

    } catch (error) {
      console.error('Handoff management example failed:', error);
      throw error;
    }
  }

  /**
   * Example: Real-time session monitoring
   */
  async exampleRealTimeMonitoring() {
    console.log('\n📊 Example: Real-time Session Monitoring');
    console.log('=' .repeat(60));

    try {
      // Create a session for monitoring
      const session = await this.handoffManager.createSession({
        mode: 'code',
        user_id: 'monitoring_demo',
        project_id: 'monitoring_test',
        creation_reason: 'realtime_demo'
      });

      console.log('🎬 Created session for monitoring: ' + session.session_id);

      // Simulate real-time activity updates
      console.log('\n📈 Simulating real-time activity...');
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

        // Update session with activity
        await this.handoffManager.updateSession(session.session_id, {
          pattern_application: {
            pattern_id: `pattern_${i + 1}`,
            pattern_name: `Demo Pattern ${i + 1}`,
            confidence_score: 0.7 + (i * 0.05),
            success: Math.random() > 0.3,
            execution_time_ms: 1000 + (i * 200),
            context: { step: i + 1 }
          }
        });

        // Get current statistics
        const stats = this.handoffManager.getSessionStatistics();
        console.log(`   Step ${i + 1}: ${stats.active_sessions} active, ${stats.stored_handoffs} handoffs`);
      }

      // Create final handoff
      console.log('\n📤 Creating final handoff...');
      const handoff = await this.handoffManager.initiateHandoff(
        session.session_id,
        'monitoring_complete'
      );

      console.log(`✅ Final handoff: ${handoff.handoff_id}`);
      console.log(`📊 Session had ${handoff.session_data.learning_context.pattern_history.length} pattern applications`);

      return {
        session: session,
        handoff: handoff,
        finalStats: this.handoffManager.getSessionStatistics()
      };

    } catch (error) {
      console.error('Real-time monitoring example failed:', error);
      throw error;
    }
  }

  /**
   * Simulate learning activities for a session
   */
  async simulateLearningActivities(sessionId, context) {
    const activities = [
      {
        pattern_application: {
          pattern_id: 'security-jwt-auth',
          pattern_name: 'JWT Authentication Pattern',
          confidence_score: 0.85,
          success: true,
          execution_time_ms: 1200,
          context: context
        }
      },
      {
        confidence_update: {
          pattern_id: 'security-jwt-auth',
          confidence_score: 0.88,
          reason: 'successful_application'
        }
      },
      {
        pattern_application: {
          pattern_id: 'performance-caching',
          pattern_name: 'Redis Caching Strategy',
          confidence_score: 0.82,
          success: true,
          execution_time_ms: 800,
          context: context
        }
      },
      {
        quality_metrics: {
          code_quality_score: 0.87,
          test_coverage: 0.84,
          performance_score: 0.91
        }
      },
      {
        user_feedback: {
          rating: 4.5,
          comments: 'Good pattern application',
          suggestions: 'Consider more caching options'
        }
      }
    ];

    for (const activity of activities) {
      await this.handoffManager.updateSession(sessionId, activity);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
  }

  /**
   * Simulate minimal activity for session
   */
  async simulateMinimalActivity(sessionId) {
    await this.handoffManager.updateSession(sessionId, {
      pattern_application: {
        pattern_id: 'demo_pattern',
        pattern_name: 'Demo Pattern',
        confidence_score: 0.8,
        success: true,
        execution_time_ms: 500,
        context: { demo: true }
      }
    });
  }

  /**
   * Simulate restored learning activities
   */
  async simulateRestoredLearningActivities(sessionId, restoredSession) {
    // Use restoration hints to continue learning
    if (restoredSession.restoration_hints?.continue_pattern) {
      console.log('   📝 Continuing with pattern from previous session...');

      await this.handoffManager.updateSession(sessionId, {
        pattern_application: {
          pattern_id: 'continued_pattern',
          pattern_name: 'Continued Pattern',
          confidence_score: 0.82,
          success: true,
          execution_time_ms: 600,
          context: { continued_from_previous: true }
        }
      });
    }

    // Continue with new learning
    await this.handoffManager.updateSession(sessionId, {
      quality_metrics: {
        code_quality_score: 0.89,
        test_coverage: 0.86,
        performance_score: 0.93,
        restoration_impact: 0.95
      }
    });
  }

  /**
   * Add priority-specific context to session
   */
  async addPriorityContext(sessionId, priority) {
    const priorityContexts = {
      low: {
        pattern_application: {
          pattern_id: 'basic_pattern',
          pattern_name: 'Basic Implementation',
          confidence_score: 0.7,
          success: true,
          execution_time_ms: 300
        }
      },
      medium: {
        pattern_application: {
          pattern_id: 'standard_pattern',
          pattern_name: 'Standard Implementation',
          confidence_score: 0.75,
          success: true,
          execution_time_ms: 500
        },
        quality_metrics: {
          code_quality_score: 0.8
        }
      },
      high: {
        pattern_application: {
          pattern_id: 'optimized_pattern',
          pattern_name: 'Optimized Implementation',
          confidence_score: 0.85,
          success: true,
          execution_time_ms: 800
        },
        quality_metrics: {
          code_quality_score: 0.85,
          test_coverage: 0.8
        },
        confidence_update: {
          pattern_id: 'optimized_pattern',
          confidence_score: 0.87,
          reason: 'high_priority_success'
        }
      },
      critical: {
        pattern_application: {
          pattern_id: 'secure_pattern',
          pattern_name: 'Secure Implementation',
          confidence_score: 0.95,
          success: true,
          execution_time_ms: 1200
        },
        quality_metrics: {
          code_quality_score: 0.92,
          test_coverage: 0.9,
          security_score: 0.95
        },
        adaptation_event: {
          type: 'security_adaptation',
          reason: 'critical_security_requirements',
          parameters: { security_level: 'maximum' }
        }
      }
    };

    const context = priorityContexts[priority];
    if (context) {
      await this.handoffManager.updateSession(sessionId, context);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🔄 Running Session Handoff Examples');
    console.log('=' .repeat(70));

    try {
      // Initialize protocol clients
      await this.initializeProtocolClients();

      // Run examples
      await this.exampleSessionLifecycle();
      await this.exampleMultipleHandoffs();
      await this.examplePriorityHandoffs();
      await this.exampleHandoffManagement();
      await this.exampleRealTimeMonitoring();

      // Display final statistics
      const finalStats = this.handoffManager.getSessionStatistics();
      console.log('\n📈 Final Session Statistics:');
      console.log(`   Total sessions created: ${finalStats.active_sessions + finalStats.stored_handoffs}`);
      console.log(`   Active sessions: ${finalStats.active_sessions}`);
      console.log(`   Stored handoffs: ${finalStats.stored_handoffs}`);
      console.log(`   Handoff queue: ${finalStats.handoff_queue_length}`);
      console.log(`   Sessions by mode:`, finalStats.sessions_by_mode);
      console.log(`   Handoffs by reason:`, finalStats.handoffs_by_reason);

    } catch (error) {
      console.error('Example execution failed:', error);
    } finally {
      // Cleanup
      await this.handoffManager.cleanup();
    }
  }

  /**
   * Health check for session handoff system
   */
  async healthCheck() {
    console.log('🏥 Session Handoff Health Check');
    console.log('=' .repeat(40));

    try {
      const stats = this.handoffManager.getSessionStatistics();

      console.log(`✅ System Status: Healthy`);
      console.log(`📊 Active Sessions: ${stats.active_sessions}`);
      console.log(`💾 Stored Handoffs: ${stats.stored_handoffs}`);
      console.log(`📋 Queue Length: ${stats.handoff_queue_length}`);
      console.log(`⏱️  Avg Session Duration: ${Math.round(stats.average_session_duration / 1000)}s`);

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
module.exports = SessionHandoffExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new SessionHandoffExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--health')) {
    example.healthCheck();
  } else if (args.includes('--lifecycle')) {
    example.initializeProtocolClients().then(() => example.exampleSessionLifecycle());
  } else if (args.includes('--multiple')) {
    example.initializeProtocolClients().then(() => example.exampleMultipleHandoffs());
  } else if (args.includes('--priority')) {
    example.initializeProtocolClients().then(() => example.examplePriorityHandoffs());
  } else if (args.includes('--management')) {
    example.initializeProtocolClients().then(() => example.exampleHandoffManagement());
  } else if (args.includes('--monitoring')) {
    example.initializeProtocolClients().then(() => example.exampleRealTimeMonitoring());
  } else {
    // Run all examples by default
    example.runAllExamples().catch(console.error);
  }
}