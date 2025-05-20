const express = require('express');
const pool = require('./DBconnect');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// Создание поста
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );
    const postId = result.rows[0].id;

    // Обработка тегов
    const tagQueries = tags.split(',').map(tag => {
      return pool.query(
        'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
        [tag.trim()]
      ).then(res => {
        if (res.rows.length > 0) {
          return pool.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
            [postId, res.rows[0].id]
          );
        }
      });
    });

    await Promise.all(tagQueries);
    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Server error');
  }
});

// Получение всех постов
router.get('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // Assuming you have user info in req.user

    const { rows } = await pool.query(`
      SELECT p.*, array_agg(t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_private = false OR p.user_id = $1
      GROUP BY p.id
    `, [userId]);

    res.send(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Server error');
  }
});

// Получение поста по ID
router.get('/:id', async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        u.username AS post_author,  -- Имя автора поста
        array_agg(DISTINCT t.name) as tags,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', c.id,
          'content', c.content,
          'user_id', c.user_id,
          'created_at', to_char(c.created_at, 'YYYY-MM-DD HH24:MI'),
          'username', cu.username  -- Имя автора комментария
        )) FILTER (WHERE c.id IS NOT NULL), '[]') as comments
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN users u ON p.user_id = u.id  -- Соединение с таблицей пользователей для получения имени автора поста
      LEFT JOIN users cu ON c.user_id = cu.id  -- Соединение с таблицей пользователей для получения имени автора комментария
      WHERE p.id = $1
      GROUP BY p.id, u.username  -- Добавлено u.username в GROUP BY
    `, [postId]);

    if (result.rows.length === 0) {
      return res.status(404).send('Post not found');
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Server error');
  }
});

// Добавление комментария к посту
router.post('/:id/comments', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  // Проверка на наличие пользователя
  if (!req.user) {
    return res.status(401).send('User  not authenticated');
  }

  // Проверка на существование поста
  try {
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).send('Post not found');
    }

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, req.user.id, content]
    );
    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Server error');
  }
});

// Обновление поста
router.put('/:id', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const { title, content, tags } = req.body;
  const userId = req.user.id;

  try {
    const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0 || postResult.rows[0].user_id !== userId) {
      return res.status(403).send('You do not have permission to edit this post');
    }

    await pool.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3',
      [title, content, postId]
    );

    // Обновление тегов
    await pool.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
    if (tags) {
      const tagQueries = tags.split(',').map(tag => {
        return pool.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
          [tag.trim()]
        ).then(res => {
          if (res.rows.length     > 0) {
            return pool.query(
                'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
                [postId, res.rows[0].id]
            );
          }
        });
      });

      await Promise.all(tagQueries);
    }
    res.send({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).send('Server error');
  }
});

// Удаление поста
router.delete('/:id', authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).send('Post not found');
    }
    if (postResult.rows[0].user_id !== userId) {
      return res.status(403).send('You do not have permission to delete this post');
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    res.send({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Server error');
  }
});

router.get('/posts/subscribed', authMiddleware, async (req, res) => {
  const subscriberId = parseInt(req.user.id, 10); // Убедитесь, что это целое число
  console.log('Subscriber ID:', subscriberId);

  if (!req.user || !Number.isInteger(subscriberId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Проверка наличия подписок
    const subscriptionCheck = await pool.query(`
      SELECT * FROM subscriptions WHERE subscriber_id = $1
    `, [subscriberId]);

    if (subscriptionCheck.rows.length === 0) {
      return res.status(404).json({ message: "No subscriptions found." });
    }

    // Запрос на получение постов
    const result = await pool.query(`
      SELECT p.id, p.title, p.content, array_agg(t.name) as tags
      FROM posts p
      JOIN subscriptions s ON p.user_id = s.subscribed_to_id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE s.subscriber_id = $1
      GROUP BY p.id
    `, [subscriberId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscribed posts:', error.message);
    res.status(500).json({ message: "Server error." });
  }
});


module.exports = router;