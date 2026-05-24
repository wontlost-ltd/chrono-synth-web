import { initSentry } from './lib/sentry';
initSentry();

import { reportWebVitals } from './lib/web-vitals';
reportWebVitals();

import { initAnalytics } from './lib/analytics';
initAnalytics();

import { bootstrapTheme } from './lib/theme';
bootstrapTheme();

import { bootstrapFeatureFlagsRemote } from './lib/featureFlagsRemote';
bootstrapFeatureFlagsRemote();

import './i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';
import './styles/themes.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
