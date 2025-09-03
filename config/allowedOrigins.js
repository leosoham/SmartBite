const allowedOrigins = [
    'https://www.yoursite.com',
    'http://127.0.0.1:5500',
    'http://localhost:3500',
    'https://smartbite-zeu0.onrender.com'
];

// Allow ngrok tunnels dynamically in CORS check by testing origin at runtime.
// The corsOptions uses this list via indexOf, so expand it to include typical
// ngrok host suffixes to permit mobile testing over HTTPS.
allowedOrigins.push('https://*.ngrok-free.app');
allowedOrigins.push('https://*.ngrok.io');

module.exports = allowedOrigins;