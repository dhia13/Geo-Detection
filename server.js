require('dotenv').config(); // Load environment variables from .env

const maxmind = require('maxmind');
const path = require('path');
const express = require('express');
const { scheduleGeoDBUpdate } = require('./utils/scheduleGeoUpdate');
const corsConfig = require('./utils/corsConfig');
const app = express();
const bodyParser = require('body-parser');

app.use(corsConfig);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let lookup;

async function initGeoDB() {
    const dbPath = path.join(process.cwd(), 'utils', 'db', 'GeoLite2-Country.mmdb');
    lookup = await maxmind.open(dbPath);
}

function getCountryByIP(req, res) {
    if (!lookup) {
        return res.status(500).json({ error: 'GeoDB not loaded' });
    }

    const ip =
        req.query.ip ||
        (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0]) ||
        req.socket.remoteAddress;

    try {
        const geo = lookup.get(ip);
        const country = geo?.country?.iso_code || 'Unknown';
        res.json({ ip, country });
    } catch (err) {
        res.status(500).json({ error: 'Lookup failed', detail: err.message });
    }
}

app.get('/api/geo', getCountryByIP);

async function startServer() {
    try {
        await initGeoDB();
        console.log('🌍 GeoLite2 database initialized');
        const port = process.env.PORT || 4002; // Default to 3000 if PORT is not set
        app.listen(port, () => {
            console.log(
                `Express server running on port ${port} in ${app.get('env')} mode`
            );
        });
        scheduleGeoDBUpdate();
    } catch (err) {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    }
}

startServer();
