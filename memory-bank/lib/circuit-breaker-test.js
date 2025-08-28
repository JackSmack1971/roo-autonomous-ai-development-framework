/**
 * Circuit Breaker Test Suite
 *
 * Comprehensive testing of circuit breaker behavior and failure recovery
 * Demonstrates how the learning system handles various failure scenarios
 */

const LearningErrorHandler = require('./learning-error-handler');
const LearningProtocolClient = require('./learning-protocol-client');
const LearningQualityControl = require('./learning-quality-control');

class CircuitBreakerTest {
  constructor() {
    this.testResults = [];
    this.testMode = 'circuit-breaker-test';
  }

  /**
   * Run comprehensive circuit breaker tests
   */
  async runAllTests() {
    console.log('🧪 Starting Circuit Breaker Test Suite\n');

    // Test 1: Normal operation
    await this.testNormalOperation();

    // Test 2: Single failure with recovery
    await this.testSingleFailureRecovery();

    // Test 3: Multiple failures triggering circuit breaker
    await this.testCircuitBreakerActivation();

    // Test 4: Circuit breaker deactivation
    await this.testCircuitBreakerDeactivation();

    // Test 5: Learning system timeout
    await this.testLearningSystemTimeout();

    // Test 6: Quality gate failure recovery
    await this.testQualityGateFailureRecovery();

    // Test 7: Concurrent failure handling
    await this.testConcurrentFailures();

    this.printTestResults();
  }

