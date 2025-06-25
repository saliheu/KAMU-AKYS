const Court = require('../models/Court');
const Judge = require('../models/Judge');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Get courts
exports.getCourts = async (req, res, next) => {
  try {
    const filters = {
      tur: req.query.tur,
      il: req.query.il,
      ilce: req.query.ilce,
      aktif: req.query.aktif !== 'false',
      search: req.query.search,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    // Check cache first
    const cacheKey = `courts:${JSON.stringify(filters)}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get courts
    let courts = await Court.find(filters);

    // Calculate distance if coordinates provided
    if (req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);

      courts = courts.map(court => {
        const distance = court.calculateDistance(lat, lng);
        return {
          ...court,
          distance
        };
      }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    const response = {
      courts,
      total: courts.length,
      limit: filters.limit,
      offset: filters.offset
    };

    // Cache the results
    await cache.set(cacheKey, response, 600); // 10 minutes

    res.json(response);
  } catch (error) {
    logger.error('Get courts hatası:', error);
    next(error);
  }
};

// Get court by ID
exports.getCourtById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check cache
    const cacheKey = `court:${id}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json({ court: cachedData });
    }

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Cache the result
    await cache.set(cacheKey, court, 600); // 10 minutes

    res.json({ court });
  } catch (error) {
    logger.error('Get court by ID hatası:', error);
    next(error);
  }
};

// Get court judges
exports.getCourtJudges = async (req, res, next) => {
  try {
    const { id } = req.params;

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    const judges = await court.getJudges();

    res.json({ judges });
  } catch (error) {
    logger.error('Get court judges hatası:', error);
    next(error);
  }
};

// Get available slots
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, judgeId } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Tarih parametresi gerekli' });
    }

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Check cache
    const cacheKey = `slots:${id}:${date}${judgeId ? `:${judgeId}` : ''}`;
    const cachedSlots = await cache.get(cacheKey);
    if (cachedSlots) {
      return res.json({ slots: cachedSlots });
    }

    const availableSlots = await court.getAvailableSlots(date, judgeId);

    // Cache for 5 minutes
    await cache.set(cacheKey, availableSlots, 300);

    res.json({ 
      slots: availableSlots,
      date,
      courtId: id,
      judgeId
    });
  } catch (error) {
    logger.error('Get available slots hatası:', error);
    next(error);
  }
};

// Get court statistics
exports.getCourtStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Başlangıç ve bitiş tarihleri gerekli' });
    }

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    const statistics = await court.getStatistics(startDate, endDate);

    res.json({ statistics });
  } catch (error) {
    logger.error('Get court statistics hatası:', error);
    next(error);
  }
};

// Create court (Admin only)
exports.createCourt = async (req, res, next) => {
  try {
    const courtData = req.body;

    // Validate required fields
    if (!courtData.ad || !courtData.tur || !courtData.adres) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }

    // Create court
    const court = await Court.create(courtData);

    // Clear cache
    await cache.delPattern('courts:*');

    res.status(201).json({
      message: 'Mahkeme oluşturuldu',
      court
    });
  } catch (error) {
    logger.error('Create court hatası:', error);
    next(error);
  }
};

// Update court (Admin only)
exports.updateCourt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Update court
    await court.update(updateData);

    // Clear cache
    await cache.delPattern('courts:*');
    await cache.del(`court:${id}`);

    res.json({
      message: 'Mahkeme güncellendi',
      court
    });
  } catch (error) {
    logger.error('Update court hatası:', error);
    next(error);
  }
};

// Delete court (Admin only)
exports.deleteCourt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ error: 'Mahkeme bulunamadı' });
    }

    // Soft delete by deactivating
    await court.update({ aktif: false });

    // Clear cache
    await cache.delPattern('courts:*');
    await cache.del(`court:${id}`);

    res.json({
      message: 'Mahkeme silindi'
    });
  } catch (error) {
    logger.error('Delete court hatası:', error);
    next(error);
  }
};