import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import CreatePost from './components/Posts/CreatePost';
import PostList from './components/Posts/PostList';
import PostDetail from './components/Posts/PostDetail';
import Navigation from './components/Navbar';

const App = () => {
  const [user, setUser ] = useState(null); // Состояние для хранения информации о пользователе

  useEffect(() => {
    const loggedInUser  = localStorage.getItem('user');
    if (loggedInUser ) {
      setUser (JSON.parse(loggedInUser )); // Устанавливаем пользователя из localStorage
    }
  }, []);

  const handleLogin = (userData) => {
    setUser (userData); // Устанавливаем пользователя после входа
    localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем пользователя в localStorage
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Удаляем токен из localStorage
    localStorage.removeItem('user'); // Удаляем данные пользователя
    setUser (null); // Сбрасываем пользователя при выходе
  };

  return (
    <Router>
      <Container>
        <Navigation user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/" element={<PostList onLogin={handleLogin} />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;