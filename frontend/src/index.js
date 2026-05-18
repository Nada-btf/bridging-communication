import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './styles/variables.css';
import App from './App';

// Restore dark mode before first render to prevent flash
if (localStorage.getItem('settings_darkMode') === 'true') {
  document.body.classList.add('dark-theme');
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);