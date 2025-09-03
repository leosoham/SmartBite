const path = require('path')
const express = require('express')
const router = express.Router()
const saveSearch = require('../controllers/history')


router.post('/', saveSearch.addSearch).get('/', saveSearch.getSearch)



module.exports = router;