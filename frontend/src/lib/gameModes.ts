import type { LucideIcon } from 'lucide-react'
import {
  Music,
  Theater,
  MessageCircle,
  BookOpen,
  Music2,
  User,
  PenLine,
  Ban,
  Lightbulb,
  Pencil,
} from 'lucide-react'
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

export const MODE_ICONS: Record<CardMode, LucideIcon> = {
  sing: Music,
  act: Theater,
  explain: MessageCircle,
  trivia: BookOpen,
  hum: Music2,
  whoami: User,
  fillinblank: PenLine,
  taboo: Ban,
  oneword: Lightbulb,
  draw: Pencil,
}

export const MODE_DESCRIPTIONS: Record<CardMode, string> = {
  sing: 'Sing a line from a worship song that contains this word',
  act: 'Act out a Bible story, no talking allowed',
  explain: 'Describe the word without saying it',
  trivia: 'Answer a faith-based multiple choice question',
  hum: 'Hum a hymn or gospel song — your team names the tune',
  whoami: "Guess who you are from your team's yes/no clues",
  fillinblank: 'Complete the missing word in a Bible verse',
  taboo: 'Describe the word without saying the forbidden words',
  oneword: 'One word only — make your team guess',
  draw: 'Sketch it — no letters or numbers allowed',
}

export const MODE_RULES: Record<CardMode, string> = {
  sing: 'Your team must sing a line from a worship or Christian song that contains the word shown. The word must appear in the lyrics — not the song title. Teammates guess the song or confirm the word is in the line.',
  act: 'Act out the Bible character, story, or concept on the card. No talking or mouthing words. Your team guesses what you are acting.',
  explain: 'Describe the word or concept so your team can guess it. You cannot say the word itself or any form of it.',
  trivia: 'Answer the multiple choice question. Only the first answer counts. No hints from the team.',
  hum: 'Hum or whistle the tune of the hymn or gospel song. No words. Your team guesses the song title.',
  whoami: "You are the Bible character on the card. Your team asks yes/no questions to guess who you are. You may only answer yes or no.",
  fillinblank: 'Complete the Bible verse by filling in the missing word. Your team can help. The reference is shown for context.',
  taboo: 'Get your team to say the main word without using that word or any of the forbidden words listed on the card.',
  oneword: 'You may only say one word as a clue. Your team must guess the concept from that single word.',
  draw: 'Draw the scene or object on the card. No letters, numbers, or words. Your team guesses what you are drawing.',
}
