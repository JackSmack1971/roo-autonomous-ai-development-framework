/**
 * Context Analyzer
 *
 * Analyzes current project context to understand the environment,
 * requirements, constraints, and characteristics for pattern matching
 */

const EventEmitter = require('events');

class ContextAnalyzer extends EventEmitter {
  constructor(options = {}) {
    super();

    this.analysisDepth = options.analysisDepth || 'comprehensive';
    this.contextHistorySize = options.contextHistorySize || 10;
    this.confidenceThreshold = options.confidenceThreshold || 0.7;

    // Context dimensions to analyze
    this.contextDimensions = {
      technical: ['technology_stack', 'architecture_pattern', 'infrastructure'],
      organizational: ['team_size', 'development_methodology', 'company_size'],
      project: ['project_type', 'timeline', 'budget', 'complexity'],
      environmental: ['deployment_environment', 'compliance_requirements', 'geographic_distribution'],
      quality: ['quality_requirements', 'testing_strategy', 'monitoring_needs'],
      security: ['security_level', 'data_sensitivity', 'compliance_framework']
    };

    this.contextHistory = [];
  }

  /**
   * Analyze current project context comprehensively
   */
  async analyzeContext(rawContext = {}, options = {}) {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const contextAnalysis = {
      analysis_id: analysisId,
      timestamp: new Date().toISOString(),
      raw_context: rawContext,
      analysis_depth: options.depth || this.analysisDepth,
      context_dimensions: {},
      context_quality: {},
      context_characteristics: {},
      context_insights: [],
      context_recommendations: [],
      context_risks: [],
      metadata: {}
    };

    try {
      // Analyze each context dimension
      for (const [dimension, fields] of Object.entries(this.contextDimensions)) {
        contextAnalysis.context_dimensions[dimension] = await this.analyzeDimension(
          dimension,
          fields,
          rawContext
        );
      }

      // Assess overall context quality
      contextAnalysis.context_quality = this.assessContextQuality(rawContext);

      // Identify context characteristics
      contextAnalysis.context_characteristics = this.identifyCharacteristics(rawContext);

      // Generate context insights
      contextAnalysis.context_insights = this.generateContextInsights(contextAnalysis);

      // Generate context recommendations
      contextAnalysis.context_recommendations = this.generateContextRecommendations(contextAnalysis);

      // Identify context risks
      contextAnalysis.context_risks = this.identifyContextRisks(contextAnalysis);

      // Add metadata
      contextAnalysis.metadata = {
        analysis_duration_ms: Date.now() - new Date(contextAnalysis.timestamp).getTime(),
        context_completeness_score: this.calculateCompletenessScore(rawContext),
        analysis_confidence: this.assessAnalysisConfidence(contextAnalysis)
      };

      // Store in history
      this.storeContextAnalysis(contextAnalysis);

      this.emit('context_analyzed', contextAnalysis);

      return contextAnalysis;

    } catch (error) {
      contextAnalysis.error = error.message;
      this.emit('context_analysis_failed', {
        analysis_id: analysisId,
        error: error.message,
        raw_context: rawContext
      });
      throw error;
    }
  }

  /**
   * Analyze a specific context dimension
   */
  async analyzeDimension(dimension, fields, rawContext) {
    const dimensionAnalysis = {
      dimension: dimension,
      fields_analyzed: {},
      completeness_score: 0,
      confidence_score: 0,
      insights: [],
      recommendations: []
    };

    let analyzedFields = 0;
    let totalFields = fields.length;

    for (const field of fields) {
      const fieldAnalysis = this.analyzeContextField(field, rawContext[field]);
      dimensionAnalysis.fields_analyzed[field] = fieldAnalysis;

      if (fieldAnalysis.has_value) {
        analyzedFields++;
      }
    }

    // Calculate dimension completeness
    dimensionAnalysis.completeness_score = totalFields > 0 ? analyzedFields / totalFields : 0;

    // Calculate dimension confidence
    dimensionAnalysis.confidence_score = this.calculateDimensionConfidence(dimensionAnalysis);

    // Generate dimension-specific insights
    dimensionAnalysis.insights = this.generateDimensionInsights(dimension, dimensionAnalysis);

    return dimensionAnalysis;
  }

