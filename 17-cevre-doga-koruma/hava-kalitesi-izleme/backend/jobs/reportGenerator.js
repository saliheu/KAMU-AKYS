const { Report, Station, Measurement } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

const generateDailyReports = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active stations
    const stations = await Station.findAll({
      where: { isActive: true }
    });

    for (const station of stations) {
      await generateStationDailyReport(station, yesterday, today);
    }

    // Generate system-wide report
    await generateSystemDailyReport(yesterday, today);
    
    logger.info('Daily reports generated successfully');
  } catch (error) {
    logger.error('Error generating daily reports:', error);
  }
};

const generateStationDailyReport = async (station, startDate, endDate) => {
  try {
    // Get measurements for the station
    const measurements = await Measurement.findAll({
      where: {
        stationId: station.id,
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['timestamp', 'ASC']]
    });

    if (measurements.length === 0) {
      logger.warn(`No measurements found for station ${station.name}`);
      return;
    }

    // Calculate statistics
    const stats = calculateStatistics(measurements);

    // Create report record
    const report = await Report.create({
      title: `${station.name} - Günlük Rapor`,
      type: 'daily',
      format: 'pdf',
      parameters: {
        stationId: station.id,
        stationName: station.name
      },
      startDate,
      endDate,
      stationIds: [station.id],
      status: 'generating',
      createdBy: 'system' // System-generated report
    });

    // Generate PDF
    const filePath = await generatePDF(station, stats, startDate);
    
    // Update report with file info
    await report.update({
      status: 'completed',
      filePath,
      generatedAt: new Date()
    });

    logger.info(`Daily report generated for station ${station.name}`);
  } catch (error) {
    logger.error(`Error generating report for station ${station.name}:`, error);
  }
};

const generateSystemDailyReport = async (startDate, endDate) => {
  // Implementation for system-wide daily report
  logger.info('System-wide daily report generation not implemented yet');
};

const calculateStatistics = (measurements) => {
  const pollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'];
  const stats = {};

  pollutants.forEach(pollutant => {
    const values = measurements
      .map(m => m[pollutant])
      .filter(v => v !== null && v !== undefined);

    if (values.length > 0) {
      stats[pollutant] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        max: Math.max(...values),
        min: Math.min(...values),
        count: values.length
      };
    }
  });

  // AQI statistics
  const aqiValues = measurements
    .map(m => m.aqi)
    .filter(v => v !== null);

  if (aqiValues.length > 0) {
    stats.aqi = {
      avg: Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
      max: Math.max(...aqiValues),
      min: Math.min(...aqiValues),
      count: aqiValues.length
    };
  }

  return stats;
};

const generatePDF = async (station, stats, date) => {
  const reportsDir = path.join(__dirname, '..', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `${station.code}_${date.toISOString().split('T')[0]}.pdf`;
  const filePath = path.join(reportsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text('Hava Kalitesi Günlük Rapor', { align: 'center' });
    doc.fontSize(16).text(station.name, { align: 'center' });
    doc.fontSize(12).text(date.toLocaleDateString('tr-TR'), { align: 'center' });
    
    doc.moveDown(2);

    // Station info
    doc.fontSize(14).text('İstasyon Bilgileri', { underline: true });
    doc.fontSize(10);
    doc.text(`Kod: ${station.code}`);
    doc.text(`Tip: ${station.type}`);
    doc.text(`Konum: ${station.city}, ${station.region}`);
    
    doc.moveDown();

    // Statistics
    doc.fontSize(14).text('Günlük İstatistikler', { underline: true });
    doc.fontSize(10);

    const pollutantNames = {
      pm25: 'PM2.5 (μg/m³)',
      pm10: 'PM10 (μg/m³)',
      co: 'CO (mg/m³)',
      no2: 'NO2 (μg/m³)',
      so2: 'SO2 (μg/m³)',
      o3: 'O3 (μg/m³)',
      aqi: 'Hava Kalitesi İndeksi'
    };

    Object.entries(stats).forEach(([pollutant, values]) => {
      doc.moveDown();
      doc.fontSize(12).text(pollutantNames[pollutant] || pollutant, { underline: true });
      doc.fontSize(10);
      doc.text(`  Ortalama: ${values.avg.toFixed(2)}`);
      doc.text(`  Maksimum: ${values.max.toFixed(2)}`);
      doc.text(`  Minimum: ${values.min.toFixed(2)}`);
      doc.text(`  Ölçüm Sayısı: ${values.count}`);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text('Bu rapor otomatik olarak oluşturulmuştur.', { align: 'center' });
    doc.text(new Date().toLocaleString('tr-TR'), { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = {
  generateDailyReports
};