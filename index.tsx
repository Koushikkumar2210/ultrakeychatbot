
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * ULTRAKEY AI EMBED ENGINE
 * This script handles the self-mounting logic for external website integration.
 */

const MOUNT_ID = 'ultrakey-messenger-root';

function initUltraKey() {
  let rootElement = document.getElementById(MOUNT_ID);

  // If the target website didn't provide a div, we create one automatically
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = MOUNT_ID;
    document.body.appendChild(rootElement);
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Ensure the DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUltraKey);
} else {
  initUltraKey();
}
