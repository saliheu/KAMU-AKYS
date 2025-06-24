const { sequelize, Disaster, HelpRequest, Team, Resource, Location } = require('../models');
const { Op } = require('sequelize');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const aggregateData = async (job) => {
  const { type, disasterId, timeRange = '24h' } = job.data;

  try {
    let result;
    
    switch (type) {
      case 'disaster_statistics':
        result = await aggregateDisasterStatistics(disasterId, timeRange);
        break;
      case 'resource_availability':
        result = await aggregateResourceAvailability(disasterId);
        break;
      case 'team_performance':
        result = await aggregateTeamPerformance(disasterId, timeRange);
        break;
      case 'help_request_trends':
        result = await aggregateHelpRequestTrends(disasterId, timeRange);
        break;
      case 'location_priorities':
        result = await aggregateLocationPriorities(disasterId);
        break;
      default:
        throw new Error(`Unknown aggregation type: ${type}`);
    }

    // Cache the results
    const cacheKey = `aggregation:${type}:${disasterId}:${timeRange}`;
    await cache.set(cacheKey, result, 3600); // Cache for 1 hour

    return { success: true, data: result };
  } catch (error) {
    logger.error('Data aggregation error:', error);
    throw error;
  }
};

const aggregateDisasterStatistics = async (disasterId, timeRange) => {
  const startDate = getStartDate(timeRange);
  
  const [
    helpRequestStats,
    teamStats,
    resourceStats,
    casualtyTrends
  ] = await Promise.all([
    // Help request statistics
    HelpRequest.findAll({
      where: {
        disasterId,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        'status',
        'urgency',
        'requestType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.literal("EXTRACT(EPOCH FROM (\"completedAt\" - \"assignedAt\"))/3600")), 'avgCompletionHours']
      ],
      group: ['status', 'urgency', 'requestType']
    }),

    // Team statistics
    Team.findAll({
      where: { disasterId },
      attributes: [
        'status',
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.literal('"achievements"->\'peopleRescued\'')), 'totalRescued'],
        [sequelize.fn('SUM', sequelize.literal('"achievements"->\'peopleEvacuated\'')), 'totalEvacuated']
      ],
      group: ['status', 'type']
    }),

    // Resource utilization
    sequelize.query(`
      SELECT 
        r.category,
        SUM(r.quantity) as total_quantity,
        SUM(r."availableQuantity") as available_quantity,
        COUNT(DISTINCT r."institutionId") as contributing_institutions
      FROM "Resources" r
      INNER JOIN "ResourceRequests" rr ON rr."providerId" = r."institutionId"
      WHERE rr."disasterId" = :disasterId
        AND rr.status IN ('approved', 'delivered')
      GROUP BY r.category
    `, {
      replacements: { disasterId },
      type: sequelize.QueryTypes.SELECT
    }),

    // Casualty trends over time
    sequelize.query(`
      SELECT 
        DATE_TRUNC('hour', updated_at) as hour,
        MAX(casualties->>'dead')::int as dead,
        MAX(casualties->>'injured')::int as injured,
        MAX(casualties->>'missing')::int as missing,
        MAX(casualties->>'evacuated')::int as evacuated
      FROM "Disasters"
      WHERE id = :disasterId
        AND updated_at >= :startDate
      GROUP BY hour
      ORDER BY hour
    `, {
      replacements: { disasterId, startDate },
      type: sequelize.QueryTypes.SELECT
    })
  ]);

  return {
    helpRequests: {
      byStatus: groupBy(helpRequestStats, 'status'),
      byUrgency: groupBy(helpRequestStats, 'urgency'),
      byType: groupBy(helpRequestStats, 'requestType'),
      avgCompletionTime: calculateAverage(helpRequestStats, 'avgCompletionHours')
    },
    teams: {
      byStatus: groupBy(teamStats, 'status'),
      byType: groupBy(teamStats, 'type'),
      totalRescued: sumValues(teamStats, 'totalRescued'),
      totalEvacuated: sumValues(teamStats, 'totalEvacuated')
    },
    resources: resourceStats,
    casualties: casualtyTrends,
    lastUpdated: new Date()
  };
};

