const { Contract, Tender, Supplier, Bid } = require('../models');
const { Op } = require('sequelize');

const generateContractNumber = async () => {
  const year = new Date().getFullYear();
  const lastContract = await Contract.findOne({
    where: {
      contractNumber: {
        [Op.like]: `SZ-${year}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });

  let nextNumber = 1;
  if (lastContract) {
    const lastNumber = parseInt(lastContract.contractNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `SZ-${year}-${nextNumber.toString().padStart(6, '0')}`;
};

exports.getAllContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Contract.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'companyName', 'taxNumber']
        },
        {
          model: Tender,
          as: 'tender',
          attributes: ['id', 'tenderNumber']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      contracts: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalContracts: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Sözleşmeler getirilemedi' });
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: Tender,
          as: 'tender',
          include: [{
            model: Bid,
            as: 'bids',
            where: { isWinner: true }
          }]
        }
      ]
    });
    
    if (!contract) {
      return res.status(404).json({ error: 'Sözleşme bulunamadı' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Sözleşme getirilemedi' });
  }
};

exports.createContract = async (req, res) => {
  try {
    // Kazanan teklifi bul
    const winnerBid = await Bid.findOne({
      where: {
        tenderId: req.body.tenderId,
        isWinner: true
      }
    });

    if (!winnerBid) {
      return res.status(400).json({ error: 'Bu ihale için kazanan teklif bulunamadı' });
    }

    const contractData = {
      ...req.body,
      contractNumber: await generateContractNumber(),
      supplierId: winnerBid.supplierId,
      contractAmount: winnerBid.bidAmount,
      status: 'taslak'
    };

    const contract = await Contract.create(contractData);

    // İhale durumunu güncelle
    const tender = await Tender.findByPk(req.body.tenderId);
    tender.status = 'sonuclandi';
    await tender.save();

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Sözleşme oluşturulamadı' });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Sözleşme bulunamadı' });
    }

    if (!['taslak', 'imza_bekliyor'].includes(contract.status)) {
      return res.status(400).json({ error: 'Bu aşamada sözleşme güncellenemez' });
    }

    await contract.update(req.body);
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Sözleşme güncellenemedi' });
  }
};

exports.signContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Sözleşme bulunamadı' });
    }

    if (contract.status !== 'imza_bekliyor') {
      return res.status(400).json({ error: 'Bu sözleşme imzalanamaz' });
    }

    contract.status = 'aktif';
    contract.signedBy = {
      ...contract.signedBy,
      authority: {
        userId: req.user.id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        signDate: new Date()
      }
    };

    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Sözleşme imzalanamadı' });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Sözleşme bulunamadı' });
    }

    if (contract.status !== 'taslak') {
      return res.status(400).json({ error: 'Sadece taslak sözleşmeler silinebilir' });
    }

    await contract.destroy();
    res.json({ message: 'Sözleşme silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Sözleşme silinemedi' });
  }
};