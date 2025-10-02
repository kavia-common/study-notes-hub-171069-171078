import React from 'react';
import './App.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Upload from './pages/Upload.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

// PUBLIC_INTERFACE
function App() {
  /**
   * App sets up ThemeProvider and application routes.
   * The AuthProvider is applied in src/index.js to ensure authentication
   * state is available across the entire app.
   */
  return (
    <ThemeProvider initial="light">
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
