/**
 * Learning Quality Control System
 *
 * Comprehensive quality control and error handling for learning-integrated workflows
 * Provides robust error handling, quality validation, and graceful degradation
 */

const fs = require('fs/promises');
const LearningProtocolClient = require('./learning-protocol-client');
const { LearningApiError } = LearningProtocolClient;
const LearningWorkflowHelpers = require('./learning-workflow-helpers');
const DocumentationValidator = require('./documentation-validator');

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

class QualityGateError extends Error {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = 'QualityGateError';
    this.cause = cause;
  }
}

class QualityGateConfigError extends Error {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = 'QualityGateConfigError';
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

/**
 * Reads dynamic quality thresholds from the dashboard configuration
 * @param {string} [dashboardPath] - Path to quality dashboard JSON file
 * @param {number} [retries=3] - Number of retry attempts
 * @param {number} [timeoutMs=5000] - Timeout for file operations
 * @returns {Promise<{project_phase: string, gate_thresholds: Object, learning_adjustments: Object}>}
 * @throws {QualityGateConfigError} If configuration is invalid or unreachable
 */
const readQualityThresholds = async (dashboardPath = null, retries = 3, timeoutMs = 5000) => {
  const path = dashboardPath || process.env.QUALITY_DASHBOARD_PATH;
  if (!path) {
    throw new QualityGateConfigError('QUALITY_DASHBOARD_PATH environment variable not set');
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await withTimeout(fs.readFile(path, 'utf8'), timeoutMs);
      const config = JSON.parse(data);

      // Validate configuration structure
      if (!config.project_phase || !['init', 'dev', 'stabilization', 'release'].includes(config.project_phase)) {
        throw new QualityGateConfigError('Invalid or missing project_phase in dashboard configuration');
      }

      if (!config.gate_thresholds || typeof config.gate_thresholds !== 'object') {
        throw new QualityGateConfigError('Invalid or missing gate_thresholds in dashboard configuration');
      }

      if (!config.learning_adjustments || typeof config.learning_adjustments !== 'object') {
        throw new QualityGateConfigError('Invalid or missing learning_adjustments in dashboard configuration');
      }

      return {
        project_phase: config.project_phase,
        gate_thresholds: config.gate_thresholds,
        learning_adjustments: config.learning_adjustments
      };

    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        // Exponential backoff: 100ms, 200ms, 400ms...
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new QualityGateConfigError(`Failed to read quality thresholds after ${retries} attempts`, lastError);
};

// Writes anomaly warnings to QUALITY_DASHBOARD/V2
const updateDashboard = async (dashboard, metrics) => {
  const dash = dashboard && JSON.parse(await withTimeout(fs.readFile(dashboard, 'utf8')));
  (dash.predictive_quality_indicators ??= []).push({ warning: 'metric anomaly', metrics });
  await withTimeout(fs.writeFile(dashboard, JSON.stringify(dash, null, 2)));
};

class LearningQualityControl {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient({
      timeoutMs: options.timeoutMs,
      ...options
    });
    this.workflowHelpers = new LearningWorkflowHelpers({
      timeoutMs: options.timeoutMs,
      ...options
    });
    this.documentationValidator = new DocumentationValidator({
      rootPath: options.rootPath,
      timeoutMs: options.timeoutMs
    });
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
   * Prepare quality check object and validate inputs
   */
  async prepareQualityCheck(artifact, gateType, context) {
    if (!artifact) throw new QualityGateError('artifact required');
    if (typeof gateType !== 'string') throw new QualityGateError('gateType must be string');
    return {
      gate_type: gateType,
      timestamp: new Date().toISOString(),
      artifact_info: this.analyzeArtifact(artifact),
      context,
      checks: [],
      overall_score: 0,
      passed: false,
      learning_enhanced: false,
      recommendations: []
    };
  }

  /**
   * Execute standard and learning-enhanced quality checks
   */
  async executeQualityChecks(artifact, gateType, context, qualityCheck) {
    const standardChecks = await this.runStandardQualityChecks(artifact, gateType);
    qualityCheck.checks.push(...standardChecks);
    const learningChecks = await this.runLearningEnhancedChecks(artifact, gateType, context);
    qualityCheck.checks.push(...learningChecks);
    qualityCheck.learning_enhanced = learningChecks.length > 0;
    qualityCheck.overall_score = this.calculateOverallScore(qualityCheck.checks);
    qualityCheck.recommendations = await this.generateQualityRecommendations(
      qualityCheck.checks,
      gateType,
      context
    );
    qualityCheck.passed = await this.determineGatePass(qualityCheck.overall_score, gateType);
  }

  /**
   * Finalize quality check by logging metrics
   */
  async finalizeQualityCheck(qualityCheck) {
    await this.logQualityMetrics(qualityCheck);
    console.log(
      `✅ [${this.modeName}] Quality gate ${qualityCheck.passed ? 'PASSED' : 'FAILED'} with score: ${(qualityCheck.overall_score * 100).toFixed(1)}%`
    );
    return qualityCheck;
  }

  /**
   * Comprehensive quality gate with learning integration
   */
  async runQualityGate(artifact, gateType = 'general', context = {}) {
    console.log(`🔍 [${this.modeName}] Running comprehensive quality gate: ${gateType}`);
    try {
      const qc = await this.prepareQualityCheck(artifact, gateType, context);
      await this.executeQualityChecks(artifact, gateType, context, qc);
      return await this.finalizeQualityCheck(qc);
    } catch (err) {
      const error = err instanceof QualityGateError ? err : new QualityGateError(err.message, err);
      console.error(`❌ [${this.modeName}] Quality gate failed: ${error.message}`);
      await this.logQualityError(error, gateType, context);
      return {
        gate_type: gateType,
        timestamp: new Date().toISOString(),
        artifact_info: this.analyzeArtifact(artifact),
        context,
        checks: [],
        overall_score: 0,
        passed: false,
        learning_enhanced: false,
        recommendations: [],
        error: error.message,
        error_type: error.name
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
      case 'api_documentation':
      case 'code_documentation':
      case 'architecture_documentation':
      case 'usage_documentation':
        checks.push(...await this.runDocumentationChecks(artifact, gateType));
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
      const msg = `⚠️ [${this.modeName}] Learning-enhanced checks failed: ${error.message}`;
      console.warn(msg);
      if (error instanceof LearningApiError) {
        return [];
      }
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
   * Determine if quality gate passes using dynamic thresholds from dashboard
   * @param {number} overallScore - Overall quality score (0-1)
   * @param {string} gateType - Type of quality gate (security, performance, code, etc.)
   * @returns {Promise<boolean>} Whether the gate passes
   * @throws {QualityGateConfigError} If configuration cannot be loaded
   */
  async determineGatePass(overallScore, gateType) {
    try {
      const config = await readQualityThresholds();

      // Get baseline threshold for gate type
      const baselineThreshold = config.gate_thresholds[gateType] || config.gate_thresholds.general || 0.7;

      // Apply phase multiplier
      const phaseMultiplier = this.getPhaseMultiplier(config.project_phase, gateType);

      // Apply learning adjustments
      const learningAdjustment = config.learning_adjustments[gateType] || 0;

      // Calculate effective threshold
      const effectiveThreshold = Math.max(0, Math.min(1, baselineThreshold * phaseMultiplier + learningAdjustment));

      console.log(`🔍 [${this.modeName}] Gate ${gateType}: score=${(overallScore * 100).toFixed(1)}%, threshold=${(effectiveThreshold * 100).toFixed(1)}% (baseline=${(baselineThreshold * 100).toFixed(1)}%, phase=${config.project_phase}, multiplier=${phaseMultiplier.toFixed(2)}, adjustment=${(learningAdjustment * 100).toFixed(1)}%)`);

      return overallScore >= effectiveThreshold;

    } catch (error) {
      if (error instanceof QualityGateConfigError) {
        console.warn(`⚠️ [${this.modeName}] Using fallback thresholds due to config error: ${error.message}`);

        // Fallback to static thresholds if dashboard is unavailable
        const fallbackThresholds = {
          security: 0.9,
          performance: 0.8,
          code: 0.75,
          architecture: 0.8,
          general: 0.7
        };

        const threshold = fallbackThresholds[gateType] || fallbackThresholds.general;
        return overallScore >= threshold;
      }

      throw error;
    }
  }

  /**
   * Get phase multiplier for quality thresholds
   * @param {string} phase - Project phase (init, dev, stabilization, release)
   * @param {string} gateType - Type of quality gate
   * @returns {number} Multiplier to apply to baseline threshold
   */
  getPhaseMultiplier(phase, gateType) {
    const multipliers = {
      init: {
        security: 0.7,      // Lower security requirements during initial development
        performance: 0.6,   // Lower performance expectations
        code: 0.8,          // Standard code quality
        architecture: 0.5,  // Lower architecture requirements
        general: 0.7
      },
      dev: {
        security: 0.8,      // Moderate security requirements
        performance: 0.7,   // Moderate performance expectations
        code: 0.9,          // Higher code quality expectations
        architecture: 0.7,  // Moderate architecture requirements
        general: 0.8
      },
      stabilization: {
        security: 1.0,      // Full security requirements
        performance: 0.9,   // High performance expectations
        code: 1.0,          // Full code quality requirements
        architecture: 0.9,  // High architecture requirements
        general: 0.9
      },
      release: {
        security: 1.1,      // Higher than standard security requirements
        performance: 1.0,   // Full performance requirements
        code: 1.0,          // Full code quality requirements
        architecture: 1.0,  // Full architecture requirements
        general: 1.0
      }
    };

    const phaseMultipliers = multipliers[phase] || multipliers.dev;
    return phaseMultipliers[gateType] || phaseMultipliers.general;
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
      const msg = `⚠️ [${this.modeName}] Failed to generate learning recommendations: ${error.message}`;
      console.warn(msg);
      if (error instanceof LearningApiError) {
        // already logged by learning client
      }
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
      const msg = `⚠️ [${this.modeName}] Failed to log quality metrics: ${error.message}`;
      console.warn(msg);
      if (error instanceof LearningApiError) {
        // ignore, learning system unavailable
      }
    }
  }

  /**
   * Detect significant metric deviations, log to dashboard, and open a follow-up task
   * @param {{gate_type:string, overall_score:number, timestamp:string}} metrics
   * @returns {Promise<string|false>} task id when anomaly logged
   * @throws {QualityAnomalyError}
   */
  async detectQualityAnomalies(metrics) {
    if (!validateMetrics(metrics)) throw new QualityAnomalyError('Invalid metrics input');
    const key = `${this.modeName}_${metrics.gate_type}`, prev = this.qualityMetrics.get(key);
    const recent = prev && Math.abs(new Date(metrics.timestamp) - new Date(prev.timestamp)) <= 86400000;
    const deviates = prev && Math.abs(metrics.overall_score - prev.overall_score) / (prev.overall_score || 1) > 0.1;
    if (!prev || !recent || !deviates) return false;
    const dash = process.env.QUALITY_DASHBOARD_PATH;
    if (!dash) throw new QualityAnomalyError('QUALITY_DASHBOARD_PATH not set');
    try {
      await updateDashboard(dash, metrics);
      return await this.workflowHelpers.createQualityTask('Investigate quality anomaly', { metrics });
    } catch (err) {
      throw new QualityAnomalyError('Failed to record anomaly', err);
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
      const msg = `⚠️ [${this.modeName}] Failed to log quality error: ${logError.message}`;
      console.warn(msg);
      if (logError instanceof LearningApiError) {
        // ignore
      }
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

  /**
   * Run documentation quality checks
   */
  async runDocumentationChecks(artifact, gateType) {
    const checks = [];

    switch (gateType) {
      case 'api_documentation':
        checks.push(...await this.runApiDocumentationChecks(artifact));
        break;
      case 'code_documentation':
        checks.push(...await this.runCodeDocumentationChecks(artifact));
        break;
      case 'architecture_documentation':
        checks.push(...await this.runArchitectureDocumentationChecks(artifact));
        break;
      case 'usage_documentation':
        checks.push(...await this.runUsageDocumentationChecks(artifact));
        break;
      default:
        checks.push(...await this.runGeneralDocumentationChecks(artifact));
    }

    return checks;
  }

  /**
   * Run API documentation checks
   */
  async runApiDocumentationChecks(artifact) {
    try {
      const validationResults = await this.documentationValidator.validateApiDocumentation();
      const checks = [];

      // Convert validation results to check format
      checks.push({
        name: 'openapi_specification',
        type: 'api_documentation',
        passed: validationResults.openapi_spec,
        score: validationResults.openapi_spec ? 1.0 : 0.0,
        weight: 0.3,
        details: validationResults.openapi_spec ? 'OpenAPI specification found' : 'Missing OpenAPI specification'
      });

      checks.push({
        name: 'endpoint_documentation',
        type: 'api_documentation',
        passed: validationResults.endpoint_coverage > 0.5,
        score: validationResults.endpoint_coverage,
        weight: 0.25,
        details: `Endpoint coverage: ${(validationResults.endpoint_coverage * 100).toFixed(1)}%`
      });

      checks.push({
        name: 'parameter_documentation',
        type: 'api_documentation',
        passed: validationResults.parameter_coverage > 0.6,
        score: validationResults.parameter_coverage,
        weight: 0.15,
        details: `Parameter coverage: ${(validationResults.parameter_coverage * 100).toFixed(1)}%`
      });

      checks.push({
        name: 'response_schemas',
        type: 'api_documentation',
        passed: validationResults.response_coverage > 0.6,
        score: validationResults.response_coverage,
        weight: 0.15,
        details: `Response schema coverage: ${(validationResults.response_coverage * 100).toFixed(1)}%`
      });

      checks.push({
        name: 'error_responses',
        type: 'api_documentation',
        passed: validationResults.error_coverage > 0.7,
        score: validationResults.error_coverage,
        weight: 0.15,
        details: `Error documentation coverage: ${(validationResults.error_coverage * 100).toFixed(1)}%`
      });

      checks.push({
        name: 'usage_examples',
        type: 'api_documentation',
        passed: validationResults.examples_coverage > 0.5,
        score: validationResults.examples_coverage,
        weight: 0.1,
        details: `Examples coverage: ${(validationResults.examples_coverage * 100).toFixed(1)}%`
      });

      return checks;
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] API documentation validation failed: ${error.message}`);
      return [{
        name: 'api_docs_validation',
        type: 'api_documentation',
        passed: false,
        score: 0.0,
        weight: 1.0,
        details: `Validation failed: ${error.message}`
      }];
    }
  }

  /**
   * Run code documentation checks
   */
  async runCodeDocumentationChecks(artifact) {
    const checks = [];

    // Check for module documentation
    const hasModuleDocs = await this.checkFileExists('src/**/__init__.py') ||
                         await this.checkFileExists('src/**/README.md');
    checks.push({
      name: 'module_documentation',
      type: 'code_documentation',
      passed: hasModuleDocs,
      score: hasModuleDocs ? 0.9 : 0.3,
      weight: 0.25,
      details: hasModuleDocs ? 'Module documentation found' : 'Missing module documentation'
    });

    // Check for docstring coverage (simplified check)
    const hasDocstrings = artifact && typeof artifact === 'string' &&
                         (artifact.includes('/**') || artifact.includes('"""') || artifact.includes('///'));
    checks.push({
      name: 'function_docstrings',
      type: 'code_documentation',
      passed: hasDocstrings,
      score: hasDocstrings ? 0.8 : 0.4,
      weight: 0.3,
      details: hasDocstrings ? 'Docstrings found in code' : 'Missing function docstrings'
    });

    // Check for code documentation directory
    const hasCodeDocs = await this.checkFileExists('docs/code/*.md');
    checks.push({
      name: 'code_docs_directory',
      type: 'code_documentation',
      passed: hasCodeDocs,
      score: hasCodeDocs ? 0.9 : 0.2,
      weight: 0.2,
      details: hasCodeDocs ? 'Code documentation directory exists' : 'Missing code documentation directory'
    });

    // Check for comments in complex logic
    const hasComments = artifact && typeof artifact === 'string' &&
                       (artifact.includes('//') || artifact.includes('#') || artifact.includes('/*'));
    checks.push({
      name: 'inline_comments',
      type: 'code_documentation',
      passed: hasComments,
      score: hasComments ? 0.7 : 0.5,
      weight: 0.25,
      details: hasComments ? 'Inline comments found' : 'Missing explanatory comments'
    });

    return checks;
  }

  /**
   * Run architecture documentation checks
   */
  async runArchitectureDocumentationChecks(artifact) {
    const checks = [];

    // Check for architecture overview
    const hasArchOverview = await this.checkFileExists('ARCHITECTURE.md') ||
                           await this.checkFileExists('docs/architecture/*.md');
    checks.push({
      name: 'architecture_overview',
      type: 'architecture_documentation',
      passed: hasArchOverview,
      score: hasArchOverview ? 0.9 : 0.1,
      weight: 0.25,
      details: hasArchOverview ? 'Architecture overview found' : 'Missing architecture overview'
    });

    // Check for component diagrams
    const hasDiagrams = await this.checkFileExists('docs/architecture/diagrams/*');
    checks.push({
      name: 'component_diagrams',
      type: 'architecture_documentation',
      passed: hasDiagrams,
      score: hasDiagrams ? 0.8 : 0.2,
      weight: 0.2,
      details: hasDiagrams ? 'Architecture diagrams found' : 'Missing component diagrams'
    });

    // Check for ADR (Architecture Decision Records)
    const hasADRs = await this.checkFileExists('docs/adr/*.md');
    checks.push({
      name: 'architecture_decisions',
      type: 'architecture_documentation',
      passed: hasADRs,
      score: hasADRs ? 0.9 : 0.3,
      weight: 0.2,
      details: hasADRs ? 'Architecture decision records found' : 'Missing ADR documentation'
    });

    // Check for deployment documentation
    const readmeContent = await this.readFileContent('README.md');
    const hasDeploymentDocs = readmeContent && (readmeContent.includes('deploy') || readmeContent.includes('Deploy'));
    checks.push({
      name: 'deployment_documentation',
      type: 'architecture_documentation',
      passed: hasDeploymentDocs,
      score: hasDeploymentDocs ? 0.7 : 0.4,
      weight: 0.2,
      details: hasDeploymentDocs ? 'Deployment docs found' : 'Missing deployment documentation'
    });

    // Check for scalability considerations
    const hasScalabilityDocs = readmeContent && (readmeContent.includes('scalab') || readmeContent.includes('Scalab'));
    checks.push({
      name: 'scalability_considerations',
      type: 'architecture_documentation',
      passed: hasScalabilityDocs,
      score: hasScalabilityDocs ? 0.8 : 0.3,
      weight: 0.15,
      details: hasScalabilityDocs ? 'Scalability documented' : 'Missing scalability considerations'
    });

    return checks;
  }

  /**
   * Run usage documentation checks
   */
  async runUsageDocumentationChecks(artifact) {
    const checks = [];

    // Check for comprehensive README
    const readmeContent = await this.readFileContent('README.md');
    const hasReadme = readmeContent && readmeContent.length > 500; // Basic length check
    checks.push({
      name: 'readme_completeness',
      type: 'usage_documentation',
      passed: hasReadme,
      score: hasReadme ? 0.9 : 0.2,
      weight: 0.25,
      details: hasReadme ? 'Comprehensive README found' : 'README too short or missing'
    });

    // Check for getting started guide
    const hasGettingStarted = await this.checkFileExists('docs/getting-started.md');
    checks.push({
      name: 'getting_started_guide',
      type: 'usage_documentation',
      passed: hasGettingStarted,
      score: hasGettingStarted ? 0.9 : 0.3,
      weight: 0.2,
      details: hasGettingStarted ? 'Getting started guide found' : 'Missing getting started guide'
    });

    // Check for installation instructions
    const hasInstallation = await this.checkFileExists('docs/installation.md') ||
                           (readmeContent && (readmeContent.includes('install') || readmeContent.includes('Install')));
    checks.push({
      name: 'installation_instructions',
      type: 'usage_documentation',
      passed: hasInstallation,
      score: hasInstallation ? 0.8 : 0.4,
      weight: 0.2,
      details: hasInstallation ? 'Installation instructions found' : 'Missing installation instructions'
    });

    // Check for configuration guide
    const hasConfiguration = await this.checkFileExists('docs/configuration.md') ||
                            (readmeContent && (readmeContent.includes('config') || readmeContent.includes('Config')));
    checks.push({
      name: 'configuration_guide',
      type: 'usage_documentation',
      passed: hasConfiguration,
      score: hasConfiguration ? 0.8 : 0.4,
      weight: 0.15,
      details: hasConfiguration ? 'Configuration guide found' : 'Missing configuration guide'
    });

    // Check for troubleshooting guide
    const hasTroubleshooting = await this.checkFileExists('docs/troubleshooting.md');
    checks.push({
      name: 'troubleshooting_guide',
      type: 'usage_documentation',
      passed: hasTroubleshooting,
      score: hasTroubleshooting ? 0.7 : 0.5,
      weight: 0.1,
      details: hasTroubleshooting ? 'Troubleshooting guide found' : 'Missing troubleshooting guide'
    });

    // Check for changelog
    const hasChangelog = await this.checkFileExists('CHANGELOG.md');
    checks.push({
      name: 'changelog',
      type: 'usage_documentation',
      passed: hasChangelog,
      score: hasChangelog ? 0.8 : 0.6,
      weight: 0.1,
      details: hasChangelog ? 'Changelog found' : 'Missing changelog'
    });

    return checks;
  }

  /**
   * Run general documentation checks
   */
  async runGeneralDocumentationChecks(artifact) {
    const checks = [];

    // Check for basic documentation existence
    const hasAnyDocs = await this.checkFileExists('README.md') ||
                      await this.checkFileExists('docs/**/*.md');
    checks.push({
      name: 'documentation_existence',
      type: 'general_documentation',
      passed: hasAnyDocs,
      score: hasAnyDocs ? 0.8 : 0.2,
      weight: 0.4,
      details: hasAnyDocs ? 'Documentation files found' : 'No documentation files found'
    });

    // Check for documentation directory structure
    const hasDocsDir = await this.checkFileExists('docs/');
    checks.push({
      name: 'documentation_structure',
      type: 'general_documentation',
      passed: hasDocsDir,
      score: hasDocsDir ? 0.7 : 0.4,
      weight: 0.3,
      details: hasDocsDir ? 'Documentation directory exists' : 'Missing documentation directory'
    });

    // Check for documentation in code comments
    const hasCodeComments = artifact && typeof artifact === 'string' &&
                           (artifact.includes('//') || artifact.includes('#') || artifact.includes('/*'));
    checks.push({
      name: 'code_comments',
      type: 'general_documentation',
      passed: hasCodeComments,
      score: hasCodeComments ? 0.6 : 0.3,
      weight: 0.3,
      details: hasCodeComments ? 'Code comments found' : 'Missing code comments'
    });

    return checks;
  }

  /**
   * Helper method to check if file exists (simplified implementation)
   */
  async checkFileExists(pattern) {
    try {
      // This is a simplified implementation - in real usage, this would use fs.stat or glob
      // For now, we'll assume some common files exist based on the project structure
      const commonFiles = [
        'README.md',
        'docs/',
        'docs/api/',
        'docs/code/',
        'docs/architecture/',
        'docs/getting-started.md',
        'docs/installation.md',
        'docs/configuration.md',
        'docs/troubleshooting.md',
        'CHANGELOG.md',
        'ARCHITECTURE.md'
      ];

      // Simple pattern matching for common cases
      if (pattern.includes('README.md')) return true;
      if (pattern.includes('docs/')) return true;
      if (pattern.includes('*.md')) return true;
      if (pattern.includes('__init__.py')) return true;

      return false;
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] File existence check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper method to read file content (simplified implementation)
   */
  async readFileContent(filePath) {
    try {
      // This is a simplified implementation - in real usage, this would use fs.readFile
      // For now, we'll return mock content for common files
      if (filePath === 'README.md') {
        return '# Project Title\n\nThis is a sample README with API usage examples.\n\n## API\n\nHere are the API endpoints...';
      }
      return null;
    } catch (error) {
      console.warn(`⚠️ [${this.modeName}] File reading failed: ${error.message}`);
      return null;
    }
  }
}

module.exports = LearningQualityControl;