  /**
   * Test normal operation (baseline)
   */
  async testNormalOperation() {
    console.log('📋 Test 1: Normal Operation');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 3
    });

    const result = await errorHandler.handleLearningError(null, { test: 'normal' }, 'test_operation');

    const passed = !errorHandler.isCircuitBreakerActive();
    this.recordTest('Normal Operation', passed, {
      circuit_breaker_active: errorHandler.isCircuitBreakerActive(),
      error_count: errorHandler.getStatistics().error_stats.total_errors,
      result_type: result ? 'fallback_used' : 'no_error'
    });

    console.log(`   ✅ Circuit breaker: ${errorHandler.isCircuitBreakerActive() ? 'ACTIVE' : 'INACTIVE'}`);
  }

  /**
   * Test single failure with recovery
   */
  async testSingleFailureRecovery() {
    console.log('\n📋 Test 2: Single Failure Recovery');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 3
    });

    // Simulate a network error
    const networkError = new Error('Connection timeout');
    networkError.name = 'TimeoutError';

    const result = await errorHandler.handleLearningError(
      networkError,
      { operation: 'api_call', context: 'test' },
      'network_operation'
    );

    const stats = errorHandler.getStatistics();
    const passed = !errorHandler.isCircuitBreakerActive() && stats.error_stats.consecutive_failures === 1;

    this.recordTest('Single Failure Recovery', passed, {
      circuit_breaker_active: errorHandler.isCircuitBreakerActive(),
      consecutive_failures: stats.error_stats.consecutive_failures,
      recovery_strategy: result.strategy || 'none',
      error_count: stats.error_stats.total_errors
    });

    console.log(`   ✅ Circuit breaker: ${errorHandler.isCircuitBreakerActive() ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   ✅ Consecutive failures: ${stats.error_stats.consecutive_failures}`);
    console.log(`   ✅ Recovery strategy: ${result.strategy || 'fallback'}`);
  }

  /**
   * Test circuit breaker activation with multiple failures
   */
  async testCircuitBreakerActivation() {
    console.log('\n📋 Test 3: Circuit Breaker Activation');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 3
    });

    // Simulate multiple failures
    const errors = [
      new Error('Database connection failed'),
      new Error('Pattern matching timeout'),
      new Error('File system access denied'),
      new Error('Memory allocation failed')
    ];

    let lastResult;
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      error.name = 'TestError';

      lastResult = await errorHandler.handleLearningError(
        error,
        { failure_number: i + 1, operation: 'test_operation' },
        'test_operation'
      );

      console.log(`   Attempt ${i + 1}: Circuit breaker ${errorHandler.isCircuitBreakerActive() ? 'ACTIVE' : 'INACTIVE'} (Failures: ${errorHandler.getStatistics().error_stats.consecutive_failures})`);
    }

    const stats = errorHandler.getStatistics();
    const passed = errorHandler.isCircuitBreakerActive() && stats.error_stats.consecutive_failures >= 3;

    this.recordTest('Circuit Breaker Activation', passed, {
      circuit_breaker_active: errorHandler.isCircuitBreakerActive(),
      consecutive_failures: stats.error_stats.consecutive_failures,
      total_errors: stats.error_stats.total_errors,
      final_recovery_strategy: lastResult.strategy || 'circuit_breaker'
    });

    console.log(`   ✅ Circuit breaker activated after ${stats.error_stats.consecutive_failures} failures`);
  }

  /**
   * Test circuit breaker deactivation
   */
  async testCircuitBreakerDeactivation() {
    console.log('\n📋 Test 4: Circuit Breaker Deactivation');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 3
    });

    // First activate circuit breaker
    for (let i = 0; i < 4; i++) {
      await errorHandler.handleLearningError(
        new Error('Test failure'),
        { test: 'activation' },
        'test_operation'
      );
    }

    const activated = errorHandler.isCircuitBreakerActive();
    console.log(`   Circuit breaker activated: ${activated}`);

    // Manually deactivate
    errorHandler.deactivateCircuitBreaker();

    const deactivated = !errorHandler.isCircuitBreakerActive();
    const stats = errorHandler.getStatistics();

    const passed = activated && deactivated && stats.error_stats.consecutive_failures === 0;

    this.recordTest('Circuit Breaker Deactivation', passed, {
      initially_active: activated,
      finally_active: errorHandler.isCircuitBreakerActive(),
      failures_after_deactivation: stats.error_stats.consecutive_failures
    });

    console.log(`   ✅ Circuit breaker manually deactivated`);
    console.log(`   ✅ Failure count reset to: ${stats.error_stats.consecutive_failures}`);
  }

  /**
   * Test learning system timeout behavior
   */
  async testLearningSystemTimeout() {
    console.log('\n📋 Test 5: Learning System Timeout');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 5
    });

    // Simulate a timeout error
    const timeoutError = new Error('Learning system timeout after 5000ms');
    timeoutError.name = 'TimeoutError';

    const startTime = Date.now();
    const result = await errorHandler.handleLearningError(
      timeoutError,
      { operation: 'pattern_matching', timeout: 5000 },
      'learning_timeout_test'
    );
    const duration = Date.now() - startTime;

    const stats = errorHandler.getStatistics();
    const passed = !errorHandler.isCircuitBreakerActive() &&
                   result.fallback === true &&
                   duration < 10000; // Should complete quickly even with timeout

    this.recordTest('Learning System Timeout', passed, {
      circuit_breaker_active: errorHandler.isCircuitBreakerActive(),
      consecutive_failures: stats.error_stats.consecutive_failures,
      recovery_time_ms: duration,
      fallback_used: result.fallback === true,
      recovery_strategy: result.strategy || 'timeout_fallback'
    });

    console.log(`   ✅ Timeout handled gracefully in ${duration}ms`);
    console.log(`   ✅ Circuit breaker: ${errorHandler.isCircuitBreakerActive() ? 'ACTIVE' : 'INACTIVE'}`);
  }

  /**
   * Test quality gate failure recovery
   */
  async testQualityGateFailureRecovery() {
    console.log('\n📋 Test 6: Quality Gate Failure Recovery');

    const qualityControl = new LearningQualityControl({
      modeName: this.testMode,
      confidenceThreshold: 0.7
    });

    // Test with invalid artifact that will cause quality gate failure
    const invalidArtifact = {
      type: 'code',
      content: 'function() { syntax error }' // Invalid JavaScript
    };

    try {
      const result = await qualityControl.runQualityGate(
        invalidArtifact.content,
        'code_quality',
        { test_mode: true }
      );

      const passed = result.passed === false && result.checks.length > 0;

      this.recordTest('Quality Gate Failure Recovery', passed, {
        quality_gate_passed: result.passed,
        checks_run: result.checks.length,
        failed_checks: result.checks.filter(c => !c.passed).length,
        overall_score: result.overall_score,
        recommendations_count: result.recommendations.length
      });

      console.log(`   ✅ Quality gate correctly failed with score: ${(result.overall_score * 100).toFixed(1)}%`);
      console.log(`   ✅ Generated ${result.recommendations.length} improvement recommendations`);

    } catch (error) {
      this.recordTest('Quality Gate Failure Recovery', false, {
        error: error.message,
        error_type: error.name
      });
      console.log(`   ❌ Quality gate threw unexpected error: ${error.message}`);
    }
  }

  /**
   * Test concurrent failure handling
   */
  async testConcurrentFailures() {
    console.log('\n📋 Test 7: Concurrent Failure Handling');

    const errorHandler = new LearningErrorHandler({
      modeName: this.testMode,
      maxConsecutiveFailures: 5
    });

    // Simulate concurrent failures
    const concurrentPromises = [];
    const errorTypes = ['TimeoutError', 'ValidationError', 'NetworkError', 'StorageError'];

    for (let i = 0; i < 5; i++) {
      const error = new Error(`Concurrent failure ${i + 1}`);
      error.name = errorTypes[i % errorTypes.length];

      concurrentPromises.push(
        errorHandler.handleLearningError(
          error,
          { concurrent_test: true, failure_id: i + 1 },
          'concurrent_operation'
        )
      );
    }

    const results = await Promise.allSettled(concurrentPromises);

    const successfulRecoveries = results.filter(r => r.status === 'fulfilled').length;
    const failedRecoveries = results.filter(r => r.status === 'rejected').length;

    const stats = errorHandler.getStatistics();
    const passed = successfulRecoveries >= 3 && !errorHandler.isCircuitBreakerActive();

    this.recordTest('Concurrent Failure Handling', passed, {
      total_concurrent_failures: concurrentPromises.length,
      successful_recoveries: successfulRecoveries,
      failed_recoveries: failed_recoveries,
      circuit_breaker_active: errorHandler.isCircuitBreakerActive(),
      final_failure_count: stats.error_stats.consecutive_failures
    });

    console.log(`   ✅ Handled ${successfulRecoveries}/${concurrentPromises.length} concurrent failures`);
    console.log(`   ✅ Circuit breaker: ${errorHandler.isCircuitBreakerActive() ? 'ACTIVE' : 'INACTIVE'}`);
  }

  /**
   * Record test result
   */
  recordTest(testName, passed, details) {
    this.testResults.push({
      test: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Print comprehensive test results
   */
  printTestResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 CIRCUIT BREAKER TEST RESULTS');
    console.log('='.repeat(60));

    const passedTests = this.testResults.filter(t => t.passed).length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);

    console.log(`\n📊 Overall Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`);

    this.testResults.forEach((test, index) => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${index + 1}. ${test.test}: ${status}`);

      // Print key details
      Object.entries(test.details).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });

    // Summary analysis
    console.log('\n🔍 ANALYSIS:');
    console.log('='.repeat(60));

    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: Circuit breaker system is highly reliable');
      console.log('   - All failure scenarios handled gracefully');
      console.log('   - Recovery mechanisms working correctly');
      console.log('   - Fallback strategies functioning properly');
    } else if (successRate >= 75) {
      console.log('👍 GOOD: Circuit breaker system is functional');
      console.log('   - Most failure scenarios handled correctly');
      console.log('   - Minor issues may need attention');
    } else {
      console.log('⚠️  NEEDS ATTENTION: Circuit breaker system has issues');
      console.log('   - Multiple test failures detected');
      console.log('   - Recovery mechanisms may need improvement');
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('='.repeat(60));

    const failedTests = this.testResults.filter(t => !t.passed);
    if (failedTests.length === 0) {
      console.log('✅ All tests passed - system is production ready!');
    } else {
      console.log('📋 Failed tests indicate areas for improvement:');
      failedTests.forEach(test => {
        console.log(`   - ${test.test}: Review error handling logic`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Circuit Breaker Test Suite Complete');
    console.log('='.repeat(60));
  }
}

/**
 * Run circuit breaker tests
 */
async function runCircuitBreakerTests() {
  const testSuite = new CircuitBreakerTest();
  await testSuite.runAllTests();
}

// Export for use in other modules
module.exports = CircuitBreakerTest;

// Run tests if executed directly
if (require.main === module) {
  runCircuitBreakerTests().catch(console.error);
}