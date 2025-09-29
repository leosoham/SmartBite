const { getDb } = require('../db');

const getData = async (req, res) => {
    try {
        const user = req.query.user;
        const db = getDb();
        const foundUser = await db.collection('users').findOne({ username: user });

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const realName = typeof foundUser.realName === 'string' ? foundUser.realName : '';
        const parts = realName.trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0] || 'User';
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

        // Return only the safe, necessary fields
        res.json({
            username: foundUser.username,
            firstName,
            lastName
        });
    } catch (e) {
        console.error('Error fetching user data:', e);
        res.status(500).json({ message: 'Server error fetching user data' });
    }
};

module.exports = { getData };