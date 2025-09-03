const { getDb } = require('../db');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd , rname} = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const db = getDb();
    const duplicate = await db.collection('users').findOne({ username: user });
    if (duplicate) return res.sendStatus(409); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        const newUser = { username: user, roles: { User: 2001 }, password: hashedPwd, realName: rname };
        await db.collection('users').insertOne(newUser);
        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };