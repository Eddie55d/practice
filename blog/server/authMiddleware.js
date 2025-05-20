// const jwt = require('jsonwebtoken');
// const JWT_SECRET = 'R@nd0mStr1ngs0m3v3ryL0ng'; // Замените на ваш секретный ключ

// const authMiddleware = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).send('Access denied.');

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).send('Invalid token.');
//     req.user = user;
//     next();
//   });
// };

// module.exports = authMiddleware;


//JWT_SECRET=R@nd0mStr1ngs0m3v3ryL0ng

const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Извлекаем токен из заголовка

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Используйте переменную окружения для секретного ключа
    req.user = decoded; // Устанавливаем пользователя в req.user
    next();
  } catch (ex) {
    console.error('Token verification failed:', ex);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;

