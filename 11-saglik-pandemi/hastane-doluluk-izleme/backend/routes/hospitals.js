const router = require('express').Router();
const { Hospital, HospitalDepartment, Department } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { canAccessHospital } = require('../utils/auth');

// Get all hospitals
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { city, region, type } = req.query;
    const where = { isActive: true };

    if (city) where.city = city;
    if (region) where.region = region;
    if (type) where.type = type;

    let hospitals;
    
    if (req.user.role === 'hospital_admin') {
      // Hospital admins only see their hospitals
      hospitals = await req.user.getHospitals({
        where,
        include: [{
          model: Department,
          as: 'departments',
          through: { attributes: ['totalBeds', 'occupiedBeds', 'availableBeds'] }
        }]
      });
    } else {
      hospitals = await Hospital.findAll({
        where,
        include: [{
          model: Department,
          as: 'departments',
          through: { attributes: ['totalBeds', 'occupiedBeds', 'availableBeds'] }
        }]
      });
    }

    res.json(hospitals);
  } catch (error) {
    next(error);
  }
});

// Get single hospital
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const canAccess = await canAccessHospital(req.user, req.params.id);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const hospital = await Hospital.findByPk(req.params.id, {
      include: [{
        model: Department,
        as: 'departments',
        through: { 
          attributes: ['id', 'totalBeds', 'occupiedBeds', 'availableBeds', 'lastUpdated'] 
        }
      }]
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    next(error);
  }
});

// Create hospital
router.post('/', authenticate, authorize('super_admin', 'admin'), async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (error) {
    next(error);
  }
});

// Update hospital
router.put('/:id', authenticate, authorize('super_admin', 'admin', 'hospital_admin'), async (req, res, next) => {
  try {
    const canAccess = await canAccessHospital(req.user, req.params.id);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    await hospital.update(req.body);
    res.json(hospital);
  } catch (error) {
    next(error);
  }
});

// Get hospital statistics
router.get('/:id/stats', authenticate, async (req, res, next) => {
  try {
    const canAccess = await canAccessHospital(req.user, req.params.id);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const departments = await HospitalDepartment.findAll({
      where: { hospitalId: req.params.id },
      include: [{ model: Department, as: 'department' }]
    });

    const stats = {
      totalBeds: departments.reduce((sum, d) => sum + d.totalBeds, 0),
      occupiedBeds: departments.reduce((sum, d) => sum + d.occupiedBeds, 0),
      availableBeds: departments.reduce((sum, d) => sum + d.availableBeds, 0),
      occupancyRate: 0,
      departmentStats: departments.map(d => ({
        department: d.department.name,
        totalBeds: d.totalBeds,
        occupiedBeds: d.occupiedBeds,
        availableBeds: d.availableBeds,
        occupancyRate: d.getOccupancyRate()
      }))
    };

    if (stats.totalBeds > 0) {
      stats.occupancyRate = ((stats.occupiedBeds / stats.totalBeds) * 100).toFixed(2);
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;