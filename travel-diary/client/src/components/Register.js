import {
  Form,
  FormGroup,
  FormControl,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку при изменении поля
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const { username, email, password } = formData;

    if (!username.trim()) {
      errors.username = "Пожалуйста, введите имя пользователя";
    } else if (username.length < 3) {
      errors.username = "Имя пользователя должно содержать минимум 3 символа";
    }

    if (!email.trim()) {
      errors.email = "Пожалуйста, введите email";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Пожалуйста, введите корректный email";
    }

    if (!password) {
      errors.password = "Пожалуйста, введите пароль";
    } else if (password.length < 6) {
      errors.password = "Пароль должен содержать минимум 6 символов";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка регистрации");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Произошла ошибка при подключении к серверу. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова."
        );
      } else {
        setError(
          "Произошла непредвиденная ошибка при регистрации. Попробуйте обновить страницу."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="text-center mb-4">Регистрация</h2>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {Object.entries(validationErrors).map(([fieldName, error]) => (
        <FormGroup key={fieldName} className="mb-3">
          <FormControl
            type={fieldName === "password" ? "password" : "text"}
            name={fieldName}
            placeholder={
              fieldName === "username"
                ? "Имя пользователя"
                : fieldName === "email"
                ? "Email"
                : "Пароль"
            }
            value={formData[fieldName]}
            onChange={handleChange}
            isInvalid={!!error}
          />
          {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </FormGroup>
      ))}

      <Form onSubmit={handleRegister}>
        <FormGroup className="mb-3">
          <FormControl
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            isInvalid={!!validationErrors.username}
          />
        </FormGroup>

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
                Регистрация...
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </Button>
        </div>

        <p className="text-center text-muted">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary text-decoration-none">
            Войти
          </Link>
        </p>
      </Form>
    </div>
  );
}
