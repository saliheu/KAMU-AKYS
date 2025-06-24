const { Report, Disaster, HelpRequest, Resource, Team, Location } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const generateReport = async (job) => {
  const { reportId } = job.data;

  try {
    const report = await Report.findByPk(reportId, {
      include: [{ model: Disaster }]
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Update report status
    await report.update({ status: 'pending_review' });

    // Gather data based on report type
    let reportData = {};
    
    switch (report.type) {
      case 'situation':
        reportData = await generateSituationReport(report);
        break;
      case 'damage_assessment':
        reportData = await generateDamageReport(report);
        break;
      case 'resource_status':
        reportData = await generateResourceReport(report);
        break;
      case 'daily':
      case 'weekly':
        reportData = await generatePeriodicReport(report);
        break;
      default:
        reportData = await generateCustomReport(report);
    }

    // Update report with generated data
    await report.update({
      content: reportData.content,
      data: reportData.statistics,
      status: 'pending_review'
    });

    // Generate files if needed
    if (job.data.formats) {
      const attachments = [];
      
      if (job.data.formats.includes('pdf')) {
        const pdfPath = await generatePDF(report, reportData);
        attachments.push({
          name: `${report.reportNumber}.pdf`,
          url: pdfPath,
          type: 'pdf',
          size: (await fs.stat(pdfPath)).size
        });
      }
      
      if (job.data.formats.includes('excel')) {
        const excelPath = await generateExcel(report, reportData);
        attachments.push({
          name: `${report.reportNumber}.xlsx`,
          url: excelPath,
          type: 'excel',
          size: (await fs.stat(excelPath)).size
        });
      }

      await report.update({ attachments });
    }

    return { success: true, reportId: report.id };
  } catch (error) {
    logger.error('Report generation error:', error);
    throw error;
  }
};

const generateSituationReport = async (report) => {
  const disaster = report.Disaster;
  const { start, end } = report.period;

  // Get current statistics
  const [helpRequests, teams, locations, resources] = await Promise.all([
    HelpRequest.count({
      where: {
        disasterId: disaster.id,
        createdAt: { [Op.between]: [start, end] }
      },
      group: ['status', 'urgency']
    }),
    Team.findAll({
      where: { disasterId: disaster.id },
      include: ['members', 'volunteers']
    }),
    Location.findAll({
      where: { disasterId: disaster.id }
    }),
    Resource.findAll({
      include: [{
        model: ResourceRequest,
        where: { disasterId: disaster.id },
        required: false
      }]
    })
  ]);

  const statistics = {
    totalHelpRequests: helpRequests.reduce((sum, hr) => sum + hr.count, 0),
    helpRequestsByStatus: helpRequests.reduce((acc, hr) => {
      acc[hr.status] = hr.count;
      return acc;
    }, {}),
    activeTeams: teams.filter(t => t.status === 'in_operation').length,
    totalPersonnel: teams.reduce((sum, t) => sum + t.members.length + t.volunteers.length, 0),
    affectedLocations: locations.length,
    criticalLocations: locations.filter(l => l.priority === 'critical').length
  };

  const content = {
    summary: `${disaster.name} afeti için ${new Date(start).toLocaleDateString('tr-TR')} - ${new Date(end).toLocaleDateString('tr-TR')} tarihleri arasındaki durum raporu.`,
    sections: [
      {
        title: 'Genel Durum',
        content: `Afet ${disaster.status} durumunda. Toplam ${statistics.totalHelpRequests} yardım talebi alınmış, ${statistics.activeTeams} takım sahada aktif.`
      },
      {
        title: 'Yardım Talepleri',
        content: `Bekleyen: ${statistics.helpRequestsByStatus.pending || 0}, İşlemde: ${statistics.helpRequestsByStatus.in_progress || 0}, Tamamlanan: ${statistics.helpRequestsByStatus.completed || 0}`
      },
      {
        title: 'Saha Durumu',
        content: `${statistics.affectedLocations} bölge etkilenmiş, ${statistics.criticalLocations} kritik seviyede.`
      }
    ],
    recommendations: [
      'Kritik bölgelere ek takım sevkiyatı önerilir',
      'Gıda ve su stoklarının artırılması gerekli'
    ]
  };

  return { content, statistics };
};

const generateDamageReport = async (report) => {
  // Implement damage assessment report generation
  return {
    content: {
      summary: 'Hasar tespit raporu',
      sections: []
    },
    statistics: {}
  };
};

const generateResourceReport = async (report) => {
  // Implement resource status report generation
  return {
    content: {
      summary: 'Kaynak durum raporu',
      sections: []
    },
    statistics: {}
  };
};

const generatePeriodicReport = async (report) => {
  // Implement periodic report generation
  return {
    content: {
      summary: 'Periyodik durum raporu',
      sections: []
    },
    statistics: {}
  };
};

const generateCustomReport = async (report) => {
  // Use the custom content provided
  return {
    content: report.content,
    statistics: report.data
  };
};

const generatePDF = async (report, data) => {
  const doc = new PDFDocument();
  const filename = `report_${report.reportNumber}_${Date.now()}.pdf`;
  const filepath = path.join(process.cwd(), 'uploads', 'reports', filename);

  // Ensure directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  // Create write stream
  doc.pipe(fs.createWriteStream(filepath));

  // Add content
  doc.fontSize(20).text('AFET KOORDİNASYON MERKEZİ', { align: 'center' });
  doc.fontSize(16).text(report.title, { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(12).text(`Rapor No: ${report.reportNumber}`);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
  doc.moveDown();

  // Add summary
  if (data.content.summary) {
    doc.fontSize(14).text('Özet', { underline: true });
    doc.fontSize(11).text(data.content.summary);
    doc.moveDown();
  }

  // Add sections
  data.content.sections.forEach(section => {
    doc.fontSize(14).text(section.title, { underline: true });
    doc.fontSize(11).text(section.content);
    doc.moveDown();
  });

  // Finalize PDF
  doc.end();

  return `/uploads/reports/${filename}`;
};

const generateExcel = async (report, data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rapor');

  // Add headers
  worksheet.columns = [
    { header: 'Metrik', key: 'metric', width: 30 },
    { header: 'Değer', key: 'value', width: 20 }
  ];

  // Add data
  Object.entries(data.statistics).forEach(([key, value]) => {
    worksheet.addRow({ metric: key, value: value });
  });

  // Style the header
  worksheet.getRow(1).font = { bold: true };

  // Save file
  const filename = `report_${report.reportNumber}_${Date.now()}.xlsx`;
  const filepath = path.join(process.cwd(), 'uploads', 'reports', filename);
  
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await workbook.xlsx.writeFile(filepath);

  return `/uploads/reports/${filename}`;
};

module.exports = {
  generateReport
};