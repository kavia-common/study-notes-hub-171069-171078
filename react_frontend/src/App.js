import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';

function AppInner() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App is wrapped with ThemeProvider to enable global theming */
  return (
    <ThemeProvider initial="light">
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
