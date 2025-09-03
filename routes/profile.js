const express = require('express');
const router = express.Router();
const path = require('path');
const profileContrller = require('../controllers/profileController')

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
});

router.post('/', profileContrller.handleChange)

module.exports = router;