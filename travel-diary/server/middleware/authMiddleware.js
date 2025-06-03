const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Извлекаем токен из заголовка

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Используем переменную окружения для секретного ключа
    req.user = decoded; // Устанавливаем пользователя в req.user
    console.log('Decoded token:', decoded);
    console.log('Request headers:', req.headers);
    next();
  } catch (ex) {
    console.error('Token verification failed:', ex);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;