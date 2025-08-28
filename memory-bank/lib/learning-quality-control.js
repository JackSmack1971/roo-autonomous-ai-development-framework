/**
 * Learning Quality Control System
 *
 * Comprehensive quality control and error handling for learning-integrated workflows
 * Provides robust error handling, quality validation, and graceful degradation
 */

const fs = require('fs/promises');
const LearningProtocolClient = require('./learning-protocol-client');
const LearningWorkflowHelpers = require('./learning-workflow-helpers');

class QualityAnomalyError extends Error {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = 'QualityAnomalyError';
    this.cause = cause;
  }
}

const withTimeout = (p, ms = 2000) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

const validateMetrics = (m) =>
  m &&
  typeof m.gate_type === 'string' &&
  typeof m.overall_score === 'number' &&
  m.overall_score >= 0 &&
  m.overall_score <= 1;

// Writes anomaly warnings to the quality dashboard; task creation handled separately
const updateDashboard = async (dashboard, metrics) => {
  const dash = dashboard && JSON.parse(await withTimeout(fs.readFile(dashboard, 'utf8')));
  (dash.predictive_quality_indicators ??= []).push({ warning: 'metric anomaly', metrics });
  await withTimeout(fs.writeFile(dashboard, JSON.stringify(dash, null, 2)));
};

class LearningQualityControl {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.workflowHelpers = new LearningWorkflowHelpers(options);
    this.modeName = options.modeName || 'unknown';

    this.qualityThresholds = {
      confidence: options.confidenceThreshold || 0.6,
      success_rate: options.successRateThreshold || 0.7,
      error_tolerance: options.errorTolerance || 0.1,
      timeout_ms: options.timeoutMs || 5000
    };