  /**
   * Analyze a specific context field
   */
  analyzeContextField(fieldName, fieldValue) {
    const fieldAnalysis = {
      field_name: fieldName,
      has_value: fieldValue !== undefined && fieldValue !== null && fieldValue !== '',
      value: fieldValue,
      value_type: typeof fieldValue,
      quality_score: 0,
      validation_status: 'unknown',
      insights: []
    };

    if (fieldAnalysis.has_value) {
      // Assess field quality
      fieldAnalysis.quality_score = this.assessFieldQuality(fieldName, fieldValue);

      // Validate field value
      fieldAnalysis.validation_status = this.validateFieldValue(fieldName, fieldValue);

      // Generate field insights
      fieldAnalysis.insights = this.generateFieldInsights(fieldName, fieldValue);
    }

    return fieldAnalysis;
  }

  /**
   * Assess quality of a context field
   */
  assessFieldQuality(fieldName, fieldValue) {
    let qualityScore = 0.5; // Base score

    // Field-specific quality assessment
    switch (fieldName) {
      case 'technology_stack':
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          qualityScore = Math.min(1.0, fieldValue.length / 5); // More technologies = higher quality
        }
        break;

      case 'team_size':
        const validSizes = ['individual', 'small_team', 'large_team'];
        qualityScore = validSizes.includes(fieldValue) ? 1.0 : 0.3;
        break;

      case 'project_type':
        const validTypes = ['web_app', 'mobile_app', 'api_service', 'microservices', 'data_pipeline'];
        qualityScore = validTypes.includes(fieldValue) ? 1.0 : 0.5;
        break;

      case 'timeline':
        const validTimelines = ['rush', 'normal', 'extended'];
        qualityScore = validTimelines.includes(fieldValue) ? 1.0 : 0.5;
        break;

      case 'budget':
        const validBudgets = ['low', 'medium', 'high', 'unlimited'];
        qualityScore = validBudgets.includes(fieldValue) ? 1.0 : 0.5;
        break;

      default:
        // Generic quality assessment
        if (typeof fieldValue === 'string' && fieldValue.length > 0) {
          qualityScore = Math.min(1.0, fieldValue.length / 100); // Longer descriptions = higher quality
        } else if (Array.isArray(fieldValue)) {
          qualityScore = Math.min(1.0, fieldValue.length / 10);
        } else if (typeof fieldValue === 'boolean') {
          qualityScore = 1.0;
        } else if (typeof fieldValue === 'number') {
          qualityScore = 1.0;
        }
    }

