const { getDb } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleChange = async (req, res) => {
    const { original, user, rname } = req.body;
    if (!original) return res.status(400).json({ 'message': 'Username and rname are required.' });
    
    try {
        const db = getDb();
        const foundUser = await db.collection('users').findOne({ username: original });
        
        if (!foundUser) return res.sendStatus(401);
        
        // Update user information in MongoDB
        const result = await db.collection('users').updateOne(
            { username: original },
            { $set: { username: user, realName: rname } }
        );
        
        if (result.modifiedCount === 1) {
            const updatedUser = await db.collection('users').findOne({ username: user });
            res.json({ newUser: updatedUser });
        } else {
            res.status(500).json({ 'message': 'Failed to update user information' });
        }
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ 'message': 'Server error during profile update' });
    }
}

module.exports = { handleChange };