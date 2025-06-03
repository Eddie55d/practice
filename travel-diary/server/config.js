require('dotenv').config();

module.exports = {
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432
  },
  server: {
    port: process.env.PORT || 5000,
    sessionSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    env: process.env.NODE_ENV || 'development'
  }
};