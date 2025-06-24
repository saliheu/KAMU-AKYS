const router = require('express').Router();
const Joi = require('joi');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const disasterController = require('../controllers/disaster.controller');

// Validation schemas
const createDisasterSchema = Joi.object({
  type: Joi.string().valid(
    'earthquake', 'flood', 'fire', 'landslide', 'avalanche',
    'storm', 'tsunami', 'pandemic', 'cbrn', 'terror_attack', 'other'
  ).required(),
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  startDate: Joi.date().iso().required(),
  epicenter: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional(),
  estimatedAffectedPopulation: Joi.number().min(0).optional()
});

const updateDisasterSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  status: Joi.string().valid('alert', 'active', 'controlled', 'recovery', 'closed').optional(),
  endDate: Joi.date().iso().optional(),
  casualties: Joi.object({
    dead: Joi.number().min(0).optional(),
    injured: Joi.number().min(0).optional(),
    missing: Joi.number().min(0).optional(),
    evacuated: Joi.number().min(0).optional()
  }).optional(),
  responsePhase: Joi.string().valid(
    'initial_assessment', 'search_rescue', 'emergency_aid',
    'temporary_shelter', 'recovery', 'reconstruction'
  ).optional()
});

/**
 * @swagger
 * tags:
 *   name: Disasters
 *   description: Afet yönetimi işlemleri
 */

// Public route for active disasters (for citizens to see)
router.get('/public/active', disasterController.getActiveDisastersPublic);

// Protected routes
router.use(authenticate);

router.get('/', checkPermission('disaster', 'read'), disasterController.getDisasters);
router.get('/:id', checkPermission('disaster', 'read'), disasterController.getDisaster);
router.get('/:id/statistics', checkPermission('disaster', 'read'), disasterController.getDisasterStatistics);
router.get('/:id/map-data', checkPermission('disaster', 'read'), disasterController.getMapData);

router.post(
  '/',
  authorize('coordinator', 'city_manager'),
  validate(createDisasterSchema),
  disasterController.createDisaster
);

router.put(
  '/:id',
  authorize('coordinator', 'city_manager'),
  validate(updateDisasterSchema),
  disasterController.updateDisaster
);

router.post(
  '/:id/assign-coordinator',
  authorize('coordinator'),
  disasterController.assignCoordinator
);

router.post(
  '/:id/affected-area',
  authorize('coordinator', 'city_manager', 'field_officer'),
  disasterController.addAffectedArea
);

router.put(
  '/:id/casualties',
  authorize('coordinator', 'city_manager', 'field_officer'),
  disasterController.updateCasualties
);

router.post(
  '/:id/alert',
  authorize('coordinator', 'city_manager'),
  disasterController.sendAlert
);

module.exports = router;