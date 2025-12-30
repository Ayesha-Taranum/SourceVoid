CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    password VARCHAR(255),
    max_views INT DEFAULT 0,
    current_views INT DEFAULT 0,
    language VARCHAR(50) DEFAULT 'plaintext'
);
