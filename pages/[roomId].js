import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Room() {
    const router = useRouter();
    const { roomId } = router.query;

    const [content, setContent] = useState('');
    const [status, setStatus] = useState('loading'); // loading, ready, expired, error, saving
    const [lineNumbers, setLineNumbers] = useState([1]);

    // Fetch room data
    useEffect(() => {
        if (!roomId) return;

        fetch(`/api/rooms/${roomId}`)
            .then(async (res) => {
                if (res.status === 410) {
                    setStatus('expired');
                    return null;
                }
                if (!res.ok) {
                    throw new Error('Failed to load room');
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setContent(data.content || '');
                    setStatus('ready');
                    updateLineNumbers(data.content || '');
                }
            })
            .catch((err) => {
                console.error(err);
                setStatus('error');
            });
    }, [roomId]);

    const updateLineNumbers = (text) => {
        const lines = text.split('\n').length;
        setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
    };

    const handleChange = (e) => {
        const newVal = e.target.value;
        setContent(newVal);
        updateLineNumbers(newVal);
        saveDebounced(newVal);
    };

    // Debounced save
    const saveDebounced = useCallback((text) => {
        // Clear existing timer if any (basic implementation)
        if (window.saveTimer) clearTimeout(window.saveTimer);

        // Set status to unsaved/typing?
        // Actually we can just save quietly.

        window.saveTimer = setTimeout(() => {
            saveContent(text);
        }, 1000);
    }, [roomId]); // Dependency on roomId

    const saveContent = async (text) => {
        if (!roomId) return;
        try {
            const res = await fetch(`/api/rooms/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });
            if (!res.ok) {
                console.error('Failed to save');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [notification, setNotification] = useState('');

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        showNotification(`Copied ${label}!`);
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 2000);
    };

    if (status === 'loading') return <div className="container">Loading...</div>;
    if (status === 'expired') return <div className="container"><div className="expired-message">This room has expired.</div></div>;
    if (status === 'error') return <div className="container">Error loading room.</div>;

    return (
        <div className="room-container">
            <Head>
                <title>Room: {roomId}</title>
            </Head>

            <div className="room-header">
                <div className="room-id">ID: {roomId}</div>
                <div className="room-actions">
                    {notification && <span className="notification-toast">{notification}</span>}
                    <button onClick={() => copyToClipboard(roomId, 'Room ID')}>Copy ID</button>
                    <button onClick={() => copyToClipboard(window.location.href, 'URL')}>Copy URL</button>
                    <button onClick={() => router.push('/')}>Home</button>
                </div>
            </div>

            <div className="editor-wrapper">
                <div className="line-numbers">
                    {lineNumbers.map(n => <div key={n}>{n}</div>)}
                </div>
                <textarea
                    className="editor-textarea"
                    value={content}
                    onChange={handleChange}
                    spellCheck="false"
                    placeholder="Start typing..."
                />
            </div>
        </div>
    );
}
