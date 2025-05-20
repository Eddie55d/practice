import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">My Blog</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/create-post">Create Post</Nav.Link>
        </Nav>
        <Nav>
          {user ? (
            <>
              <Nav.Item className="nav-link" style={{ cursor: 'default', userSelect: 'none', fontWeight: 'bold' }}>
                {`Welcome, ${user.username}`}
              </Nav.Item>
              <Nav.Link onClick={onLogout}>Logout</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;