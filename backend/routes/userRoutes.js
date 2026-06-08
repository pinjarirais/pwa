const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, updateProfile, changePassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/profile', updateProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
