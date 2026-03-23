import React from 'react';

const SUIT_SYMBOLS = {
  denari: '♦',
  coppe: '♥',
  bastoni: '♣',
  spade: '♠',
};

const SUIT_COLORS = {
  denari: '#cc0000',
  coppe: '#cc0000',
  bastoni: '#111111',
  spade: '#111111',
};

const VALUE_LABELS = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5',
  6: '6', 7: '7', 8: '8', 9: '9', 10: 'R',
};

// Face card SVG patterns (King/Queen/Jack style geometric figure)
function FaceCardArt({ suit, value, color }) {
  const sym = SUIT_SYMBOLS[suit];

  if (value === 10) {
    // King - crown + figure
    return (
      <g>
        {/* Crown */}
        <polygon points="36,28 42,20 48,28 54,18 60,28 66,20 72,28" fill={color} opacity="0.9" />
        <rect x="34" y="27" width="40" height="4" rx="1" fill={color} opacity="0.8" />
        {/* Head */}
        <ellipse cx="54" cy="42" rx="10" ry="11" fill="#f5deb3" stroke={color} strokeWidth="0.5" />
        {/* Body */}
        <path d="M35,85 Q42,62 54,58 Q66,62 73,85 Z" fill={color} opacity="0.85" />
        {/* Robe detail */}
        <path d="M44,85 Q48,70 54,68 Q60,70 64,85 Z" fill={color} opacity="0.4" />
        {/* Suit symbol */}
        <text x="54" y="82" textAnchor="middle" fontSize="11" fill="white" opacity="0.9">{sym}</text>
        {/* Scepter */}
        <line x1="70" y1="50" x2="74" y2="80" stroke={color} strokeWidth="2" />
        <circle cx="72" cy="49" r="3" fill={color} />
      </g>
    );
  }
  if (value === 9) {
    // Queen - veil + figure
    return (
      <g>
        {/* Veil/Crown */}
        <path d="M38,32 Q54,22 70,32 Q66,26 54,24 Q42,26 38,32Z" fill={color} opacity="0.8" />
        <ellipse cx="54" cy="30" rx="14" ry="6" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        {/* Head */}
        <ellipse cx="54" cy="43" rx="9" ry="10" fill="#f5deb3" stroke={color} strokeWidth="0.5" />
        {/* Dress */}
        <path d="M36,90 Q44,60 54,57 Q64,60 72,90 Z" fill={color} opacity="0.85" />
        <path d="M40,90 Q46,68 54,65 Q62,68 68,90 Z" fill={color} opacity="0.35" />
        {/* Flower / orb */}
        <circle cx="68" cy="60" r="5" fill={color} opacity="0.7" />
        <text x="68" y="63" textAnchor="middle" fontSize="8" fill="white">{sym}</text>
      </g>
    );
  }
  if (value === 8) {
    // Jack - feathered hat
    return (
      <g>
        {/* Hat with feather */}
        <path d="M38,36 Q54,26 70,36 L68,44 Q54,38 40,44 Z" fill={color} opacity="0.9" />
        <path d="M66,28 Q78,18 80,30 Q74,26 68,36Z" fill={color} opacity="0.6" />
        {/* Head */}
        <ellipse cx="54" cy="52" rx="9" ry="10" fill="#f5deb3" stroke={color} strokeWidth="0.5" />
        {/* Tunic */}
        <path d="M38,88 Q44,64 54,60 Q64,64 70,88 Z" fill={color} opacity="0.85" />
        {/* Sword */}
        <line x1="68" y1="54" x2="72" y2="84" stroke={color} strokeWidth="1.5" />
        <line x1="65" y1="62" x2="75" y2="62" stroke={color} strokeWidth="2" />
        <polygon points="72,84 70,90 74,90" fill={color} />
      </g>
    );
  }
  return null;
}

