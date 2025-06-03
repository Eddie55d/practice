import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Дневник путешествий</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Все путешествия</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/my-travels">Мои путешествия</Nav.Link>
                <Nav.Link as={Link} to="/create-travel">Добавить</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-2">
                  Привет, {user.username}!
                </Navbar.Text>
                <Nav.Link onClick={handleLogout}>Выйти</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Войти</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;