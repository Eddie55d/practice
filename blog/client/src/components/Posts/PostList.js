import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Alert, Modal } from 'react-bootstrap';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const [showModal, setShowModal] = useState(false);
  const [showSubscribedPosts, setShowSubscribedPosts] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (successMessage) {
      setShowModal(true);
    }
  }, [successMessage]);

  const handleClose = () => setShowModal(false);

  const fetchPosts = async (url) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      if (error.response) {
        setError(`Ошибка: ${error.response.status} - ${error.response.data.message || 'Неизвестная ошибка'}`);
      } else if (error.request) {
        setError('Ошибка: Сервер не ответил. Пожалуйста, проверьте соединение.');
      } else {
        setError(`Ошибка: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts('http://localhost:5000/posts');
  }, []);

  const handleTogglePosts = () => {
    if (showSubscribedPosts) {
      fetchPosts('http://localhost:5000/posts');
    } else {
      fetchPosts('http://localhost:5000/api/subscribe/posts');
    }
    setShowSubscribedPosts(!showSubscribedPosts);
  };

  return (
    <div>
      <h2>Posts</h2>
      <Button variant="outline-dark" onClick={handleTogglePosts}>
        {showSubscribedPosts ? 'Показать все посты' : 'Показать посты подписанных пользователей'}
      </Button>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <Alert variant="info">Загрузка постов...</Alert>
      ) : (
        posts.length === 0 ? (
          <Alert variant="info">Посты отсутствуют. Добавьте новые посты!</Alert>
        ) : (
          posts.map(post => (
            <Card key={post.id} bg="secondary-subtle" style={{ margin: '10px 0', color: 'black' }}>
              <Card.Body>
                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.content}</Card.Text>
                <Card.Text>
                  <strong>Tags:</strong> {Array.isArray(post.tags) && post.tags.length > 0 ? post.tags.join(', ') : 'Нет тегов'}
                </Card.Text>
                <Button variant="outline-dark" href={`/posts/${post.id}`}>
                  View Post
                </Button>
              </Card.Body>
            </Card>
          ))
        )
      )}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>{successMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostList;