/**
 * Actionable Pattern Storage System
 *
 * Core system for storing, retrieving, and managing actionable patterns
 * with JSON structure, metadata management, and auto-apply functionality.
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class PatternStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PatternStorageError';
  }
}

class PatternStorage {
  constructor(options = {}) {
    this.storagePath = options.storagePath || path.join(__dirname, '..', 'data');
    this.schemaPath = options.schemaPath || path.join(__dirname, '..', 'schemas', 'pattern-schema.json');
    this.patternsFile = options.patternsFile || 'actionable-patterns.json';
    this.backupEnabled = options.backupEnabled !== false;
    this.compressionEnabled = options.compressionEnabled || false;

    this.patterns = new Map();
    this.schema = null;
    this.validator = null;
    this.initialized = false;
  }

  /**
   * Initialize the pattern storage system
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure storage directory exists
      await this.ensureStorageDirectory();

      // Load and validate schema
      await this.loadSchema();

      // Initialize validator
      this.initializeValidator();

      // Load existing patterns
      await this.loadPatterns();

      this.initialized = true;
      console.log(`Pattern storage initialized with ${this.patterns.size} patterns`);
    } catch (error) {
      console.error('Failed to initialize pattern storage:', error);
      throw error;
    }
  }

  /**
   * Ensure storage directory exists
   */
  async ensureStorageDirectory() {
    try {
      await fs.access(this.storagePath);
    } catch {
      await fs.mkdir(this.storagePath, { recursive: true });
    }
  }

  /**
   * Load and parse the pattern schema
   */
  async loadSchema() {
    try {
      const schemaContent = await fs.readFile(this.schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
    } catch (error) {
      throw new Error(`Failed to load pattern schema: ${error.message}`);
    }
  }

  /**
   * Initialize AJV validator with the loaded schema
   */
  initializeValidator() {
    const ajv = new Ajv({
      allErrors: true,
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true
    });

    addFormats(ajv);

    this.validator = ajv.compile(this.schema);
  }

  /**
   * Load existing patterns from storage
   */
  async loadPatterns() {
    const patternsFilePath = path.join(this.storagePath, this.patternsFile);

    try {
      const data = await fs.readFile(patternsFilePath, 'utf8');
      const patternsData = JSON.parse(data);

      if (patternsData.patterns && Array.isArray(patternsData.patterns)) {
        for (const pattern of patternsData.patterns) {
          if (this.validatePattern(pattern)) {
            this.patterns.set(pattern.id, pattern);
          } else {
            console.warn(`Skipping invalid pattern ${pattern.id}:`, this.validator.errors);
          }
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Failed to load existing patterns:', error.message);
      }
      // File doesn't exist, start with empty patterns
    }
  }

  /**
   * Validate a pattern against the schema
   */
  validatePattern(pattern) {
    if (!this.validator) {
      throw new Error('Validator not initialized');
    }

    const valid = this.validator(pattern);
    if (!valid) {
      console.error('Pattern validation failed:', this.validator.errors);
    }
    return valid;
  }

  /**
   * Store a new pattern or update an existing one
   */
  async storePattern(pattern) {
    await this.initialize();

    if (!this.validatePattern(pattern)) {
      throw new Error('Pattern validation failed');
    }

    // Create backup if enabled
    if (this.backupEnabled) {
      await this.createBackup(pattern.id);
    }

    // Update metadata
    const now = new Date().toISOString();
    if (!pattern.metadata) {
      pattern.metadata = {};
    }

    if (!pattern.metadata.created_at) {
      pattern.metadata.created_at = now;
    }

    pattern.metadata.last_updated = now;

    // Store pattern
    this.patterns.set(pattern.id, pattern);

    // Persist to storage
    await this.persistPatterns();

    console.log(`Pattern ${pattern.id} stored successfully`);
    return pattern;
  }

  /**
   * Retrieve a pattern by ID
   */
  async getPattern(patternId) {
    await this.initialize();

    const pattern = this.patterns.get(patternId);
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    return pattern;
  }

  /**
   * Retrieve patterns with filtering options
   */
  async getPatterns(filters = {}) {
    await this.initialize();

    let patterns = Array.from(this.patterns.values());

    // Apply filters
    if (filters.trigger_conditions) {
      patterns = patterns.filter(pattern =>
        filters.trigger_conditions.some(condition =>
          pattern.trigger_conditions.includes(condition)
        )
      );
    }

    if (filters.context_match) {
      patterns = patterns.filter(pattern =>
        this.matchesContext(pattern.context_match, filters.context_match)
      );
    }

    if (filters.confidence_threshold) {
      patterns = patterns.filter(pattern =>
        pattern.confidence_score >= filters.confidence_threshold
      );
    }

    if (filters.success_rate_threshold) {
      patterns = patterns.filter(pattern =>
        pattern.success_rate >= filters.success_rate_threshold
      );
    }

    if (filters.pattern_type) {
      patterns = patterns.filter(pattern =>
        pattern.metadata.pattern_type === filters.pattern_type
      );
    }

    if (filters.tags) {
      patterns = patterns.filter(pattern =>
        filters.tags.some(tag => pattern.metadata.tags?.includes(tag))
      );
    }

    // Apply sorting
    if (filters.sort_by) {
      patterns.sort((a, b) => {
        switch (filters.sort_by) {
          case 'confidence':
            return b.confidence_score - a.confidence_score;
          case 'success_rate':
            return b.success_rate - a.success_rate;
          case 'last_applied':
            return new Date(b.metadata.last_applied || 0) - new Date(a.metadata.last_applied || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    if (filters.limit) {
      const offset = filters.offset || 0;
      patterns = patterns.slice(offset, offset + filters.limit);
    }

    return patterns;
  }

  /**
   * Check if pattern context matches filter context
   */
  matchesContext(patternContext, filterContext) {
    if (!patternContext || !filterContext) {
      return true;
    }

    // Check required fields
    if (patternContext.required_fields) {
      for (const field of patternContext.required_fields) {
        if (!(field in filterContext)) {
          return false;
        }
      }
    }

    // Check excluded fields
    if (patternContext.excluded_fields) {
      for (const field of patternContext.excluded_fields) {
        if (field in filterContext) {
          return false;
        }
      }
    }

    // Check context filters
    if (patternContext.context_filters) {
      const filters = patternContext.context_filters;

      if (filters.technology_stack && filterContext.technology_stack) {
        const hasMatchingTech = filters.technology_stack.some(tech =>
          filterContext.technology_stack.includes(tech)
        );
        if (!hasMatchingTech) {
          return false;
        }
      }

      if (filters.project_type && filterContext.project_type) {
        if (!filters.project_type.includes(filterContext.project_type)) {
          return false;
        }
      }

      if (filters.team_size && filterContext.team_size) {
        if (filters.team_size !== filterContext.team_size) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Update pattern metadata
   */
  async updatePatternMetadata(patternId, metadata) {
    await this.initialize();

    const pattern = await this.getPattern(patternId);

    // Update metadata
    pattern.metadata = {
      ...pattern.metadata,
      ...metadata,
      last_updated: new Date().toISOString()
    };

    // Store updated pattern
    await this.storePattern(pattern);

    return pattern;
  }

  /**
   * Update pattern success rate and confidence
   */
  async updatePatternStats(patternId, success, newConfidence = null) {
    await this.initialize();

    if (typeof patternId !== 'string' || typeof success !== 'boolean') {
      throw new PatternStorageError('Invalid arguments for updatePatternStats');
    }

    try {
      const pattern = await this.getPattern(patternId);
      const stats = pattern.metadata.usage_statistics || {};

      stats.total_applications = (stats.total_applications || 0) + 1;
      if (success) {
        stats.successful_applications = (stats.successful_applications || 0) + 1;
      } else {
        stats.failed_applications = (stats.failed_applications || 0) + 1;
      }

      pattern.success_rate = stats.successful_applications / stats.total_applications;

      if (newConfidence !== null) {
        pattern.confidence_score = Math.max(0.1, Math.min(0.95, newConfidence));
      }

      pattern.metadata.last_applied = new Date().toISOString();
      stats.last_success_rate_calculation = pattern.metadata.last_applied;
      pattern.metadata.usage_statistics = stats;

      await this.storePattern(pattern);
      return pattern;
    } catch (error) {
      throw new PatternStorageError(`Failed to update pattern stats: ${error.message}`);
    }
  }

  /**
   * Delete a pattern
   */
  async deletePattern(patternId) {
    await this.initialize();

    if (!this.patterns.has(patternId)) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    // Create backup before deletion
    if (this.backupEnabled) {
      await this.createBackup(patternId, 'pre-deletion');
    }

    this.patterns.delete(patternId);
    await this.persistPatterns();

    console.log(`Pattern ${patternId} deleted successfully`);
    return true;
  }

  /**
   * Get patterns suitable for auto-apply
   */
  async getAutoApplyPatterns(context = {}) {
    const filters = {
      confidence_threshold: 0.8,
      sort_by: 'confidence',
      context_match: context
    };

    const patterns = await this.getPatterns(filters);

    return patterns.filter(pattern =>
      pattern.auto_apply_actions &&
      pattern.auto_apply_actions.length > 0
    );
  }

  /**
   * Get recommended patterns
   */
  async getRecommendedPatterns(context = {}, limit = 10) {
    const filters = {
      confidence_threshold: 0.6,
      sort_by: 'confidence',
      limit: limit,
      context_match: context
    };

    return await this.getPatterns(filters);
  }

  /**
   * Search patterns by text content
   */
  async searchPatterns(query, options = {}) {
    await this.initialize();

    const patterns = Array.from(this.patterns.values());
    const searchTerm = query.toLowerCase();

    const matches = patterns.filter(pattern => {
      const searchableText = [
        pattern.name,
        pattern.description,
        ...pattern.trigger_conditions,
        ...pattern.metadata.tags || []
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });

    // Apply options
    if (options.sort_by) {
      matches.sort((a, b) => {
        switch (options.sort_by) {
          case 'relevance':
            // Simple relevance scoring based on exact matches
            const aScore = this.calculateRelevanceScore(a, searchTerm);
            const bScore = this.calculateRelevanceScore(b, searchTerm);
            return bScore - aScore;
          case 'confidence':
            return b.confidence_score - a.confidence_score;
          default:
            return 0;
        }
      });
    }

    if (options.limit) {
      return matches.slice(0, options.limit);
    }

    return matches;
  }

  /**
   * Calculate relevance score for search results
   */
  calculateRelevanceScore(pattern, searchTerm) {
    let score = 0;

    // Exact name match gets highest score
    if (pattern.name.toLowerCase().includes(searchTerm)) {
      score += 10;
    }

    // Description match gets medium score
    if (pattern.description.toLowerCase().includes(searchTerm)) {
      score += 5;
    }

    // Trigger condition matches get lower score
    pattern.trigger_conditions.forEach(condition => {
      if (condition.toLowerCase().includes(searchTerm)) {
        score += 2;
      }
    });

    // Tag matches get lowest score
    (pattern.metadata.tags || []).forEach(tag => {
      if (tag.toLowerCase().includes(searchTerm)) {
        score += 1;
      }
    });

    return score;
  }

  /**
   * Create backup of pattern before modification
   */
  async createBackup(patternId, suffix = 'backup') {
    const pattern = this.patterns.get(patternId);
    if (!pattern) {
      return;
    }

    const backupDir = path.join(this.storagePath, 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${patternId}_${suffix}_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFile);

    await fs.writeFile(backupPath, JSON.stringify(pattern, null, 2));
  }

  /**
   * Persist patterns to storage
   */
  async persistPatterns() {
    const patternsData = {
      metadata: {
        export_timestamp: new Date().toISOString(),
        total_patterns: this.patterns.size,
        schema_version: "1.0.0"
      },
      patterns: Array.from(this.patterns.values())
    };

    const patternsFilePath = path.join(this.storagePath, this.patternsFile);
    const jsonData = JSON.stringify(patternsData, null, 2);

    // Write to temporary file first, then rename for atomicity
    const tempFilePath = `${patternsFilePath}.tmp`;
    await fs.writeFile(tempFilePath, jsonData);
    await fs.rename(tempFilePath, patternsFilePath);
  }

  /**
   * Export patterns to external format
   */
  async exportPatterns(options = {}) {
    await this.initialize();

    const patterns = Array.from(this.patterns.values());

    if (options.format === 'csv') {
      return this.exportToCSV(patterns, options);
    }

    // Default JSON export
    const exportData = {
      metadata: {
        export_timestamp: new Date().toISOString(),
        total_patterns: patterns.length,
        format_version: "1.0.0"
      },
      patterns: patterns
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export patterns to CSV format
   */
  exportToCSV(patterns, options) {
    const headers = [
      'id', 'name', 'description', 'confidence_score', 'success_rate',
      'pattern_type', 'created_at', 'last_applied', 'total_applications'
    ];

    const rows = patterns.map(pattern => [
      pattern.id,
      pattern.name,
      pattern.description,
      pattern.confidence_score,
      pattern.success_rate,
      pattern.metadata.pattern_type,
      pattern.metadata.created_at,
      pattern.metadata.last_applied || '',
      pattern.metadata.usage_statistics?.total_applications || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get storage statistics
   */
  async getStatistics() {
    await this.initialize();

    const patterns = Array.from(this.patterns.values());

    const stats = {
      total_patterns: patterns.length,
      patterns_by_type: {},
      patterns_by_confidence: {
        high: 0,    // >= 0.8
        medium: 0,  // 0.6-0.8
        low: 0      // < 0.6
      },
      average_confidence: 0,
      average_success_rate: 0,
      total_applications: 0,
      auto_apply_patterns: 0,
      deprecated_patterns: 0
    };

    let totalConfidence = 0;
    let totalSuccessRate = 0;

    for (const pattern of patterns) {
      // Count by type
      const type = pattern.metadata.pattern_type || 'unknown';
      stats.patterns_by_type[type] = (stats.patterns_by_type[type] || 0) + 1;

      // Count by confidence
      if (pattern.confidence_score >= 0.8) {
        stats.patterns_by_confidence.high++;
      } else if (pattern.confidence_score >= 0.6) {
        stats.patterns_by_confidence.medium++;
      } else {
        stats.patterns_by_confidence.low++;
      }

      // Accumulate metrics
      totalConfidence += pattern.confidence_score;
      totalSuccessRate += pattern.success_rate;
      stats.total_applications += pattern.metadata.usage_statistics?.total_applications || 0;

      // Count special patterns
      if (pattern.auto_apply_actions && pattern.auto_apply_actions.length > 0) {
        stats.auto_apply_patterns++;
      }

      if (pattern.metadata.deprecation_status?.is_deprecated) {
        stats.deprecated_patterns++;
      }
    }

    // Calculate averages
    if (patterns.length > 0) {
      stats.average_confidence = totalConfidence / patterns.length;
      stats.average_success_rate = totalSuccessRate / patterns.length;
    }

    return stats;
  }

  /**
   * Cleanup old backups and temporary files
   */
  async cleanup(options = {}) {
    const backupDir = path.join(this.storagePath, 'backups');
    const retentionDays = options.retention_days || 30;

    try {
      const files = await fs.readdir(backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      let cleanedCount = 0;
      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }

      console.log(`Cleaned up ${cleanedCount} old backup files`);
      return cleanedCount;
    } catch (error) {
      console.warn('Failed to cleanup backups:', error.message);
      return 0;
    }
  }
}

module.exports = PatternStorage;