/**
 * Pattern Manager
 *
 * High-level interface for pattern management operations
 * Provides business logic layer over the pattern storage system
 */

const PatternStorage = require('./pattern-storage');
const EventEmitter = require('events');

class PatternManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.storage = new PatternStorage(options);
    this.autoApplyEnabled = options.autoApplyEnabled !== false;
    this.recommendationEnabled = options.recommendationEnabled !== false;
    this.learningEnabled = options.learningEnabled !== false;

    this.eventLog = [];
    this.maxEventLogSize = options.maxEventLogSize || 1000;
  }

  /**
   * Initialize the pattern manager
   */
  async initialize() {
    await this.storage.initialize();
    this.emit('initialized', { patternCount: this.storage.patterns.size });
  }

  /**
   * Create a new actionable pattern
   */
  async createPattern(patternData) {
    try {
      // Validate pattern data
      this.validatePatternData(patternData);

      // Enrich pattern with metadata
      const enrichedPattern = await this.enrichPattern(patternData);

      // Store pattern
      const storedPattern = await this.storage.storePattern(enrichedPattern);

      // Log event
      this.logEvent('pattern_created', {
        patternId: storedPattern.id,
        patternType: storedPattern.metadata.pattern_type,
        confidence: storedPattern.confidence_score
      });

      this.emit('pattern_created', storedPattern);
      return storedPattern;
    } catch (error) {
      this.logEvent('pattern_creation_failed', {
        error: error.message,
        patternData: patternData
      });
      throw error;
    }
  }

  /**
   * Validate pattern data before creation
   */
  validatePatternData(patternData) {
    if (!patternData.name || typeof patternData.name !== 'string') {
      throw new Error('Pattern name is required and must be a string');
    }

    if (!patternData.description || typeof patternData.description !== 'string') {
      throw new Error('Pattern description is required and must be a string');
    }

    if (!Array.isArray(patternData.trigger_conditions) || patternData.trigger_conditions.length === 0) {
      throw new Error('Pattern must have at least one trigger condition');
    }

    if (!patternData.auto_apply_actions || !Array.isArray(patternData.auto_apply_actions)) {
      throw new Error('Pattern must have auto-apply actions');
    }

    // Validate confidence score
    if (typeof patternData.confidence_score !== 'number' ||
        patternData.confidence_score < 0 || patternData.confidence_score > 1) {
      throw new Error('Confidence score must be a number between 0 and 1');
    }

    // Validate success rate
    if (typeof patternData.success_rate !== 'number' ||
        patternData.success_rate < 0 || patternData.success_rate > 1) {
      throw new Error('Success rate must be a number between 0 and 1');
    }
  }

  /**
   * Enrich pattern with additional metadata
   */
  async enrichPattern(patternData) {
    const now = new Date().toISOString();
    const patternId = patternData.id || this.generatePatternId(patternData.name);

    const enriched = {
      ...patternData,
      id: patternId,
      metadata: {
        ...patternData.metadata,
        created_at: patternData.metadata?.created_at || now,
        last_updated: now,
        pattern_type: patternData.metadata?.pattern_type || this.inferPatternType(patternData),
        version: patternData.metadata?.version || '1.0.0',
        author_mode: patternData.metadata?.author_mode || 'framework-enhancement-architect',
        usage_statistics: {
          total_applications: 0,
          successful_applications: 0,
          failed_applications: 0,
          average_quality_impact: 0,
          last_success_rate_calculation: now
        }
      }
    };

    return enriched;
  }

  /**
   * Generate a unique pattern ID
   */
  generatePatternId(name) {
    const baseName = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50);

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return `${baseName}_v1_${timestamp}_${random}`;
  }

  /**
   * Infer pattern type from pattern data
   */
  inferPatternType(patternData) {
    const description = patternData.description.toLowerCase();
    const triggerConditions = patternData.trigger_conditions.join(' ').toLowerCase();

    if (description.includes('security') || triggerConditions.includes('auth') || triggerConditions.includes('security')) {
      return 'security';
    } else if (description.includes('performance') || triggerConditions.includes('performance') || triggerConditions.includes('slow')) {
      return 'performance';
    } else if (description.includes('architecture') || triggerConditions.includes('architecture') || triggerConditions.includes('design')) {
      return 'architecture';
    } else if (description.includes('quality') || triggerConditions.includes('test') || triggerConditions.includes('quality')) {
      return 'quality';
    } else if (description.includes('integration') || triggerConditions.includes('api') || triggerConditions.includes('service')) {
      return 'integration';
    } else if (description.includes('deployment') || triggerConditions.includes('deploy') || triggerConditions.includes('infrastructure')) {
      return 'deployment';
    }

    return 'general';
  }

  /**
   * Find patterns matching current context
   */
  async findMatchingPatterns(context, options = {}) {
    const filters = {
      context_match: context,
      sort_by: options.sortBy || 'confidence',
      limit: options.limit || 10
    };

    if (options.confidenceThreshold) {
      filters.confidence_threshold = options.confidenceThreshold;
    }

    if (options.patternType) {
      filters.pattern_type = options.patternType;
    }

    const patterns = await this.storage.getPatterns(filters);

    this.logEvent('patterns_matched', {
      context: context,
      patternCount: patterns.length,
      options: options
    });

    return patterns;
  }

  /**
   * Get patterns suitable for auto-application
   */
  async getAutoApplyPatterns(context = {}) {
    if (!this.autoApplyEnabled) {
      return [];
    }

    const patterns = await this.storage.getAutoApplyPatterns(context);

    this.logEvent('auto_apply_patterns_retrieved', {
      context: context,
      patternCount: patterns.length
    });

    return patterns;
  }

  /**
   * Get recommended patterns for current context
   */
  async getRecommendations(context = {}, limit = 5) {
    if (!this.recommendationEnabled) {
      return [];
    }

    const recommendations = await this.storage.getRecommendedPatterns(context, limit);

    this.logEvent('recommendations_generated', {
      context: context,
      recommendationCount: recommendations.length
    });

    return recommendations;
  }

  /**
   * Apply a pattern and track results
   */
  async applyPattern(patternId, context = {}, success = null) {
    try {
      const pattern = await this.storage.getPattern(patternId);

      // Execute auto-apply actions
      const results = await this.executePatternActions(pattern, context);

      // Update pattern statistics if success is known
      if (success !== null) {
        await this.storage.updatePatternStats(patternId, success);
      }

      // Log application event
      this.logEvent('pattern_applied', {
        patternId: patternId,
        context: context,
        success: success,
        actionsExecuted: results.length
      });

      this.emit('pattern_applied', {
        pattern: pattern,
        context: context,
        results: results,
        success: success
      });

      return results;
    } catch (error) {
      this.logEvent('pattern_application_failed', {
        patternId: patternId,
        error: error.message,
        context: context
      });
      throw error;
    }
  }

  /**
   * Execute pattern auto-apply actions
   */
  async executePatternActions(pattern, context) {
    const results = [];

    for (const action of pattern.auto_apply_actions) {
      try {
        const result = await this.executeAction(action, context);
        results.push({
          action: action,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          action: action,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  async executeAction(action, context) {
    switch (action.action_type) {
      case 'task_creation':
        return await this.createTaskFromAction(action, context);
      case 'quality_gate':
        return await this.enforceQualityGate(action, context);
      case 'workflow_optimization':
        return await this.optimizeWorkflow(action, context);
      default:
        throw new Error(`Unknown action type: ${action.action_type}`);
    }
  }

  /**
   * Create a task from pattern action
   */
  async createTaskFromAction(action, context) {
    const taskTemplate = action.task_template;

    // Generate task ID
    const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const task = {
      id: taskId,
      title: this.interpolateTemplate(taskTemplate.title, context),
      description: this.interpolateTemplate(taskTemplate.description, context),
      acceptance_criteria: taskTemplate.acceptance_criteria.map(criteria =>
        this.interpolateTemplate(criteria, context)
      ),
      priority: taskTemplate.priority,
      tags: taskTemplate.tags || [],
      estimated_effort: taskTemplate.estimated_effort,
      dependencies: taskTemplate.dependencies || [],
      created_from_pattern: action.task_template,
      context: context
    };

    // Here you would integrate with the actual task management system
    // For now, we'll just return the task structure
    return task;
  }

  /**
   * Enforce a quality gate
   */
  async enforceQualityGate(action, context) {
    // Here you would integrate with the quality gate enforcement system
    // For now, return a placeholder result
    return {
      gate_type: action.quality_gate_type || 'general',
      status: 'enforced',
      context: context
    };
  }

  /**
   * Optimize workflow
   */
  async optimizeWorkflow(action, context) {
    // Here you would integrate with workflow optimization systems
    // For now, return a placeholder result
    return {
      optimization_type: action.optimization_type || 'general',
      status: 'applied',
      context: context
    };
  }

  /**
   * Interpolate template variables with context
   */
  interpolateTemplate(template, context) {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return this.getNestedValue(context, path) || match;
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Update pattern confidence based on application results
   */
  async updatePatternConfidence(patternId, success, qualityImpact = 0) {
    if (!this.learningEnabled) {
      return;
    }

    const pattern = await this.storage.getPattern(patternId);
    const currentConfidence = pattern.confidence_score;

    // Simple confidence adjustment algorithm
    let confidenceAdjustment = 0;

    if (success) {
      confidenceAdjustment = 0.05; // Increase confidence for success
      if (qualityImpact > 0) {
        confidenceAdjustment += 0.02; // Bonus for positive quality impact
      }
    } else {
      confidenceAdjustment = -0.1; // Decrease confidence for failure
      if (qualityImpact < 0) {
        confidenceAdjustment -= 0.05; // Penalty for negative quality impact
      }
    }

    const newConfidence = Math.max(0.1, Math.min(0.95, currentConfidence + confidenceAdjustment));

    await this.storage.updatePatternStats(patternId, success, newConfidence);

    this.logEvent('confidence_updated', {
      patternId: patternId,
      oldConfidence: currentConfidence,
      newConfidence: newConfidence,
      success: success,
      qualityImpact: qualityImpact
    });

    return newConfidence;
  }

  /**
   * Get pattern statistics and analytics
   */
  async getPatternAnalytics(options = {}) {
    const stats = await this.storage.getStatistics();

    // Add additional analytics
    const analytics = {
      ...stats,
      recent_activity: await this.getRecentActivity(options.days || 30),
      top_performing_patterns: await this.getTopPerformingPatterns(options.limit || 10),
      pattern_effectiveness_trends: await this.getEffectivenessTrends(options.months || 3)
    };

    return analytics;
  }

  /**
   * Get recent pattern activity
   */
  async getRecentActivity(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEvents = this.eventLog.filter(event =>
      new Date(event.timestamp) > cutoffDate
    );

    return recentEvents;
  }

  /**
   * Get top performing patterns
   */
  async getTopPerformingPatterns(limit = 10) {
    const patterns = Array.from(this.storage.patterns.values());

    return patterns
      .sort((a, b) => {
        // Sort by success rate, then by confidence, then by application count
        if (b.success_rate !== a.success_rate) {
          return b.success_rate - a.success_rate;
        }
        if (b.confidence_score !== a.confidence_score) {
          return b.confidence_score - a.confidence_score;
        }
        const aApplications = a.metadata.usage_statistics?.total_applications || 0;
        const bApplications = b.metadata.usage_statistics?.total_applications || 0;
        return bApplications - aApplications;
      })
      .slice(0, limit);
  }

  /**
   * Get pattern effectiveness trends
   */
  async getEffectivenessTrends(months = 3) {
    // This would analyze historical data for trends
    // For now, return placeholder data
    return {
      overall_trend: 'improving',
      confidence_trend: 'stable',
      success_rate_trend: 'improving',
      application_trend: 'increasing',
      months_analyzed: months
    };
  }

  /**
   * Search patterns with advanced filtering
   */
  async searchPatterns(query, filters = {}) {
    const searchResults = await this.storage.searchPatterns(query, filters);

    this.logEvent('pattern_search_executed', {
      query: query,
      filters: filters,
      resultCount: searchResults.length
    });

    return searchResults;
  }

  /**
   * Export patterns in various formats
   */
  async exportPatterns(format = 'json', options = {}) {
    return await this.storage.exportPatterns({ format, ...options });
  }

  /**
   * Import patterns from external sources
   */
  async importPatterns(data, options = {}) {
    let patterns = [];

    if (typeof data === 'string') {
      if (options.format === 'csv') {
        patterns = this.parseCSVPatterns(data);
      } else {
        const parsed = JSON.parse(data);
        patterns = parsed.patterns || parsed;
      }
    } else if (Array.isArray(data)) {
      patterns = data;
    } else if (data.patterns) {
      patterns = data.patterns;
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const patternData of patterns) {
      try {
        await this.createPattern(patternData);
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          pattern: patternData.name || patternData.id,
          error: error.message
        });
      }
    }

    this.logEvent('patterns_imported', results);
    return results;
  }

  /**
   * Parse CSV format patterns
   */
  parseCSVPatterns(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

    const patterns = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
      if (values.length === headers.length) {
        const pattern = {};
        headers.forEach((header, index) => {
          pattern[header] = values[index];
        });
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Log an event for auditing and analytics
   */
  logEvent(eventType, data) {
    const event = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      data: data
    };

    this.eventLog.push(event);

    // Maintain event log size
    if (this.eventLog.length > this.maxEventLogSize) {
      this.eventLog.shift();
    }

    this.emit('event_logged', event);
  }

  /**
   * Get event log
   */
  getEventLog(options = {}) {
    let events = [...this.eventLog];

    if (options.eventType) {
      events = events.filter(e => e.event_type === options.eventType);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      events = events.filter(e => new Date(e.timestamp) > sinceDate);
    }

    if (options.limit) {
      events = events.slice(-options.limit);
    }

    return events;
  }

  /**
   * Cleanup old data and optimize storage
   */
  async cleanup(options = {}) {
    const cleanupResults = await this.storage.cleanup(options);

    this.logEvent('cleanup_executed', {
      options: options,
      results: cleanupResults
    });

    return cleanupResults;
  }
}

module.exports = PatternManager;