const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');

const handleChange = async (req, res) => {
    const { original, user, rname } = req.body;
    if (!original) return res.status(400).json({ 'message': 'Username and rname are required.' });
    const foundUser = usersDB.users.find(person => person.username === original);
    if (!foundUser) return res.sendStatus(401); 
    
    if (foundUser){
        const roles = Object.values(foundUser.roles);
        const newUser = {...foundUser, "username":user, "realName" : rname}
        
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
       
        usersDB.setUsers([...otherUsers, newUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
    
        res.json({ newUser });
    }else{
        res.status(401).json({'msg': 'no user'});
    }
}

module.exports = { handleChange };