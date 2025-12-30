import pool from '../../../lib/db';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { password, expirationType, expirationValue, language } = req.body;

        const id = nanoid(10);
        const createdAt = new Date();

        let expiresAt = null;
        let maxViews = 0;

        // Handle Expiration
        if (expirationType === 'views') {
            maxViews = parseInt(expirationValue) || 1;
        } else if (expirationType === 'minutes') {
            const mins = parseInt(expirationValue) || 60;
            expiresAt = new Date(createdAt.getTime() + mins * 60 * 1000);
        } else {
            // Default to hours (expirationType === 'hours' or 'time')
            const hours = parseInt(expirationValue) || 24;
            expiresAt = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
        }

        // Handle Password
        let passwordHash = null;
        if (password && password.trim()) {
            passwordHash = await bcrypt.hash(password.trim(), 10);
        }

        // Handle Language
        const lang = language || 'plaintext';

        await pool.query(
            'INSERT INTO rooms (id, content, created_at, expires_at, password, max_views, current_views, language) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
            [id, '', createdAt, expiresAt, passwordHash, maxViews, lang]
        );

        return res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
