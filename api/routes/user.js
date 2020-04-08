const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', UsersController.users_signup_user);

router.post('/login', UsersController.users_login_user);

router.delete('/:userId', checkAuth, UsersController.users_delete_user);

module.exports = router;