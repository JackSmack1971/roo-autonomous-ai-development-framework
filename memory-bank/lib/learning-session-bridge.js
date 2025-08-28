/**
 * Learning Session Bridge
 *
 * Manages learning state across VS Code sessions and mode boundaries
 * Provides persistent learning context and cross-session pattern evolution
 */

const fs = require('fs').promises;
const path = require('path');
const LearningProtocolClient = require('./learning-protocol-client');

class LearningSessionBridge {
  constructor(options = {}) {
    this.sessionPath = options.sessionPath || path.join(__dirname, '..', 'data', 'learning-sessions');
    this.bridgeEnabled = options.bridgeEnabled !== false;
    this.maxSessionHistory = options.maxSessionHistory || 50;
    this.learningClient = new LearningProtocolClient(options);

    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      mode: options.modeName || 'unknown',
      context: {},
      learningState: {
        patternsApplied: [],
        outcomesLogged: [],
        qualityMetrics: [],
        errorsHandled: []
      },
      crossSessionLearning: {
        patternsEvolved: [],
        confidenceAdjustments: [],
        newPatternsDiscovered: []
      }
    };
  }

  /**
   * Initialize session bridge
   */
  async initialize() {
    if (!this.bridgeEnabled) {
      console.log('🔄 [Session Bridge] Disabled - operating in isolated mode');
      return;
    }

    try {
      await this.ensureSessionDirectory();
      await this.loadSessionHistory();
      await this.initializeCrossSessionLearning();

      console.log(`🔄 [Session Bridge] Initialized for session: ${this.currentSession.id}`);
    } catch (error) {
      console.warn(`⚠️ [Session Bridge] Failed to initialize: ${error.message}`);
      this.bridgeEnabled = false;
    }
  }

  /**
   * Ensure session directory exists
   */
  async ensureSessionDirectory() {
    try {
      await fs.access(this.sessionPath);
    } catch {
      await fs.mkdir(this.sessionPath, { recursive: true });
    }
  }

  /**
   * Load session history for cross-session learning
   */
  async loadSessionHistory() {
    try {
      const sessionFiles = await fs.readdir(this.sessionPath);
      const recentSessions = sessionFiles
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, this.maxSessionHistory);

      this.sessionHistory = [];
      for (const sessionFile of recentSessions) {
        try {
          const sessionData = await fs.readFile(
            path.join(this.sessionPath, sessionFile),
            'utf8'
          );
          this.sessionHistory.push(JSON.parse(sessionData));
        } catch (error) {
          console.warn(`⚠️ [Session Bridge] Failed to load session ${sessionFile}: ${error.message}`);
        }
      }

      console.log(`📚 [Session Bridge] Loaded ${this.sessionHistory.length} historical sessions`);
    } catch (error) {
      console.warn(`⚠️ [Session Bridge] Failed to load session history: ${error.message}`);
      this.sessionHistory = [];
    }
  }

  /**
   * Initialize cross-session learning from historical data
   */
  async initializeCrossSessionLearning() {
    if (!this.sessionHistory || this.sessionHistory.length === 0) {
      return;
    }

    try {
      // Extract patterns that have evolved across sessions
      const patternEvolution = this.analyzePatternEvolution();

      // Identify successful patterns for automatic application
      const successfulPatterns = this.identifySuccessfulPatterns();

      // Update current session with cross-session insights
      this.currentSession.crossSessionLearning = {
        patternsEvolved: patternEvolution,
        successfulPatterns: successfulPatterns,
        learningVelocity: this.calculateLearningVelocity(),
        confidenceTrends: this.analyzeConfidenceTrends()
      };

      console.log(`🧠 [Session Bridge] Cross-session learning initialized with ${patternEvolution.length} evolved patterns`);
    } catch (error) {
      console.warn(`⚠️ [Session Bridge] Failed to initialize cross-session learning: ${error.message}`);
    }
  }

  /**
   * Analyze pattern evolution across sessions
   */
  analyzePatternEvolution() {
    const patternEvolution = new Map();

    for (const session of this.sessionHistory) {
      if (session.learningState && session.learningState.patternsApplied) {
        for (const pattern of session.learningState.patternsApplied) {
          const key = `${pattern.pattern_id}_${pattern.mode}`;
          if (!patternEvolution.has(key)) {
            patternEvolution.set(key, {
              pattern_id: pattern.pattern_id,
              mode: pattern.mode,
              firstApplied: session.startTime,
              totalApplications: 0,
              successfulApplications: 0,
              averageConfidence: 0,
              confidenceTrend: 'stable',
              evolution: []
            });
          }

          const evolution = patternEvolution.get(key);
          evolution.totalApplications++;
          if (pattern.outcome === 'success') {
            evolution.successfulApplications++;
          }
          evolution.averageConfidence = (evolution.averageConfidence + pattern.confidence) / 2;
          evolution.evolution.push({
            session: session.id,
            timestamp: pattern.timestamp,
            confidence: pattern.confidence,
            outcome: pattern.outcome
          });
        }
      }
    }

    // Calculate confidence trends
    for (const [key, evolution] of patternEvolution) {
      if (evolution.evolution.length >= 3) {
        evolution.confidenceTrend = this.calculateConfidenceTrend(evolution.evolution);
      }
    }

    return Array.from(patternEvolution.values());
  }

  /**
   * Calculate confidence trend for a pattern
   */
  calculateConfidenceTrend(evolution) {
    if (evolution.length < 3) return 'insufficient_data';

    const recent = evolution.slice(-3);
    const older = evolution.slice(-6, -3);

    if (older.length === 0) return 'improving';

    const recentAvg = recent.reduce((sum, e) => sum + e.confidence, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.confidence, 0) / older.length;

    const change = recentAvg - olderAvg;

    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Identify successful patterns for automatic application
   */
  identifySuccessfulPatterns() {
    const patternSuccess = new Map();

    for (const session of this.sessionHistory) {
      if (session.learningState && session.learningState.patternsApplied) {
        for (const pattern of session.learningState.patternsApplied) {
          const key = `${pattern.pattern_id}_${pattern.mode}`;
          if (!patternSuccess.has(key)) {
            patternSuccess.set(key, {
              pattern_id: pattern.pattern_id,
              mode: pattern.mode,
              total_applications: 0,
              successful_applications: 0,
              success_rate: 0,
              average_confidence: 0
            });
          }

          const stats = patternSuccess.get(key);
          stats.total_applications++;
          if (pattern.outcome === 'success') {
            stats.successful_applications++;
          }
          stats.success_rate = stats.successful_applications / stats.total_applications;
          stats.average_confidence = (stats.average_confidence + pattern.confidence) / 2;
        }
      }
    }

    // Return patterns with high success rates and confidence
    return Array.from(patternSuccess.values())
      .filter(stats => stats.success_rate >= 0.8 && stats.average_confidence >= 0.7)
      .sort((a, b) => b.success_rate - a.success_rate);
  }

  /**
   * Calculate learning velocity across sessions
   */
  calculateLearningVelocity() {
    if (this.sessionHistory.length < 2) return 0;

    const recentSessions = this.sessionHistory.slice(0, 5);
    let totalImprovement = 0;

    for (const session of recentSessions) {
      if (session.learningState && session.learningState.qualityMetrics) {
        for (const metric of session.learningState.qualityMetrics) {
          if (metric.improvement) {
            totalImprovement += metric.improvement;
          }
        }
      }
    }

    return totalImprovement / recentSessions.length;
  }

  /**
   * Analyze confidence trends across sessions
   */
  analyzeConfidenceTrends() {
    const trends = {
      overall_trend: 'stable',
      improving_patterns: [],
      declining_patterns: [],
      average_confidence: 0
    };

    if (this.sessionHistory.length === 0) return trends;

    // Calculate overall confidence trend
    const confidences = [];
    for (const session of this.sessionHistory) {
      if (session.learningState && session.learningState.patternsApplied) {
        for (const pattern of session.learningState.patternsApplied) {
          confidences.push(pattern.confidence);
        }
      }
    }

    if (confidences.length >= 6) {
      const recent = confidences.slice(0, 3);
      const older = confidences.slice(3, 6);

      const recentAvg = recent.reduce((sum, c) => sum + c, 0) / recent.length;
      const olderAvg = older.reduce((sum, c) => sum + c, 0) / older.length;

      if (recentAvg > olderAvg + 0.02) {
        trends.overall_trend = 'improving';
      } else if (recentAvg < olderAvg - 0.02) {
        trends.overall_trend = 'declining';
      }
    }

    trends.average_confidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    return trends;
  }

  /**
   * Record pattern application for cross-session learning
   */
  async recordPatternApplication(patternId, mode, confidence, outcome, context = {}) {
    if (!this.bridgeEnabled) return;

    const patternRecord = {
      pattern_id: patternId,
      mode: mode,
      confidence: confidence,
      outcome: outcome,
      timestamp: new Date().toISOString(),
      context: context
    };

    this.currentSession.learningState.patternsApplied.push(patternRecord);

    // Check for pattern evolution
    await this.checkPatternEvolution(patternRecord);

    // Save session state
    await this.saveSessionState();
  }

  /**
   * Check for pattern evolution opportunities
   */
  async checkPatternEvolution(patternRecord) {
    // Look for patterns that might benefit from evolution
    const similarPatterns = this.findSimilarPatterns(patternRecord);

    for (const similar of similarPatterns) {
      if (this.shouldEvolvePattern(patternRecord, similar)) {
        await this.evolvePattern(patternRecord, similar);
      }
    }
  }

  /**
   * Find similar patterns for evolution analysis
   */
  findSimilarPatterns(patternRecord) {
    const similar = [];

    for (const session of this.sessionHistory) {
      if (session.learningState && session.learningState.patternsApplied) {
        for (const pattern of session.learningState.patternsApplied) {
          if (pattern.pattern_id !== patternRecord.pattern_id &&
              pattern.mode === patternRecord.mode) {
            similar.push(pattern);
          }
        }
      }
    }

    return similar;
  }

  /**
   * Determine if a pattern should evolve
   */
  shouldEvolvePattern(newPattern, existingPattern) {
    // Evolve if confidence has significantly changed
    const confidenceChange = Math.abs(newPattern.confidence - existingPattern.confidence);

    // Evolve if success rate has changed significantly
    const newSuccess = newPattern.outcome === 'success' ? 1 : 0;
    const existingSuccess = existingPattern.outcome === 'success' ? 1 : 0;
    const successChange = Math.abs(newSuccess - existingSuccess);

    return confidenceChange > 0.1 || successChange > 0;
  }

  /**
   * Evolve a pattern based on new data
   */
  async evolvePattern(newPattern, existingPattern) {
    const evolution = {
      pattern_id: newPattern.pattern_id,
      mode: newPattern.mode,
      evolution_type: 'confidence_adjustment',
      from_confidence: existingPattern.confidence,
      to_confidence: newPattern.confidence,
      trigger: newPattern.outcome === 'success' ? 'success' : 'failure',
      timestamp: new Date().toISOString(),
      context: newPattern.context
    };

    this.currentSession.crossSessionLearning.patternsEvolved.push(evolution);

    console.log(`🧬 [Session Bridge] Pattern evolved: ${newPattern.pattern_id} (${existingPattern.confidence} → ${newPattern.confidence})`);
  }

  /**
   * Get cross-session learning recommendations
   */
  getCrossSessionRecommendations(context = {}) {
    if (!this.bridgeEnabled || !this.currentSession.crossSessionLearning) {
      return [];
    }

    const recommendations = [];

    // Recommend successful patterns from other sessions
    const successfulPatterns = this.currentSession.crossSessionLearning.successfulPatterns || [];
    for (const pattern of successfulPatterns.slice(0, 3)) {
      recommendations.push({
        type: 'cross_session_pattern',
        pattern_id: pattern.pattern_id,
        mode: pattern.mode,
        confidence: pattern.average_confidence,
        rationale: `Successful pattern from previous sessions (${(pattern.success_rate * 100).toFixed(1)}% success rate)`,
        source: 'cross_session_learning'
      });
    }

    // Recommend evolved patterns
    const evolvedPatterns = this.currentSession.crossSessionLearning.patternsEvolved || [];
    const recentEvolutions = evolvedPatterns.slice(-3);
    for (const evolution of recentEvolutions) {
      if (evolution.to_confidence > evolution.from_confidence) {
        recommendations.push({
          type: 'evolved_pattern',
          pattern_id: evolution.pattern_id,
          mode: evolution.mode,
          confidence: evolution.to_confidence,
          rationale: `Recently evolved pattern with improved confidence`,
          source: 'pattern_evolution'
        });
      }
    }

    return recommendations;
  }

  /**
   * Save current session state
   */
  async saveSessionState() {
    if (!this.bridgeEnabled) return;

    try {
      const sessionFile = path.join(this.sessionPath, `${this.currentSession.id}.json`);
      await fs.writeFile(sessionFile, JSON.stringify(this.currentSession, null, 2));
    } catch (error) {
      console.warn(`⚠️ [Session Bridge] Failed to save session state: ${error.message}`);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Get session bridge statistics
   */
  getStatistics() {
    return {
      current_session: this.currentSession.id,
      bridge_enabled: this.bridgeEnabled,
      session_history_count: this.sessionHistory ? this.sessionHistory.length : 0,
      cross_session_learning: this.currentSession.crossSessionLearning,
      learning_velocity: this.calculateLearningVelocity(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up old session files
   */
  async cleanupOldSessions() {
    if (!this.bridgeEnabled) return;

    try {
      const sessionFiles = await fs.readdir(this.sessionPath);
      const jsonFiles = sessionFiles.filter(file => file.endsWith('.json'));

      if (jsonFiles.length > this.maxSessionHistory) {
        const filesToDelete = jsonFiles
          .sort()
          .slice(0, jsonFiles.length - this.maxSessionHistory);

        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.sessionPath, file));
        }

        console.log(`🧹 [Session Bridge] Cleaned up ${filesToDelete.length} old session files`);
      }
    } catch (error) {
      console.warn(`⚠️ [Session Bridge] Failed to cleanup old sessions: ${error.message}`);
    }
  }
}

module.exports = LearningSessionBridge;