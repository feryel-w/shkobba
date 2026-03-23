// ── Shkobba Game Engine ──────────────────────────────────────────────────────

export const SUITS = ['denari', 'coppe', 'bastoni', 'spade'];
export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, id: `${value}_${suit}` });
    }
  }
  return shuffle(deck);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGame(player1Id, player2Id) {
  const deck = createDeck();
  const tableCards = deck.splice(0, 4);
  const hand1 = deck.splice(0, 3);
  const hand2 = deck.splice(0, 3);

  return {
    deck,
    tableCards,
    hands: {
      [player1Id]: hand1,
      [player2Id]: hand2,
    },
    captured: {
      [player1Id]: [],
      [player2Id]: [],
    },
    shkobba: {
      [player1Id]: 0,
      [player2Id]: 0,
    },
    currentTurn: player1Id,
    lastCaptor: null,
    players: [player1Id, player2Id],
    phase: 'playing', // 'playing' | 'finished'
    scores: null,
    roundNumber: 1,
  };
}

// Returns all subsets of tableCards that sum to targetValue
export function findCaptures(tableCards, playedValue) {
  const results = [];
  const n = tableCards.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    let sum = 0;
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += tableCards[i].value;
        subset.push(tableCards[i]);
      }
    }
    if (sum === playedValue) results.push(subset);
  }
  return results;
}

export function applyMove(game, playerId, cardId, captureGroup) {
  const state = JSON.parse(JSON.stringify(game)); // deep clone
  const hand = state.hands[playerId];
  const cardIndex = hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) throw new Error('Card not in hand');
  const [playedCard] = hand.splice(cardIndex, 1);

  const otherId = state.players.find(p => p !== playerId);

  if (captureGroup && captureGroup.length > 0) {
    // Remove captured cards from table
    const captureIds = new Set(captureGroup.map(c => c.id));
    state.tableCards = state.tableCards.filter(c => !captureIds.has(c.id));
    state.captured[playerId].push(playedCard, ...captureGroup);
    state.lastCaptor = playerId;

    // Shkobba!
    if (state.tableCards.length === 0) {
      state.shkobba[playerId] += 1;
    }
  } else {
    // No capture: add to table
    state.tableCards.push(playedCard);
  }

  // Deal new hands if both empty
  const myHand = state.hands[playerId];
  const otherHand = state.hands[otherId];
  if (myHand.length === 0 && otherHand.length === 0) {
    if (state.deck.length >= 6) {
      state.hands[playerId] = state.deck.splice(0, 3);
      state.hands[otherId] = state.deck.splice(0, 3);
    } else if (state.deck.length > 0) {
      // Deal remaining
      const remaining = state.deck.splice(0);
      const half = Math.ceil(remaining.length / 2);
      state.hands[playerId] = remaining.slice(0, half);
      state.hands[otherId] = remaining.slice(half);
    } else {
      // Game over — remaining table cards go to last captor
      if (state.lastCaptor && state.tableCards.length > 0) {
        state.captured[state.lastCaptor].push(...state.tableCards);
        state.tableCards = [];
      }
      state.phase = 'finished';
      state.scores = calculateScores(state);
      return state;
    }
  }

  state.currentTurn = otherId;
  return state;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function calculateScores(state) {
  const [p1, p2] = state.players;
  const scores = { [p1]: 0, [p2]: 0 };
  const breakdown = { [p1]: [], [p2]: [] };

  // Shkobba points
  for (const pid of state.players) {
    if (state.shkobba[pid] > 0) {
      scores[pid] += state.shkobba[pid];
      breakdown[pid].push(`Shkobba x${state.shkobba[pid]}`);
    }
  }

  // Most cards
  const c1 = state.captured[p1].length;
  const c2 = state.captured[p2].length;
  if (c1 > c2) { scores[p1]++; breakdown[p1].push('Plus de cartes'); }
  else if (c2 > c1) { scores[p2]++; breakdown[p2].push('Plus de cartes'); }

  // Most denari
  const d1 = state.captured[p1].filter(c => c.suit === 'denari').length;
  const d2 = state.captured[p2].filter(c => c.suit === 'denari').length;
  if (d1 > d2) { scores[p1]++; breakdown[p1].push('Plus de dinars'); }
  else if (d2 > d1) { scores[p2]++; breakdown[p2].push('Plus de dinars'); }

  // Settebello (7 of denari)
  const has7p1 = state.captured[p1].some(c => c.suit === 'denari' && c.value === 7);
  const has7p2 = state.captured[p2].some(c => c.suit === 'denari' && c.value === 7);
  if (has7p1) { scores[p1]++; breakdown[p1].push('7 de dinars'); }
  if (has7p2) { scores[p2]++; breakdown[p2].push('7 de dinars'); }

  // Primiera (best 7 per suit, using shkobba values: 7=21, 6=18, 1=16, 5=15, 4=14, 3=13, 2=12, others=10)
  const primieraValue = v => ({ 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12 }[v] || 10);
  const primiera = (captured) => {
    let total = 0;
    for (const suit of SUITS) {
      const suitCards = captured.filter(c => c.suit === suit);
      if (suitCards.length === 0) return -1; // can't score primiera without all suits
      total += Math.max(...suitCards.map(c => primieraValue(c.value)));
    }
    return total;
  };
  const pr1 = primiera(state.captured[p1]);
  const pr2 = primiera(state.captured[p2]);
  if (pr1 > pr2) { scores[p1]++; breakdown[p1].push('Primiera'); }
  else if (pr2 > pr1) { scores[p2]++; breakdown[p2].push('Primiera'); }

  return { scores, breakdown };
}
