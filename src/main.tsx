import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from '@/store/AppStore';
import { syncMotionAttribute } from '@/lib/motion';
import '@/styles/index.css';

/* Gate pre-animation styles before first paint. */
syncMotionAttribute(false);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
