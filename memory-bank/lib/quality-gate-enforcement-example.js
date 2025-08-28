/**
 * Quality Gate Enforcement Example
 *
 * Demonstrates comprehensive quality gate enforcement with automated checking,
 * manual review workflows, and CI/CD integration
 */

const QualityGateEnforcementEngine = require('./quality-gate-enforcement');

class QualityGateEnforcementExample {
  constructor() {
    this.qualityEngine = new QualityGateEnforcementEngine({
      enableAutomatedChecking: true,
      enableManualReview: true,
      enableCICDIntegration: false,
      qualityThreshold: 0.8,
      strictMode: false,
      maxConcurrentChecks: 5
    });

    // Add CI/CD integrations
    this.addCICDIntegrations();

    // Bind event handlers
    this.bindEventHandlers();
  }

  /**
   * Add CI/CD integrations
   */
  addCICDIntegrations() {
    // Mock GitHub Actions integration
    this.qualityEngine.addCICDIntegration('github_actions', {
      triggerCheck: async (gateResults) => {
        console.log('🚀 Triggering GitHub Actions workflow...');
        // In real implementation, this would trigger a GitHub Actions workflow
        return { status: 'triggered', workflow_id: 'qa_' + Date.now() };
      },
      getStatus: async (workflowId) => {
        // Simulate workflow status
        return {
          status: Math.random() > 0.2 ? 'success' : 'failure',
          conclusion: Math.random() > 0.2 ? 'success' : 'failure',
          completed_at: new Date().toISOString()
        };
      }
    });

    // Mock Jenkins integration
    this.qualityEngine.addCICDIntegration('jenkins', {
      triggerBuild: async (gateResults) => {
        console.log('🔧 Triggering Jenkins build...');
        return { status: 'building', build_number: Math.floor(Math.random() * 1000) };
      },
      getBuildStatus: async (buildNumber) => {
        return {
          status: Math.random() > 0.3 ? 'SUCCESS' : 'FAILURE',
          duration: Math.floor(Math.random() * 300) + 60,
          completed_at: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Bind event handlers
   */
  bindEventHandlers() {
    this.qualityEngine.on('quality_gate_registered', (gate) => {
      console.log(`📋 Quality gate registered: ${gate.name} (${gate.id})`);
    });

    this.qualityEngine.on('quality_gates_executed', (execution) => {
      console.log(`🎯 Quality gates executed: ${execution.execution_id}`);
      this.displayExecutionResults(execution);
    });

    this.qualityEngine.on('quality_check_started', (data) => {
      console.log(`🔍 Started: ${data.gateId}`);
    });

    this.qualityEngine.on('quality_check_completed', (data) => {
      console.log(`✅ Completed: ${data.gateId} - ${data.status}`);
    });

    this.qualityEngine.on('quality_gate_failed', (data) => {
      console.log(`❌ Failed: ${data.gateId} - ${data.reason}`);
    });

    this.qualityEngine.on('quality_gate_passed', (data) => {
      console.log(`✅ Passed: ${data.gateId}`);
    });

    this.qualityEngine.on('manual_review_requested', (data) => {
      console.log(`👥 Manual review requested: ${data.gate_id}`);
    });

    this.qualityEngine.on('cicd_integration_added', (data) => {
      console.log(`🔗 CI/CD integration added: ${data.name}`);
    });
  }

  /**
   * Example: Execute quality gates for a Node.js API project
   */
  async exampleNodeJsAPI() {
    console.log('\n🚀 Example: Node.js API Project Quality Gates');
    console.log('=' .repeat(70));

    const target = {
      id: 'nodejs_api_v2',
      type: 'web_api',
      name: 'User Management API',
      repository: 'https://github.com/company/user-api',
      branch: 'main',
      commit: 'abc123def456',
      files: [
        'package.json',
        'src/controllers/userController.js',
        'src/models/userModel.js',
        'test/userController.test.js'
      ]
    };

    const context = {
      technology_stack: ['nodejs', 'express', 'mongodb', 'jwt'],
      architecture_pattern: 'rest_api',
      infrastructure: 'aws_lambda',
      project_type: 'web_api',
      team_size: 'small',
      timeline: '3_months',
      security_level: 'high',
      compliance_requirements: ['gdpr'],
      testing_strategy: 'tdd'
    };

    try {
      const execution = await this.qualityEngine.executeQualityGates(target, context, {
        includeAutomatedChecks: true,
        includeManualReviews: true,
        failOnCritical: true
      });

      return execution;

    } catch (error) {
      console.error('Quality gate execution failed:', error);
      throw error;
    }
  }

  /**
   * Example: Execute quality gates for a React frontend project
   */
  async exampleReactFrontend() {
    console.log('\n⚛️  Example: React Frontend Project Quality Gates');
    console.log('=' .repeat(70));

    const target = {
      id: 'react_dashboard_v1',
      type: 'frontend',
      name: 'Analytics Dashboard',
      repository: 'https://github.com/company/analytics-dashboard',
      branch: 'develop',
      commit: 'def789ghi012',
      files: [
        'package.json',
        'src/components/Dashboard.jsx',
        'src/hooks/useAnalytics.js',
        'src/utils/apiClient.js'
      ]
    };

    const context = {
      technology_stack: ['react', 'typescript', 'redux', 'material-ui'],
      architecture_pattern: 'component_based',
      infrastructure: 'netlify',
      project_type: 'frontend',
      team_size: 'medium',
      timeline: '2_months',
      security_level: 'medium',
      compliance_requirements: ['accessibility'],
      testing_strategy: 'unit_integration'
    };

    try {
      const execution = await this.qualityEngine.executeQualityGates(target, context, {
        includeAutomatedChecks: true,
        includeManualReviews: false,
        failOnCritical: false
      });

      return execution;

    } catch (error) {
      console.error('Quality gate execution failed:', error);
      throw error;
    }
  }

  /**
   * Example: Execute quality gates for a financial system
   */
  async exampleFinancialSystem() {
    console.log('\n💰 Example: Financial System Quality Gates');
    console.log('=' .repeat(70));

    const target = {
      id: 'payment_system_v3',
      type: 'financial_system',
      name: 'Payment Processing System',
      repository: 'https://github.com/company/payment-system',
      branch: 'main',
      commit: 'jkl456mno789',
      files: [
        'src/main/java/com/company/payment/PaymentService.java',
        'src/test/java/com/company/payment/PaymentServiceTest.java',
        'infrastructure/docker-compose.yml',
        'security/encryption-config.yml'
      ]
    };

    const context = {
      technology_stack: ['java', 'spring_boot', 'postgresql', 'redis'],
      architecture_pattern: 'microservices',
      infrastructure: 'private_cloud',
      project_type: 'financial_system',
      team_size: 'large',
      timeline: '6_months',
      security_level: 'critical',
      compliance_requirements: ['pci_dss', 'sox', 'gdpr'],
      testing_strategy: 'comprehensive'
    };

    try {
      const execution = await this.qualityEngine.executeQualityGates(target, context, {
        includeAutomatedChecks: true,
        includeManualReviews: true,
        failOnCritical: true,
        priorityGates: ['security_dependency_scan', 'compliance_audit']
      });

      return execution;

    } catch (error) {
      console.error('Quality gate execution failed:', error);
      throw error;
    }
  }

  /**
   * Example: Demonstrate custom quality gate
   */
  async exampleCustomQualityGate() {
    console.log('\n🔧 Example: Custom Quality Gate');
    console.log('=' .repeat(70));

    // Register a custom quality gate
    this.qualityEngine.registerQualityGate({
      id: 'custom_api_documentation',
      name: 'API Documentation Coverage',
      type: 'documentation',
      category: 'api',
      description: 'Ensures all API endpoints are properly documented',
      automated: true,
      manualReview: false,
      severity: 'medium',
      criteria: {
        minEndpointCoverage: 90,
        requiredFields: ['description', 'parameters', 'responses'],
        maxUndocumentedEndpoints: 5
      },
      checkFunction: this.checkAPIDocumentation.bind(this),
      remediation: {
        automatic: false,
        suggestions: [
          'Add missing API documentation',
          'Include parameter descriptions',
          'Document response schemas'
        ]
      }
    });

    const target = {
      id: 'custom_api_v1',
      type: 'api',
      name: 'Custom REST API',
      endpoints: [
        { path: '/users', method: 'GET', documented: true },
        { path: '/users', method: 'POST', documented: true },
        { path: '/users/{id}', method: 'GET', documented: false },
        { path: '/users/{id}', method: 'PUT', documented: true },
        { path: '/users/{id}', method: 'DELETE', documented: false }
      ]
    };

    const context = {
      technology_stack: ['nodejs', 'express', 'swagger'],
      project_type: 'api',
      documentation_tool: 'swagger'
    };

    try {
      const execution = await this.qualityEngine.executeQualityGates(target, context);
      return execution;

    } catch (error) {
      console.error('Custom quality gate execution failed:', error);
      throw error;
    }
  }

  /**
   * Example: Demonstrate quality gate evolution
   */
  async exampleQualityGateEvolution() {
    console.log('\n🔄 Example: Quality Gate Evolution');
    console.log('=' .repeat(70));

    const target = {
      id: 'evolving_project_v1',
      type: 'web_application',
      name: 'Evolving Web App'
    };

    const contexts = [
      {
        name: 'Initial Development',
        context: {
          technology_stack: ['javascript', 'jquery'],
          project_type: 'web_app',
          team_size: 'small',
          security_level: 'basic',
          quality_requirements: 'basic'
        }
      },
      {
        name: 'Growth Phase',
        context: {
          technology_stack: ['react', 'nodejs', 'mongodb'],
          project_type: 'web_app',
          team_size: 'medium',
          security_level: 'medium',
          quality_requirements: 'high'
        }
      },
      {
        name: 'Enterprise Scale',
        context: {
          technology_stack: ['react', 'typescript', 'kubernetes', 'postgresql'],
          project_type: 'enterprise_app',
          team_size: 'large',
          security_level: 'high',
          quality_requirements: 'critical',
          compliance_requirements: ['gdpr', 'security']
        }
      }
    ];

    const results = {};

    for (const { name, context } of contexts) {
      console.log(`\n📊 Phase: ${name}`);
      try {
        const execution = await this.qualityEngine.executeQualityGates(target, context);
        results[name] = execution;

        console.log(`   Overall Status: ${execution.summary.overall_status.toUpperCase()}`);
        console.log(`   Quality Score: ${execution.summary.quality_score.toFixed(1)}%`);
        console.log(`   Gates Passed: ${execution.summary.passed_gates}/${execution.summary.total_gates}`);

      } catch (error) {
        console.error(`   ❌ Failed for ${name}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Custom check function for API documentation
   */
  async checkAPIDocumentation(target, context, criteria) {
    const endpoints = target.endpoints || [];
    const totalEndpoints = endpoints.length;
    const documentedEndpoints = endpoints.filter(e => e.documented).length;
    const coverage = totalEndpoints > 0 ? (documentedEndpoints / totalEndpoints) * 100 : 0;

    const undocumentedEndpoints = endpoints.filter(e => !e.documented);
    const maxUndocumentedExceeded = undocumentedEndpoints.length > criteria.maxUndocumentedEndpoints;

    return {
      passed: coverage >= criteria.minEndpointCoverage && !maxUndocumentedExceeded,
      score: coverage / 100,
      details: {
        total_endpoints: totalEndpoints,
        documented_endpoints: documentedEndpoints,
        coverage_percentage: coverage,
        undocumented_endpoints: undocumentedEndpoints.length
      },
      violations: undocumentedEndpoints.map(endpoint => ({
        type: 'undocumented_endpoint',
        message: `Endpoint ${endpoint.method} ${endpoint.path} is not documented`,
        severity: 'medium'
      })),
      metrics: {
        documentation_completeness: coverage,
        documentation_trend: 'improving'
      }
    };
  }

  /**
   * Display execution results
   */
  displayExecutionResults(execution) {
    console.log('\n📊 Quality Gate Execution Results:');
    console.log('-'.repeat(50));

    // Summary
    const summary = execution.summary;
    console.log(`🎯 Overall Status: ${summary.overall_status.toUpperCase()}`);
    console.log(`📈 Quality Score: ${summary.quality_score.toFixed(1)}%`);
    console.log(`✅ Passed Gates: ${summary.passed_gates}/${summary.total_gates}`);
    console.log(`❌ Failed Gates: ${summary.failed_gates}`);
    console.log(`👥 Manual Reviews Required: ${summary.manual_reviews_required}`);
    console.log(`🚨 Critical Failures: ${summary.critical_failures}`);
    console.log(`⚠️  High Priority Failures: ${summary.high_priority_failures}`);
    console.log(`📊 Average Score: ${(summary.average_score * 100).toFixed(1)}%`);

    // Individual gate results
    console.log('\n🏗️  Individual Gate Results:');
    execution.results.forEach((result, index) => {
      const gate = this.qualityEngine.qualityGates.get(result.gate_id);
      const status = result.status === 'passed' ? '✅' : '❌';
      const score = result.final_result?.score ? `(${(result.final_result.score * 100).toFixed(1)}%)` : '';

      console.log(`   ${index + 1}. ${status} ${gate?.name || result.gate_id} ${score}`);

      if (result.status === 'failed') {
        console.log(`      Reason: ${result.final_result?.reason || 'Unknown'}`);
      }

      if (result.manual_review_required) {
        console.log(`      👥 Manual review required`);
      }

      if (result.final_result?.violations && result.final_result.violations.length > 0) {
        console.log(`      ⚠️  ${result.final_result.violations.length} violations`);
      }
    });

    // Recommendations
    if (summary.recommendations && summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.gate_name} (${rec.severity} priority)`);
        rec.suggestions.forEach(suggestion => {
          console.log(`      • ${suggestion}`);
        });
      });
    }

    console.log(`\n⏱️  Execution Time: ${execution.metadata.execution_duration_ms}ms`);
    console.log('='.repeat(70));
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🧪 Running Quality Gate Enforcement Examples');
    console.log('=' .repeat(70));

    try {
      // Example 1: Node.js API
      await this.exampleNodeJsAPI();

      // Example 2: React Frontend
      await this.exampleReactFrontend();

      // Example 3: Financial System
      await this.exampleFinancialSystem();

      // Example 4: Custom Quality Gate
      await this.exampleCustomQualityGate();

      // Example 5: Quality Gate Evolution
      await this.exampleQualityGateEvolution();

      // Display system statistics
      const stats = this.qualityEngine.getStatistics();
      console.log('\n📈 System Statistics:');
      console.log(`   Total Gates: ${stats.total_gates}`);
      console.log(`   Enabled Gates: ${stats.enabled_gates}`);
      console.log(`   Active Checks: ${stats.active_checks}`);
      console.log(`   Results History: ${stats.history_size}`);
      console.log(`   CI/CD Integrations: ${stats.cicd_integrations}`);

      // Display recent history
      const history = this.qualityEngine.getResultsHistory(3);
      console.log('\n📋 Recent Execution History:');
      history.forEach((execution, index) => {
        console.log(`   ${index + 1}. ${execution.execution_id} - ${execution.summary.overall_status} (${execution.summary.quality_score.toFixed(1)}%)`);
      });

    } catch (error) {
      console.error('Example execution failed:', error);
    }
  }

  /**
   * Demonstrate CI/CD integration
   */
  async demonstrateCICDIntegration() {
    console.log('\n🔗 CI/CD Integration Demonstration');
    console.log('=' .repeat(70));

    const target = {
      id: 'cicd_demo_project',
      type: 'web_application',
      name: 'CI/CD Demo Project'
    };

    const context = {
      technology_stack: ['react', 'nodejs'],
      project_type: 'web_app',
      cicd_pipeline: 'github_actions'
    };

    try {
      // Execute quality gates
      const execution = await this.qualityEngine.executeQualityGates(target, context);

      // Trigger CI/CD pipeline based on results
      if (execution.summary.overall_status === 'passed') {
        console.log('🚀 Quality gates passed - triggering deployment pipeline...');

        const githubIntegration = this.qualityEngine.cicdIntegrations.get('github_actions');
        if (githubIntegration) {
          const triggerResult = await githubIntegration.triggerCheck(execution);
          console.log(`   Pipeline triggered: ${triggerResult.workflow_id}`);

          // Check pipeline status
          setTimeout(async () => {
            const status = await githubIntegration.getStatus(triggerResult.workflow_id);
            console.log(`   Pipeline status: ${status.status} (${status.conclusion})`);
          }, 2000);
        }
      } else {
        console.log('❌ Quality gates failed - blocking deployment pipeline');
      }

      return execution;

    } catch (error) {
      console.error('CI/CD integration demonstration failed:', error);
      throw error;
    }
  }

  /**
   * Demonstrate quality gate configuration
   */
  async demonstrateConfiguration() {
    console.log('\n⚙️  Configuration Demonstration');
    console.log('=' .repeat(70));

    // Export current configuration
    const config = this.qualityEngine.exportConfiguration();
    console.log('📋 Current Configuration:');
    console.log(`   Total Gates: ${config.gates.length}`);
    console.log(`   Quality Threshold: ${config.options.qualityThreshold}`);
    console.log(`   Strict Mode: ${config.options.strictMode}`);
    console.log(`   Max Concurrent Checks: ${config.options.maxConcurrentChecks}`);

    // Display gate details
    console.log('\n🏗️  Quality Gates:');
    config.gates.forEach((gate, index) => {
      console.log(`   ${index + 1}. ${gate.name} (${gate.type}) - ${gate.severity} priority`);
      console.log(`      Automated: ${gate.automated}, Manual Review: ${gate.manualReview}`);
    });

    // Create backup configuration
    console.log('\n💾 Configuration exported successfully');

    return config;
  }
}

// Export for use in other modules
module.exports = QualityGateEnforcementExample;

// If run directly, execute examples
if (require.main === module) {
  const example = new QualityGateEnforcementExample();

  // Run examples based on command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    example.runAllExamples();
  } else if (args.includes('--cicd')) {
    example.demonstrateCICDIntegration();
  } else if (args.includes('--config')) {
    example.demonstrateConfiguration();
  } else if (args.includes('--evolution')) {
    example.exampleQualityGateEvolution();
  } else {
    // Run Node.js API example by default
    example.exampleNodeJsAPI().catch(console.error);
  }
}