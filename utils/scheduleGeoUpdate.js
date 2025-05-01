const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { pipeline } = require('stream/promises');
const tar = require('tar');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const LICENSE_KEY = process.env.GEOLITE2_LICENSE_KEY;
const downloadURL = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${LICENSE_KEY}&suffix=tar.gz`;

// Use absolute paths
const DB_DIR = path.join(process.cwd(), 'db');
const TEMP_DIR = path.join(DB_DIR, 'temp');
const TAR_PATH = path.join(DB_DIR, `GeoLite2-Country-${uuidv4()}.tar.gz`);
const DB_PATH = path.join(DB_DIR, 'GeoLite2-Country.mmdb');
const LOCK_FILE = path.join(DB_DIR, 'geolite-update.lock');

async function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function acquireLock() {
    if (fs.existsSync(LOCK_FILE)) {
        const lockTime = fs.statSync(LOCK_FILE).mtime;
        // If lock is older than 10 minutes, consider it stale
        if (Date.now() - lockTime.getTime() > 10 * 60 * 1000) {
            fs.unlinkSync(LOCK_FILE);
        } else {
            return false;
        }
    }
    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    return true;
}

function releaseLock() {
    if (fs.existsSync(LOCK_FILE)) {
        fs.unlinkSync(LOCK_FILE);
    }
}

async function updateGeoLite2DB() {
    console.log('🌍 Starting GeoLite2 DB update...');

    try {
        // Ensure directories exist
        await ensureDirectoryExists(DB_DIR);
        await ensureDirectoryExists(TEMP_DIR);

        // Acquire lock to prevent concurrent updates
        if (!await acquireLock()) {
            console.log('⚠️ Update already in progress by another instance. Skipping...');
            return;
        }

        // Download the file
        console.log('⬇️ Downloading GeoLite2 database...');
        const response = await fetch(downloadURL);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        // Save to temp file
        const fileStream = fs.createWriteStream(TAR_PATH);
        await pipeline(response.body, fileStream);

        // Verify file exists and has content
        const stats = fs.statSync(TAR_PATH);
        if (stats.size === 0) {
            throw new Error('Downloaded file is empty');
        }

        // Extract
        console.log('📦 Extracting...');
        await tar.x({
            file: TAR_PATH,
            cwd: TEMP_DIR,
            strip: 1
        });

        // Find the extracted .mmdb file
        const extractedFiles = fs.readdirSync(TEMP_DIR);
        const mmdbFile = extractedFiles.find(f => f.endsWith('.mmdb'));
        if (!mmdbFile) {
            throw new Error('No .mmdb file found in archive');
        }

        // Copy to final location
        fs.copyFileSync(path.join(TEMP_DIR, mmdbFile), DB_PATH);

        console.log('✅ GeoLite2 DB updated successfully');
    } catch (error) {
        console.error('❌ Failed to update GeoLite2 DB:', error);
    } finally {
        // Cleanup
        try {
            if (fs.existsSync(TEMP_DIR)) {
                fs.rmSync(TEMP_DIR, { recursive: true, force: true });
            }
            if (fs.existsSync(TAR_PATH)) {
                fs.rmSync(TAR_PATH, { force: true });
            }
            releaseLock();
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
    }
}

const scheduleGeoDBUpdate = () => {
    // Daily at 12:00 (noon)
    cron.schedule('0 12 * * *', async () => {
        console.log('⏰ Running scheduled GeoLite2 DB update...');
        await updateGeoLite2DB();
    });
};

module.exports = {
    scheduleGeoDBUpdate,
    updateGeoLite2DB
};