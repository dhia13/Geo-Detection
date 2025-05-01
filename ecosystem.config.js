module.exports = {
    apps: [
        {
            name: 'geo-detection-service',
            script: './server.js',  // Adjust this path to your main server file
            cwd: './',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 4002
            },
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss"
        }
    ]
};