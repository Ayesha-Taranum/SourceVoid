const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Starting migration...');

    // Manual config parsing because dotenv might not load .env.local automatically in script context properly without full path
    // But we requiring dotenv above with path.

    // Check if we have connection details
    if (!process.env.DB_HOST) {
        console.error('No DB_HOST found. Make sure .env.local exists.');
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Connected to database.');

        // Add password column
        try {
            await connection.query('ALTER TABLE rooms ADD COLUMN password VARCHAR(255)');
            console.log('Added password column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('password column already exists.');
            else console.error('Error adding password:', e.message);
        }

        // Add max_views
        try {
            await connection.query('ALTER TABLE rooms ADD COLUMN max_views INT DEFAULT 0');
            console.log('Added max_views column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('max_views column already exists.');
            else console.error('Error adding max_views:', e.message);
        }

        // Add current_views
        try {
            await connection.query('ALTER TABLE rooms ADD COLUMN current_views INT DEFAULT 0');
            console.log('Added current_views column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('current_views column already exists.');
            else console.error('Error adding current_views:', e.message);
        }

        // Add language
        try {
            await connection.query("ALTER TABLE rooms ADD COLUMN language VARCHAR(50) DEFAULT 'plaintext'");
            console.log('Added language column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('language column already exists.');
            else console.error('Error adding language:', e.message);
        }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
