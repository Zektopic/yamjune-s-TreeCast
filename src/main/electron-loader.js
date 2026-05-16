// electron-loader.js
// Workaround for Electron Windows bug where require('electron') returns
// the binary path string instead of the API module.
// This file is NOT bundled — it's required directly by electron.

const path = require('path');
const Module = require('module');

// Attempt to load electron API via require('electron')
let electronModule;
try {
  // Try direct require first (works on macOS/Linux and some Windows setups)
  electronModule = require('electron');
} catch(e) {
  electronModule = null;
}

// If require('electron') returned a string (Windows bug), try alternative methods
if (typeof electronModule === 'string') {
  console.warn('[electron-loader] require("electron") returned path string — applying workaround');

  // Try to access electron through the browser_init builtin
  try {
    // electron/js2c/browser_init provides the main process API
    electronModule = require('electron/js2c/browser_init');
  } catch(e) {
    console.error('[electron-loader] Failed to load browser_init:', e.message);
  }

  // If still not working, try the node_init bundled modules
  if (!electronModule || typeof electronModule !== 'object') {
    try {
      electronModule = require('electron/js2c/node_init');
    } catch(e) {
      console.error('[electron-loader] Failed to load node_init:', e.message);
    }
  }
}

// Export the electron module
if (electronModule && typeof electronModule === 'object') {
  module.exports = electronModule;
} else {
  throw new Error(
    'Failed to load Electron API module. This is a known issue on some Windows systems.\n' +
    'Please try building the packaged app with: npm run build && npm run package'
  );
}
