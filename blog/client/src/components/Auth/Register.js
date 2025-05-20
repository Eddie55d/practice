import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/register', {
        username,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', JSON.stringify(response.data.user.id));
      console.log('Token:', localStorage.getItem('token'));
      console.log('User:', localStorage.getItem('user'));
      onLogin(response.data.user); // Обновляем состояние пользователя
      setSuccess('Registration successful!');
      setError('');
      navigate('/', { state: { successMessage: 'Registration successful!' } }); // Перенаправляем на домашнюю страницу
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response && err.response.data && err.response.data.errors
          ? err.response.data.errors[0].msg
          : 'Registration failed'
      );
      setSuccess('');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group controlId="formUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </Form.Group>
      <Form.Group controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" value={
        password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Button variant="primary" type="submit">Register</Button>
      </Form>
    );
  };
  
  export default Register;