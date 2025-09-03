const { getDb } = require('../db');

const addSearch = async (req, res)=>{
    // const cookies = req.cookies;
    // if (!cookies?.user) return res.sendStatus(204); //No content
    // const refreshToken = cookies.jwt;
    const {user, term} = req.body;


    // const {term} = req.body

    const db = getDb();
    const now = new Date();
    await db.collection('users').updateOne(
        { username: user },
        { $push: { history: { code: term, time: now } } }
    );
    res.status(200).json({ ok: true })
}


const getSearch = async (req, res)=>{
    const user = req.query.user;
    const db = getDb();
    const foundUser = await db.collection('users').findOne({ username: user }, { projection: { history: 1, _id: 0 } });
    res.json(Array.isArray(foundUser?.history)?foundUser.history:[])
}

module.exports = {addSearch, getSearch}