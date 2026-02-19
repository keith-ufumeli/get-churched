/**
 * In-memory config for Gemini and modes. Admin PATCH updates these.
 * Cards route reads topUpRate and enabledModes from here when available.
 */

const { builtinCards } = require('../data/builtinCards');
const VALID_MODES = Object.keys(builtinCards);

const config = {
  topUpRate: null,
  enabledModes: null,
};

function getTopUpRate() {
  if (config.topUpRate != null && config.topUpRate >= 0 && config.topUpRate <= 1) {
    return config.topUpRate;
  }
  return parseFloat(process.env.GEMINI_TOP_UP_RATE, 10) || 0.3;
}

function getEnabledModes() {
  if (config.enabledModes && config.enabledModes.length > 0) {
    return config.enabledModes;
  }
  return [...VALID_MODES];
}

function setTopUpRate(value) {
  if (typeof value === 'number' && value >= 0 && value <= 1) {
    config.topUpRate = value;
  }
}

function setEnabledModes(modes) {
  if (Array.isArray(modes)) {
    const valid = modes.filter((m) => VALID_MODES.includes(m));
    if (valid.length > 0) config.enabledModes = valid;
  }
}

function getConfig() {
  return { topUpRate: getTopUpRate(), enabledModes: getEnabledModes() };
}

function updateConfig(updates) {
  if (updates.topUpRate != null) setTopUpRate(Number(updates.topUpRate));
  if (updates.enabledModes != null) setEnabledModes(updates.enabledModes);
  return getConfig();
}

module.exports = { getTopUpRate, getEnabledModes, getConfig, updateConfig };