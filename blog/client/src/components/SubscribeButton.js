import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Spinner } from 'react-bootstrap';

const SubscribeButton = ({ userId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkSubscription = async () => {
    try {
    const res = await axios.get(`http://localhost:5000/api/subscribe/check/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Subscription check response:', res.data);
    setIsSubscribed(res.data.isSubscribed);
    } catch (err) {
    console.error('Failed to check subscription', err);
    setError('Failed to check subscription. Please try again later.');
    } finally {
    setLoading(false);
    }
    };
    
    if (token) {
    checkSubscription();
    } else {
    setLoading(false);
    setError('You must be logged in to subscribe.');
    }
   }, [userId, token]);

  const handleSubscribe = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/subscribe/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200 || response.status === 201) {
        console.log('Subscription success:', response.data); // Добавим логирование
        setIsSubscribed(true);
        setMessage('Subscribed successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Failed to subscribe. Please try again later.');
      }
    } catch (error) {
      console.error('Subscription error:', error); // Добавим логирование
      setError(error.response?.data?.message || 'Failed to subscribe. Please try again later.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
    const response = await axios.delete(`http://localhost:5000/api/unsubscribe/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 200 || response.status === 201) {
    setIsSubscribed(false);
    setMessage('Unsubscribed successfully!');
    setTimeout(() => setMessage(''), 3000);
    } else {
    setError('Failed to unsubscribe. Please try again later.');
    }
    } catch (error) {
    setError(error.response?.data?.message || 'Failed to unsubscribe. Please try again later.');
    }
   };

  if (loading) return <Button disabled><Spinner animation="border" size="sm" /> Loading...</Button>;

  return (
   <div>
   {message && (
   <Alert variant="success" onClose={() => setMessage('')} dismissible>
   {message}
   </Alert>
   )}
   {error && (
   <Alert variant="danger" onClose={() => setError('')} dismissible>
   {error}
   </Alert>
   )}
   {loading ? (
   <Button disabled>
   <Spinner animation="border" size="sm" /> Loading...
   </Button>
   ) : isSubscribed ? (
   <Button variant="danger" onClick={handleUnsubscribe}>
   Unsubscribe
   </Button>
   ) : (
   <Button variant="primary" onClick={handleSubscribe}>
   Subscribe
   </Button>
   )}
   </div>
  );
};

export default SubscribeButton;