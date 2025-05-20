import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      // Выводим ответ в консоль для проверки
      console.log('Login response:', response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Сохраняем данные пользователя
      localStorage.setItem('userId', JSON.stringify(response.data.user.id));
      setSuccess('Login successful!');
      setError('');
      onLogin(response.data.user); // Передаем пользователя в родительский компонент
      navigate('/'); // Перенаправляем на стартовую страницу
    } catch (err) {
      console.error(' Login error:', err);
      setError(
        err.response && err.response.data && err.response.data.errors
          ? err.response.data.errors[0].msg
          : ' Login failed'
      );
      setSuccess('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} style={{ backgroundColor: '#e2e3e5', padding: '20px' }}>
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Form.Group>
      <Form.Group controlId="formPassword" >
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Form.Group>
      <Button variant="outline-dark" className="mt-3 mx-auto" type="submit">Login</Button>
    </Form>
  );
};

export default Login;