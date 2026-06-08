const CreditCard = require('../models/CreditCard');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

exports.getAllCards = async (req, res) => {
  try {
    const { page = 1, limit = 9, search = '', sort = '-createdAt', status = '' } = req.query;
    const { cards, total } = await CreditCard.find({
      query: { search, cardStatus: status },
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });

    res.status(200).json({
      success: true,
      data: { cards: cards.map(c => c.toJSON()), total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const card = await CreditCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.status(200).json({ success: true, data: card.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const card = await CreditCard.create({ ...req.body, userId: req.body.userId || req.user.id });
    res.status(201).json({ success: true, message: 'Card created successfully', data: card.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { pin, cvv, ...updateData } = req.body;
    const card = await CreditCard.findByIdAndUpdate(req.params.id, updateData);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.status(200).json({ success: true, message: 'Card updated successfully', data: card.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await CreditCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.status(200).json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const card = await CreditCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    const isMatch = await card.matchPin(oldPin);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid current PIN' });

    await CreditCard.findByIdAndUpdate(req.params.id, { pin: newPin });
    res.status(200).json({ success: true, message: 'PIN changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadCard = async (req, res) => {
  try {
    const card = await CreditCard.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=card-${card.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a365d').text('Credit Card Details', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#3182ce').lineWidth(2).stroke();
    doc.moveDown(1);

    const addField = (label, value) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#4a5568').text(label, { continued: true });
      doc.font('Helvetica').fillColor('#2d3748').text(`  ${value || 'N/A'}`);
      doc.moveDown(0.4);
    };

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2d3748').text('Card Information');
    doc.moveDown(0.5);
    addField('Card Holder:', card.cardHolderName);
    addField('Card Number:', `**** **** **** ${String(card.cardNumber).slice(-4)}`);
    addField('Card Type:', card.cardType);
    addField('Expiry Date:', card.expiryDate);
    addField('Card Status:', card.cardStatus.toUpperCase());
    addField('Credit Limit:', `$${Number(card.creditLimit).toLocaleString()}`);
    addField('Available Balance:', `$${Number(card.availableBalance).toLocaleString()}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#2d3748').text('Account Holder Information');
    doc.moveDown(0.5);
    if (card.userId && typeof card.userId === 'object') {
      addField('Name:', `${card.userId.firstName} ${card.userId.lastName}`);
      addField('Email:', card.userId.email);
      addField('Phone:', card.userId.phone);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#718096').text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });
    doc.text('This is a confidential document. Do not share.', { align: 'center' });
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCards = await CreditCard.countDocuments();
    const activeCards = await CreditCard.countDocuments({ cardStatus: 'active' });
    const blockedCards = await CreditCard.countDocuments({ cardStatus: 'blocked' });
    const cardStatusStats = await CreditCard.aggregate();
    const monthlyRegistrations = await CreditCard.monthlyRegistrations();

    res.status(200).json({
      success: true,
      data: { totalUsers, totalCards, activeCards, blockedCards, cardStatusStats, monthlyRegistrations }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
