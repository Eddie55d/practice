const pool = require('./DBconnect');

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица подписок
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        subscriber_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscribed_to_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(subscriber_id, subscribed_to_id) -- Уникальность подписки
      )
    `);

    // Таблица постов
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[], -- Добавляем массив тегов
        is_private BOOLEAN DEFAULT FALSE, -- Флаг для скрытых постов
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица тегов
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `);

    // Таблица связей постов и тегов
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);

    // Таблица комментариев
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    

    await client.query('COMMIT');
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables or inserting data:', error);
  } finally {
    client.release();
  }
}

module.exports = createTables;


// -- Вставка пользователей
// INSERT INTO users (username, password, email, role) VALUES
// ('testuser1', 'password1', 'test1@example.com', 'user'),
// ('testuser2', 'password2', 'test2@example.com', 'user'),
// ('testuser3', 'password3', 'test3@example.com', 'user')
// ON CONFLICT (email) DO NOTHING;

// -- Вставка тегов
// INSERT INTO tags (name) VALUES                                      
// ('tag1'), 
// ('tag2'), 
// ('tag3'), 
// ('tag4');

// -- Вставка постов
// INSERT INTO posts (user_id, title, content, is_private) VALUES 
// (1, 'First Post', 'This is the content of the first post.', FALSE),                                                     
// (1, 'Second Post', 'This is the content of the second post.', FALSE),                                                              
// (2, 'Third Post', 'This is the content of the third post.', FALSE),
// (3, 'Fourth Post', 'This is the content of the fourth post.', TRUE);

// -- Вставка связей между постами и тегами
// INSERT INTO post_tags (post_id, tag_id) VALUES
// (1, (SELECT id FROM tags WHERE name = 'tag1')),
// (1, (SELECT id FROM tags WHERE name = 'tag2')),
// (2, (SELECT id FROM tags WHERE name = 'tag2')),
// (2, (SELECT id FROM tags WHERE name = 'tag3')),
// (3, (SELECT id FROM tags WHERE name = 'tag1')),
// (4, (SELECT id FROM tags WHERE name = 'tag3')),
// (4, (SELECT id FROM tags WHERE name = 'tag4'));
