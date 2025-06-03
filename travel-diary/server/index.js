require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const travelRoutes = require('./routes/travelRoutes');
const config = require('./config');
const initializeDatabase = require('./seeders/initDB');

console.log('Starting application...');

try {
  // Добавляем логирование загрузки модулей
  console.log('Loading modules...');
  const app = express();
  
  console.log('Setting up middleware...');
  app.use(cors({
    origin: ['http://localhost:3000', 'https://api-maps.yandex.ru'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  app.use(express.json());
  app.use(session({ 
    secret: config.server.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));
  
  app.use('/api/auth', authRoutes);
  app.use('/api/travels', travelRoutes);
  
  app.use((err, req, res, next) => {
    console.error('Error handler:', err.stack);
    res.status(500).send('Something broke!');
  });
  
  // Функция запуска сервера с инициализацией БД
  async function startServer() {
    try {
      console.log('Initializing database...');
      await initializeDatabase();
      
      console.log('Starting server...');
      const server = app.listen(config.server.port, () => {
        console.log(`Server running on port ${config.server.port}`);
        console.log(`Database host: ${process.env.DB_HOST}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
      
      process.on('SIGINT', () => {
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    } catch (error) {
      console.error('Error starting server:', error.stack);
      process.exit(1);
    }
  }
  
  startServer();
} catch (error) {
  console.error('Critical error during initialization:', error.stack);
  process.exit(1);
}

