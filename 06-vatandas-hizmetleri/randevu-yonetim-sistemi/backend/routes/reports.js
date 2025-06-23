const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get appointment statistics
router.get('/statistics', [auth, authorize('admin', 'staff')], async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (departmentId) {
      query.department = departmentId;
    }
    
    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const departmentStats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $project: {
          name: '$department.name',
          count: 1
        }
      }
    ]);
    
    res.json({
      statusStats: stats,
      departmentStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;