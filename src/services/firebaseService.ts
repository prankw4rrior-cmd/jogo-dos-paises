/**
 * Serviço Firebase para modo multijogador online.
 * Suporta dois modos: 'team' (equipa) e 'versus' (1v1).
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, get, onValue, update, off,
} from 'firebase/database';
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

// ─── Tipos ──────────────────────────────────────────────────────────────

export type RoomMode = 'team' | 'versus';
export type OnlinePhase = 'waiting' | 'countdown' | 'playing' | 'scoring' | 'finished';

export interface OnlinePlayer {
  id: string;
  name: string;
  emoji: string;
  score: number;
  isHost: boolean;
}

export interface PlayerAnswer {
  text: string;
  status: 'pending' | 'correct' | 'wrong' | 'gaveup'; // pending = ainda a tentar
}

export interface OnlineRoom {
  code: string;
  mode: RoomMode;
  hostId: string;
  phase: OnlinePhase;
  currentLetter: string;
  currentCategory: CategoryKey;
  round: number;
  timePerRound: number;
  usedLetters: string[];
  remainingLetters: string[];
  players: Record<string, OnlinePlayer>;
  answers: Record<string, PlayerAnswer>; // playerId → resposta da ronda actual
  createdAt: number;
}

// ─── Código de sala ─────────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─── Criar sala ─────────────────────────────────────────────────────────

export async function createRoom(
  player: OnlinePlayer,
  mode: RoomMode,
  timePerRound: number,
  remainingLetters: string[],
  firstLetter: string,
  firstCategory: CategoryKey
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
    code,
    mode,
    hostId: player.id,
    phase: 'waiting',
    currentLetter: firstLetter,
    currentCategory: firstCategory,
    round: 1,
    timePerRound,
    usedLetters: [firstLetter],
    remainingLetters: remainingLetters.filter(l => l !== firstLetter),
    players: { [player.id]: player },
    answers: {},
    createdAt: Date.now(),
  };

  await set(ref(db, `rooms/${code}`), room);
  return code;
}

// ─── Entrar numa sala ───────────────────────────────────────────────────

export async function joinRoom(code: string, player: OnlinePlayer): Promise<OnlineRoom | null> {
  const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return null;

  const room = snapshot.val() as OnlineRoom;
  if (room.phase !== 'waiting') return null;
  if (Object.keys(room.players).length >= 2) return null; // máx 2 jogadores

  await update(ref(db, `rooms/${code.toUpperCase()}/players`), { [player.id]: player });
  return { ...room, players: { ...room.players, [player.id]: player } };
}

// ─── Observar sala ──────────────────────────────────────────────────────

export function watchRoom(code: string, callback: (room: OnlineRoom | null) => void): () => void {
  const roomRef = ref(db, `rooms/${code}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as OnlineRoom) : null);
  });
  return () => off(roomRef);
}

// ─── Acções ─────────────────────────────────────────────────────────────

export async function startOnlineGame(code: string): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase: 'countdown' });
}

export async function setOnlinePhase(code: string, phase: OnlinePhase): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase });
}

export async function nextOnlineRound(
  code: string,
  nextLetter: string,
  nextCategory: CategoryKey,
  usedLetters: string[],
  remainingLetters: string[],
  round: number
): Promise<void> {
  await update(ref(db, `rooms/${code}`), {
    phase: 'countdown',
    currentLetter: nextLetter,
    currentCategory: nextCategory,
    usedLetters, remainingLetters, round,
    answers: {},
  });
}

export async function endOnlineGame(code: string): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase: 'finished' });
}

/** Submete ou actualiza a resposta de um jogador */
export async function setPlayerAnswer(code: string, playerId: string, answer: PlayerAnswer): Promise<void> {
  await set(ref(db, `rooms/${code}/answers/${playerId}`), answer);
}

/** Adiciona pontos a um jogador */
export async function addScore(code: string, playerId: string, delta: number): Promise<void> {
  const snapshot = await get(ref(db, `rooms/${code}/players/${playerId}/score`));
  const current = (snapshot.val() as number) ?? 0;
  await set(ref(db, `rooms/${code}/players/${playerId}/score`), Math.max(0, current + delta));
}

export async function deleteRoom(code: string): Promise<void> {
  await set(ref(db, `rooms/${code}`), null);
}
