# Geo-Detection Service

A Node.js microservice that provides IP geolocation detection using MaxMind's GeoLite2 database. This service automatically detects the country associated with an IP address and includes scheduled database updates to keep the geolocation data current.

## Features

- 🌍 **IP Geolocation Detection**: Get country information for any IP address
- 🔄 **Automatic Database Updates**: Daily scheduled updates of the GeoLite2 database at 12:00 PM
- 🚀 **RESTful API**: Simple Express.js API endpoint
- 🔒 **CORS Configuration**: Pre-configured CORS settings for multiple allowed origins
- 📦 **PM2 Support**: Ready for production deployment with PM2 process manager

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MaxMind GeoLite2 License Key ([Get one here](https://www.maxmind.com/en/geolite2/signup))

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Geo-Detection
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=4002
GEOLITE2_LICENSE_KEY=your_license_key_here
NODE_ENV=production
```

4. Ensure the GeoLite2 database exists:
   - The database file should be located at `utils/db/GeoLite2-Country.mmdb`
   - If it doesn't exist, the service will attempt to download it on startup (requires valid license key)

## Usage

### Start the Server

```bash
# Development mode
yarn dev
# or
npm run dev

# Production mode
yarn start
# or
npm start
```

The server will start on port `4002` by default (or the port specified in your `.env` file).

### API Endpoint

#### GET `/api/geo`

Returns the country code for an IP address.

**Query Parameters:**

- `ip` (optional): The IP address to look up. If not provided, the service will attempt to detect the IP from request headers.

**Response:**

```json
{
  "ip": "8.8.8.8",
  "country": "US"
}
```

**Example Requests:**

```bash
# Lookup specific IP
curl http://localhost:4002/api/geo?ip=8.8.8.8

# Auto-detect IP from request
curl http://localhost:4002/api/geo
```

**Response Codes:**

- `200`: Success
- `500`: Error (database not loaded, lookup failed, etc.)

## Project Structure

```
Geo-Detection/
├── server.js                 # Main server file
├── ecosystem.config.js       # PM2 configuration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in git)
├── utils/
│   ├── corsConfig.js         # CORS configuration
│   ├── scheduleGeoUpdate.js  # Scheduled database update logic
│   └── db/
│       └── GeoLite2-Country.mmdb  # MaxMind database file
└── README.md
```

## Configuration

### CORS Settings

The service includes pre-configured CORS settings in `utils/corsConfig.js` with allowed origins for:

- Local development (localhost on various ports)
- Care-me production domains
- IDD Groupe domains
- Mobile development (Android emulator, iOS simulator)

Modify `utils/corsConfig.js` to add or remove allowed origins.

### PM2 Deployment

The project includes PM2 configuration for production deployment:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Other PM2 commands
pm2 stop geo-detection-service
pm2 restart geo-detection-service
pm2 logs geo-detection-service
```

## Database Updates

The GeoLite2 database is automatically updated daily at 12:00 PM using a cron job. The update process:

1. Downloads the latest GeoLite2-Country database from MaxMind
2. Extracts and replaces the existing database file
3. Includes lock file mechanism to prevent concurrent updates
4. Logs all update activities

Manual database update can be triggered by:

- Restarting the server (if the database is missing)
- Running the update function programmatically

## Environment Variables

| Variable               | Description                  | Default      |
| ---------------------- | ---------------------------- | ------------ |
| `PORT`                 | Server port number           | `4002`       |
| `GEOLITE2_LICENSE_KEY` | MaxMind GeoLite2 license key | Required     |
| `NODE_ENV`             | Environment mode             | `production` |

## Dependencies

- **express**: Web framework
- **maxmind**: MaxMind GeoIP2 library for database lookups
- **node-cron**: Scheduled task execution
- **node-fetch**: HTTP client for downloading database updates
- **tar**: Archive extraction
- **cors**: CORS middleware
- **body-parser**: Request body parsing
- **dotenv**: Environment variable management

## Error Handling

The service includes error handling for:

- Missing or unloaded database
- Invalid IP addresses
- Database lookup failures
- Update process failures

All errors are logged to the console and returned as JSON responses with appropriate HTTP status codes.

## License

MIT

## Notes

- The GeoLite2 database file (`GeoLite2-Country.mmdb`) is not included in the repository and must be downloaded separately or will be auto-downloaded on first run (with valid license key).
- Ensure you have sufficient disk space for database updates (approximately 5-10 MB).
- The service uses a lock file mechanism to prevent concurrent database updates.
