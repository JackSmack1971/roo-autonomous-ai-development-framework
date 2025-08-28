/**
 * Organizational Intelligence System
 *
 * Scales learning across multiple teams and projects
 * Manages global pattern libraries, team-specific learning, and organizational optimization
 */

const LearningProtocolClient = require('./learning-protocol-client');
const fs = require('fs').promises;
const path = require('path');

class OrganizationalIntelligence {
  constructor(options = {}) {
    this.learningClient = new LearningProtocolClient(options);
    this.organizationPath = options.organizationPath || path.join(__dirname, '..', 'data', 'organization');
    this.globalPatternLibrary = options.globalPatternLibrary || path.join(this.organizationPath, 'global-patterns');
    this.teamLearningPath = options.teamLearningPath || path.join(this.organizationPath, 'team-learning');

    this.intelligenceLayers = {
      global: {
        patterns: new Map(),
        success_rates: new Map(),
        anti_patterns: new Map(),
        optimization_opportunities: []
      },
      team: new Map(), // team_id -> team intelligence
      project: new Map(), // project_id -> project intelligence
      cross_team: {
        collaboration_patterns: new Map(),
        knowledge_sharing: new Map(),
        best_practices: []
      }
    };

    this.scalingStrategies = {
      pattern_promotion: {
        criteria: ['success_rate > 0.85', 'applications > 10', 'consistency_across_teams'],
        promotion_path: ['project', 'team', 'global']
      },
      team_learning_aggregation: {
        frequency: 'daily',
        aggregation_methods: ['success_rate_weighted', 'recency_weighted', 'expertise_weighted']
      },
      organizational_optimization: {
        triggers: ['performance_benchmarks', 'quality_metrics', 'team_productivity'],
        optimization_targets: ['workflow_efficiency', 'knowledge_sharing', 'skill_development']
      }
    };
  }

  /**
   * Initialize organizational intelligence system
   */
  async initialize() {
    await this.ensureOrganizationDirectories();
    await this.loadGlobalPatternLibrary();
    await this.loadTeamIntelligence();
    await this.initializeCrossTeamLearning();

    console.log(`🏢 [Org Intelligence] Initialized for organization with ${this.intelligenceLayers.global.patterns.size} global patterns`);
  }

  /**
   * Ensure organization directory structure exists
   */
  async ensureOrganizationDirectories() {
    const directories = [
      this.organizationPath,
      this.globalPatternLibrary,
      this.teamLearningPath,
      path.join(this.organizationPath, 'projects'),
      path.join(this.organizationPath, 'teams'),
      path.join(this.organizationPath, 'analytics'),
      path.join(this.organizationPath, 'optimization')
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Load global pattern library
   */
  async loadGlobalPatternLibrary() {
    try {
      const globalPatternsFile = path.join(this.globalPatternLibrary, 'global-patterns.json');

      try {
        const data = await fs.readFile(globalPatternsFile, 'utf8');
        const globalData = JSON.parse(data);

        for (const [patternId, pattern] of Object.entries(globalData.patterns || {})) {
          this.intelligenceLayers.global.patterns.set(patternId, pattern);
        }

        console.log(`📚 [Org Intelligence] Loaded ${this.intelligenceLayers.global.patterns.size} global patterns`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ [Org Intelligence] Failed to load global patterns: ${error.message}`);
        }
        // Initialize empty global library
        this.intelligenceLayers.global.patterns = new Map();
      }
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to initialize global pattern library: ${error.message}`);
    }
  }

  /**
   * Load team intelligence data
   */
  async loadTeamIntelligence() {
    try {
      const teamsDir = path.join(this.organizationPath, 'teams');

      try {
        const teamFiles = await fs.readdir(teamsDir);

        for (const teamFile of teamFiles) {
          if (teamFile.endsWith('.json')) {
            const teamId = teamFile.replace('.json', '');
            const teamData = await fs.readFile(path.join(teamsDir, teamFile), 'utf8');
            const teamIntelligence = JSON.parse(teamData);

            this.intelligenceLayers.team.set(teamId, teamIntelligence);
          }
        }

        console.log(`👥 [Org Intelligence] Loaded intelligence for ${this.intelligenceLayers.team.size} teams`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ [Org Intelligence] Failed to load team intelligence: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to initialize team intelligence: ${error.message}`);
    }
  }

  /**
   * Initialize cross-team learning
   */
  async initializeCrossTeamLearning() {
    try {
      const crossTeamFile = path.join(this.organizationPath, 'cross-team-learning.json');

      try {
        const data = await fs.readFile(crossTeamFile, 'utf8');
        const crossTeamData = JSON.parse(data);

        this.intelligenceLayers.cross_team = {
          collaboration_patterns: new Map(Object.entries(crossTeamData.collaboration_patterns || {})),
          knowledge_sharing: new Map(Object.entries(crossTeamData.knowledge_sharing || {})),
          best_practices: crossTeamData.best_practices || []
        };

        console.log(`🤝 [Org Intelligence] Loaded cross-team learning data`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️ [Org Intelligence] Failed to load cross-team learning: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to initialize cross-team learning: ${error.message}`);
    }
  }

  /**
   * Promote successful project patterns to team level
   */
  async promoteProjectPatternToTeam(projectId, patternId, teamId) {
    try {
      const projectIntelligence = this.intelligenceLayers.project.get(projectId);
      if (!projectIntelligence) {
        throw new Error(`Project intelligence not found: ${projectId}`);
      }

      const pattern = projectIntelligence.patterns.get(patternId);
      if (!pattern) {
        throw new Error(`Pattern not found in project: ${patternId}`);
      }

      // Check promotion criteria
      if (this.shouldPromotePattern(pattern, 'team')) {
        const teamIntelligence = this.intelligenceLayers.team.get(teamId) || {
          patterns: new Map(),
          success_rates: new Map(),
          anti_patterns: new Map(),
          metadata: {
            team_id: teamId,
            created_at: new Date().toISOString(),
            pattern_count: 0
          }
        };

        // Add pattern to team intelligence
        teamIntelligence.patterns.set(patternId, {
          ...pattern,
          promoted_from: projectId,
          promotion_date: new Date().toISOString(),
          promotion_level: 'team',
          organizational_significance: this.calculateOrganizationalSignificance(pattern)
        });

        teamIntelligence.metadata.pattern_count = teamIntelligence.patterns.size;

        // Save team intelligence
        await this.saveTeamIntelligence(teamId, teamIntelligence);
        this.intelligenceLayers.team.set(teamId, teamIntelligence);

        console.log(`⬆️ [Org Intelligence] Promoted pattern ${patternId} from project ${projectId} to team ${teamId}`);

        // Check if should promote to global level
        if (this.shouldPromotePattern(pattern, 'global')) {
          await this.promoteTeamPatternToGlobal(teamId, patternId);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to promote project pattern: ${error.message}`);
      return false;
    }
  }

  /**
   * Promote team pattern to global level
   */
  async promoteTeamPatternToGlobal(teamId, patternId) {
    try {
      const teamIntelligence = this.intelligenceLayers.team.get(teamId);
      if (!teamIntelligence) {
        throw new Error(`Team intelligence not found: ${teamId}`);
      }

      const pattern = teamIntelligence.patterns.get(patternId);
      if (!pattern) {
        throw new Error(`Pattern not found in team: ${patternId}`);
      }

      // Add to global pattern library
      this.intelligenceLayers.global.patterns.set(patternId, {
        ...pattern,
        promoted_from: teamId,
        promotion_date: new Date().toISOString(),
        promotion_level: 'global',
        organizational_adoption: await this.calculateOrganizationalAdoption(pattern),
        global_significance: this.calculateGlobalSignificance(pattern)
      });

      // Save global pattern library
      await this.saveGlobalPatternLibrary();

      console.log(`🌍 [Org Intelligence] Promoted pattern ${patternId} from team ${teamId} to global library`);

      return true;
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to promote team pattern to global: ${error.message}`);
      return false;
    }
  }

  /**
   * Determine if pattern should be promoted
   */
  shouldPromotePattern(pattern, targetLevel) {
    const criteria = this.scalingStrategies.pattern_promotion.criteria;

    for (const criterion of criteria) {
      if (!this.evaluatePromotionCriterion(pattern, criterion)) {
        return false;
      }
    }

    // Additional level-specific checks
    if (targetLevel === 'global') {
      return pattern.organizational_significance > 0.8 &&
             pattern.consistency_across_teams > 0.7;
    }

    return true;
  }

  /**
   * Evaluate promotion criterion
   */
  evaluatePromotionCriterion(pattern, criterion) {
    const [metric, operator, value] = criterion.split(/\s+/);

    let actualValue;
    switch (metric) {
      case 'success_rate':
        actualValue = pattern.success_rate || 0;
        break;
      case 'applications':
        actualValue = pattern.metadata?.usage_statistics?.total_applications || 0;
        break;
      case 'consistency_across_teams':
        actualValue = this.calculateConsistencyAcrossTeams(pattern);
        break;
      default:
        return false;
    }

    const threshold = parseFloat(value);

    switch (operator) {
      case '>': return actualValue > threshold;
      case '>=': return actualValue >= threshold;
      case '<': return actualValue < threshold;
      case '<=': return actualValue <= threshold;
      case '=': return actualValue === threshold;
      default: return false;
    }
  }

  /**
   * Calculate consistency across teams
   */
  calculateConsistencyAcrossTeams(pattern) {
    let teamCount = 0;
    let consistentTeams = 0;

    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      if (teamIntelligence.patterns.has(pattern.id)) {
        teamCount++;
        const teamPattern = teamIntelligence.patterns.get(pattern.id);

        // Check if success rates are similar
        if (Math.abs(teamPattern.success_rate - pattern.success_rate) < 0.1) {
          consistentTeams++;
        }
      }
    }

    return teamCount > 0 ? consistentTeams / teamCount : 0;
  }

  /**
   * Calculate organizational significance
   */
  calculateOrganizationalSignificance(pattern) {
    let significance = 0;

    // Success rate contribution
    significance += (pattern.success_rate || 0) * 0.3;

    // Usage frequency contribution
    const usage = pattern.metadata?.usage_statistics?.total_applications || 0;
    significance += Math.min(usage / 100, 1) * 0.3;

    // Quality impact contribution
    const qualityImpact = pattern.metadata?.usage_statistics?.average_quality_impact || 0;
    significance += Math.max(0, qualityImpact + 1) / 2 * 0.2;

    // Cross-team applicability
    significance += this.calculateConsistencyAcrossTeams(pattern) * 0.2;

    return Math.min(significance, 1);
  }

  /**
   * Calculate organizational adoption
   */
  async calculateOrganizationalAdoption(pattern) {
    let totalTeams = this.intelligenceLayers.team.size;
    let adoptingTeams = 0;

    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      if (teamIntelligence.patterns.has(pattern.id)) {
        adoptingTeams++;
      }
    }

    return {
      adoption_rate: totalTeams > 0 ? adoptingTeams / totalTeams : 0,
      adopting_teams: adoptingTeams,
      total_teams: totalTeams,
      adoption_trend: await this.calculateAdoptionTrend(pattern.id)
    };
  }

  /**
   * Calculate global significance
   */
  calculateGlobalSignificance(pattern) {
    let significance = this.calculateOrganizationalSignificance(pattern);

    // Boost for cross-domain applicability
    if (pattern.context_match?.domain === 'universal') {
      significance += 0.2;
    }

    // Boost for high business impact
    if (pattern.business_impact === 'critical' || pattern.business_impact === 'high') {
      significance += 0.1;
    }

    return Math.min(significance, 1);
  }

  /**
   * Calculate adoption trend
   */
  async calculateAdoptionTrend(patternId) {
    // This would analyze adoption over time
    // For now, return a placeholder
    return 'increasing';
  }

  /**
   * Aggregate team learning for organizational insights
   */
  async aggregateTeamLearning() {
    console.log(`📊 [Org Intelligence] Aggregating team learning...`);

    const aggregatedInsights = {
      top_patterns: new Map(),
      team_effectiveness: new Map(),
      collaboration_opportunities: [],
      organizational_trends: [],
      optimization_recommendations: []
    };

    // Aggregate pattern success rates across teams
    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      for (const [patternId, pattern] of teamIntelligence.patterns) {
        if (!aggregatedInsights.top_patterns.has(patternId)) {
          aggregatedInsights.top_patterns.set(patternId, {
            pattern_name: pattern.name,
            teams_using: 0,
            average_success_rate: 0,
            total_applications: 0,
            team_success_rates: []
          });
        }

        const aggregated = aggregatedInsights.top_patterns.get(patternId);
        aggregated.teams_using++;
        aggregated.team_success_rates.push(pattern.success_rate);
        aggregated.total_applications += pattern.metadata?.usage_statistics?.total_applications || 0;
      }
    }

    // Calculate averages
    for (const [patternId, data] of aggregatedInsights.top_patterns) {
      data.average_success_rate = data.team_success_rates.reduce((sum, rate) => sum + rate, 0) / data.team_success_rates.length;
    }

    // Identify collaboration opportunities
    aggregatedInsights.collaboration_opportunities = this.identifyCollaborationOpportunities(aggregatedInsights);

    // Generate organizational trends
    aggregatedInsights.organizational_trends = await this.identifyOrganizationalTrends();

    // Generate optimization recommendations
    aggregatedInsights.optimization_recommendations = this.generateOptimizationRecommendations(aggregatedInsights);

    console.log(`📊 [Org Intelligence] Generated ${aggregatedInsights.top_patterns.size} aggregated insights`);

    return aggregatedInsights;
  }

  /**
   * Identify collaboration opportunities
   */
  identifyCollaborationOpportunities(aggregatedInsights) {
    const opportunities = [];

    // Find teams with different success rates for same patterns
    for (const [patternId, data] of aggregatedInsights.top_patterns) {
      if (data.teams_using >= 2) {
        const successRates = data.team_success_rates;
        const maxRate = Math.max(...successRates);
        const minRate = Math.min(...successRates);

        if (maxRate - minRate > 0.2) {
          opportunities.push({
            type: 'knowledge_sharing',
            pattern_id: patternId,
            opportunity: `High-performing teams could share best practices with teams struggling with this pattern`,
            potential_impact: 'medium',
            affected_teams: data.teams_using
          });
        }
      }
    }

    // Find patterns that work well in one domain but could apply to others
    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      for (const [patternId, pattern] of teamIntelligence.patterns) {
        if (pattern.success_rate > 0.9 && pattern.metadata?.usage_statistics?.total_applications >= 5) {
          opportunities.push({
            type: 'cross_domain_application',
            pattern_id: patternId,
            team_id: teamId,
            opportunity: `Successful pattern in ${teamId} could benefit other teams`,
            potential_impact: 'high',
            pattern_success_rate: pattern.success_rate
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Identify organizational trends
   */
  async identifyOrganizationalTrends() {
    const trends = [];

    // Analyze pattern adoption trends
    const adoptionTrends = await this.analyzePatternAdoptionTrends();
    trends.push(...adoptionTrends);

    // Analyze team performance trends
    const performanceTrends = await this.analyzeTeamPerformanceTrends();
    trends.push(...performanceTrends);

    // Analyze technology stack evolution
    const technologyTrends = await this.analyzeTechnologyTrends();
    trends.push(...technologyTrends);

    return trends;
  }

  /**
   * Analyze pattern adoption trends
   */
  async analyzePatternAdoptionTrends() {
    const trends = [];

    // Calculate adoption velocity
    const recentSessions = await this.getRecentSessions(30); // Last 30 days
    const olderSessions = await this.getRecentSessions(60, 30); // 30-60 days ago

    if (recentSessions.length > 0 && olderSessions.length > 0) {
      const recentAdoption = this.calculateAverageAdoption(recentSessions);
      const olderAdoption = this.calculateAverageAdoption(olderSessions);

      if (recentAdoption > olderAdoption * 1.1) {
        trends.push({
          type: 'adoption_accelerating',
          description: 'Pattern adoption is accelerating across teams',
          metric: 'adoption_rate',
          change: `${((recentAdoption - olderAdoption) / olderAdoption * 100).toFixed(1)}% increase`,
          significance: 'positive'
        });
      }
    }

    return trends;
  }

  /**
   * Analyze team performance trends
   */
  async analyzeTeamPerformanceTrends() {
    const trends = [];

    // Compare team performance metrics
    const teamMetrics = [];

    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      const metrics = this.calculateTeamPerformanceMetrics(teamIntelligence);
      teamMetrics.push({ teamId, ...metrics });
    }

    if (teamMetrics.length >= 2) {
      // Identify top and bottom performers
      teamMetrics.sort((a, b) => b.averageSuccessRate - a.averageSuccessRate);

      const topPerformer = teamMetrics[0];
      const bottomPerformer = teamMetrics[teamMetrics.length - 1];

      if (topPerformer.averageSuccessRate - bottomPerformer.averageSuccessRate > 0.2) {
        trends.push({
          type: 'performance_gap',
          description: `Significant performance gap between teams (${topPerformer.teamId} vs ${bottomPerformer.teamId})`,
          metric: 'success_rate',
          gap: `${((topPerformer.averageSuccessRate - bottomPerformer.averageSuccessRate) * 100).toFixed(1)}%`,
          significance: 'needs_attention'
        });
      }
    }

    return trends;
  }

  /**
   * Analyze technology trends
   */
  async analyzeTechnologyTrends() {
    const trends = [];

    // Analyze technology stack preferences
    const technologyUsage = new Map();

    for (const [teamId, teamIntelligence] of this.intelligenceLayers.team) {
      for (const [patternId, pattern] of teamIntelligence.patterns) {
        if (pattern.context_match?.technology_stack) {
          for (const tech of pattern.context_match.technology_stack) {
            if (!technologyUsage.has(tech)) {
              technologyUsage.set(tech, { teams: 0, patterns: 0, success_rate: 0 });
            }

            const usage = technologyUsage.get(tech);
            usage.teams++;
            usage.patterns++;
            usage.success_rate = (usage.success_rate + pattern.success_rate) / 2;
          }
        }
      }
    }

    // Identify emerging technologies
    for (const [technology, usage] of technologyUsage) {
      if (usage.teams >= 3 && usage.success_rate > 0.8) {
        trends.push({
          type: 'emerging_technology',
          description: `${technology} showing strong adoption and success across teams`,
          metric: 'adoption_with_success',
          adoption_rate: usage.teams / this.intelligenceLayers.team.size,
          average_success_rate: usage.success_rate,
          significance: 'positive'
        });
      }
    }

    return trends;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(aggregatedInsights) {
    const recommendations = [];

    // Recommend knowledge sharing for performance gaps
    const performanceGaps = aggregatedInsights.organizational_trends.filter(
      trend => trend.type === 'performance_gap'
    );

    for (const gap of performanceGaps) {
      recommendations.push({
        type: 'knowledge_sharing_program',
        priority: 'high',
        description: `Implement knowledge sharing program to address ${gap.gap} performance gap`,
        expected_impact: 'reduce_performance_variance',
        implementation_effort: 'medium'
      });
    }

    // Recommend cross-team collaboration
    if (aggregatedInsights.collaboration_opportunities.length > 0) {
      recommendations.push({
        type: 'collaboration_platform',
        priority: 'medium',
        description: `Establish cross-team collaboration platform for ${aggregatedInsights.collaboration_opportunities.length} identified opportunities`,
        expected_impact: 'accelerate_learning',
        implementation_effort: 'high'
      });
    }

    // Recommend standardization for highly successful patterns
    const topPatterns = Array.from(aggregatedInsights.top_patterns.values())
      .filter(data => data.average_success_rate > 0.9 && data.teams_using >= 3)
      .sort((a, b) => b.average_success_rate - a.average_success_rate)
      .slice(0, 3);

    for (const pattern of topPatterns) {
      recommendations.push({
        type: 'pattern_standardization',
        priority: 'high',
        description: `Standardize ${pattern.pattern_name} across all teams (${(pattern.average_success_rate * 100).toFixed(1)}% success rate)`,
        expected_impact: 'improve_consistency',
        implementation_effort: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Save global pattern library
   */
  async saveGlobalPatternLibrary() {
    try {
      const globalPatternsFile = path.join(this.globalPatternLibrary, 'global-patterns.json');

      const globalData = {
        metadata: {
          export_timestamp: new Date().toISOString(),
          total_patterns: this.intelligenceLayers.global.patterns.size,
          schema_version: '1.0.0'
        },
        patterns: Object.fromEntries(this.intelligenceLayers.global.patterns)
      };

      await fs.writeFile(globalPatternsFile, JSON.stringify(globalData, null, 2));
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to save global pattern library: ${error.message}`);
    }
  }

  /**
   * Save team intelligence
   */
  async saveTeamIntelligence(teamId, teamIntelligence) {
    try {
      const teamFile = path.join(this.organizationPath, 'teams', `${teamId}.json`);
      await fs.writeFile(teamFile, JSON.stringify(teamIntelligence, null, 2));
    } catch (error) {
      console.warn(`⚠️ [Org Intelligence] Failed to save team intelligence for ${teamId}: ${error.message}`);
    }
  }

  /**
   * Get organizational intelligence statistics
   */
  getStatistics() {
    return {
      global_patterns: this.intelligenceLayers.global.patterns.size,
      teams: this.intelligenceLayers.team.size,
      projects: this.intelligenceLayers.project.size,
      cross_team_collaboration: this.intelligenceLayers.cross_team.collaboration_patterns.size,
      scaling_strategies: this.scalingStrategies,
      timestamp: new Date().toISOString()
    };
  }

  // Placeholder methods - would be implemented based on data availability
  async getRecentSessions(days, offset = 0) { return []; }
  calculateAverageAdoption(sessions) { return 0; }
  calculateTeamPerformanceMetrics(teamIntelligence) {
    return { averageSuccessRate: 0, patternCount: 0, antiPatternCount: 0 };
  }
}

module.exports = OrganizationalIntelligence;