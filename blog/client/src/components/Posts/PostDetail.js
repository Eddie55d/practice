import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Импорт иконок
import SubscribeButton from '../SubscribeButton';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState({ title: '', content: '', tags: [], user_id: null });
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/posts/${id}`);
        setPost(response.data);
        console.log(response.data)
        setUpdatedTitle(response.data.title);
        setUpdatedContent(response.data.content);
        setError('');
      } catch (err) {
        setError('Failed to fetch post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to add a comment.');
      setSuccess('');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/posts/${id}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Comment added successfully!');
      setError('');
      setComment('');

      // Обновляем пост, чтобы отобразить новый комментарий
      const updatedPostResponse = await axios.get(`http://localhost:5000/posts/${id}`);
      setPost(updatedPostResponse.data);
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      console.error('Failed to add comment:', message);
      setError(`Failed to add comment: ${message}`);
      setSuccess('');
    }
  };

  const handleEditPost = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/posts/${id}`, 
        { title: updatedTitle, content: updatedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Post updated successfully!');
      setShowModal(false);
      // Обновляем пост
      const updatedPostResponse = await axios.get(`http://localhost:5000/posts/${id}`);
      setPost(updatedPostResponse.data);
    } catch (err) {
      setError('Failed to update post.');
    }
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/posts/${id}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Post deleted successfully!');
     
        setTimeout(() => {
         navigate('/');
       }, 2000);
  
      } catch (err) {
        setError('Failed to delete post.');
      }
    }
  };



  if (loading) return (
    <div className="text-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );

  const currentUser_Id = parseInt(localStorage.getItem('userId'));

  return (
    <div>
      <Card className='variant="success"'>
        <Card.Body className=' variant="Secondary"'>
          <Card.Title>{post.title}</Card.Title>
          <Card.Text>{post.content}</Card.Text>
          <Card.Text>
            <strong>Tags:</strong> {post.tags.join(', ')}
          </Card.Text>
          <Card.Text>
            <strong>Author:</strong> {post.post_author}
          </Card.Text>
          {post.user_id !== currentUser_Id && (
            <SubscribeButton userId={post.user_id} token={localStorage.getItem('token')} />
            )}
            
            {post.user_id === currentUser_Id && (
              <div className=''>
                <FaEdit className='ms="auto d-block" ' onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }} />
                <FaTrash className='ms="auto d-block" ms="4"'  onClick={handleDeletePost} style={{ cursor: 'pointer' }} />
              </div>
            )}
        </Card.Body>
      </Card>

      {/* Модальное окно для редактирования поста */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPostTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPostContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditPost}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <h3>Comments</h3>
      {Array.isArray(post.comments) && post.comments.length > 0 ? (
        post.comments.map(comment => (
          <div key={comment.id} className="mb-3">
            <p>{comment.content}</p>
            <small>
              Added by: {comment.username} at {comment.created_at}
            </small>
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
      <Form onSubmit={handleCommentSubmit}>
        <Form.Group controlId="formComment">
          <Form.Label>Add a Comment</Form.Label>
          <Form.Control as="textarea" rows={3} value={comment} onChange={e => setComment(e.target.value)} required />
        </Form.Group>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        <Button variant="primary" type="submit" className="mt-3">Submit Comment</Button>
      </Form>
    </div>
  );
};

export default PostDetail;