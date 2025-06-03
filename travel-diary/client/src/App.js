import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Navigation from './components/Menu';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/AllTravelList';
import CreateTravel from './components/CreateTravel';
import AddPlaces from './components/AddPlaces';
import MyTravelsList from './components/MyTravelsList';


function App() {
  const [user, setUser] = useState(() => {
    // Инициализация из localStorage при первом рендере
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navigation user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/create-travel" element={<CreateTravel user={user} />} />
        <Route path="/travels/:id/add-places" element={<AddPlaces />} />
        <Route path="/my-travels" element={<MyTravelsList  user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;