import React, { useState, useEffect } from 'react';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import { createGame } from './lib/gameEngine';
import { updateGameState, subscribeToRoom, supabase } from './lib/supabase';

function getOrCreatePlayerId() {
  let id = localStorage.getItem('shkobba_player_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 12);
    localStorage.setItem('shkobba_player_id', id);
  }
  return id;
}

export default function App() {
  const [playerId] = useState(getOrCreatePlayerId);
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [role, setRole] = useState(null); // 'host' | 'guest'

  async function handleRoomReady(room, name, myRole) {
    setPlayerName(name);
    setRole(myRole);
    setRoom(room);

    if (myRole === 'host') {
      // Host starts the game
      const state = createGame(room.host_id, room.guest_id);
      setGameState(state);
      await updateGameState(room.code, state);
    }
  }

  // Guest: wait for game state to appear
  useEffect(() => {
    if (!room || role !== 'guest') return;
    const channel = subscribeToRoom(room.code, (updatedRoom) => {
      if (updatedRoom.state && !gameState) {
        setGameState(updatedRoom.state);
      }
    });
    return () => supabase.removeChannel(channel);
  }, [room, role]);

  if (!room) {
    return <Lobby playerId={playerId} onRoomReady={handleRoomReady} />;
  }

  if (!gameState) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a3a2a 0%, #0d1f15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'IM Fell English', serif",
        color: '#c9b07a',
        fontSize: 20,
      }}>
        Chargement de la partie…
      </div>
    );
  }

  return (
    <GameBoard
      room={room}
      gameState={gameState}
      setGameState={setGameState}
      playerId={playerId}
      playerName={playerName}
      role={role}
    />
  );
}
