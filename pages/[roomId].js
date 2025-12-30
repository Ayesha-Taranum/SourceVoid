import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Editor
import Editor from 'react-simple-code-editor';
// Prism logic
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-markup'; // for xml/html/text
import 'prismjs/components/prism-csv';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';
import 'prismjs/themes/prism-okaidia.css'; // Vibrant high-contrast theme

export default function Room() {
    const router = useRouter();
    const { roomId } = router.query;

    const [content, setContent] = useState('');
    const [status, setStatus] = useState('loading'); // loading, protected, ready, expired, error
    const [roomPassword, setRoomPassword] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [language, setLanguage] = useState('javascript');

    // Stats
    const [stats, setStats] = useState({ current_views: 0, max_views: 0, expires_at: null });
    const [timeLeft, setTimeLeft] = useState('');

    const fetchRoom = useCallback(async (pwd = null) => {
        setStatus('loading');
        try {
            const headers = {};
            if (pwd) headers['x-room-password'] = pwd;

            const res = await fetch(`/api/rooms/${roomId}`, { headers });

            if (res.status === 410) {
                setStatus('expired');
                return;
            }
            if (res.status === 401 || res.status === 403) {
                setStatus('protected');
                return;
            }
            if (!res.ok) throw new Error('Failed');

            const data = await res.json();
            setContent(data.content || '');
            setLanguage(data.language || 'plaintext');
            setStats({
                current_views: data.current_views,
                max_views: data.max_views,
                expires_at: data.expires_at
            });

            if (pwd) setRoomPassword(pwd);
            setStatus('ready');

        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    }, [roomId]);

    // Countdown Timer logic
    useEffect(() => {
        if (!stats.expires_at) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expire = new Date(stats.expires_at).getTime();
            const distance = expire - now;

            if (distance < 0) {
                setTimeLeft('Expired');
                clearInterval(interval);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [stats.expires_at]);

    useEffect(() => {
        if (!roomId) return;
        fetchRoom();
    }, [roomId, fetchRoom]);

    const handleUnlock = (e) => {
        e.preventDefault();
        fetchRoom(inputPassword);
    };

    const handleChange = (newVal) => {
        setContent(newVal);
        saveDebounced(newVal);
    };

    const saveDebounced = useCallback((text) => {
        if (window.saveTimer) clearTimeout(window.saveTimer);
        window.saveTimer = setTimeout(() => {
            saveContent(text);
        }, 1000);
    }, [roomId, roomPassword]);

    const saveContent = async (text) => {
        if (!roomId) return;
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (roomPassword) headers['x-room-password'] = roomPassword;

            const res = await fetch(`/api/rooms/${roomId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ content: text })
            });
            if (!res.ok) console.error('Failed to save');
        } catch (err) {
            console.error(err);
        }
    };

    const [notification, setNotification] = useState('');
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setNotification(`Copied ${label}!`);
        setTimeout(() => setNotification(''), 2000);
    };

    // Prism highlighter wrapper
    const highlightCode = (input, language) => {
        return highlight(input, languages[language] || languages.javascript, language);
    }

    const lineNumbers = content.split('\n').map((_, i) => i + 1);

    if (status === 'loading') return <div className="container">Loading...</div>;
    if (status === 'expired') return <div className="container"><div className="expired-message">This room has expired.</div></div>;
    if (status === 'protected') return (
        <div className="container">
            <form onSubmit={handleUnlock} className="password-gate">
                <h2>🔒 Protected Room</h2>
                <input
                    type="password"
                    placeholder="Enter Password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                />
                <button type="submit">Unlock</button>
            </form>
        </div>
    );
    if (status === 'error') return <div className="container">Error loading room.</div>;

    return (
        <div className="room-container">
            <Head>
                <title>Room: {roomId}</title>
            </Head>

            <div className="room-header">
                <div>
                    <span className="room-id">ID: {roomId}</span>
                    {stats.max_views > 0 && <span style={{ marginLeft: '1rem', opacity: 0.7 }}>Views: {stats.current_views} / {stats.max_views}</span>}
                    {stats.expires_at && timeLeft && <span style={{ marginLeft: '1rem', color: '#ffcc00' }}>⏳ {timeLeft}</span>}
                </div>

                <div className="room-actions">
                    {notification && <span className="notification-toast">{notification}</span>}
                    <select
                        className="lang-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="css">CSS</option>
                        <option value="json">JSON</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="csv">CSV</option>
                        <option value="markup">Text/HTML</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                        <option value="markdown">Markdown</option>
                        <option value="yaml">YAML</option>
                        <option value="docker">Dockerfile</option>
                    </select>

                    <button onClick={() => copyToClipboard(roomId, 'Room ID')}>Copy ID</button>
                    <button onClick={() => copyToClipboard(window.location.href, 'URL')}>Copy URL</button>
                    <button onClick={() => router.push('/')}>Home</button>
                </div>
            </div>

            <div className="editor-wrapper">
                <div className="line-numbers" style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 16, paddingTop: 16, lineHeight: '24px' }}>
                    {lineNumbers.map(n => <div key={n}>{n}</div>)}
                </div>
                <div className="editor-container" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 60px)' }}>
                    <Editor
                        value={content}
                        onValueChange={handleChange}
                        highlight={code => highlightCode(code, language === 'plaintext' ? 'javascript' : language)}
                        padding={16}
                        ignoreTabKey={false}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 16,
                            backgroundColor: '#0e0e0e',
                            minHeight: '100%',
                            lineHeight: '24px',
                            tabSize: 4,
                            MozTabSize: 4
                        }}
                        textareaClassName="focus:outline-none"
                        placeholder="Start typing..."
                    />
                </div>
            </div>
        </div>
    );
}
