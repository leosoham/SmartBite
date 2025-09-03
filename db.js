const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn('MONGODB_URI not set. Set it in your environment.');
}

let client;
let db;

async function connectToDatabase() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  // Use database name from URI path if provided; else default to 'smartbite'
  const dbNameFromUri = (uri && uri.split('/')[3]) || 'smartbite';
  db = client.db(dbNameFromUri || 'smartbite');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { connectToDatabase, getDb };

