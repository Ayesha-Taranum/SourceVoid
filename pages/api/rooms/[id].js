import pool from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Room ID is required' });
    }

    try {
        if (req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
            const now = new Date();

            let room = null;

            if (rows.length > 0) {
                room = rows[0];

                // 1. Time Expiration Check
                if (room.expires_at && new Date(room.expires_at) < now) {
                    return res.status(410).json({ message: 'Room has expired (Time limit reached)' });
                }

                // 2. View Expiration Check
                if (room.max_views > 0 && room.current_views >= room.max_views) {
                    return res.status(410).json({ message: 'Room has expired (View limit reached)' });
                }

                // 3. Password Check
                if (room.password) {
                    const providedPass = req.headers['x-room-password'];
                    if (!providedPass) {
                        return res.status(401).json({ protected: true, id: id });
                    }
                    const isMatch = await bcrypt.compare(providedPass, room.password);
                    if (!isMatch) {
                        return res.status(403).json({ message: 'Invalid password', protected: true });
                    }
                }

                // 4. Increment View Count
                await pool.query('UPDATE rooms SET current_views = current_views + 1 WHERE id = ?', [id]);

                // Return data
                return res.status(200).json({
                    id: room.id,
                    content: room.content,
                    created_at: room.created_at,
                    expires_at: room.expires_at,
                    language: room.language || 'plaintext',
                    current_views: room.current_views + 1,
                    max_views: room.max_views
                });

            } else {
                // Room does not exist, Auto-create (Default settings)
                const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                await pool.query(
                    'INSERT INTO rooms (id, content, created_at, expires_at, language) VALUES (?, ?, ?, ?, ?)',
                    [id, '', now, expiresAt, 'plaintext']
                );
                return res.status(200).json({
                    id,
                    content: '',
                    created_at: now,
                    expires_at: expiresAt,
                    language: 'plaintext',
                    current_views: 0,
                    max_views: 0
                });
            }

        } else if (req.method === 'POST') {
            const { content } = req.body;
            const password = req.headers['x-room-password'];

            // First check if room requires password
            const [rows] = await pool.query('SELECT password FROM rooms WHERE id = ?', [id]);
            if (rows.length > 0) {
                const room = rows[0];
                if (room.password) {
                    if (!password) return res.status(401).json({ message: 'Password required' });
                    const isMatch = await bcrypt.compare(password, room.password);
                    if (!isMatch) return res.status(403).json({ message: 'Invalid password' });
                }
            }

            // Update room content
            const [result] = await pool.query(
                'UPDATE rooms SET content = ? WHERE id = ?',
                [content, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Room not found or expired' });
            }

            return res.status(200).json({ message: 'Updated' });

        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error(`Error handling room ${id}:`, error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
