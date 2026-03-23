import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import { findCaptures, applyMove } from '../lib/gameEngine';
import { updateGameState, subscribeToRoom, supabase } from '../lib/supabase';

export default function GameBoard({ room, gameState, setGameState, playerId, playerName, role }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [possibleCaptures, setPossibleCaptures] = useState([]);
  const [selectedCapture, setSelectedCapture] = useState(null);
  const [message, setMessage] = useState('');
  const [lastShkobba, setLastShkobba] = useState(false);

  const opponentId = room.host_id === playerId ? room.guest_id : room.host_id;
  const opponentName = room.host_id === playerId ? room.guest_name : room.host_name;
  const myHand = gameState.hands[playerId] || [];
  const opponentHandCount = (gameState.hands[opponentId] || []).length;
  const isMyTurn = gameState.currentTurn === playerId;

  // Subscribe to remote state updates
  useEffect(() => {
    const channel = subscribeToRoom(room.code, (updatedRoom) => {
      if (updatedRoom.state) {
        const prev = gameState;
        const next = updatedRoom.state;
        // Detect shkobba by opponent
        if (next.shkobba && prev.shkobba) {
          const myPrevSk = prev.shkobba[playerId] || 0;
          const myNextSk = next.shkobba[playerId] || 0;
          const oppPrevSk = prev.shkobba[opponentId] || 0;
          const oppNextSk = next.shkobba[opponentId] || 0;
          if (oppNextSk > oppPrevSk) showShkobba();
          if (myNextSk > myPrevSk) showShkobba();
        }
        setGameState(next);
      }
    });
    return () => supabase.removeChannel(channel);
  }, [room.code, gameState]);

  function showShkobba() {
    setLastShkobba(true);
    setTimeout(() => setLastShkobba(false), 2000);
  }

  function handleCardSelect(card) {
    if (!isMyTurn) return;
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      setPossibleCaptures([]);
      setSelectedCapture(null);
      return;
    }
    setSelectedCard(card);
    const captures = findCaptures(gameState.tableCards, card.value);
    setPossibleCaptures(captures);
    setSelectedCapture(captures.length === 1 ? captures[0] : null);
  }

  function handleTableCardSelect(tableCard) {
    if (!selectedCard) return;
    // Toggle selection in current capture group
    const currentGroup = selectedCapture || [];
    const alreadyIn = currentGroup.some(c => c.id === tableCard.id);
    let newGroup = alreadyIn
      ? currentGroup.filter(c => c.id !== tableCard.id)
      : [...currentGroup, tableCard];

    // Validate sum
    const sum = newGroup.reduce((acc, c) => acc + c.value, 0);
    if (sum === selectedCard.value || newGroup.length === 0) {
      setSelectedCapture(newGroup.length === 0 ? null : newGroup);
    }
  }

  async function handlePlay() {
    if (!selectedCard) return;
    if (!isMyTurn) return;

    const captureGroup = selectedCapture || [];
    // Validate capture if table has matching cards
    const captures = findCaptures(gameState.tableCards, selectedCard.value);
    if (captures.length > 0 && captureGroup.length === 0) {
      setMessage('Tu dois capturer au moins un groupe de cartes !');
      setTimeout(() => setMessage(''), 2500);
      return;
    }

    try {
      const newState = applyMove(gameState, playerId, selectedCard.id, captureGroup);
      const prevSk = gameState.shkobba[playerId] || 0;
      const newSk = newState.shkobba[playerId] || 0;
      if (newSk > prevSk) showShkobba();

      setGameState(newState);
      setSelectedCard(null);
      setPossibleCaptures([]);
      setSelectedCapture(null);
      await updateGameState(room.code, newState);
    } catch (e) {
      setMessage(e.message);
      setTimeout(() => setMessage(''), 2500);
    }
  }

  const myCaptured = gameState.captured[playerId] || [];
  const oppCaptured = gameState.captured[opponentId] || [];
  const myShkobba = gameState.shkobba[playerId] || 0;
  const oppShkobba = gameState.shkobba[opponentId] || 0;

  if (gameState.phase === 'finished') {
    return <ScoreScreen gameState={gameState} playerId={playerId} opponentId={opponentId} playerName={playerName} opponentName={opponentName} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a3a2a 0%, #0d1f15 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'IM Fell English', serif",
      color: '#fdf8ee',
      padding: '12px 16px',
      gap: 12,
    }}>
      {/* Shkobba flash */}
      {lastShkobba && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', cursive",
            fontSize: 64,
            color: '#f0c040',
            textShadow: '0 0 40px #f0c040',
            animation: 'fadeInOut 2s ease',
          }}>
            SHKOBBA! 🎉
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut { 0%,100%{opacity:0;transform:scale(0.8)} 30%,70%{opacity:1;transform:scale(1.1)} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#c9b07a' }}>
          Salle: <strong style={{ letterSpacing: 2 }}>{room.code}</strong>
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          color: isMyTurn ? '#6dfa8a' : '#f0c040',
          border: `1px solid ${isMyTurn ? '#6dfa8a' : '#f0c040'}`,
          borderRadius: 20,
          padding: '3px 12px',
        }}>
          {isMyTurn ? 'Ton tour ✨' : `Tour de ${opponentName}`}
        </div>
      </div>

      {/* Opponent area */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        border: !isMyTurn ? '1px solid rgba(240,192,64,0.3)' : '1px solid transparent',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#c9b07a' }}>{opponentName}</span>
          <span style={{ fontSize: 12, color: '#7a8a7a' }}>
            {oppCaptured.length} cartes capturées
            {oppShkobba > 0 && <span style={{ color: '#f0c040', marginLeft: 6 }}>⭐ x{oppShkobba}</span>}
          </span>
        </div>
        {/* Opponent hand (face down) */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: opponentHandCount }).map((_, i) => (
            <Card key={i} card={{ suit: 'spade', value: 1 }} faceDown small />
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#0f2a1a',
        borderRadius: 12,
        border: '2px solid #2a5a3a',
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        minHeight: 160,
      }}>
        <div style={{ fontSize: 11, color: '#5a8a6a', letterSpacing: 2, textTransform: 'uppercase' }}>
          Table — {gameState.tableCards.length} carte{gameState.tableCards.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {gameState.tableCards.map(card => {
            const inCapture = selectedCapture?.some(c => c.id === card.id);
            const couldCapture = possibleCaptures.some(group => group.some(c => c.id === card.id));
            return (
              <div key={card.id} style={{
                outline: inCapture ? '2px solid #f0c040' : couldCapture ? '1px dashed #c9b07a55' : 'none',
                borderRadius: 9,
                cursor: selectedCard && couldCapture ? 'pointer' : 'default',
              }} onClick={() => couldCapture && handleTableCardSelect(card)}>
                <Card card={card} selected={inCapture} selectable={!!(selectedCard && couldCapture)} />
              </div>
            );
          })}
          {gameState.tableCards.length === 0 && (
            <div style={{ color: '#3a6a4a', fontSize: 14, padding: 20 }}>Table vide</div>
          )}
        </div>

        {/* Deck remaining */}
        <div style={{ fontSize: 11, color: '#4a6a5a' }}>
          {gameState.deck.length} carte{gameState.deck.length !== 1 ? 's' : ''} dans le talon
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: 'rgba(200,50,50,0.2)',
          border: '1px solid #e05050',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 13,
          color: '#e07070',
          textAlign: 'center',
        }}>
          {message}
        </div>
      )}

      {/* My hand */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        border: isMyTurn ? '1px solid rgba(109,250,138,0.3)' : '1px solid transparent',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#c9b07a' }}>{playerName} (toi)</span>
          <span style={{ fontSize: 12, color: '#7a8a7a' }}>
            {myCaptured.length} capturées
            {myShkobba > 0 && <span style={{ color: '#f0c040', marginLeft: 6 }}>⭐ x{myShkobba}</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {myHand.map(card => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCard?.id === card.id}
              selectable={isMyTurn}
              onClick={() => handleCardSelect(card)}
            />
          ))}
          {myHand.length === 0 && (
            <div style={{ color: '#3a6a4a', fontSize: 14, padding: 10 }}>En attente de distribution…</div>
          )}
        </div>
      </div>

      {/* Play button */}
      {selectedCard && isMyTurn && (
        <button
          onClick={handlePlay}
          style={{
            padding: '14px',
            background: selectedCapture || findCaptures(gameState.tableCards, selectedCard.value).length === 0
              ? '#4a8a14'
              : '#8b4a14',
            border: 'none',
            borderRadius: 8,
            color: '#fdf8ee',
            fontFamily: "'Cinzel', serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          {selectedCapture && selectedCapture.length > 0
            ? `Capturer ${selectedCapture.length} carte${selectedCapture.length > 1 ? 's' : ''} ✓`
            : findCaptures(gameState.tableCards, selectedCard.value).length === 0
              ? 'Poser sur la table'
              : 'Sélectionne les cartes à capturer'}
        </button>
      )}
    </div>
  );
}

