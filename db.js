const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn('MONGODB_URI not set. Set it in your environment.');
}

let client;
let db;

async function connectToDatabase() {
  try {
    if (db) return db;
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Parse the connection string to extract database name
    let dbName = 'smartbite'; // Default database name
    const uriParts = uri.split('/');
    if (uriParts.length > 3) {
      const dbPart = uriParts[3];
      if (dbPart && dbPart.includes('?')) {
        dbName = dbPart.split('?')[0];
      } else if (dbPart) {
        dbName = dbPart;
      }
    }
    
    // Connect with proper options
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { connectToDatabase, getDb };

