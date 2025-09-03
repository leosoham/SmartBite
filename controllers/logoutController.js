const { getDb } = require('../db');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    try {
        const db = getDb();
        
        // Is refreshToken in db?
        const foundUser = await db.collection('users').findOne({ refreshToken: refreshToken });
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            return res.sendStatus(204);
        }

        // Delete refreshToken in db
        await db.collection('users').updateOne(
            { refreshToken: refreshToken },
            { $set: { refreshToken: '' } }
        );

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ 'message': 'Server error during logout' });
    }
}

module.exports = { handleLogout }