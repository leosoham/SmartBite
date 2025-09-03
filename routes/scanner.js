const path = require('path')
const express = require('express')
const router = express.Router()
const saveSearch = require('../controllers/history')


router.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'views', 'scanner.html'))
})



module.exports = router;