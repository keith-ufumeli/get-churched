const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const PROMPTS = {
  trivia: `Generate one Bible trivia question as JSON only, no markdown. Use this exact shape: {"q": "question text", "a": "correct answer", "options": ["option1", "option2", "option3", "option4"]}. Four options, one correct. JSON only.`,
  fillinblank: `Generate one fill-in-the-blank Bible verse as JSON only. Use this shape: {"verse": "sentence with _____ for the missing word", "answer": "the missing word", "ref": "Book chapter:verse"}. JSON only, no markdown.`,
  taboo: `Generate one Bible taboo card as JSON only. Use this shape: {"word": "main word", "forbidden": ["word1", "word2", "word3", "word4", "word5"]}. Five forbidden words. JSON only, no markdown.`,
  sing: 'Give one worship-song or hymn keyword (single word or short title). Plain text only, no JSON, no quotes.',
  act: 'Give one Bible charades prompt: a character, story, or concept in 3-5 words. Plain text only.',
  explain: 'Give one Bible word, place, or concept (1-3 words). Plain text only.',
  hum: 'Give one well-known Christian hymn or worship song title. Plain text only.',
  whoami: 'Give one Bible character name. Plain text only.',
  oneword: 'Give one abstract Christian or faith concept, one word. Plain text only.',
  draw: 'Give one Bible scene or object to draw, 3-5 words. Plain text only.',
};

const JSON_MODES = ['trivia', 'fillinblank', 'taboo'];

/**
 * Generate a card using the Gemini API. Returns null on any error (caller should use built-in deck).
 * @param {string} mode - Card mode (sing, act, trivia, etc.)
 * @returns {Promise<string|object|null>} Card content or null
 */
async function generateCard(mode) {
  if (!genAI) return null;
  const prompt = PROMPTS[mode] || PROMPTS.explain;
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: { maxOutputTokens: 300 },
    });
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.()?.trim() || '';
    if (!text) return null;

    if (JSON_MODES.includes(mode)) {
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    }
    return text;
  } catch (err) {
    return null;
  }
}

module.exports = { generateCard };
