import React, { useState, useEffect } from 'react';
import { createRoom, joinRoom, subscribeToRoom, supabase } from '../lib/supabase';

export default function Lobby({ playerId, onRoomReady }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  async function handleCreate() {
    if (!name.trim()) return setError('Entre ton prénom');
    setLoading(true); setError('');
    try {
      const room = await createRoom(playerId, name.trim());
      setCreatedCode(room.code);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Entre ton prénom');
    if (!joinCode.trim()) return setError('Entre le code de la salle');
    setLoading(true); setError('');
    try {
      const room = await joinRoom(joinCode, playerId, name.trim());
      onRoomReady(room, name.trim(), 'guest');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  const inputStyle = {
    background: 'rgba(255,248,230,0.1)',
    border: '1px solid #c9b07a',
    borderRadius: 6,
    color: '#fdf8ee',
    padding: '10px 14px',
    fontSize: 16,
    fontFamily: "'IM Fell English', serif",
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = (primary) => ({
    padding: '12px 28px',
    borderRadius: 6,
    border: primary ? '2px solid #c9b07a' : '1px solid #7a6a4a',
    background: primary ? '#8b6914' : 'transparent',
    color: '#fdf8ee',
    fontSize: 15,
    fontFamily: "'Cinzel', serif",
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: 1,
    transition: 'all 0.2s',
    width: '100%',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a3a2a 0%, #0d1f15 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IM Fell English', serif",
      padding: 20,
    }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {/* Title */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🃏</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', cursive",
            fontSize: 42,
            color: '#f0c040',
            margin: 0,
            textShadow: '0 2px 20px rgba(240,192,64,0.4)',
            letterSpacing: 4,
          }}>Shkobba</h1>
          <p style={{ color: '#c9b07a', fontSize: 14, marginTop: 6, letterSpacing: 2 }}>
            JEU DE CARTES TUNISIEN
          </p>
        </div>

        {/* Name input always visible */}
        <div style={{ marginBottom: 20 }}>
          <input
            style={inputStyle}
            placeholder="Ton prénom"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {!mode && !createdCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={btnStyle(true)} onClick={() => setMode('create')}>
              Créer une partie
            </button>
            <button style={btnStyle(false)} onClick={() => setMode('join')}>
              Rejoindre une partie
            </button>
          </div>
        )}

        {mode === 'create' && !createdCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={btnStyle(true)} onClick={handleCreate} disabled={loading}>
              {loading ? 'Création...' : 'Créer la salle'}
            </button>
            <button style={{ ...btnStyle(false) }} onClick={() => setMode(null)}>
              Retour
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={{ ...inputStyle, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 4, fontSize: 20 }}
              placeholder="CODE DE SALLE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button style={btnStyle(true)} onClick={handleJoin} disabled={loading}>
              {loading ? 'Connexion...' : 'Rejoindre'}
            </button>
            <button style={btnStyle(false)} onClick={() => setMode(null)}>
              Retour
            </button>
          </div>
        )}

        {/* Room created — waiting for guest */}
        {createdCode && (
          <WaitingForGuest
            code={createdCode}
            playerName={name}
            onRoomReady={onRoomReady}
          />
        )}

        {error && (
          <p style={{ color: '#e05050', marginTop: 16, fontSize: 14 }}>{error}</p>
        )}
      </div>
    </div>
  );
}

function WaitingForGuest({ code, playerName, onRoomReady }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const channel = subscribeToRoom(code, (room) => {
      if (room.status === 'ready' && room.guest_id) {
        onRoomReady(room, playerName, 'host');
      }
    });
    return () => supabase.removeChannel(channel);
  }, [code]);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#c9b07a', marginBottom: 12 }}>
        Envoie ce code à ton adversaire :
      </p>
      <div style={{
        fontSize: 40,
        fontFamily: "'Cinzel', serif",
        fontWeight: 700,
        color: '#f0c040',
        letterSpacing: 10,
        background: 'rgba(240,192,64,0.1)',
        border: '2px solid #c9b07a',
        borderRadius: 8,
        padding: '16px 24px',
        marginBottom: 16,
      }}>
        {code}
      </div>
      <button
        onClick={copyCode}
        style={{
          background: 'none',
          border: '1px solid #c9b07a',
          borderRadius: 6,
          color: '#c9b07a',
          padding: '8px 20px',
          cursor: 'pointer',
          fontFamily: "'Cinzel', serif",
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        {copied ? '✓ Copié !' : 'Copier le code'}
      </button>
      <div style={{ color: '#7a8a7a', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
        En attente de l'adversaire…
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
