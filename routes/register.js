const express = require('express');
const router = express.Router();
const path = require('path')
const registerController = require('../controllers/registerController');


router.post('/', registerController.handleNewUser).get('/', 
    (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'views', "signin.html"))
});

module.exports = router;