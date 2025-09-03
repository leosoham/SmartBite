const path =require('path')
const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

fsPromises = require('fs').promises

const addSearch = async (req, res)=>{
    // const cookies = req.cookies;
    // if (!cookies?.user) return res.sendStatus(204); //No content
    // const refreshToken = cookies.jwt;
    const {user, term} = req.body;


    // const {term} = req.body

    const foundUser = usersDB.users.find(person => person.username === user);
    if (!foundUser) {
        return res.status(404).json({'msg': "no user exists"});
    }
    const now = new Date();
    const otherUsers = usersDB.users.filter(per=>per.username != foundUser.username);
    let newUser = { ...foundUser,  history:[...(Array.isArray(foundUser.history)?foundUser.history:[]),{"code":term, "time" : now}]};
    usersDB.setUsers([...otherUsers, newUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
    
    res.status(200).json({otherUsers})
}


const getSearch = async (req, res)=>{
    const user = req.query.user;
    const foundUser = usersDB.users.find(person => person.username === user);
    res.json(Array.isArray(foundUser.history)?foundUser.history:[])
}

module.exports = {addSearch, getSearch}