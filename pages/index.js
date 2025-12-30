import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
  const router = useRouter();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms/create', { method: 'POST' });
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
        <title>CodeFlux</title>
        <meta name="description" content="Room-based code sharing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <h1 className="title" style={{ minHeight: '3rem' }}>
        <TypeAnimation
          sequence={[
            '_code_flux',
            1000,
            '',
            500,
            '_code_flux',
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
        <button onClick={createRoom} disabled={loading}>
          {loading ? 'Creating...' : '> Create New Room'}
        </button>

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
