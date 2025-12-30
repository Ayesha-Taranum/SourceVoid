import pool from '../../../lib/db';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Room ID is required' });
    }

    try {
        if (req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);

            const now = new Date();

            if (rows.length > 0) {
                const room = rows[0];
                if (new Date(room.expires_at) < now) {
                    return res.status(410).json({ message: 'Room has expired' });
                }
                return res.status(200).json(room);
            } else {
                // Room does not exist, create it (Auto-create behavior)
                const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                await pool.query(
                    'INSERT INTO rooms (id, content, expires_at) VALUES (?, ?, ?)',
                    [id, '', expiresAt]
                );
                return res.status(200).json({
                    id,
                    content: '',
                    created_at: now,
                    expires_at: expiresAt
                });
            }

        } else if (req.method === 'POST') {
            const { content } = req.body;

            // Update room content only if it exists and is not expired
            const [result] = await pool.query(
                'UPDATE rooms SET content = ? WHERE id = ? AND expires_at > NOW()',
                [content, id]
            );

            if (result.affectedRows === 0) {
                // Check if it was because it didn't exist (unlikely if GET called first) or expired
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
