const express = require('express');
const router = express.Router();
const {
  getAllCards, getCardById, createCard, updateCard, deleteCard, changePin, downloadCard, getDashboardStats
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/download/:id', downloadCard);
router.put('/change-pin/:id', changePin);
router.route('/').get(getAllCards).post(createCard);
router.route('/:id').get(getCardById).put(updateCard).delete(deleteCard);

module.exports = router;
