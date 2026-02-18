import type { CardMode } from '@/types/game'

export const GAME_MODES: CardMode[] = [
  'sing', 'act', 'explain', 'trivia', 'hum',
  'whoami', 'fillinblank', 'taboo', 'oneword', 'draw',
]

export const MODE_COLORS: Record<CardMode, string> = {
  sing: '#FFD700',
  act: '#DC2626',
  explain: '#2563EB',
  trivia: '#16A34A',
  hum: '#9333EA',
  whoami: '#FB923C',
  fillinblank: '#14B8A6',
  taboo: '#DC2626',
  oneword: '#1E3A8A',
  draw: '#F59E0B',
}

export const MODE_LABELS: Record<CardMode, string> = {
  sing: 'Sing',
  act: 'Act',
  explain: 'Explain',
  trivia: 'Trivia',
  hum: 'Hum a Hymn',
  whoami: 'Who Am I?',
  fillinblank: 'Fill in the Blank',
  taboo: 'Taboo',
  oneword: 'One Word',
  draw: 'Draw',
}

export const MODE_DURATIONS: Record<CardMode, number> = {
  sing: 60,
  act: 60,
  explain: 60,
  trivia: 0,
  hum: 60,
  whoami: 90,
  fillinblank: 0,
  taboo: 60,
  oneword: 30,
  draw: 90,
}

export const MODE_EMOJIS: Record<CardMode, string> = {
  sing: '🎵',
  act: '🎭',
  explain: '💬',
  trivia: '📖',
  hum: '🎶',
  whoami: '👤',
  fillinblank: '✍️',
  taboo: '🚫',
  oneword: '💡',
  draw: '🎨',
}

export const MODE_DESCRIPTIONS: Record<CardMode, string> = {
  sing: 'Belt out a worship song — your team guesses the title',
  act: 'Act out a Bible story, no talking allowed',
  explain: 'Describe the word without saying it',
  trivia: 'Answer a faith-based multiple choice question',
  hum: 'Hum a hymn — your team names the tune',
  whoami: "Guess who you are from your team's yes/no clues",
  fillinblank: 'Complete the missing word in a Bible verse',
  taboo: 'Describe the word without saying the forbidden words',
  oneword: 'One word only — make your team guess',
  draw: 'Sketch it — no letters or numbers allowed',
}
