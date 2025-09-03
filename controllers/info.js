const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
// const fsPromises = require('fs').promises;
const path = require('path');

const getData = async(req, res)=>{
    try{const user = req.query.user;
    const foundUser = usersDB.users.find(person => person.username === user);
    const name = foundUser.realName.split(' ')
    foundUser.firstName = name[0]
    foundUser.lastName = name[1]
    res.json(foundUser)}
    catch(e){
        res.sendStatus(400)
    }
}

module.exports = {getData}