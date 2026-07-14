@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

/* Base custom styles */
body {
  font-family: var(--font-sans);
  background-color: #FDFBF7; /* Natural Tones body bg */
  color: #333333; /* Natural Tones text color */
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Pulse keyframes for simulated collaborative activity */
@keyframes markerPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.collab-marker-pulse {
  animation: markerPulse 2s infinite ease-in-out;
}

/* PRINT / PDF GENERATION STYLES */
@media print {
  /* Hide UI elements */
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Hide navigation, sidebars, controls */
  .no-print,
  nav,
  button,
  input,
  textarea,
  select,
  aside,
  .print-hidden {
    display: none !important;
  }

  /* Force slide layout to fill page */
  .print-page-container {
    display: block !important;
    width: 100% !important;
    height: auto !important;
  }

  .slide-print-card {
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    width: 297mm !important; /* Landscape A4 width */
    height: 210mm !important; /* Landscape A4 height */
    padding: 24mm !important;
    box-sizing: border-box !important;
    page-break-after: always !important;
    break-after: page !important;
    background-color: var(--print-bg, #fcfbf7) !important;
    color: var(--print-text, #1c1917) !important;
    border: none !important;
    box-shadow: none !important;
    overflow: hidden !important;
    position: relative !important;
  }

  /* Ensure colors and background colors are printed correctly */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
