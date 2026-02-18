/**
 * Built-in card deck for fallback when Gemini is unavailable or for 70% of draws.
 * Keys match API mode names; each value is an array of cards (string or object per mode).
 */

const builtinCards = {
  sing: ['Amazing Grace', 'How Great Thou Art', 'Holy Spirit'],
  act: ['Noah and the Ark', 'David and Goliath', 'The Good Samaritan'],
  explain: ['Faith', 'Redemption', 'Covenant'],
  trivia: [
    { q: 'Who built the ark?', a: 'Noah', options: ['Noah', 'Moses', 'Abraham', 'David'] },
    { q: 'How many books are in the New Testament?', a: '27', options: ['27', '39', '66', '12'] },
    { q: 'What is the first book of the Bible?', a: 'Genesis', options: ['Genesis', 'Exodus', 'Matthew', 'John'] },
  ],
  hum: ['Amazing Grace', 'How Great Thou Art', 'It Is Well With My Soul'],
  whoami: ['Moses', 'David', 'Paul', 'Peter'],
  fillinblank: [
    { verse: 'For God so loved the world that he gave his one and only _____.', answer: 'Son', ref: 'John 3:16' },
    { verse: 'The _____ is the way, the truth and the life.', answer: 'Lord', ref: 'John 14:6' },
    { verse: 'Trust in the _____ with all your heart.', answer: 'Lord', ref: 'Proverbs 3:5' },
  ],
  taboo: [
    { word: 'Prayer', forbidden: ['talk', 'God', 'ask', 'church', 'bless'] },
    { word: 'Faith', forbidden: ['believe', 'trust', 'hope', 'God', 'Jesus'] },
    { word: 'Grace', forbidden: ['mercy', 'forgive', 'God', 'gift', 'free'] },
  ],
  oneword: ['Hope', 'Mercy', 'Salvation'],
  draw: ['Noah\'s Ark', 'The Cross', 'The Good Shepherd'],
};

/**
 * Get a random card for the given mode.
 * @param {string} mode - Card mode (sing, act, trivia, etc.)
 * @returns {string|object} Card content (string for simple modes, object for trivia/fillinblank/taboo)
 */
function getRandomBuiltinCard(mode) {
  const cards = builtinCards[mode];
  if (!cards || cards.length === 0) {
    return builtinCards.explain[0];
  }
  return cards[Math.floor(Math.random() * cards.length)];
}

module.exports = { builtinCards, getRandomBuiltinCard };