const aggregateResourceAvailability = async (disasterId) => {
  const resources = await sequelize.query(`
    SELECT 
      r.category,
      r."subCategory",
      r.name,
      SUM(r."availableQuantity") as available,
      SUM(r.quantity) as total,
      COUNT(DISTINCT r."institutionId") as providers,
      STRING_AGG(DISTINCT i.name, ', ') as institutions
    FROM "Resources" r
    INNER JOIN "Institutions" i ON r."institutionId" = i.id
    WHERE r.status = 'available'
      AND r."availableQuantity" > 0
    GROUP BY r.category, r."subCategory", r.name
    ORDER BY r.category, available DESC
  `, {
    type: sequelize.QueryTypes.SELECT
  });

  const critical = await sequelize.query(`
    SELECT 
      rr.resources->>'category' as category,
      rr.resources->>'name' as name,
      SUM((rr.resources->>'requestedQuantity')::int) as requested,
      SUM((rr.resources->>'approvedQuantity')::int) as approved,
      COUNT(*) as request_count
    FROM "ResourceRequests" rr
    WHERE rr."disasterId" = :disasterId
      AND rr.status IN ('pending', 'approved')
      AND rr."createdAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY rr.resources->>'category', rr.resources->>'name'
    ORDER BY requested DESC
    LIMIT 10
  `, {
    replacements: { disasterId },
    type: sequelize.QueryTypes.SELECT
  });

  return {
    available: resources,
    criticalNeeds: critical,
    summary: {
      totalCategories: new Set(resources.map(r => r.category)).size,
      totalProviders: new Set(resources.map(r => r.providers)).size,
      criticalShortages: critical.filter(c => c.approved < c.requested * 0.5).length
    }
  };
};

const aggregateTeamPerformance = async (disasterId, timeRange) => {
  const startDate = getStartDate(timeRange);

  const performance = await sequelize.query(`
    SELECT 
      t.id,
      t.name,
      t.type,
      t.status,
      COUNT(DISTINCT hr.id) as completed_requests,
      AVG(EXTRACT(EPOCH FROM (hr."completedAt" - hr."assignedAt"))/3600) as avg_completion_hours,
      t.achievements->>'peopleRescued' as people_rescued,
      t.achievements->>'peopleEvacuated' as people_evacuated,
      COUNT(DISTINCT p.id) + COUNT(DISTINCT v.id) as team_size
    FROM "Teams" t
    LEFT JOIN "HelpRequests" hr ON hr."assignedTeamId" = t.id 
      AND hr.status = 'completed'
      AND hr."completedAt" >= :startDate
    LEFT JOIN "Personnel" p ON p."teamId" = t.id
    LEFT JOIN "Volunteers" v ON v."teamId" = t.id
    WHERE t."disasterId" = :disasterId
    GROUP BY t.id
    ORDER BY completed_requests DESC
  `, {
    replacements: { disasterId, startDate },
    type: sequelize.QueryTypes.SELECT
  });

  return {
    teams: performance,
    summary: {
      totalTeams: performance.length,
      activeTeams: performance.filter(t => t.status === 'in_operation').length,
      totalCompletedRequests: sumValues(performance, 'completed_requests'),
      avgCompletionTime: calculateAverage(performance, 'avg_completion_hours')
    }
  };
};

const aggregateHelpRequestTrends = async (disasterId, timeRange) => {
  const startDate = getStartDate(timeRange);
  const interval = timeRange === '24h' ? 'hour' : timeRange === '7d' ? 'day' : 'week';

  const trends = await sequelize.query(`
    SELECT 
      DATE_TRUNC(:interval, created_at) as period,
      "requestType",
      urgency,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      AVG(CASE WHEN status = 'completed' 
        THEN EXTRACT(EPOCH FROM ("completedAt" - created_at))/3600 
        END) as avg_resolution_hours
    FROM "HelpRequests"
    WHERE "disasterId" = :disasterId
      AND created_at >= :startDate
    GROUP BY period, "requestType", urgency
    ORDER BY period, count DESC
  `, {
    replacements: { interval, disasterId, startDate },
    type: sequelize.QueryTypes.SELECT
  });

  const hotspots = await sequelize.query(`
    SELECT 
      ST_AsGeoJSON(ST_Centroid(ST_Collect("exactLocation"))) as center,
      COUNT(*) as request_count,
      array_agg(DISTINCT "requestType") as types,
      AVG(CASE 
        WHEN urgency = 'critical' THEN 4
        WHEN urgency = 'high' THEN 3
        WHEN urgency = 'medium' THEN 2
        ELSE 1
      END) as avg_urgency
    FROM "HelpRequests"
    WHERE "disasterId" = :disasterId
      AND created_at >= :startDate
      AND "exactLocation" IS NOT NULL
    GROUP BY ST_SnapToGrid("exactLocation", 0.01)
    HAVING COUNT(*) >= 3
    ORDER BY request_count DESC
    LIMIT 20
  `, {
    replacements: { disasterId, startDate },
    type: sequelize.QueryTypes.SELECT
  });

  return {
    timeline: trends,
    hotspots: hotspots.map(h => ({
      ...h,
      center: JSON.parse(h.center)
    })),
    summary: {
      totalRequests: sumValues(trends, 'count'),
      completionRate: (sumValues(trends, 'completed') / sumValues(trends, 'count') * 100).toFixed(2),
      criticalRequests: trends.filter(t => t.urgency === 'critical').reduce((sum, t) => sum + t.count, 0)
    }
  };
};

