const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./DBconnect');
const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const createTables = require('./createTables'); // Импортируем функцию создания таблиц
const initializeDatabase = require('./initDB');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/api', subscriptionRoutes);

// Инициализация базы данных
initializeDatabase().then(() => {
  // Запуск сервера после инициализации базы данных
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});

// Создаем таблицы при запуске приложения
createTables()
  .then(() => console.log('Tables created successfully'))
  .catch(error => console.error('Error creating tables:', error));