    return qualityScore;
  }

  /**
   * Validate field value
   */
  validateFieldValue(fieldName, fieldValue) {
    // Field-specific validation rules
    const validationRules = {
      technology_stack: (value) => Array.isArray(value) && value.length > 0,
      team_size: (value) => ['individual', 'small_team', 'large_team'].includes(value),
      project_type: (value) => ['web_app', 'mobile_app', 'api_service', 'microservices', 'data_pipeline'].includes(value),
      timeline: (value) => ['rush', 'normal', 'extended'].includes(value),
      budget: (value) => ['low', 'medium', 'high', 'unlimited'].includes(value),
      complexity: (value) => ['low', 'medium', 'high'].includes(value),
      security_level: (value) => ['basic', 'standard', 'high', 'critical'].includes(value)
    };

    const rule = validationRules[fieldName];
    if (rule) {
      return rule(fieldValue) ? 'valid' : 'invalid';
    }

    // Generic validation
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      return 'missing';
    }

    return 'valid';
  }

  /**
   * Generate insights for a specific field
   */
  generateFieldInsights(fieldName, fieldValue) {
    const insights = [];

    switch (fieldName) {
      case 'technology_stack':
        if (Array.isArray(fieldValue)) {
          if (fieldValue.includes('react') && fieldValue.includes('nodejs')) {
            insights.push({
              type: 'technology_coherence',
              message: 'Full-stack JavaScript technology stack detected',
              impact: 'positive'
            });
          }
          if (fieldValue.length > 5) {
            insights.push({
              type: 'technology_complexity',
              message: 'Large technology stack may increase complexity',
              impact: 'warning'
            });
          }
        }
        break;

      case 'team_size':
        if (fieldValue === 'individual') {
          insights.push({
            type: 'team_constraint',
            message: 'Individual developer - consider automation and tooling',
            impact: 'info'
          });
        }
        break;

      case 'timeline':
        if (fieldValue === 'rush') {
          insights.push({
            type: 'timeline_pressure',
            message: 'Tight timeline - prioritize core functionality',
            impact: 'warning'
          });
        }
        break;

      case 'budget':
        if (fieldValue === 'low') {
          insights.push({
            type: 'budget_constraint',
            message: 'Limited budget - focus on cost-effective solutions',
            impact: 'info'
          });
        }
        break;
    }

    return insights;
  }

  /**
   * Calculate dimension confidence
   */
  calculateDimensionConfidence(dimensionAnalysis) {
    const fields = Object.values(dimensionAnalysis.fields_analyzed);
    if (fields.length === 0) return 0;

    const validFields = fields.filter(f => f.validation_status === 'valid');
    const highQualityFields = fields.filter(f => f.quality_score > 0.7);

    const validityScore = validFields.length / fields.length;
    const qualityScore = highQualityFields.length / fields.length;

    return (validityScore + qualityScore) / 2;
  }

  /**
   * Generate dimension-specific insights
   */
  generateDimensionInsights(dimension, dimensionAnalysis) {
    const insights = [];

    if (dimensionAnalysis.completeness_score < 0.5) {
      insights.push({
        type: 'incomplete_dimension',
        message: `${dimension} context is incomplete - consider providing more details`,
        impact: 'warning'
      });
    }

    if (dimensionAnalysis.confidence_score < 0.6) {
      insights.push({
        type: 'low_confidence_dimension',
        message: `${dimension} context has low confidence - review and validate information`,
        impact: 'warning'
      });
    }

    // Dimension-specific insights
    switch (dimension) {
      case 'technical':
        if (dimensionAnalysis.completeness_score > 0.8) {
          insights.push({
            type: 'strong_technical_context',
            message: 'Strong technical context enables precise pattern matching',
            impact: 'positive'
          });
        }
        break;

      case 'security':
        if (dimensionAnalysis.completeness_score > 0.7) {
          insights.push({
            type: 'security_conscious',
            message: 'Good security context - security patterns will be highly relevant',
            impact: 'positive'
          });
        }
        break;

      case 'organizational':
        if (dimensionAnalysis.completeness_score < 0.3) {
          insights.push({
            type: 'organizational_context_missing',
            message: 'Limited organizational context - team-based patterns may be less accurate',
            impact: 'info'
          });
        }
        break;
    }

    return insights;
  }

  /**
   * Assess overall context quality
   */
  assessContextQuality(rawContext) {
    const qualityAssessment = {
      overall_score: 0,
      completeness_score: 0,
      validation_score: 0,
      quality_score: 0,
      dimensions_covered: 0,
      total_dimensions: Object.keys(this.contextDimensions).length
    };

    // Calculate completeness
    const totalFields = Object.values(this.contextDimensions).flat().length;
    let filledFields = 0;

    for (const fields of Object.values(this.contextDimensions)) {
      for (const field of fields) {
        if (rawContext[field] !== undefined && rawContext[field] !== null && rawContext[field] !== '') {
          filledFields++;
        }
      }
    }

    qualityAssessment.completeness_score = totalFields > 0 ? filledFields / totalFields : 0;

    // Count covered dimensions
    for (const [dimension, fields] of Object.entries(this.contextDimensions)) {
      const hasAnyField = fields.some(field => rawContext[field] !== undefined);
      if (hasAnyField) {
        qualityAssessment.dimensions_covered++;
      }
    }

    // Calculate overall score
    qualityAssessment.overall_score =
      (qualityAssessment.completeness_score * 0.4) +
      ((qualityAssessment.dimensions_covered / qualityAssessment.total_dimensions) * 0.6);

    return qualityAssessment;
  }

  /**
   * Identify context characteristics
   */
  identifyCharacteristics(rawContext) {
    const characteristics = {
      technology_focus: this.identifyTechnologyFocus(rawContext),
      development_style: this.identifyDevelopmentStyle(rawContext),
      risk_profile: this.identifyRiskProfile(rawContext),
      complexity_profile: this.identifyComplexityProfile(rawContext),
      resource_profile: this.identifyResourceProfile(rawContext)
    };

    return characteristics;
  }

  /**
   * Identify technology focus
   */
  identifyTechnologyFocus(context) {
    const techStack = context.technology_stack || [];

    if (techStack.includes('react') || techStack.includes('vue') || techStack.includes('angular')) {
      return 'frontend_focused';
    } else if (techStack.includes('nodejs') || techStack.includes('python') || techStack.includes('java')) {
      return 'backend_focused';
    } else if (techStack.includes('aws') || techStack.includes('azure') || techStack.includes('gcp')) {
      return 'cloud_focused';
    } else if (techStack.includes('kubernetes') || techStack.includes('docker')) {
      return 'infrastructure_focused';
    } else {
      return 'general';
    }
  }

  /**
   * Identify development style
   */
  identifyDevelopmentStyle(context) {
    const teamSize = context.team_size;
    const methodology = context.development_methodology;

    if (teamSize === 'individual') {
      return 'solo_development';
    } else if (methodology === 'agile' || methodology === 'scrum') {
      return 'agile_development';
    } else if (methodology === 'waterfall') {
      return 'structured_development';
    } else {
      return 'standard_development';
    }
  }

  /**
   * Identify risk profile
   */
  identifyRiskProfile(context) {
    let riskScore = 0;

    if (context.timeline === 'rush') riskScore += 0.3;
    if (context.budget === 'low') riskScore += 0.2;
    if (context.complexity === 'high') riskScore += 0.3;
    if (context.team_size === 'individual') riskScore += 0.2;
    if (context.security_level === 'critical') riskScore += 0.3;
    if (context.is_production === true) riskScore += 0.2;

    if (riskScore >= 0.8) return 'high_risk';
    if (riskScore >= 0.5) return 'medium_risk';
    if (riskScore >= 0.2) return 'low_risk';
    return 'minimal_risk';
  }

  /**
   * Identify complexity profile
   */
  identifyComplexityProfile(context) {
    const complexity = context.complexity;
    const techStack = context.technology_stack || [];
    const architecture = context.architecture_pattern;

    if (complexity === 'high' || techStack.length > 5 || architecture === 'microservices') {
      return 'high_complexity';
    } else if (complexity === 'medium' || (techStack.length >= 3 && techStack.length <= 5)) {
      return 'medium_complexity';
    } else {
      return 'low_complexity';
    }
  }

  /**
   * Identify resource profile
   */
  identifyResourceProfile(context) {
    const teamSize = context.team_size;
    const budget = context.budget;
    const timeline = context.timeline;

    if (teamSize === 'large_team' && budget === 'high' && timeline !== 'rush') {
      return 'resource_rich';
    } else if (teamSize === 'individual' || budget === 'low' || timeline === 'rush') {
      return 'resource_constrained';
    } else {
      return 'balanced_resources';
    }
  }

  /**
   * Generate context insights
   */
  generateContextInsights(contextAnalysis) {
    const insights = [];

    const quality = contextAnalysis.context_quality;
    const characteristics = contextAnalysis.context_characteristics;

    // Quality-based insights
    if (quality.overall_score > 0.8) {
      insights.push({
        type: 'high_quality_context',
        message: 'High-quality context enables precise pattern matching and recommendations',
        impact: 'positive',
        confidence: 0.9
      });
    } else if (quality.overall_score < 0.5) {
      insights.push({
        type: 'low_quality_context',
        message: 'Limited context information may reduce pattern matching accuracy',
        impact: 'warning',
        confidence: 0.8
      });
    }

    // Characteristic-based insights
    if (characteristics.risk_profile === 'high_risk') {
      insights.push({
        type: 'high_risk_profile',
        message: 'High-risk profile detected - conservative pattern recommendations advised',
        impact: 'warning',
        confidence: 0.85
      });
    }

    if (characteristics.technology_focus === 'cloud_focused') {
      insights.push({
        type: 'cloud_focused',
        message: 'Cloud-focused technology stack - cloud-native patterns will be most relevant',
        impact: 'info',
        confidence: 0.9
      });
    }

    if (characteristics.resource_profile === 'resource_constrained') {
      insights.push({
        type: 'resource_constrained',
        message: 'Resource constraints detected - focus on efficient, low-overhead patterns',
        impact: 'info',
        confidence: 0.8
      });
    }

    return insights;
  }

  /**
   * Generate context recommendations
   */
  generateContextRecommendations(contextAnalysis) {
    const recommendations = [];

    const quality = contextAnalysis.context_quality;
    const characteristics = contextAnalysis.context_characteristics;

    // Quality-based recommendations
    if (quality.completeness_score < 0.7) {
      recommendations.push({
        type: 'improve_context_completeness',
        priority: 'medium',
        action: 'Provide additional context information for better pattern matching',
        rationale: 'More complete context enables more accurate pattern recommendations'
      });
    }

    // Characteristic-based recommendations
    if (characteristics.risk_profile === 'high_risk') {
      recommendations.push({
        type: 'risk_mitigation_patterns',
        priority: 'high',
        action: 'Prioritize patterns with strong error handling and rollback capabilities',
        rationale: 'High-risk context requires robust, fault-tolerant patterns'
      });
    }

    if (characteristics.complexity_profile === 'high_complexity') {
      recommendations.push({
        type: 'complexity_management',
        priority: 'medium',
        action: 'Consider patterns that help manage and reduce system complexity',
        rationale: 'High complexity context benefits from architectural simplification patterns'
      });
    }

    if (characteristics.development_style === 'solo_development') {
      recommendations.push({
        type: 'automation_focus',
        priority: 'medium',
        action: 'Prioritize automation and tooling patterns for individual developers',
        rationale: 'Solo development benefits from automation to improve efficiency'
      });
    }

    return recommendations;
  }

  /**
   * Identify context risks
   */
  identifyContextRisks(contextAnalysis) {
    const risks = [];

    const quality = contextAnalysis.context_quality;
    const characteristics = contextAnalysis.context_characteristics;

    // Quality-based risks
    if (quality.completeness_score < 0.4) {
      risks.push({
        type: 'incomplete_context',
        severity: 'high',
        description: 'Very limited context information increases risk of inappropriate pattern recommendations',
        mitigation: 'Gather more comprehensive context information before proceeding'
      });
    }

    // Characteristic-based risks
    if (characteristics.risk_profile === 'high_risk' && quality.completeness_score < 0.6) {
      risks.push({
        type: 'high_risk_incomplete_context',
        severity: 'critical',
        description: 'High-risk context with incomplete information significantly increases project risk',
        mitigation: 'Complete context assessment before applying any patterns'
      });
    }

    if (characteristics.complexity_profile === 'high_complexity' && characteristics.resource_profile === 'resource_constrained') {
      risks.push({
        type: 'complexity_resource_mismatch',
        severity: 'medium',
        description: 'High complexity with limited resources may lead to implementation challenges',
        mitigation: 'Consider simplifying architecture or increasing resource allocation'
      });
    }

    return risks;
  }

  /**
   * Calculate context completeness score
   */
  calculateCompletenessScore(rawContext) {
    const totalFields = Object.values(this.contextDimensions).flat().length;
    let filledFields = 0;

    for (const fields of Object.values(this.contextDimensions)) {
      for (const field of fields) {
        if (rawContext[field] !== undefined && rawContext[field] !== null && rawContext[field] !== '') {
          filledFields++;
        }
      }
    }

    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  /**
   * Assess analysis confidence
   */
  assessAnalysisConfidence(contextAnalysis) {
    const qualityScore = contextAnalysis.context_quality.overall_score;
    const completenessScore = this.calculateCompletenessScore(contextAnalysis.raw_context);

    // Analysis confidence is based on context quality and completeness
    return (qualityScore + completenessScore) / 2;
  }

  /**
   * Store context analysis in history
   */
  storeContextAnalysis(analysis) {
    this.contextHistory.push(analysis);

    // Maintain history size
    if (this.contextHistory.length > this.contextHistorySize) {
      this.contextHistory.shift();
    }
  }

  /**
   * Get context analysis history
   */
  getContextAnalysisHistory(options = {}) {
    let history = [...this.contextHistory];

    if (options.limit) {
      history = history.slice(-options.limit);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(analysis => new Date(analysis.timestamp) > sinceDate);
    }

    return history;
  }

  /**
   * Get context analysis statistics
   */
  getContextAnalysisStatistics() {
    const history = this.contextAnalysisHistory;

    if (history.length === 0) {
      return {
        total_analyses: 0,
        average_completeness: 0,
        average_quality: 0,
        average_confidence: 0
      };
    }

    const totalCompleteness = history.reduce((sum, analysis) =>
      sum + analysis.metadata.context_completeness_score, 0);
    const totalQuality = history.reduce((sum, analysis) =>
      sum + analysis.context_quality.overall_score, 0);
    const totalConfidence = history.reduce((sum, analysis) =>
      sum + analysis.metadata.analysis_confidence, 0);

    return {
      total_analyses: history.length,
      average_completeness: totalCompleteness / history.length,
      average_quality: totalQuality / history.length,
      average_confidence: totalConfidence / history.length
    };
  }

  /**
   * Export context analysis data
   */
  exportContextAnalysis(format = 'json') {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      context_history: this.contextHistory,
      statistics: this.getContextAnalysisStatistics(),
      configuration: {
        analysis_depth: this.analysisDepth,
        context_history_size: this.contextHistorySize,
        confidence_threshold: this.confidenceThreshold
      }
    };

    if (format === 'csv') {
      return this.convertAnalysisToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert analysis to CSV format
   */
  convertAnalysisToCSV(data) {
    let csv = 'ANALYSIS_ID,TIMESTAMP,CONTEXT_COMPLETENESS,CONTEXT_QUALITY,ANALYSIS_CONFIDENCE\n';

    for (const analysis of data.context_history) {
      csv += `${analysis.analysis_id},${analysis.timestamp},`;
      csv += `${analysis.metadata.context_completeness_score},`;
      csv += `${analysis.context_quality.overall_score},`;
      csv += `${analysis.metadata.analysis_confidence}\n`;
    }

    return csv;
  }
}

module.exports = ContextAnalyzer;