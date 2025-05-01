const cors = require('cors');

const allowedOrigins = [
    "*",
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3005',
    'http://localhost:3004',
    'https://care-me.pro',
    'https://care-me.dz',
    'https://care-me.fr',
    'https://care-me.ma',
    'https://care-me.tn',
    'https://care-me-jobs.com',
    'https://payment.care-me.pro',
    'https://admin777.care-me.co',
    'https://pro.iddgroupe.com',
    'https://client.iddgroupe.com',
    'https://jobs.iddgroupe.com',
    "https://www.care-me-jobs.com",
    "https://care-me-jobs.com",
    'https://payment.iddgroupe.com',
    'https://admin777.iddgroupe.com',
    'http://10.0.2.2:3000',  // Android emulator accessing host's localhost:3000
    'http://10.0.2.2:8080',  // Other common port
    'http://localhost:8080', // iOS simulator
    'https://care-me.app',   // Y
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        console.error(`Blocked by CORS: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
