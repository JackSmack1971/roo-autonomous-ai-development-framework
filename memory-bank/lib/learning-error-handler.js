/**
 * Learning Error Handler
 *
 * Robust error handling and graceful degradation for learning-integrated workflows
 * Ensures system stability when learning components fail or are unavailable
 */

const LearningProtocolClient = require('./learning-protocol-client');
const fs = require('fs').promises;
const path = require('path');

class GlobalPatternLoadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GlobalPatternLoadError';
  }
}

class LearningErrorHandler {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.modeName = options.modeName || 'unknown';

    this.errorPatterns = new Map();
    this.recoveryStrategies = new Map();
    this.fallbackModes = new Map();

    this.errorThresholds = {
      max_consecutive_failures: options.maxConsecutiveFailures || 3,
      error_rate_threshold: options.errorRateThreshold || 0.1,
      recovery_timeout_ms: options.recoveryTimeoutMs || 30000,
      circuit_breaker_threshold: options.circuitBreakerThreshold || 5
    };

    this.errorStats = {
      total_errors: 0,
      consecutive_failures: 0,
      last_error_time: null,
      circuit_breaker_active: false,
      recovery_attempts: 0
    };

    this.initializeRecoveryStrategies();
    this.initializeFallbackModes();
  }

  async loadGlobalPatternsGuide() {
    const guidePath = path.join(__dirname, '..', 'global-patterns.md');
    try {
      return await fs.readFile(guidePath, 'utf8');
    } catch (error) {
      throw new GlobalPatternLoadError(
        `Failed to load global patterns: ${error.message}`
      );
    }
  }

  /**
   * Handle learning-related errors with graceful degradation
   */
  async handleLearningError(error, context = {}, operation = 'unknown') {
    const errorMessage = error && error.message ? error.message : 'Unknown error';
    console.warn(`🚨 [${this.modeName}] Learning error in ${operation}: ${errorMessage}`);

    // Update error statistics
    this.updateErrorStats(error, operation);

    // Check if circuit breaker should activate
    if (this.shouldActivateCircuitBreaker()) {
      console.error(`🔴 [${this.modeName}] Circuit breaker activated - disabling learning for ${this.modeName}`);
      this.errorStats.circuit_breaker_active = true;
      return this.executeFallbackStrategy(operation, context);
    }

    // Attempt recovery
    const recoveryResult = await this.attemptRecovery(error, context, operation);

    if (recoveryResult.success) {
      console.log(`✅ [${this.modeName}] Learning error recovered successfully`);
      this.resetErrorStats();
      return recoveryResult.result;
    }

    // Recovery failed - use fallback
    console.warn(`⚠️ [${this.modeName}] Recovery failed - using fallback strategy`);
    return this.executeFallbackStrategy(operation, context);
  }

  /**
   * Update error statistics
   */
  updateErrorStats(error, operation) {
    this.errorStats.total_errors++;
    this.errorStats.consecutive_failures++;
    this.errorStats.last_error_time = new Date().toISOString();

    // Track error patterns
    const errorKey = `${operation}_${error.name}`;
    const currentCount = this.errorPatterns.get(errorKey) || 0;
    this.errorPatterns.set(errorKey, currentCount + 1);
  }

  /**
   * Reset error statistics after successful recovery
   */
  resetErrorStats() {
    this.errorStats.consecutive_failures = 0;
    this.errorStats.recovery_attempts = 0;
  }

  /**
   * Check if circuit breaker should activate
   */
  shouldActivateCircuitBreaker() {
    return (
      this.errorStats.consecutive_failures >= this.errorThresholds.circuit_breaker_threshold ||
      (this.errorStats.total_errors > 10 && this.calculateErrorRate() > this.errorThresholds.error_rate_threshold)
    );
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate() {
    // Simple error rate calculation - could be more sophisticated
    return this.errorStats.total_errors / Math.max(this.errorStats.total_errors + 100, 100);
  }

  /**
   * Attempt to recover from learning error
   */
  async attemptRecovery(error, context, operation) {
    this.errorStats.recovery_attempts++;

    try {
      const recoveryStrategy = this.selectRecoveryStrategy(error, operation);

      if (!recoveryStrategy) {
        return { success: false, reason: 'no_recovery_strategy' };
      }

      console.log(`🔧 [${this.modeName}] Attempting recovery with strategy: ${recoveryStrategy.name}`);

      const result = await this.executeRecoveryStrategy(recoveryStrategy, error, context, operation);

      if (result.success) {
        // Log successful recovery for learning
        await this.logRecoveryOutcome('success', operation, recoveryStrategy.name, context);
        return result;
      } else {
        // Log failed recovery
        await this.logRecoveryOutcome('failure', operation, recoveryStrategy.name, context);
        return result;
      }

    } catch (recoveryError) {
      console.error(`❌ [${this.modeName}] Recovery attempt failed: ${recoveryError.message}`);
      return { success: false, reason: 'recovery_execution_failed', error: recoveryError.message };
    }
  }

  /**
   * Select appropriate recovery strategy
   */
  selectRecoveryStrategy(error, operation) {
    // Select strategy based on error type and operation
    const strategies = this.recoveryStrategies.get(operation) || [];

    // Try specific error type strategies first
    const errorTypeStrategy = strategies.find(s => s.error_types?.includes(error.name));
    if (errorTypeStrategy) {
      return errorTypeStrategy;
    }

    // Try general operation strategies
    const generalStrategy = strategies.find(s => !s.error_types);
    if (generalStrategy) {
      return generalStrategy;
    }

    // Use default strategy
    return this.recoveryStrategies.get('default')?.[0];
  }

  /**
   * Execute recovery strategy
   */
  async executeRecoveryStrategy(strategy, error, context, operation) {
    try {
      switch (strategy.type) {
        case 'retry':
          return await this.executeRetryStrategy(strategy, error, context, operation);
        case 'fallback':
          return await this.executeFallbackStrategy(strategy, error, context, operation);
        case 'degrade':
          return await this.executeDegradeStrategy(strategy, error, context, operation);
        case 'restart':
          return await this.executeRestartStrategy(strategy, error, context, operation);
        default:
          throw new Error(`Unknown recovery strategy type: ${strategy.type}`);
      }
    } catch (executionError) {
      return { success: false, reason: 'strategy_execution_failed', error: executionError.message };
    }
  }

  /**
   * Execute retry strategy
   */
  async executeRetryStrategy(strategy, error, context, operation) {
    const maxRetries = strategy.max_retries || 2;
    const delayMs = strategy.delay_ms || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [${this.modeName}] Retry attempt ${attempt}/${maxRetries}`);

        // Wait before retry
        if (delayMs > 0) {
          await this.delay(delayMs);
        }

        // Attempt the operation again
        const result = await this.retryOperation(operation, context, attempt);

        if (result.success) {
          return { success: true, result: result.data, strategy: 'retry', attempt };
        }
      } catch (retryError) {
        console.warn(`⚠️ [${this.modeName}] Retry attempt ${attempt} failed: ${retryError.message}`);
      }
    }

    return { success: false, reason: 'max_retries_exceeded' };
  }

  /**
   * Execute fallback strategy
   */
  async executeFallbackStrategy(strategy, error, context, operation) {
    console.log(`🔄 [${this.modeName}] Executing fallback strategy`);

    const fallbackMode = this.fallbackModes.get(operation) || this.fallbackModes.get('default');

    if (!fallbackMode) {
      return { success: false, reason: 'no_fallback_available' };
    }

    try {
      const result = await this.executeFallbackMode(fallbackMode, context, operation);
      return { success: true, result, strategy: 'fallback', fallback_mode: fallbackMode.name };
    } catch (fallbackError) {
      return { success: false, reason: 'fallback_failed', error: fallbackError.message };
    }
  }

  /**
   * Execute degrade strategy (simplified operation)
   */
  async executeDegradeStrategy(strategy, error, context, operation) {
    console.log(`🔄 [${this.modeName}] Executing degrade strategy`);

    try {
      const result = await this.executeDegradedOperation(operation, context, strategy.degradation_level || 'basic');
      return { success: true, result, strategy: 'degrade', degradation_level: strategy.degradation_level };
    } catch (degradeError) {
      return { success: false, reason: 'degradation_failed', error: degradeError.message };
    }
  }

  /**
   * Execute restart strategy
   */
  async executeRestartStrategy(strategy, error, context, operation) {
    console.log(`🔄 [${this.modeName}] Executing restart strategy`);

    try {
      // Reset learning client state
      this.learningClient.clearCache();

      // Wait for restart delay
      const delayMs = strategy.restart_delay_ms || 5000;
      await this.delay(delayMs);

      // Attempt operation with fresh state
      const result = await this.retryOperation(operation, context, 1, true);

      if (result.success) {
        return { success: true, result: result.data, strategy: 'restart' };
      } else {
        return { success: false, reason: 'restart_failed' };
      }
    } catch (restartError) {
      return { success: false, reason: 'restart_error', error: restartError.message };
    }
  }

  /**
   * Execute fallback strategy when recovery fails
   */
  async executeFallbackStrategy(operation, context) {
    const fallbackMode = this.fallbackModes.get(operation) || this.fallbackModes.get('default');

    if (!fallbackMode) {
      console.warn(`⚠️ [${this.modeName}] No fallback available for ${operation} - returning default response`);
      return this.getDefaultFallbackResponse(operation);
    }

    try {
      console.log(`🔄 [${this.modeName}] Executing fallback mode: ${fallbackMode.name}`);
      const result = await this.executeFallbackMode(fallbackMode, context, operation);
      return result;
    } catch (fallbackError) {
      console.error(`❌ [${this.modeName}] Fallback mode failed: ${fallbackError.message}`);
      return this.getDefaultFallbackResponse(operation);
    }
  }

  /**
   * Initialize recovery strategies
   */
  initializeRecoveryStrategies() {
    // Default recovery strategies
    this.recoveryStrategies.set('default', [
      {
        name: 'simple_retry',
        type: 'retry',
        max_retries: 2,
        delay_ms: 1000
      },
      {
        name: 'fallback_mode',
        type: 'fallback'
      }
    ]);

    // Pattern matching specific strategies
    this.recoveryStrategies.set('pattern_matching', [
      {
        name: 'pattern_retry',
        type: 'retry',
        max_retries: 3,
        delay_ms: 500,
        error_types: ['TimeoutError', 'NetworkError']
      },
      {
        name: 'pattern_fallback',
        type: 'fallback',
        error_types: ['ValidationError', 'SchemaError']
      },
      {
        name: 'pattern_degrade',
        type: 'degrade',
        degradation_level: 'basic',
        error_types: ['ComplexityError', 'MemoryError']
      }
    ]);

    // Learning update strategies
    this.recoveryStrategies.set('learning_update', [
      {
        name: 'update_retry',
        type: 'retry',
        max_retries: 1,
        delay_ms: 2000,
        error_types: ['TimeoutError']
      },
      {
        name: 'update_fallback',
        type: 'fallback',
        error_types: ['StorageError', 'PermissionError']
      }
    ]);

    // Quality gate strategies
    this.recoveryStrategies.set('quality_gate', [
      {
        name: 'gate_retry',
        type: 'retry',
        max_retries: 2,
        delay_ms: 1000,
        error_types: ['TimeoutError']
      },
      {
        name: 'gate_degrade',
        type: 'degrade',
        degradation_level: 'minimal',
        error_types: ['ValidationError', 'ComplexityError']
      }
    ]);
  }

  /**
   * Initialize fallback modes
   */
  initializeFallbackModes() {
    // Default fallback
    this.fallbackModes.set('default', {
      name: 'manual_fallback',
      description: 'Manual reference to memory-bank files',
      execute: async (context, operation) => {
        console.log(`📚 [${this.modeName}] Using manual fallback - reference memory-bank files`);
        let advice = `Learning system unavailable - proceeding with standard ${operation} workflow.`;
        try {
          await this.loadGlobalPatternsGuide();
          advice += ' Refer to memory-bank/global-patterns.md for cross-project guidance.';
        } catch (error) {
          console.warn(error.message);
        }
        return {
          available: false,
          guidance: {
            recommendations: [],
            fallback_advice: advice
          },
          metadata: {
            fallback: true,
            reason: 'learning_system_unavailable'
          }
        };
      }
    });

    // Pattern matching fallback
    this.fallbackModes.set('pattern_matching', {
      name: 'pattern_fallback',
      description: 'Use cached patterns or manual pattern reference',
      execute: async (context, operation) => {
        return {
          available: false,
          guidance: {
            recommendations: [],
            fallback_advice: 'Pattern matching unavailable - using standard development practices'
          },
          metadata: {
            fallback: true,
            reason: 'pattern_matching_unavailable'
          }
        };
      }
    });
  }

  /**
   * Log recovery outcome for learning
   */
  async logRecoveryOutcome(outcome, operation, strategyName, context) {
    try {
      await this.learningClient.logOutcome(
        this.modeName,
        `error_recovery_${operation}`,
        outcome,
        outcome === 'success' ? 0.8 : 0.3,
        `Recovery ${outcome} using ${strategyName} strategy`
      );
    } catch (logError) {
      console.warn(`⚠️ [${this.modeName}] Failed to log recovery outcome: ${logError.message}`);
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Placeholder methods - would be implemented based on specific needs
   */
  async retryOperation(operation, context, attempt, freshState = false) {
    // Placeholder - would implement actual retry logic
    return { success: Math.random() > 0.5, data: null };
  }

  async executeFallbackMode(fallbackMode, context, operation) {
    return await fallbackMode.execute(context, operation);
  }

  async executeDegradedOperation(operation, context, degradationLevel) {
    // Placeholder - would implement degraded operation logic
    return { success: true, data: null, degradation_level: degradationLevel };
  }

  getDefaultFallbackResponse(operation) {
    return {
      available: false,
      guidance: {
        recommendations: [],
        fallback_advice: `Learning system unavailable - proceeding with standard ${operation} workflow`
      },
      metadata: {
        fallback: true,
        reason: 'learning_system_unavailable'
      }
    };
  }

  /**
   * Get error handler statistics
   */
  getStatistics() {
    return {
      mode: this.modeName,
      error_stats: { ...this.errorStats },
      error_patterns: Object.fromEntries(this.errorPatterns),
      circuit_breaker_active: this.errorStats.circuit_breaker_active,
      error_rate: this.calculateErrorRate(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset error handler state
   */
  reset() {
    this.errorStats = {
      total_errors: 0,
      consecutive_failures: 0,
      last_error_time: null,
      circuit_breaker_active: false,
      recovery_attempts: 0
    };
    this.errorPatterns.clear();
    console.log(`🔄 [${this.modeName}] Error handler state reset`);
  }

  /**
   * Check if circuit breaker is active
   */
  isCircuitBreakerActive() {
    return this.errorStats.circuit_breaker_active;
  }

  /**
   * Manually deactivate circuit breaker
   */
  deactivateCircuitBreaker() {
    this.errorStats.circuit_breaker_active = false;
    this.resetErrorStats();
    console.log(`✅ [${this.modeName}] Circuit breaker manually deactivated`);
  }
}

module.exports = LearningErrorHandler;