    this.errorTracking = new Map();
    this.qualityMetrics = new Map();
  }

  /**
   * Comprehensive quality gate with learning integration
   */
  async runQualityGate(artifact, gateType = 'general', context = {}) {
    console.log(`🔍 [${this.modeName}] Running comprehensive quality gate: ${gateType}`);

    const qualityCheck = {
      gate_type: gateType,
      timestamp: new Date().toISOString(),
      artifact_info: this.analyzeArtifact(artifact),
      context: context,
      checks: [],
      overall_score: 0,
      passed: false,
      learning_enhanced: false,
      recommendations: []
    };

    try {
      // Step 1: Run standard quality checks
      const standardChecks = await this.runStandardQualityChecks(artifact, gateType);
      qualityCheck.checks.push(...standardChecks);

      // Step 2: Run learning-enhanced checks if available
      const learningChecks = await this.runLearningEnhancedChecks(artifact, gateType, context);
      qualityCheck.checks.push(...learningChecks);
      qualityCheck.learning_enhanced = learningChecks.length > 0;

      // Step 3: Calculate overall score
      qualityCheck.overall_score = this.calculateOverallScore(qualityCheck.checks);

      // Step 4: Generate recommendations
      qualityCheck.recommendations = await this.generateQualityRecommendations(
        qualityCheck.checks,
        gateType,
        context
      );

      // Step 5: Determine pass/fail
      qualityCheck.passed = this.determineGatePass(qualityCheck.overall_score, gateType);

      // Step 6: Log quality metrics for learning
      await this.logQualityMetrics(qualityCheck);

      console.log(`✅ [${this.modeName}] Quality gate ${qualityCheck.passed ? 'PASSED' : 'FAILED'} with score: ${(qualityCheck.overall_score * 100).toFixed(1)}%`);

      return qualityCheck;

    } catch (error) {
      console.error(`❌ [${this.modeName}] Quality gate failed: ${error.message}`);

      // Log error for learning
      await this.logQualityError(error, gateType, context);

      return {
        ...qualityCheck,
        passed: false,
        error: error.message,
        error_type: 'quality_gate_failure'
      };
    }
  }

  /**
   * Analyze artifact to extract relevant information
   */
  analyzeArtifact(artifact) {
    if (!artifact) return { type: 'null', size: 0 };

    const info = {
      type: typeof artifact,
      size: artifact.toString().length,
      lines: artifact.toString().split('\n').length,
      complexity: this.calculateComplexity(artifact)
    };

    // Extract additional metadata based on type
    if (typeof artifact === 'string') {
      info.contains_code = /function|class|const|let|var/.test(artifact);
      info.contains_security = /auth|password|token|encrypt/.test(artifact);
      info.contains_database = /select|insert|update|delete|query/.test(artifact);
      info.contains_api = /api|endpoint|route|http/.test(artifact);
    }

    return info;
  }

  /**
   * Calculate artifact complexity
   */
  calculateComplexity(artifact) {
    if (typeof artifact !== 'string') return 0;

    const code = artifact;
    let complexity = 0;

    // Cyclomatic complexity indicators
    complexity += (code.match(/if|else|for|while|case|catch/g) || []).length * 0.1;

    // Function/method count
    complexity += (code.match(/function|=>/g) || []).length * 0.2;

    // Class count
    complexity += (code.match(/class/g) || []).length * 0.3;

    // Import/dependency count
    complexity += (code.match(/import|require|from/g) || []).length * 0.05;

    return Math.min(complexity, 1); // Normalize to 0-1
  }

  /**
   * Run standard quality checks
   */
  async runStandardQualityChecks(artifact, gateType) {
    const checks = [];

    switch (gateType) {
      case 'security':
        checks.push(...await this.runSecurityChecks(artifact));
        break;
      case 'performance':
        checks.push(...await this.runPerformanceChecks(artifact));
        break;
      case 'code':
        checks.push(...await this.runCodeQualityChecks(artifact));
        break;
      case 'architecture':
        checks.push(...await this.runArchitectureChecks(artifact));
        break;
      default:
        checks.push(...await this.runGeneralChecks(artifact));
    }

    return checks;
  }

  /**
   * Run learning-enhanced quality checks
   */
  async runLearningEnhancedChecks(artifact, gateType, context) {
    try {
      const learningGuidance = await this.learningClient.getLearningGuidance(
        context,
        `quality_${gateType}`
      );

      if (!learningGuidance.available) {
        return [];
      }

      const enhancedChecks = [];

      // Apply high-confidence learning patterns
      for (const recommendation of learningGuidance.guidance.recommendations) {
        if (recommendation.confidence_score >= this.qualityThresholds.confidence) {
          const check = await this.applyLearningPatternCheck(
            artifact,
            recommendation,
            gateType
          );

          if (check) {
            enhancedChecks.push(check);
          }
        }
      }

      return enhancedChecks;

    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Learning-enhanced checks failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Apply a learning pattern as a quality check
   */
  async applyLearningPatternCheck(artifact, recommendation, gateType) {
    try {
      // This would be customized based on the specific pattern
      const checkResult = {
        name: `learning_${recommendation.pattern_name}`,
        type: 'learning_enhanced',
        category: gateType,
        passed: Math.random() > 0.3, // Placeholder - would be actual pattern application
        score: recommendation.confidence_score,
        weight: 0.1,
        details: `Applied learning pattern: ${recommendation.pattern_name}`,
        pattern_id: recommendation.pattern_id,
        learning_based: true
      };

      return checkResult;

    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Failed to apply learning pattern check: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore(checks) {
    if (checks.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    for (const check of checks) {
      const weight = check.weight || 1;
      const score = check.passed ? (check.score || 1) : 0;
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Determine if quality gate passes
   */
  determineGatePass(overallScore, gateType) {
    const thresholds = {
      security: 0.9,
      performance: 0.8,
      code: 0.75,
      architecture: 0.8,
      general: 0.7
    };

    const threshold = thresholds[gateType] || thresholds.general;
    return overallScore >= threshold;
  }

  /**
   * Generate quality recommendations
   */
  async generateQualityRecommendations(checks, gateType, context) {
    const recommendations = [];

    // Analyze failed checks
    const failedChecks = checks.filter(check => !check.passed);

    for (const failedCheck of failedChecks) {
      recommendations.push({
        type: 'fix_failed_check',
        check_name: failedCheck.name,
        priority: failedCheck.category === 'security' ? 'high' : 'medium',
        description: `Address failed check: ${failedCheck.name}`,
        details: failedCheck.details || 'No details available'
      });
    }

    // Add learning-based recommendations
    try {
      const learningGuidance = await this.learningClient.getLearningGuidance(
        context,
        `quality_improvement_${gateType}`
      );

      if (learningGuidance.available) {
        for (const rec of learningGuidance.guidance.recommendations.slice(0, 3)) {
          recommendations.push({
            type: 'learning_recommendation',
            pattern_name: rec.pattern_name,
            confidence: rec.confidence_score,
            priority: rec.confidence_score > 0.8 ? 'high' : 'medium',
            description: rec.action || rec.pattern_name,
            rationale: rec.rationale || 'Based on learned patterns'
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Failed to generate learning recommendations: ${error.message}`);
    }

    return recommendations;
  }

  /**
   * Log quality metrics for learning
   */
  async logQualityMetrics(qualityCheck) {
    try {
      const metrics = {
        mode: this.modeName,
        gate_type: qualityCheck.gate_type,
        overall_score: qualityCheck.overall_score,
        passed: qualityCheck.passed,
        check_count: qualityCheck.checks.length,
        learning_enhanced: qualityCheck.learning_enhanced,
        timestamp: qualityCheck.timestamp
      };

      // Store in local metrics
      this.qualityMetrics.set(`${this.modeName}_${qualityCheck.gate_type}`, metrics);

      // Log to learning system
      await this.workflowHelpers.postTaskLearningUpdate(
        `quality_${qualityCheck.gate_type}`,
        qualityCheck.passed ? 'success' : 'failure',
        qualityCheck.overall_score,
        `Quality gate ${qualityCheck.gate_type}: ${qualityCheck.passed ? 'PASSED' : 'FAILED'} (${(qualityCheck.overall_score * 100).toFixed(1)}%)`
      );

    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] Failed to log quality metrics: ${error.message}`);
    }
  }

  /**
   * Detect anomalies in quality metrics and create follow-up tasks
   * @param {{gate_type:string, overall_score:number, timestamp:string}} metrics
   * @returns {Promise<string|false>} task id when anomaly logged
   * @throws {QualityAnomalyError}
   */
  async detectQualityAnomalies(metrics) {
    if (!validateMetrics(metrics)) {
      throw new QualityAnomalyError('Invalid metrics input');
    }
    const key = `${this.modeName}_${metrics.gate_type}`,
      prev = this.qualityMetrics.get(key);
    if (
      !prev ||
      Math.abs(metrics.overall_score - prev.overall_score) / (prev.overall_score || 1) <= 0.1 ||
      Math.abs(new Date(metrics.timestamp) - new Date(prev.timestamp)) > 86400000
    ) {
      return false;
    }
    const dashboard = process.env.QUALITY_DASHBOARD_PATH;
    for (let i = 0; i < 3; i++) {
      try {
        await updateDashboard(dashboard, metrics);
        const id = await this.workflowHelpers.createQualityTask('metric anomaly', { metrics });
        return id;
      } catch (err) {
        if (i === 2) throw new QualityAnomalyError('Failed to record anomaly', err);
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  /**
   * Log quality errors for learning
   */
  async logQualityError(error, gateType, context) {
    try {
      const errorInfo = {
        mode: this.modeName,
        gate_type: gateType,
        error_message: error.message,
        error_type: error.name,
        context: context,
        timestamp: new Date().toISOString()
      };

      // Track error patterns
      const errorKey = `${gateType}_${error.name}`;
      const currentCount = this.errorTracking.get(errorKey) || 0;
      this.errorTracking.set(errorKey, currentCount + 1);

      // Log to learning system
      await this.workflowHelpers.postTaskLearningUpdate(
        `quality_error_${gateType}`,
        'failure',
        0.1,
        `Quality error in ${gateType}: ${error.message}`
      );

    } catch (logError) {
      console.warn(`⚠️ [${this.modeName}] Failed to log quality error: ${logError.message}`);
    }
  }

  /**
   * Get quality control statistics
   */
  getStatistics() {
    return {
      mode: this.modeName,
      quality_metrics: Object.fromEntries(this.qualityMetrics),
      error_tracking: Object.fromEntries(this.errorTracking),
      thresholds: this.qualityThresholds,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset quality control state
   */
  reset() {
    this.errorTracking.clear();
    this.qualityMetrics.clear();
    console.log(`🔄 [${this.modeName}] Quality control state reset`);
  }

  // Placeholder implementations for specific check types
  // These would be fully implemented based on specific requirements

  async runSecurityChecks(artifact) {
    return [
      { name: 'input_validation', type: 'security', passed: true, score: 0.9, weight: 0.3 },
      { name: 'authentication_check', type: 'security', passed: true, score: 0.85, weight: 0.3 },
      { name: 'authorization_check', type: 'security', passed: false, score: 0.6, weight: 0.4 }
    ];
  }

  async runPerformanceChecks(artifact) {
    return [
      { name: 'response_time_check', type: 'performance', passed: true, score: 0.8, weight: 0.4 },
      { name: 'resource_usage_check', type: 'performance', passed: true, score: 0.75, weight: 0.4 },
      { name: 'scalability_assessment', type: 'performance', passed: false, score: 0.5, weight: 0.2 }
    ];
  }

  async runCodeQualityChecks(artifact) {
    return [
      { name: 'test_coverage', type: 'code', passed: true, score: 0.9, weight: 0.3 },
      { name: 'code_complexity', type: 'code', passed: false, score: 0.6, weight: 0.3 },
      { name: 'maintainability_index', type: 'code', passed: true, score: 0.8, weight: 0.4 }
    ];
  }

  async runArchitectureChecks(artifact) {
    return [
      { name: 'separation_of_concerns', type: 'architecture', passed: true, score: 0.85, weight: 0.3 },
      { name: 'scalability_design', type: 'architecture', passed: false, score: 0.7, weight: 0.3 },
      { name: 'security_integration', type: 'architecture', passed: true, score: 0.9, weight: 0.4 }
    ];
  }

  async runGeneralChecks(artifact) {
    return [
      { name: 'completeness_check', type: 'general', passed: true, score: 0.8, weight: 0.4 },
      { name: 'consistency_check', type: 'general', passed: true, score: 0.75, weight: 0.4 },
      { name: 'documentation_check', type: 'general', passed: false, score: 0.5, weight: 0.2 }
    ];
  }
}

module.exports = LearningQualityControl;