const aggregateLocationPriorities = async (disasterId) => {
  const locations = await sequelize.query(`
    SELECT 
      l.id,
      l.name,
      l.type,
      l.priority,
      l."affectedPopulation",
      l."damageAssessment"->>'level' as damage_level,
      COUNT(DISTINCT hr.id) as pending_help_requests,
      COUNT(DISTINCT CASE WHEN hr.urgency = 'critical' THEN hr.id END) as critical_requests,
      array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as assigned_teams,
      l.accessibility->>'byRoad' as road_access,
      l.infrastructure
    FROM "Locations" l
    LEFT JOIN "HelpRequests" hr ON hr."locationId" = l.id 
      AND hr.status IN ('pending', 'assigned')
    LEFT JOIN "Teams" t ON l.id = ANY(t."assignedArea"::text[])
    WHERE l."disasterId" = :disasterId
    GROUP BY l.id
    ORDER BY 
      CASE l.priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      pending_help_requests DESC
  `, {
    replacements: { disasterId },
    type: sequelize.QueryTypes.SELECT
  });

  const priorityMatrix = locations.map(loc => ({
    ...loc,
    priorityScore: calculatePriorityScore(loc),
    recommendedActions: generateLocationRecommendations(loc)
  }));

  return {
    locations: priorityMatrix,
    summary: {
      criticalLocations: locations.filter(l => l.priority === 'critical').length,
      locationsWithoutTeams: locations.filter(l => !l.assigned_teams || l.assigned_teams.length === 0).length,
      inaccessibleLocations: locations.filter(l => l.road_access === 'false').length
    }
  };
};

// Helper functions
const getStartDate = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now - 24 * 60 * 60 * 1000);
  }
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

const sumValues = (array, key) => {
  return array.reduce((sum, item) => sum + (parseInt(item[key]) || 0), 0);
};

const calculateAverage = (array, key) => {
  const values = array.map(item => parseFloat(item[key])).filter(v => !isNaN(v));
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
};

const calculatePriorityScore = (location) => {
  let score = 0;
  
  // Base priority
  switch (location.priority) {
    case 'critical': score += 40; break;
    case 'high': score += 30; break;
    case 'medium': score += 20; break;
    default: score += 10;
  }
  
  // Population impact
  score += Math.min(location.affectedPopulation / 100, 20);
  
  // Pending requests
  score += location.pending_help_requests * 2;
  score += location.critical_requests * 5;
  
  // Damage level
  switch (location.damage_level) {
    case 'destroyed': score += 20; break;
    case 'heavy': score += 15; break;
    case 'moderate': score += 10; break;
    case 'light': score += 5; break;
  }
  
  // Accessibility penalty
  if (location.road_access === 'false') score += 10;
  
  // No team assigned penalty
  if (!location.assigned_teams || location.assigned_teams.length === 0) score += 15;
  
  return Math.min(score, 100);
};

const generateLocationRecommendations = (location) => {
  const recommendations = [];
  
  if (location.critical_requests > 0) {
    recommendations.push('Kritik yardım talepleri var, acil müdahale gerekli');
  }
  
  if (!location.assigned_teams || location.assigned_teams.length === 0) {
    recommendations.push('Bölgeye takım ataması yapılmalı');
  }
  
  if (location.road_access === 'false') {
    recommendations.push('Alternatif ulaşım yöntemleri değerlendirilmeli (helikopter, bot vb.)');
  }
  
  if (location.damage_level === 'destroyed' || location.damage_level === 'heavy') {
    recommendations.push('Ağır hasarlı bölge, arama kurtarma ekipleri öncelikli');
  }
  
  return recommendations;
};

module.exports = {
  aggregateData
};