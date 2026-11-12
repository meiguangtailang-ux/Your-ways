import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { APP_NAME } from './config/app';
import { loadSerifWebFontIfNeeded } from './lib/webFont';

document.title = APP_NAME;
loadSerifWebFontIfNeeded();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