// Pip layout for number cards (how many suit symbols to show and where)
const PIP_LAYOUTS = {
  1:  [[54, 54]],
  2:  [[54, 32], [54, 76]],
  3:  [[54, 28], [54, 54], [54, 80]],
  4:  [[38, 32], [70, 32], [38, 76], [70, 76]],
  5:  [[38, 30], [70, 30], [54, 54], [38, 78], [70, 78]],
  6:  [[38, 30], [70, 30], [38, 54], [70, 54], [38, 78], [70, 78]],
  7:  [[38, 28], [70, 28], [54, 42], [38, 56], [70, 56], [38, 78], [70, 78]],
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
  const sym = SUIT_SYMBOLS[card.suit];
  const isFace = card.value >= 8;
  const pips = PIP_LAYOUTS[card.value] || [];

  const W = small ? 52 : 72;
  const H = small ? 78 : 108;
  const scale = small ? 52/108 : 1;

  const cardStyle = {
    width: W,
    height: H,
    flexShrink: 0,
    cursor: selectable ? 'pointer' : 'default',
    transform: selected ? 'translateY(-10px) scale(1.05)' : 'none',
    transition: 'transform 0.15s ease, filter 0.15s ease',
    filter: selected ? 'drop-shadow(0 6px 16px rgba(240,192,64,0.7))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
    userSelect: 'none',
  };

  if (faceDown) {
    return (
      <div style={cardStyle} onClick={selectable ? onClick : undefined}>
        <svg width={W} height={H} viewBox="0 0 72 108">
          <rect x="1" y="1" width="70" height="106" rx="6" fill="#1a5c36" stroke="#c9b07a" strokeWidth="1.5" />
          <rect x="5" y="5" width="62" height="98" rx="4" fill="none" stroke="#c9b07a" strokeWidth="0.8" opacity="0.5" />
          {/* Crosshatch pattern */}
          {Array.from({length: 8}).map((_, i) => (
            <line key={`h${i}`} x1="5" y1={14 + i * 12} x2="67" y2={14 + i * 12}
              stroke="#c9b07a" strokeWidth="0.4" opacity="0.3" />
          ))}
          {Array.from({length: 6}).map((_, i) => (
            <line key={`v${i}`} x1={14 + i * 10} y1="5" x2={14 + i * 10} y2="103"
              stroke="#c9b07a" strokeWidth="0.4" opacity="0.3" />
          ))}
          <text x="36" y="59" textAnchor="middle" dominantBaseline="central"
            fontSize="22" fill="#c9b07a" opacity="0.6">🃏</text>
        </svg>
      </div>
    );
  }

  return (
    <div style={cardStyle} onClick={selectable ? onClick : undefined}>
      <svg width={W} height={H} viewBox="0 0 72 108">
        {/* Card body */}
        <rect x="0.5" y="0.5" width="71" height="107" rx="6"
          fill="white"
          stroke={selected ? '#f0c040' : '#999'}
          strokeWidth={selected ? 2 : 0.8}
        />
        {selected && (
          <rect x="0.5" y="0.5" width="71" height="107" rx="6"
            fill="rgba(240,192,64,0.08)" />
        )}

        {/* Top-left corner */}
        <text x="5" y="13" fontSize="11" fontWeight="700" fontFamily="Georgia, serif"
          fill={color}>{label}</text>
        <text x="5" y="23" fontSize="9" fontFamily="Georgia, serif"
          fill={color}>{sym}</text>

        {/* Bottom-right corner (rotated) */}
        <g transform="rotate(180, 36, 54)">
          <text x="5" y="13" fontSize="11" fontWeight="700" fontFamily="Georgia, serif"
            fill={color}>{label}</text>
          <text x="5" y="23" fontSize="9" fontFamily="Georgia, serif"
            fill={color}>{sym}</text>
        </g>

        {/* Card content */}
        {isFace ? (
          <>
            {/* Face card border decoration */}
            <rect x="12" y="14" width="48" height="80" rx="3"
              fill="none" stroke={color} strokeWidth="0.6" opacity="0.4" />
            <FaceCardArt suit={card.suit} value={card.value} color={color} />
          </>
        ) : (
          /* Pip card */
          pips.map(([px, py], i) => (
            <text key={i} x={px} y={py}
              textAnchor="middle" dominantBaseline="central"
              fontSize={card.value === 1 ? "28" : "13"}
              fontFamily="Georgia, serif"
              fill={color}
            >{sym}</text>
          ))
        )}
      </svg>
    </div>
  );
}