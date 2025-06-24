const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { HospitalDepartment, OccupancyRecord, Hospital, Department } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { canAccessHospital } = require('../utils/auth');
const { broadcast } = require('../websocket');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Update occupancy data
router.post('/update', [
  body('hospitalId').isUUID(),
  body('departmentId').isUUID(),
  body('occupiedBeds').isInt({ min: 0 }),
  body('totalBeds').isInt({ min: 0 }).optional(),
  body('reservedBeds').isInt({ min: 0 }).optional(),
  body('ventilatorOccupied').isInt({ min: 0 }).optional(),
  body('ventilatorTotal').isInt({ min: 0 }).optional()
], authenticate, authorize('hospital_admin', 'department_head', 'admin'), validate, async (req, res, next) => {
  try {
    const { hospitalId, departmentId, ...updateData } = req.body;

    const canAccess = await canAccessHospital(req.user, hospitalId);
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find or create hospital department record
    let hospitalDept = await HospitalDepartment.findOne({
      where: { hospitalId, departmentId }
    });

    if (!hospitalDept) {
      hospitalDept = await HospitalDepartment.create({
        hospitalId,
        departmentId,
        ...updateData
      });
    } else {
      await hospitalDept.update(updateData);
    }

    // Create occupancy record for history
    const occupancyRecord = await OccupancyRecord.create({
      hospitalDepartmentId: hospitalDept.id,
      totalBeds: hospitalDept.totalBeds,
      occupiedBeds: hospitalDept.occupiedBeds,
      availableBeds: hospitalDept.availableBeds,
      reservedBeds: hospitalDept.reservedBeds,
      occupancyRate: hospitalDept.getOccupancyRate(),
      ventilatorTotal: hospitalDept.ventilatorTotal,
      ventilatorOccupied: hospitalDept.ventilatorOccupied
    });

    // Get full data for WebSocket broadcast
    const fullData = await HospitalDepartment.findByPk(hospitalDept.id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Department, as: 'department' }
      ]
    });

    // Broadcast update via WebSocket
    broadcast('occupancy_update', {
      hospital: fullData.hospital,
      department: fullData.department,
      occupancy: {
        totalBeds: fullData.totalBeds,
        occupiedBeds: fullData.occupiedBeds,
        availableBeds: fullData.availableBeds,
        occupancyRate: fullData.getOccupancyRate()
      }
    }, [`hospital_${hospitalId}`]);

    res.json({
      hospitalDepartment: fullData,
      occupancyRecord
    });
  } catch (error) {
    next(error);
  }
});

// Get occupancy history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { hospitalId, departmentId, startDate, endDate } = req.query;
    const where = {};

    if (startDate) where.timestamp = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      where.timestamp = where.timestamp || {};
      where.timestamp[Op.lte] = new Date(endDate);
    }

    const include = [{
      model: HospitalDepartment,
      as: 'hospitalDepartment',
      where: {},
      include: [
        { model: Hospital, as: 'hospital' },
        { model: Department, as: 'department' }
      ]
    }];

    if (hospitalId) {
      include[0].where.hospitalId = hospitalId;
    }
    if (departmentId) {
      include[0].where.departmentId = departmentId;
    }

    const records = await OccupancyRecord.findAll({
      where,
      include,
      order: [['timestamp', 'DESC']],
      limit: 1000
    });

    res.json(records);
  } catch (error) {
    next(error);
  }
});

// Get current occupancy for all hospitals
router.get('/current', authenticate, async (req, res, next) => {
  try {
    const { region, city, critical } = req.query;
    
    const hospitalWhere = {};
    if (region) hospitalWhere.region = region;
    if (city) hospitalWhere.city = city;

    const departmentWhere = {};
    if (critical === 'true') departmentWhere.isCritical = true;

    const occupancyData = await HospitalDepartment.findAll({
      include: [
        {
          model: Hospital,
          as: 'hospital',
          where: hospitalWhere
        },
        {
          model: Department,
          as: 'department',
          where: departmentWhere
        }
      ],
      order: [['lastUpdated', 'DESC']]
    });

    const formattedData = occupancyData.map(item => ({
      hospital: {
        id: item.hospital.id,
        name: item.hospital.name,
        city: item.hospital.city,
        region: item.hospital.region
      },
      department: {
        id: item.department.id,
        name: item.department.name,
        category: item.department.category
      },
      occupancy: {
        totalBeds: item.totalBeds,
        occupiedBeds: item.occupiedBeds,
        availableBeds: item.availableBeds,
        occupancyRate: item.getOccupancyRate(),
        lastUpdated: item.lastUpdated
      }
    }));

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;