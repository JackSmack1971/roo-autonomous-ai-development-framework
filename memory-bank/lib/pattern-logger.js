/**
 * Pattern Logger
 *
 * Comprehensive logging system for tracking pattern application outcomes,
 * failures, and adaptation triggers in the learning system
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class PatternLogger extends EventEmitter {
  constructor(options = {}) {
    super();

    this.logPath = options.logPath || path.join(__dirname, '..', 'logs');
    this.applicationLogFile = options.applicationLogFile || 'pattern-applications.log';
    this.failureLogFile = options.failureLogFile || 'pattern-failures.log';
    this.auditLogFile = options.auditLogFile || 'pattern-audit.log';

    this.maxLogFileSize = options.maxLogFileSize || 10 * 1024 * 1024; // 10MB
    this.maxLogEntries = options.maxLogEntries || 10000;
    this.logRetentionDays = options.logRetentionDays || 30;

    this.applicationLogs = [];
    this.failureLogs = [];
    this.auditLogs = [];

    this.initialized = false;
  }

  /**
   * Initialize the pattern logger
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.ensureLogDirectory();
    await this.loadExistingLogs();

    this.initialized = true;
    this.emit('initialized', {
      logPath: this.logPath,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDirectory() {
    try {
      await fs.access(this.logPath);
    } catch {
      await fs.mkdir(this.logPath, { recursive: true });
    }
  }

  /**
   * Load existing logs from files
   */
  async loadExistingLogs() {
    try {
      // Load application logs
      const applicationLogPath = path.join(this.logPath, this.applicationLogFile);
      const applicationData = await this.readLogFile(applicationLogPath);
      this.applicationLogs = applicationData || [];

      // Load failure logs
      const failureLogPath = path.join(this.logPath, this.failureLogFile);
      const failureData = await this.readLogFile(failureLogPath);
      this.failureLogs = failureData || [];

      // Load audit logs
      const auditLogPath = path.join(this.logPath, this.auditLogFile);
      const auditData = await this.readLogFile(auditLogPath);
      this.auditLogs = auditData || [];

    } catch (error) {
      console.warn('Failed to load existing logs:', error.message);
      // Start with empty logs if loading fails
    }
  }

  /**
   * Read log file and parse JSON entries
   */
  async readLogFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const lines = data.split('\n').filter(line => line.trim());
      return lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(entry => entry !== null);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return [];
    }
  }

  /**
   * Log pattern application
   */
  async logPatternApplication(patternId, context, outcome, details = {}) {
    await this.initialize();

    const logEntry = {
      timestamp: new Date().toISOString(),
      log_type: 'pattern_application',
      pattern_id: patternId,
      context: context,
      outcome: outcome,
      details: details,
      session_id: details.session_id || 'unknown',
      decision_confidence: details.decision_confidence || 0,
      risk_level: details.risk_level || 'unknown',
      execution_time_ms: details.execution_time_ms || 0,
      quality_impact: details.quality_impact || 0,
      user_feedback: details.user_feedback || null
    };

    this.applicationLogs.push(logEntry);

    // Maintain log size limit
    if (this.applicationLogs.length > this.maxLogEntries) {
      this.applicationLogs.shift();
    }

    // Write to file
    await this.writeLogEntry(this.applicationLogFile, logEntry);

    // Emit event
    this.emit('pattern_application_logged', logEntry);

    return logEntry;
  }

  /**
   * Log pattern failure with detailed analysis
   */
  async logPatternFailure(patternId, context, failureReason, details = {}) {
    await this.initialize();

    const failureEntry = {
      timestamp: new Date().toISOString(),
      log_type: 'pattern_failure',
      pattern_id: patternId,
      context: context,
      failure_reason: failureReason,
      failure_category: this.categorizeFailure(failureReason),
      details: details,
      session_id: details.session_id || 'unknown',
      decision_confidence: details.decision_confidence || 0,
      risk_level: details.risk_level || 'unknown',
      error_stack: details.error_stack || null,
      recovery_actions: details.recovery_actions || [],
      impact_assessment: details.impact_assessment || 'unknown',
      user_feedback: details.user_feedback || null
    };

    this.failureLogs.push(failureEntry);

    // Maintain log size limit
    if (this.failureLogs.length > this.maxLogEntries) {
      this.failureLogs.shift();
    }

    // Write to file
    await this.writeLogEntry(this.failureLogFile, failureEntry);

    // Also log as application with failure outcome
    await this.logPatternApplication(patternId, context, 'failure', {
      ...details,
      failure_reason: failureReason
    });

    // Emit event
    this.emit('pattern_failure_logged', failureEntry);

    return failureEntry;
  }

  /**
   * Log audit event
   */
  async logAuditEvent(eventType, details = {}) {
    await this.initialize();

    const auditEntry = {
      timestamp: new Date().toISOString(),
      log_type: 'audit',
      event_type: eventType,
      details: details,
      session_id: details.session_id || 'unknown',
      user_id: details.user_id || 'system',
      ip_address: details.ip_address || null,
      user_agent: details.user_agent || null
    };

    this.auditLogs.push(auditEntry);

    // Maintain log size limit
    if (this.auditLogs.length > this.maxLogEntries) {
      this.auditLogs.shift();
    }

    // Write to file
    await this.writeLogEntry(this.auditLogFile, auditEntry);

    // Emit event
    this.emit('audit_event_logged', auditEntry);

    return auditEntry;
  }

  /**
   * Categorize failure reason
   */
  categorizeFailure(failureReason) {
    const reason = failureReason.toLowerCase();

    if (reason.includes('validation') || reason.includes('schema')) {
      return 'validation_error';
    } else if (reason.includes('permission') || reason.includes('access')) {
      return 'permission_error';
    } else if (reason.includes('timeout') || reason.includes('performance')) {
      return 'performance_error';
    } else if (reason.includes('configuration') || reason.includes('config')) {
      return 'configuration_error';
    } else if (reason.includes('dependency') || reason.includes('missing')) {
      return 'dependency_error';
    } else if (reason.includes('quality') || reason.includes('gate')) {
      return 'quality_gate_error';
    } else if (reason.includes('context') || reason.includes('matching')) {
      return 'context_error';
    } else if (reason.includes('execution') || reason.includes('runtime')) {
      return 'execution_error';
    } else {
      return 'unknown_error';
    }
  }

  /**
   * Write log entry to file
   */
  async writeLogEntry(fileName, entry) {
    const filePath = path.join(this.logPath, fileName);
    const logLine = JSON.stringify(entry) + '\n';

    try {
      await fs.appendFile(filePath, logLine);
    } catch (error) {
      console.error(`Failed to write log entry to ${fileName}:`, error);
    }
  }

  /**
   * Get application logs with filtering
   */
  getApplicationLogs(options = {}) {
    let logs = [...this.applicationLogs];

    // Apply filters
    if (options.pattern_id) {
      logs = logs.filter(log => log.pattern_id === options.pattern_id);
    }

    if (options.outcome) {
      logs = logs.filter(log => log.outcome === options.outcome);
    }

    if (options.session_id) {
      logs = logs.filter(log => log.session_id === options.session_id);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      logs = logs.filter(log => new Date(log.timestamp) > sinceDate);
    }

    if (options.until) {
      const untilDate = new Date(options.until);
      logs = logs.filter(log => new Date(log.timestamp) <= untilDate);
    }

    // Apply sorting
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  /**
   * Get failure logs with filtering
   */
  getFailureLogs(options = {}) {
    let logs = [...this.failureLogs];

    // Apply filters
    if (options.pattern_id) {
      logs = logs.filter(log => log.pattern_id === options.pattern_id);
    }

    if (options.failure_category) {
      logs = logs.filter(log => log.failure_category === options.failure_category);
    }

    if (options.session_id) {
      logs = logs.filter(log => log.session_id === options.session_id);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      logs = logs.filter(log => new Date(log.timestamp) > sinceDate);
    }

    if (options.until) {
      const untilDate = new Date(options.until);
      logs = logs.filter(log => new Date(log.timestamp) <= untilDate);
    }

    // Apply sorting
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  /**
   * Get audit logs with filtering
   */
  getAuditLogs(options = {}) {
    let logs = [...this.auditLogs];

    // Apply filters
    if (options.event_type) {
      logs = logs.filter(log => log.event_type === options.event_type);
    }

    if (options.user_id) {
      logs = logs.filter(log => log.user_id === options.user_id);
    }

    if (options.session_id) {
      logs = logs.filter(log => log.session_id === options.session_id);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      logs = logs.filter(log => new Date(log.timestamp) > sinceDate);
    }

    if (options.until) {
      const untilDate = new Date(options.until);
      logs = logs.filter(log => new Date(log.timestamp) <= untilDate);
    }

    // Apply sorting
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  /**
   * Get comprehensive logging statistics
   */
  getStatistics(options = {}) {
    const stats = {
      timestamp: new Date().toISOString(),
      application_logs: {
        total: this.applicationLogs.length,
        by_outcome: this.getOutcomeDistribution(),
        by_pattern: this.getPatternDistribution(this.applicationLogs),
        recent_activity: this.getRecentActivity()
      },
      failure_logs: {
        total: this.failureLogs.length,
        by_category: this.getFailureCategoryDistribution(),
        by_pattern: this.getPatternDistribution(this.failureLogs),
        top_failure_reasons: this.getTopFailureReasons()
      },
      audit_logs: {
        total: this.auditLogs.length,
        by_event_type: this.getEventTypeDistribution(),
        by_user: this.getUserDistribution()
      }
    };

    return stats;
  }

  /**
   * Get outcome distribution from application logs
   */
  getOutcomeDistribution() {
    const distribution = {};

    this.applicationLogs.forEach(log => {
      const outcome = log.outcome || 'unknown';
      distribution[outcome] = (distribution[outcome] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get pattern distribution from logs
   */
  getPatternDistribution(logs) {
    const distribution = {};

    logs.forEach(log => {
      const patternId = log.pattern_id || 'unknown';
      distribution[patternId] = (distribution[patternId] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get failure category distribution
   */
  getFailureCategoryDistribution() {
    const distribution = {};

    this.failureLogs.forEach(log => {
      const category = log.failure_category || 'unknown';
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get top failure reasons
   */
  getTopFailureReasons(limit = 10) {
    const reasonCount = {};

    this.failureLogs.forEach(log => {
      const reason = log.failure_reason || 'unknown';
      reasonCount[reason] = (reasonCount[reason] || 0) + 1;
    });

    return Object.entries(reasonCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([reason, count]) => ({ reason, count }));
  }

  /**
   * Get event type distribution
   */
  getEventTypeDistribution() {
    const distribution = {};

    this.auditLogs.forEach(log => {
      const eventType = log.event_type || 'unknown';
      distribution[eventType] = (distribution[eventType] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get user distribution from audit logs
   */
  getUserDistribution() {
    const distribution = {};

    this.auditLogs.forEach(log => {
      const userId = log.user_id || 'unknown';
      distribution[userId] = (distribution[userId] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get recent activity summary
   */
  getRecentActivity(hours = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const recentApplications = this.applicationLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    ).length;

    const recentFailures = this.failureLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    ).length;

    const recentAudits = this.auditLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    ).length;

    return {
      hours: hours,
      applications: recentApplications,
      failures: recentFailures,
      audits: recentAudits,
      success_rate: recentApplications > 0 ?
        ((recentApplications - recentFailures) / recentApplications) : 0
    };
  }

  /**
   * Export logs in various formats
   */
  async exportLogs(format = 'json', options = {}) {
    const exportData = {
      export_timestamp: new Date().toISOString(),
      format: format,
      options: options,
      statistics: this.getStatistics(),
      application_logs: options.include_application_logs ? this.applicationLogs : [],
      failure_logs: options.include_failure_logs ? this.failureLogs : [],
      audit_logs: options.include_audit_logs ? this.auditLogs : []
    };

    if (format === 'csv') {
      return this.convertLogsToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Convert logs to CSV format
   */
  convertLogsToCSV(data) {
    let csv = 'LOG_TYPE,TIMESTAMP,PATTERN_ID,OUTCOME,DETAILS\n';

    // Add application logs
    data.application_logs.forEach(log => {
      csv += `application,${log.timestamp},${log.pattern_id},${log.outcome},"${JSON.stringify(log.details).replace(/"/g, '""')}"\n`;
    });

    // Add failure logs
    data.failure_logs.forEach(log => {
      csv += `failure,${log.timestamp},${log.pattern_id},${log.failure_category},"${JSON.stringify(log.details).replace(/"/g, '""')}"\n`;
    });

    // Add audit logs
    data.audit_logs.forEach(log => {
      csv += `audit,${log.timestamp},N/A,${log.event_type},"${JSON.stringify(log.details).replace(/"/g, '""')}"\n`;
    });

    return csv;
  }

  /**
   * Cleanup old log entries
   */
  async cleanup(options = {}) {
    const retentionDays = options.retention_days || this.logRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let cleanedEntries = 0;

    // Cleanup application logs
    const originalAppLength = this.applicationLogs.length;
    this.applicationLogs = this.applicationLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );
    cleanedEntries += (originalAppLength - this.applicationLogs.length);

    // Cleanup failure logs
    const originalFailLength = this.failureLogs.length;
    this.failureLogs = this.failureLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );
    cleanedEntries += (originalFailLength - this.failureLogs.length);

    // Cleanup audit logs
    const originalAuditLength = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );
    cleanedEntries += (originalAuditLength - this.auditLogs.length);

    // Rewrite log files
    await this.rewriteLogFiles();

    this.emit('cleanup_completed', {
      cleaned_entries: cleanedEntries,
      retention_days: retentionDays,
      timestamp: new Date().toISOString()
    });

    return cleanedEntries;
  }

  /**
   * Rewrite log files after cleanup
   */
  async rewriteLogFiles() {
    // Rewrite application logs
    const appLogPath = path.join(this.logPath, this.applicationLogFile);
    const appLogData = this.applicationLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
    await fs.writeFile(appLogPath, appLogData);

    // Rewrite failure logs
    const failLogPath = path.join(this.logPath, this.failureLogFile);
    const failLogData = this.failureLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
    await fs.writeFile(failLogPath, failLogData);

    // Rewrite audit logs
    const auditLogPath = path.join(this.logPath, this.auditLogFile);
    const auditLogData = this.auditLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
    await fs.writeFile(auditLogPath, auditLogData);
  }

  /**
   * Search logs with advanced filtering
   */
  searchLogs(query, options = {}) {
    const searchTerm = query.toLowerCase();
    let allLogs = [];

    // Combine all log types
    if (!options.log_type || options.log_type === 'application') {
      allLogs.push(...this.applicationLogs.map(log => ({ ...log, log_type: 'application' })));
    }
    if (!options.log_type || options.log_type === 'failure') {
      allLogs.push(...this.failureLogs.map(log => ({ ...log, log_type: 'failure' })));
    }
    if (!options.log_type || options.log_type === 'audit') {
      allLogs.push(...this.auditLogs.map(log => ({ ...log, log_type: 'audit' })));
    }

    // Search in logs
    const matches = allLogs.filter(log => {
      const searchableText = [
        log.pattern_id || '',
        log.outcome || '',
        log.failure_reason || '',
        log.event_type || '',
        JSON.stringify(log.details || {}),
        JSON.stringify(log.context || {})
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });

    // Apply additional filters
    let filteredMatches = matches;

    if (options.pattern_id) {
      filteredMatches = filteredMatches.filter(log => log.pattern_id === options.pattern_id);
    }

    if (options.since) {
      const sinceDate = new Date(options.since);
      filteredMatches = filteredMatches.filter(log => new Date(log.timestamp) > sinceDate);
    }

    // Sort by timestamp
    filteredMatches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply limit
    if (options.limit) {
      filteredMatches = filteredMatches.slice(0, options.limit);
    }

    return filteredMatches;
  }
}

module.exports = PatternLogger;