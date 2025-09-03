const { getDb } = require('../db');

const getData = async(req, res)=>{
    try {
        const user = req.query.user;
        const db = getDb();
        const foundUser = await db.collection('users').findOne({ username: user });
        
        if (!foundUser) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        
        const name = foundUser.realName.split(' ');
        foundUser.firstName = name[0];
        foundUser.lastName = name.length > 1 ? name[1] : '';
        
        res.json(foundUser);
    } catch(e) {
        console.error('Error fetching user data:', e);
        res.status(500).json({ 'message': 'Server error fetching user data' });
    }
}

module.exports = {getData}