function ScoreScreen({ gameState, playerId, opponentId, playerName, opponentName }) {
  const { scores, breakdown } = gameState.scores;
  const myScore = scores[playerId];
  const oppScore = scores[opponentId];
  const winner = myScore > oppScore ? playerName : oppScore > myScore ? opponentName : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1a3a2a 0%, #0d1f15 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IM Fell English', serif",
      color: '#fdf8ee',
      padding: 20,
    }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', cursive",
          fontSize: 28,
          color: '#f0c040',
          marginBottom: 6,
        }}>
          {winner ? `${winner} gagne !` : 'Égalité !'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 24,
        }}>
          {[{ id: playerId, name: playerName }, { id: opponentId, name: opponentName }].map(({ id, name }) => (
            <div key={id} style={{
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${scores[id] >= scores[id === playerId ? opponentId : playerId] && winner === name ? '#f0c040' : '#3a5a3a'}`,
              borderRadius: 10,
              padding: 16,
            }}>
              <div style={{ fontSize: 13, color: '#c9b07a', marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 40, fontFamily: "'Cinzel', serif", color: '#f0c040', fontWeight: 700 }}>
                {scores[id]}
              </div>
              <div style={{ fontSize: 11, color: '#7a8a7a', marginTop: 8, textAlign: 'left' }}>
                {(breakdown[id] || []).map(b => <div key={b}>✓ {b}</div>)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 28,
            padding: '12px 32px',
            background: '#8b6914',
            border: '2px solid #c9b07a',
            borderRadius: 8,
            color: '#fdf8ee',
            fontFamily: "'Cinzel', serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          Rejouer
        </button>
      </div>
    </div>
  );
}
