/**
 * Serviço Firebase para modo multijogador online.
 * Completamente separado do modo local — não afecta o jogo normal.
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  off,
  type DatabaseReference,
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

// ─── Tipos da sala online ──────────────────────────────────────────────────

export interface OnlinePlayer {
  id: string;
  name: string;
  emoji: string;
  score: number;
  isHost: boolean;
}

export type OnlinePhase =
  | 'waiting'    // à espera de jogadores
  | 'countdown'  // contagem 3-2-1
  | 'playing'    // a jogar
  | 'voting'     // a votar na resposta
  | 'scoring'    // a ver pontuações
  | 'finished';  // fim do jogo

export interface OnlineAnswer {
  playerId: string;
  text: string;
  valid: boolean | null; // null = ainda não votado
}

export interface OnlineRoom {
  code: string;
  hostId: string;
  phase: OnlinePhase;
  currentLetter: string;
  currentCategory: CategoryKey;
  round: number;
  timePerRound: number;
  usedLetters: string[];
  remainingLetters: string[];
  players: Record<string, OnlinePlayer>;
  answers: Record<string, OnlineAnswer>; // playerId → resposta
  createdAt: number;
}

// ─── Gerar código de sala ──────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Criar sala ────────────────────────────────────────────────────────────

export async function createRoom(
  player: OnlinePlayer,
  timePerRound: number,
  remainingLetters: string[],
  firstLetter: string,
  firstCategory: CategoryKey
): Promise<string> {
  let code = generateRoomCode();

  // Garantir código único
  let attempts = 0;
  while (attempts < 5) {
    const existing = await get(ref(db, `rooms/${code}`));
    if (!existing.exists()) break;
    code = generateRoomCode();
    attempts++;
  }

  const room: OnlineRoom = {
    code,
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

// ─── Entrar numa sala ──────────────────────────────────────────────────────

export async function joinRoom(
  code: string,
  player: OnlinePlayer
): Promise<OnlineRoom | null> {
  const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return null;

  const room = snapshot.val() as OnlineRoom;
  if (room.phase !== 'waiting') return null;
  if (Object.keys(room.players).length >= 8) return null;

  await update(ref(db, `rooms/${code}/players`), {
    [player.id]: player,
  });

  return room;
}

// ─── Observar sala em tempo real ───────────────────────────────────────────

export function watchRoom(
  code: string,
  callback: (room: OnlineRoom | null) => void
): () => void {
  const roomRef = ref(db, `rooms/${code}`);
  onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as OnlineRoom) : null);
  });
  return () => off(roomRef);
}

// ─── Acções do host ────────────────────────────────────────────────────────

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
    usedLetters,
    remainingLetters,
    round,
    answers: {},
  });
}

export async function endOnlineGame(code: string): Promise<void> {
  await update(ref(db, `rooms/${code}`), { phase: 'finished' });
}

// ─── Acções dos jogadores ──────────────────────────────────────────────────

export async function submitAnswer(
  code: string,
  playerId: string,
  text: string
): Promise<void> {
  await set(ref(db, `rooms/${code}/answers/${playerId}`), {
    playerId,
    text,
    valid: null,
  });
}

export async function voteAnswer(
  code: string,
  playerId: string,
  valid: boolean
): Promise<void> {
  await update(ref(db, `rooms/${code}/answers/${playerId}`), { valid });
  if (valid) {
    // Incrementar pontuação
    const snapshot = await get(ref(db, `rooms/${code}/players/${playerId}/score`));
    const current = (snapshot.val() as number) ?? 0;
    await set(ref(db, `rooms/${code}/players/${playerId}/score`), current + 1);
  }
}

export async function updateOnlineScore(
  code: string,
  playerId: string,
  delta: number
): Promise<void> {
  const snapshot = await get(ref(db, `rooms/${code}/players/${playerId}/score`));
  const current = (snapshot.val() as number) ?? 0;
  await set(
    ref(db, `rooms/${code}/players/${playerId}/score`),
    Math.max(0, current + delta)
  );
}

// ─── Limpar sala antiga ────────────────────────────────────────────────────

export async function deleteRoom(code: string): Promise<void> {
  await set(ref(db, `rooms/${code}`), null);
}

// ─── Referência directa (para uso pontual) ────────────────────────────────
export function roomRef(code: string): DatabaseReference {
  return ref(db, `rooms/${code}`);
}
