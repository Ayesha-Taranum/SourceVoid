import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
  const router = useRouter();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Creation Options
  const [password, setPassword] = useState('');
  const [expirationType, setExpirationType] = useState('hours'); // 'hours', 'minutes', 'views'
  const [expirationValue, setExpirationValue] = useState('24');
  const [showOptions, setShowOptions] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          expirationType,
          expirationValue: parseInt(expirationValue),
          language: 'javascript' // Default, can change in room
        })
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/${id}`);
      } else {
        alert('Failed to create room');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      router.push(`/${roomIdInput.trim()}`);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>SourceVoid</title>
        <meta name="description" content="Room-based code sharing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <h1 className="title" style={{ minHeight: '3rem' }}>
        <TypeAnimation
          sequence={[
            '_source_void',
            1000,
            '',
            500,
            '_source_void',
            1000,
          ]}
          wrapper="span"
          speed={10}
          deletionSpeed={20}
          repeat={Infinity}
          style={{ display: 'inline-block' }}
          cursor={true}
        />
      </h1>

      <div className="actions">
        <div className="creation-panel">
          {!showOptions ? (
            <button onClick={() => setShowOptions(true)} className="create-btn">
              Create New Room
            </button>
          ) : (
            <>
              <div className="options-row">
                <select value={expirationType} onChange={(e) => {
                  setExpirationType(e.target.value);
                  // Set reasonable defaults
                  if (e.target.value === 'hours') setExpirationValue('24');
                  if (e.target.value === 'minutes') setExpirationValue('30');
                  if (e.target.value === 'views') setExpirationValue('5');
                }}>
                  <option value="hours">Expire after (Hours)</option>
                  <option value="minutes">Expire after (Minutes)</option>
                  <option value="views">Expire after (Views)</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={expirationValue}
                  onChange={(e) => setExpirationValue(e.target.value)}
                  className="small-input"
                />
              </div>
              <input
                type="password"
                placeholder="Optional Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
              />
              <button onClick={createRoom} disabled={loading} className="create-btn">
                {loading ? 'Creating...' : '> Initialize Void'}
              </button>
              <button
                onClick={() => setShowOptions(false)}
                style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="divider">OR</div>

        <form onSubmit={joinRoom} className="join-form">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>
    </div>
  );
}
