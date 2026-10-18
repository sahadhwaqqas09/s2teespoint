import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initInspectProtection } from './lib/protectInspect';

initInspectProtection();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
