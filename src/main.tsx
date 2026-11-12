import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { watchInstallPrompt } from './features/offline/installPrompt';
import { registerServiceWorker } from './features/offline/serviceWorker';
import { watchTheme } from './features/settings/theme';
import { loadSerifWebFontIfNeeded } from './lib/webFont';

watchTheme();
loadSerifWebFontIfNeeded();
registerServiceWorker();
watchInstallPrompt();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
