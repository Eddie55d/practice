const pool = require('./DBconnect');

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Проверка и вставка пользователей
    const users = await client.query(`
      SELECT * FROM users WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
    `);
    if (users.rows.length === 0) {
      await client.query(`
        INSERT INTO users (username, password, email, role) VALUES
        ('testuser1', 'password1', 'test1@example.com', 'user'),
        ('testuser2', 'password2', 'test2@example.com', 'user'),
        ('testuser3', 'password3', 'test3@example.com', 'user')
      `);
    }

    // Проверка и вставка тегов
    const tags = await client.query(`
      SELECT * FROM tags WHERE name IN ('tag1', 'tag2', 'tag3', 'tag4')
    `);
    if (tags.rows.length === 0) {
      await client.query(`
        INSERT INTO tags (name) VALUES
        ('tag1'),
        ('tag2'),
        ('tag3'),
        ('tag4')
      `);
    }

    // Проверка и вставка постов
    const posts = await client.query(`
      SELECT * FROM posts WHERE title IN ('First Post', 'Second Post', 'Third Post', 'Fourth Post')
    `);
    if (posts.rows.length === 0) {
      await client.query(`
        INSERT INTO posts (user_id, title, content, is_private) VALUES 
        (1, 'First Post', 'This is the content of the first post.', FALSE),
        (1, 'Second Post', 'This is the content of the second post.', FALSE),
        (2, 'Third Post', 'This is the content of the third post.', FALSE),
        (3, 'Fourth Post', 'This is the content of the fourth post.', TRUE)
      `);
    }

    // Вставка связей между постами и тегами
    const postTags = await client.query(`
      SELECT * FROM post_tags WHERE post_id IN (1, 2, 3, 4)
    `);
    if (postTags.rows.length === 0) {
      await client.query(`
        INSERT INTO post_tags (post_id, tag_id) VALUES
        (1, (SELECT id FROM tags WHERE name = 'tag1')),
        (1, (SELECT id FROM tags WHERE name = 'tag2')),
        (2, (SELECT id FROM tags WHERE name = 'tag2')),
        (2, (SELECT id FROM tags WHERE name = 'tag3')),
        (3, (SELECT id FROM tags WHERE name = 'tag1')),
        (4, (SELECT id FROM tags WHERE name = 'tag3')),
        (4, (SELECT id FROM tags WHERE name = 'tag4'));
      `);
    }

    await client.query('COMMIT');
    console.log('Database initialized with test data');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

module.exports = initializeDatabase;
