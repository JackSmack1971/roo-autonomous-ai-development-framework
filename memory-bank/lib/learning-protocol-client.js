/**
 * Universal Learning Protocol Client
 *
 * Standardized interface for integrating learning capabilities into any mode's workflow
 * Provides graceful degradation and error handling for robust operation
 */

const EventEmitter = require('events');
const path = require('path');

class LearningProtocolClient extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      learningSystemPath: options.learningSystemPath || path.join(__dirname, '..'),
      enableCaching: options.enableCaching !== false,
      timeoutMs: options.timeoutMs || 5000,
      confidenceThreshold: options.confidenceThreshold || 0.6,
      ...options
    };

    this.isAvailable = false;
    this.lastCheck = null;
    this.cache = new Map();

    // Bind methods
    this.checkAvailability = this.checkAvailability.bind(this);
    this.getLearningGuidance = this.getLearningGuidance.bind(this);
    this.logOutcome = this.logOutcome.bind(this);
    this.applyWithConfidence = this.applyWithConfidence.bind(this);
  }

  /**
   * Check if learning system is available
   */
  async checkAvailability() {
    if (this.lastCheck && Date.now() - this.lastCheck < 30000) {
      return this.isAvailable;
    }

    try {
      const fs = require('fs').promises;

      // Check for required learning system files
      const requiredFiles = [
        'lib/pattern-matcher.js',
        'lib/pattern-storage.js',
        'data/actionable-patterns.json'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.options.learningSystemPath, file);
        await fs.access(filePath);
      }

      this.isAvailable = true;
      this.lastCheck = Date.now();

      this.emit('learning_available');
      return true;

    } catch (error) {
      this.isAvailable = false;
      this.lastCheck = Date.now();

      this.emit('learning_unavailable', error.message);
      return false;
    }
  }

  /**
   * Get learning guidance for current context
   */
  async getLearningGuidance(context = {}, taskType = 'general', options = {}) {
    const cacheKey = this.generateCacheKey(context, taskType);

    // Check cache first
    if (this.options.enableCaching && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }
    }

    if (!(await this.checkAvailability())) {
      return this.getFallbackGuidance(context, taskType);
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Learning system timeout')), this.options.timeoutMs)
      );

      const learningPromise = this.queryLearningSystem(context, taskType, options);

      const result = await Promise.race([learningPromise, timeoutPromise]);

      // Cache the result
      if (this.options.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;

    } catch (error) {
      console.warn(`Learning system error: ${error.message}`);
      this.emit('learning_error', error);

      return this.getFallbackGuidance(context, taskType);
    }
  }

  /**
   * Query the learning system for guidance
   */
  async queryLearningSystem(context, taskType, options) {
    try {
      const PatternMatcher = require(path.join(this.options.learningSystemPath, 'lib/pattern-matcher'));
      const PatternStorage = require(path.join(this.options.learningSystemPath, 'lib/pattern-storage'));

      const patternMatcher = new PatternMatcher();
      const patternStorage = new PatternStorage();

      // Prepare context for pattern matching
      const rawContext = {
        task_type: taskType,
        context_data: context,
        timestamp: new Date().toISOString(),
        ...options.context || {}
      };

      // Get pattern matches
      const matchingResult = await patternMatcher.matchPatterns(rawContext);

      // Get recommended patterns
      const recommendedPatterns = await patternStorage.getRecommendedPatterns(rawContext, 5);

      return {
        available: true,
        guidance: {
          pattern_matches: matchingResult.pattern_matches?.matches || [],
          recommendations: matchingResult.recommendations || [],
          recommended_patterns: recommendedPatterns,
          decision: matchingResult.decision,
          confidence: matchingResult.decision?.confidence || 0
        },
        metadata: {
          query_timestamp: new Date().toISOString(),
          patterns_found: matchingResult.pattern_matches?.matches?.length || 0,
          recommendations_count: matchingResult.recommendations?.length || 0
        }
      };

    } catch (error) {
      throw new Error(`Failed to query learning system: ${error.message}`);
    }
  }

  /**
   * Apply learning guidance with confidence threshold
   */
  async applyWithConfidence(guidance, confidenceThreshold = null) {
    const threshold = confidenceThreshold || this.options.confidenceThreshold;

    if (!guidance.available) {
      return {
        applied: false,
        reason: 'Learning system not available',
        fallback: true
      };
    }

    const highConfidencePatterns = guidance.guidance.recommended_patterns.filter(
      pattern => pattern.confidence_score >= threshold
    );

    if (highConfidencePatterns.length === 0) {
      return {
        applied: false,
        reason: `No patterns meet confidence threshold of ${threshold}`,
        available_patterns: guidance.guidance.recommended_patterns.length
      };
    }

    // Apply the highest confidence pattern
    const bestPattern = highConfidencePatterns[0];

    return {
      applied: true,
      pattern: bestPattern,
      confidence: bestPattern.confidence_score,
      action: bestPattern.auto_apply_actions?.[0] || null
    };
  }

  /**
   * Log outcome for learning system
   */
  async logOutcome(mode, taskType, outcome, confidence, details = '') {
    if (!(await this.checkAvailability())) {
      // Fallback: log to memory-bank manually
      await this.logToMemoryBank(mode, taskType, outcome, confidence, details);
      return;
    }

    try {
      const PatternStorage = require(path.join(this.options.learningSystemPath, 'lib/pattern-storage'));
      const patternStorage = new PatternStorage();

      // Find relevant patterns and update their stats
      const context = { mode, task_type: taskType };
      const relevantPatterns = await patternStorage.getRecommendedPatterns(context, 10);

      for (const pattern of relevantPatterns) {
        if (pattern.confidence_score > 0.5) { // Only update reasonably confident patterns
          const success = outcome === 'success';
          const newConfidence = success ? Math.min(confidence + 0.1, 0.95) : Math.max(confidence - 0.1, 0.1);

          await patternStorage.updatePatternStats(pattern.id, success, newConfidence);
        }
      }

      // Log to decision log
      await this.logToDecisionLog(mode, taskType, outcome, confidence, details);

    } catch (error) {
      console.warn(`Failed to log outcome to learning system: ${error.message}`);
      await this.logToMemoryBank(mode, taskType, outcome, confidence, details);
    }
  }

  /**
   * Get fallback guidance when learning system is unavailable
   */
  getFallbackGuidance(context, taskType) {
    return {
      available: false,
      guidance: {
        recommendations: [],
        fallback_advice: `Learning system unavailable - proceeding with standard ${taskType} workflow. Check memory-bank files for context.`
      },
      metadata: {
        fallback: true,
        reason: 'learning_system_unavailable'
      }
    };
  }

  /**
   * Log outcome to memory-bank when learning system is unavailable
   */
  async logToMemoryBank(mode, taskType, outcome, confidence, details) {
    try {
      const fs = require('fs').promises;
      const logEntry = {
        timestamp: new Date().toISOString(),
        mode,
        task_type: taskType,
        outcome,
        confidence,
        details,
        learning_system_available: false
      };

      const logPath = path.join(this.options.learningSystemPath, 'learning-outcomes-manual.log');
      const logLine = JSON.stringify(logEntry) + '\n';

      await fs.appendFile(logPath, logLine);

    } catch (error) {
      console.warn(`Failed to log to memory-bank: ${error.message}`);
    }
  }

  /**
   * Log to decision log
   */
  async logToDecisionLog(mode, taskType, outcome, confidence, details) {
    try {
      const fs = require('fs').promises;
      const decisionLogPath = path.join(this.options.learningSystemPath, '..', 'decisionLog.md');

      const entry = `\n## ${new Date().toISOString()} - ${mode} Learning Outcome\n\n` +
        `**Task Type:** ${taskType}\n` +
        `**Outcome:** ${outcome}\n` +
        `**Confidence:** ${confidence}\n` +
        `**Details:** ${details}\n\n`;

      await fs.appendFile(decisionLogPath, entry);

    } catch (error) {
      console.warn(`Failed to log to decision log: ${error.message}`);
    }
  }

  /**
   * Generate cache key for context
   */
  generateCacheKey(context, taskType) {
    const contextStr = JSON.stringify(context);
    return `${taskType}:${contextStr.length}:${contextStr.slice(0, 100)}`;
  }

  /**
   * Check if cache entry is still valid
   */
  isCacheValid(timestamp) {
    const ttl = 300000; // 5 minutes
    return Date.now() - timestamp < ttl;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.emit('cache_cleared');
  }

  /**
   * Get learning statistics
   */
  getStatistics() {
    return {
      is_available: this.isAvailable,
      last_check: this.lastCheck ? new Date(this.lastCheck).toISOString() : null,
      cache_size: this.cache.size,
      options: this.options
    };
  }
}

module.exports = LearningProtocolClient;