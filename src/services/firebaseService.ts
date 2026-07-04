import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, off } from 'firebase/database';
import type { CategoryKey } from '@/types';

const firebaseConfig = {
  apiKey: 'AIzaSyAnAX6-1F2YpyTdbtr0TVPscJxmQiUF3MQ',
  authDomain: 'letra-a-letra-1aea7.firebaseapp.com',
  databaseURL: 'https://letra-a-letra-1aea7-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'letra-a-letra-1aea7',
  storageBucket: 'letra-a-letra-1aea7.firebasestorage.app',
  messagingSenderId: '992970442215',
  appId: '1:992970442215:web:688b926b276a2377112942',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export type RoomMode = 'team' | 'versus';
export type OnlinePhase = 'waiting' | 'countdown' | 'playing' | 'scoring' | 'finished';

export interface OnlineConfig {
  timePerRound: number;
  selectedCategories: CategoryKey[];
  categoriesPerRound: number;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  emoji: string;
  score: number;
  isHost: boolean;
}

export interface PlayerAnswer {
  text: string;
  status: 'pending' | 'correct' | 'wrong' | 'gaveup';
}

export interface ChatMessage {
  playerId: string;
  emoji: string;
  ts: number;
}

export interface OnlineRoom {
  code: string;
  mode: RoomMode;
  hostId: string;
  phase: OnlinePhase;
  currentLetter: string;
  currentCategories: CategoryKey[];
  round: number;
  config: OnlineConfig;
  usedLetters: string[];
  remainingLetters: string[];
  players: Record<string, OnlinePlayer>;
  answers: Record<string, PlayerAnswer>;
  chat: Record<string, ChatMessage>;
  createdAt: number;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createRoom(
  player: OnlinePlayer,
  mode: RoomMode,
  config: OnlineConfig,
  remainingLetters: string[],
  firstLetter: string,
  firstCategories: CategoryKey[]
): Promise<string> {
  let code = generateRoomCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await get(ref(db, `rooms/${code}`));
    if (!existing.exists()) break;
    code = generateRoomCode();
    attempts++;
  }

  const room: OnlineRoom = {
    code, mode, hostId: player.id, phase: 'waiting',
    currentLetter: firstLetter, currentCategories: firstCategories,
    round: 1, config,
    usedLetters: [firstLetter],
    remainingLetters: remainingLetters.filter(l => l !== firstLetter),
    players: { [player.id]: player },
    answers: {}, chat: {},
    createdAt: Date.now(),
  };

  await set(ref(db, `rooms/${code}`), room);
  return code;
}

export async function joinRoom(code: string, player: OnlinePlayer): Promise<OnlineRoom | null> {
  const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return null;
  const room = snapshot.val() as OnlineRoom;
  if (room.phase !== 'waiting') return null;
  if (Object.keys(room.players).length >= 2) return null;
  await update(ref(db, `rooms/${code.toUpperCase()}/players`), { [player.id]: player });
  return { ...room, players: { ...room.players, [player.id]: player } };
}

export function watchRoom(code: string, callback: (room: OnlineRoom | null) => void): () => void {
  const roomRef = ref(db, `rooms/${code}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as OnlineRoom) : null);
  });
  return () => off(roomRef);
}

export async function startOnlineGame(code: string): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase: 'countdown' });
}

export async function setOnlinePhase(code: string, phase: OnlinePhase): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase });
}

export async function nextOnlineRound(
  code: string, nextLetter: string, nextCategories: CategoryKey[],
  usedLetters: string[], remainingLetters: string[], round: number
): Promise<void> {
  await update(ref(db, `rooms/${code}`), {
    phase: 'countdown', currentLetter: nextLetter, currentCategories: nextCategories,
    usedLetters, remainingLetters, round, answers: {},
  });
}

export async function rematch(code: string, firstLetter: string, firstCategories: CategoryKey[], remainingLetters: string[]): Promise<void> {
  // Reset scores e reinicia o jogo
  const snapshot = await get(ref(db, `rooms/${code}/players`));
  if (!snapshot.exists()) return;
  const players = snapshot.val() as Record<string, OnlinePlayer>;
  const resetPlayers: Record<string, OnlinePlayer> = {};
  for (const [id, p] of Object.entries(players)) {
    resetPlayers[id] = { ...p, score: 0 };
  }
  await update(ref(db, `rooms/${code}`), {
    phase: 'countdown',
    currentLetter: firstLetter, currentCategories: firstCategories,
    round: 1, usedLetters: [firstLetter], remainingLetters, answers: {}, chat: {},
    players: resetPlayers,
  });
}

export async function endOnlineGame(code: string): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase: 'finished' });
}

export async function setPlayerAnswer(code: string, playerId: string, answer: PlayerAnswer): Promise<void> {
  await set(ref(db, `rooms/${code}/answers/${playerId}`), answer);
}

export async function addScore(code: string, playerId: string, delta: number): Promise<void> {
  const { runTransaction } = await import('firebase/database');
  await runTransaction(ref(db, `rooms/${code}/players/${playerId}/score`), (current) => {
    return Math.max(0, (current ?? 0) + delta);
  });
}

export async function sendChatEmoji(code: string, playerId: string, emoji: string): Promise<void> {
  const ts = Date.now();
  await set(ref(db, `rooms/${code}/chat/${playerId}_${ts}`), { playerId, emoji, ts });
}

export async function deleteRoom(code: string): Promise<void> {
  await set(ref(db, `rooms/${code}`), null);
}

/** Remove um jogador da sala (quando não é o host a sair) */
export async function removePlayerFromRoom(code: string, playerId: string): Promise<void> {
  await set(ref(db, `rooms/${code}/players/${playerId}`), null);
}
