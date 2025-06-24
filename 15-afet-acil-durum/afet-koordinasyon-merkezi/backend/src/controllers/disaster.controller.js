const { Disaster, Location, Team, HelpRequest, SafeZone, User } = require('../models');
const { Op } = require('sequelize');
const { cache } = require('../config/redis');
const { addNotificationJob } = require('../workers');
const logger = require('../utils/logger');

const disasterController = {
  async getDisasters(req, res, next) {
    try {
      const { status, type, severity, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (severity) where.severity = severity;

      const { count, rows } = await Disaster.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'coordinator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        disasters: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      next(error);
    }
  },

  async getDisaster(req, res, next) {
    try {
      const { id } = req.params;

      // Try cache first
      const cached = await cache.get(`disaster:${id}`);
      if (cached) {
        return res.json({ disaster: cached });
      }

      const disaster = await Disaster.findByPk(id, {
        include: [
          {
            model: User,
            as: 'coordinator',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
          },
          {
            model: Location,
            as: 'affectedAreas',
            attributes: ['id', 'name', 'type', 'priority', 'affectedPopulation']
          },
          {
            model: SafeZone,
            attributes: ['id', 'name', 'type', 'status', 'capacity']
          }
        ]
      });

      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      // Cache for 5 minutes
      await cache.set(`disaster:${id}`, disaster.toJSON(), 300);

      res.json({ disaster });
    } catch (error) {
      next(error);
    }
  },

  async createDisaster(req, res, next) {
    try {
      const data = req.body;
      data.coordinatorId = req.user.id;

      // Create epicenter location if provided
      if (data.epicenter) {
        data.epicenter = {
          type: 'Point',
          coordinates: [data.epicenter.longitude, data.epicenter.latitude]
        };
      }

      const disaster = await Disaster.create(data);

      // Send notifications to relevant users
      await addNotificationJob({
        type: 'disaster_alert',
        disasterId: disaster.id,
        priority: disaster.severity === 'critical' ? 'critical' : 'high',
        title: `Yeni Afet: ${disaster.name}`,
        message: `${disaster.type} türünde yeni bir afet bildirildi. Seviye: ${disaster.severity}`,
        roles: ['coordinator', 'city_manager', 'field_officer']
      });

      // Emit socket event
      const io = req.app.get('io');
      io.emit('disaster:new', {
        disaster: disaster.toJSON(),
        createdBy: `${req.user.firstName} ${req.user.lastName}`
      });

      logger.info(`New disaster created: ${disaster.id} by user ${req.user.id}`);

      res.status(201).json({
        message: 'Afet başarıyla oluşturuldu',
        disaster
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDisaster(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const disaster = await Disaster.findByPk(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      await disaster.update(updates);

      // Clear cache
      await cache.del(`disaster:${id}`);

      // Emit update event
      const io = req.app.get('io');
      io.to(`disaster:${id}`).emit('disaster:updated', {
        disasterId: id,
        updates,
        updatedBy: `${req.user.firstName} ${req.user.lastName}`
      });

      res.json({
        message: 'Afet güncellendi',
        disaster
      });
    } catch (error) {
      next(error);
    }
  },

  async getDisasterStatistics(req, res, next) {
    try {
      const { id } = req.params;

      // Check cache
      const cached = await cache.get(`disaster:stats:${id}`);
      if (cached) {
        return res.json(cached);
      }

      const [
        helpRequestStats,
        teamStats,
        locationStats,
        safeZoneStats
      ] = await Promise.all([
        // Help request statistics
        HelpRequest.findAll({
          where: { disasterId: id },
          attributes: [
            'status',
            'urgency',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status', 'urgency']
        }),

        // Team statistics
        Team.findAll({
          where: { disasterId: id },
          attributes: [
            'status',
            'type',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status', 'type']
        }),

        // Location statistics
        Location.findAll({
          where: { disasterId: id },
          attributes: [
            'priority',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('affectedPopulation')), 'totalPopulation']
          ],
          group: ['priority']
        }),

        // Safe zone statistics
        SafeZone.findAll({
          where: { disasterId: id },
          attributes: [
            'type',
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.literal("(capacity->>'total')::int")), 'totalCapacity'],
            [sequelize.fn('SUM', sequelize.literal("(capacity->>'current')::int")), 'currentOccupancy']
          ],
          group: ['type', 'status']
        })
      ]);

      const statistics = {
        helpRequests: helpRequestStats,
        teams: teamStats,
        locations: locationStats,
        safeZones: safeZoneStats,
        timestamp: new Date()
      };

      // Cache for 10 minutes
      await cache.set(`disaster:stats:${id}`, statistics, 600);

      res.json(statistics);
    } catch (error) {
      next(error);
    }
  },

  async getMapData(req, res, next) {
    try {
      const { id } = req.params;

      const [locations, teams, helpRequests, safeZones] = await Promise.all([
        Location.findAll({
          where: { disasterId: id },
          attributes: ['id', 'name', 'type', 'coordinates', 'priority', 'damageAssessment']
        }),
        Team.findAll({
          where: { 
            disasterId: id,
            currentLocation: { [Op.ne]: null }
          },
          attributes: ['id', 'name', 'type', 'status', 'currentLocation']
        }),
        HelpRequest.findAll({
          where: { 
            disasterId: id,
            exactLocation: { [Op.ne]: null },
            status: ['pending', 'assigned']
          },
          attributes: ['id', 'requestType', 'urgency', 'status', 'exactLocation']
        }),
        SafeZone.findAll({
          where: { disasterId: id },
          attributes: ['id', 'name', 'type', 'status', 'coordinates', 'capacity']
        })
      ]);

      res.json({
        locations: locations.map(l => ({
          ...l.toJSON(),
          coordinates: l.coordinates ? {
            lat: l.coordinates.coordinates[1],
            lng: l.coordinates.coordinates[0]
          } : null
        })),
        teams: teams.map(t => ({
          ...t.toJSON(),
          location: t.currentLocation ? {
            lat: t.currentLocation.coordinates[1],
            lng: t.currentLocation.coordinates[0]
          } : null
        })),
        helpRequests: helpRequests.map(hr => ({
          ...hr.toJSON(),
          location: hr.exactLocation ? {
            lat: hr.exactLocation.coordinates[1],
            lng: hr.exactLocation.coordinates[0]
          } : null
        })),
        safeZones: safeZones.map(sz => ({
          ...sz.toJSON(),
          location: sz.coordinates ? {
            lat: sz.coordinates.coordinates[1],
            lng: sz.coordinates.coordinates[0]
          } : null
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  async getActiveDisastersPublic(req, res, next) {
    try {
      const disasters = await Disaster.findAll({
        where: {
          status: ['active', 'controlled'],
          severity: ['high', 'critical']
        },
        attributes: [
          'id', 'type', 'name', 'description', 'severity', 
          'status', 'startDate', 'affectedArea'
        ],
        order: [['severity', 'DESC'], ['startDate', 'DESC']]
      });

      res.json({ disasters });
    } catch (error) {
      next(error);
    }
  },

  async assignCoordinator(req, res, next) {
    try {
      const { id } = req.params;
      const { coordinatorId } = req.body;

      const [disaster, coordinator] = await Promise.all([
        Disaster.findByPk(id),
        User.findByPk(coordinatorId)
      ]);

      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      if (!coordinator || !['coordinator', 'city_manager'].includes(coordinator.role)) {
        return res.status(400).json({ error: 'Geçersiz koordinatör' });
      }

      await disaster.update({ coordinatorId });

      res.json({
        message: 'Koordinatör atandı',
        disaster
      });
    } catch (error) {
      next(error);
    }
  },

  async addAffectedArea(req, res, next) {
    try {
      const { id } = req.params;
      const { name, coordinates, population, priority } = req.body;

      const disaster = await Disaster.findByPk(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      const location = await Location.create({
        disasterId: id,
        name,
        type: 'district',
        coordinates: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        affectedPopulation: population,
        priority
      });

      // Emit to map subscribers
      const io = req.app.get('io');
      io.to(`disaster:${id}`).emit('disaster:area:added', {
        location: location.toJSON()
      });

      res.status(201).json({
        message: 'Etkilenen bölge eklendi',
        location
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCasualties(req, res, next) {
    try {
      const { id } = req.params;
      const { casualties } = req.body;

      const disaster = await Disaster.findByPk(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      await disaster.update({ casualties });

      // Clear cache
      await cache.del(`disaster:${id}`);

      // Emit critical update
      const io = req.app.get('io');
      io.emit('disaster:casualties:update', {
        disasterId: id,
        casualties,
        timestamp: new Date()
      });

      res.json({
        message: 'Kayıp bilgileri güncellendi',
        casualties
      });
    } catch (error) {
      next(error);
    }
  },

  async sendAlert(req, res, next) {
    try {
      const { id } = req.params;
      const { message, channels = ['in_app', 'sms'], targetAreas } = req.body;

      const disaster = await Disaster.findByPk(id);
      if (!disaster) {
        return res.status(404).json({ error: 'Afet bulunamadı' });
      }

      // Create notification job
      await addNotificationJob({
        type: 'emergency_alert',
        disasterId: id,
        priority: 'critical',
        title: `ACİL: ${disaster.name}`,
        message,
        channels,
        targetAreas,
        broadcast: true
      });

      res.json({
        message: 'Acil durum uyarısı gönderiliyor'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = disasterController;