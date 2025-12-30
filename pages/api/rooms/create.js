import pool from '../../../lib/db';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const id = nanoid(10);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

        await pool.query(
            'INSERT INTO rooms (id, content, created_at, expires_at) VALUES (?, ?, ?, ?)',
            [id, '', createdAt, expiresAt]
        );

        return res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
