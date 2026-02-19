const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const DIFFICULTY_HINT = {
  easy: 'Use very common, well-known references only.',
  medium: 'Use a mix of common and moderately known references.',
  hard: 'Use some lesser-known or deeper references.',
  mixed: 'Vary between easy and hard.',
};

function buildPrompt(mode, opts = {}) {
  const { difficulty, country, usedSet } = opts;
  const base = {
    trivia: `Generate one Bible trivia question as JSON only, no markdown. Use this exact shape: {"q": "question text", "a": "correct answer", "options": ["option1", "option2", "option3", "option4"]}. Four options, one correct. JSON only.`,
    fillinblank: `Generate one fill-in-the-blank Bible verse as JSON only. Use this shape: {"verse": "sentence with _____ for the missing word", "answer": "the missing word", "ref": "Book chapter:verse"}. JSON only, no markdown.`,
    taboo: `Generate one Bible taboo card as JSON only. Use this shape: {"word": "main word", "forbidden": ["word1", "word2", "word3", "word4", "word5"]}. Five forbidden words. JSON only, no markdown.`,
    sing: 'Give one single WORD (e.g. Grace, Love, Peace) that must appear in the lyrics of a worship or Christian song. The team will sing a line containing this word — not the song title. Plain text only, one word, no JSON, no quotes.',
    act: 'Give one Bible charades prompt: a character, story, or concept in 3-5 words. Plain text only.',
    explain: 'Give one Bible word, place, or concept (1-3 words). Plain text only.',
    hum: 'Give one well-known Christian hymn or worship song title. Plain text only.',
    whoami: 'Give one Bible character name. Plain text only.',
    oneword: 'Give one abstract Christian or faith concept, one word. Plain text only.',
    draw: 'Give one Bible scene or object to draw, 3-5 words. Plain text only.',
  };
  let prompt = base[mode] || base.explain;
  if (difficulty && DIFFICULTY_HINT[difficulty]) {
    prompt += ` Difficulty: ${DIFFICULTY_HINT[difficulty]}`;
  }
  if (country && (mode === 'hum' || mode === 'sing')) {
    prompt += ` Prefer songs or hymns commonly known in ${country}.`;
  }
  if (usedSet && usedSet.size > 0) {
    const exclude = [...usedSet].slice(0, 20).join(', ');
    prompt += ` Do not use any of these: ${exclude}.`;
  }
  return prompt;
}

const JSON_MODES = ['trivia', 'fillinblank', 'taboo'];

/**
 * Generate a card using the Gemini API. Returns null on any error (caller should use built-in deck).
 * @param {string} mode - Card mode (sing, act, trivia, etc.)
 * @param {{ difficulty?: string, country?: string, usedSet?: Set<string> }} opts - Optional context
 * @returns {Promise<string|object|null>} Card content or null
 */
async function generateCard(mode, opts = {}) {
  if (!genAI) {
    console.log('[Gemini] No API key configured, skipping Gemini');
    return null;
  }
  const prompt = buildPrompt(mode, opts);
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 300 },
    });
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.()?.trim() || '';
    const usageMetadata = result.response?.usageMetadata ?? null;
    const tokens = usageMetadata
      ? (usageMetadata.totalTokenCount ?? (usageMetadata.promptTokenCount || 0) + (usageMetadata.candidatesTokenCount || 0))
      : 0;

    if (!text) {
      console.log('[Gemini] Empty response from API for mode:', mode);
      return { card: null, tokens, success: false };
    }

    let card = null;
    if (JSON_MODES.includes(mode)) {
      try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        card = JSON.parse(cleaned);
      } catch (parseErr) {
        console.log('[Gemini] JSON parse error for mode:', mode, 'Response:', text.substring(0, 100));
        return { card: null, tokens, success: false };
      }
    } else {
      card = text;
    }
    return { card, tokens, success: true };
  } catch (err) {
    console.log('[Gemini] API error for mode:', mode, 'Error:', err.message || err);
    return { card: null, tokens: 0, success: false };
  }
}

module.exports = { generateCard };
