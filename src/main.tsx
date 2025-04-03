import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add skip to content link for accessibility
const skipToContent = document.createElement('a');
skipToContent.href = '#main-content';
skipToContent.className = 'skip-to-content';
skipToContent.textContent = 'Skip to content';
document.body.prepend(skipToContent);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
