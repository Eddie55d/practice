import {
  Form,
  FormGroup,
  FormControl,
  Button,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const { email, password } = formData;

    if (!email.trim()) {
      errors.email = "Пожалуйста, введите email";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Пожалуйста, введите корректный email";
    }

    if (!password) {
      errors.password = "Пожалуйста, введите пароль";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin(response.data.user, response.data.token);
      navigate("/my-travels");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Неверный email или пароль");
      } else if (err.message === "Failed to fetch") {
        setError(
          "Произошла ошибка при подключении к серверу. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова."
        );
      } else {
        setError(
          "Произошла непредвиденная ошибка при входе в систему. Попробуйте обновить страницу."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <Card.Body>
        <h2 className="text-center mb-4">Вход в систему</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {Object.entries(validationErrors).map(([fieldName, error]) => (
          <Form.Group key={fieldName} className="mb-3">
            <FormControl
              type={fieldName === "email" ? "email" : "password"}
              name={fieldName}
              placeholder={fieldName === "email" ? "Email" : "Пароль"}
              value={formData[fieldName]}
              onChange={handleChange}
              isInvalid={!!error}
            />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        ))}

        <Form onSubmit={handleLogin}>
          <FormGroup className="mb-3">
            <FormControl
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!validationErrors.email}
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <FormControl
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!validationErrors.password}
            />
          </FormGroup>

          <div className="d-grid mb-3">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </div>

          <p className="text-center text-muted mb-0">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary text-decoration-none">
              Зарегистрироваться
            </Link>
          </p>
        </Form>
      </Card.Body>
    </Card>
  );
}
