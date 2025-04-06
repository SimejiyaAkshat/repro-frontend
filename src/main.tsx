
import { createRoot } from 'react-dom/client'
import React from 'react' // Explicitly import React
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './hooks/useTheme'

// Make sure we have a DOM node to render to
const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
