const { getDb } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    
    try {
        const db = getDb();
        const foundUser = await db.collection('users').findOne({ username: user });
        
        if (!foundUser) return res.sendStatus(401); //Unauthorized 
        
        // evaluate password 
        const match = await bcrypt.compare(pwd, foundUser.password);
        
        if (match) {
            const roles = Object.values(foundUser.roles);
            
            // create JWTs
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            
            const refreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            
            // Saving refreshToken with current user in MongoDB
            await db.collection('users').updateOne(
                { username: user },
                { $set: { refreshToken: refreshToken } }
            );
            
            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
            res.json({ accessToken });
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 'message': 'Server error during login' });
    }
}

module.exports = { handleLogin };