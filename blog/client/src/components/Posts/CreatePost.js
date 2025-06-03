import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/posts', { title, content, tags, is_private: isPrivate }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Post created successfully!');
      setError('');
      setTitle('');
      setContent('');
      setTags('');
      setIsPrivate(false);
    } catch (err) {
      setError('Failed to create post');
      setSuccess('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} style={{ backgroundColor: '#e2e3e5', padding: '20px' }}>
      <h2>Create Post</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group controlId="formTitle" className="mb-3">
        <Form.Label style={{ color: 'black' }}>Title</Form.Label>
        <Form.Control 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          bg="secondary-subtle" 
          style={{ color: 'black' }}
        />
      </Form.Group>
      <Form.Group controlId="formContent" className="mb-3">
        <Form.Label style={{ color: 'black' }}>Content</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          bg="secondary-subtle" 
          style={{ color: 'black' }}
        />
      </Form.Group>
      <Form.Group controlId="formTags" className="mb-3">
        <Form.Label style={{ color: 'black' }}>Tags (comma separated)</Form.Label>
        <Form.Control 
          type="text" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          bg="secondary-subtle" 
          style={{ color: 'black' }}
        />
      </Form.Group>
      <Form.Group controlId="formIsPrivate" className="mb-4 mt-4">
        <Form.Check 
          type="checkbox" 
          label="Make this post private" 
          checked={isPrivate} 
          onChange={(e) => setIsPrivate(e.target.checked)} 
        />
      </Form.Group>
      <div className="text-center">
        <Button variant="outline-dark" type="submit">Create Post</Button>
      </div>
    </Form>
  );
};

export default CreatePost;