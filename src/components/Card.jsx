import React from 'react';

const SUIT_SYMBOLS = {
  denari: '🪙',
  coppe: '🏆',
  bastoni: '🪄',
  spade: '⚔️',
};

const SUIT_LABELS = {
  denari: 'Dinars',
  coppe: 'Coupes',
  bastoni: 'Bâtons',
  spade: 'Épées',
};

const SUIT_COLORS = {
  denari: '#c8860a',
  coppe: '#8b1a1a',
  bastoni: '#2d5a1b',
  spade: '#1a2a5a',
};

const VALUE_LABELS = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5',
  6: '6', 7: '7', 8: '8', 9: '9', 10: 'R',
};

export default function Card({
  card,
  selected = false,
  selectable = false,
  onClick,
  small = false,
  faceDown = false,
}) {
  if (!card) return null;

  const color = SUIT_COLORS[card.suit];
  const label = VALUE_LABELS[card.value];
  const symbol = SUIT_SYMBOLS[card.suit];

  const size = small
    ? { width: 52, height: 78, font: 14, symFont: 16 }
    : { width: 72, height: 108, font: 18, symFont: 24 };

  const cardStyle = {
    width: size.width,
    height: size.height,
    borderRadius: 8,
    border: selected
      ? '2.5px solid #f0c040'
      : '1.5px solid #c9b07a',
    background: faceDown
      ? 'repeating-linear-gradient(45deg, #1a3a2a, #1a3a2a 4px, #245238 4px, #245238 8px)'
      : '#fdf8ee',
    cursor: selectable ? 'pointer' : 'default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 3px',
    boxShadow: selected
      ? '0 0 0 3px #f0c04066, 0 4px 12px rgba(0,0,0,0.4)'
      : '0 2px 6px rgba(0,0,0,0.3)',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    transform: selected ? 'translateY(-8px)' : 'none',
    position: 'relative',
    flexShrink: 0,
  };

  if (faceDown) {
    return (
      <div style={cardStyle}>
        <div style={{
          position: 'absolute', inset: 4,
          border: '1px solid #4a7a5a',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4a7a5a', fontSize: 20
        }}>🃏</div>
      </div>
    );
  }

  return (
    <div style={cardStyle} onClick={selectable ? onClick : undefined}>
      {/* Top-left value */}
      <div style={{
        alignSelf: 'flex-start',
        fontFamily: "'Cinzel', serif",
        fontSize: size.font,
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}>
        {label}
      </div>

      {/* Center symbol */}
      <div style={{ fontSize: size.symFont, lineHeight: 1 }}>{symbol}</div>

      {/* Bottom-right value (rotated) */}
      <div style={{
        alignSelf: 'flex-end',
        fontFamily: "'Cinzel', serif",
        fontSize: size.font,
        fontWeight: 700,
        color,
        lineHeight: 1,
        transform: 'rotate(180deg)',
      }}>
        {label}
      </div>

      {/* Suit name tiny */}
      <div style={{
        position: 'absolute',
        bottom: 2,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 7,
        color: '#999',
        fontFamily: 'serif',
        whiteSpace: 'nowrap',
      }}>
        {SUIT_LABELS[card.suit]}
      </div>
    </div>
  );
}
