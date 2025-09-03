const path =require('path')
const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

fsPromises = require('fs').promises



const getSearch = async (req, res)=>{
    const user = req.query.barcode;
    
    // const foundUser = usersDB.users.find(person => person.username === user);

    // res.json(Array.isArray(foundUser.history)?foundUser.history:[])
}