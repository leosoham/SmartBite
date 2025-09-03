const allowedOrigins = require('./allowedOrigins');

function isAllowedOrigin(origin) {
    if (!origin) return true; // same-origin or server-to-server
    if (allowedOrigins.includes(origin)) return true;
    try {
        const url = new URL(origin);
        const host = url.hostname;
        if (host.endsWith('.ngrok-free.app') || host.endsWith('.ngrok.io')) return true;
    } catch (e) {
        // fall through
    }
    return false;
}

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;