import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Creates the root container and renders the App component into it.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);