const { Pool } = require('pg');

const pool = new Pool({
  user: 'blogdb_user', // Имя пользователя
  host: 'localhost', // Хост
  database: 'blogdb', // Имя базы данных
  password: '123456', // Пароль
  port: 5432, // Порт
});

module.exports = pool;


// DB_USER=blogdb_user
// DB_HOST=localhost
// DB_NAME=blogdb
// DB_PASSWORD=123456
// DB_PORT=5432