const express = require('express');
const router = express.Router();
const path = require('path')
const authController = require('../controllers/authController');

router.post('/', authController.handleLogin).get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

module.exports = router;