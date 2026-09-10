const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.patch('/profile', auth, authController.updateProfileController);
router.patch('/profile/password', auth, authController.updatePasswordController);

module.exports = router;