const express = require('express');
const pool = require('./DBconnect');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// Подписаться на пользователя
router.post('/subscribe/:userId', authMiddleware, async (req, res) => {
  const subscriberId = req.user.id; // текущий пользователь
  const subscribedToId = parseInt(req.params.userId, 10);

  if (subscriberId === subscribedToId) {
    return res.status(400).json({ message: "You cannot subscribe to yourself." });
  }

  try {
    // Проверяем, что такой пользователь существует
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [subscribedToId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User to subscribe to not found." });
    }

    // Проверяем, что подписка не дублируется
    const exists = await pool.query(
      'SELECT * FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2',
      [subscriberId, subscribedToId]
    );

    if (exists.rows.length > 0) {
      return res.status(200).json({ message: "You are already subscribed to this user." });
    }

    // Добавляем подписку
    await pool.query(
      'INSERT INTO subscriptions (subscriber_id, subscribed_to_id) VALUES ($1, $2)',
      [subscriberId, subscribedToId]
    );

    res.status(201).json({ message: "Subscribed successfully." });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ message: "Server error." });
  }
});

// Отписаться от пользователя
router.delete('/unsubscribe/:userId', authMiddleware, async (req, res) => {
  const subscriberId = parseInt(req.user.id, 10);
  const subscribedToId = parseInt(req.params.userId, 10);

  try {
    const result = await pool.query(
      'DELETE FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2 RETURNING *',
      [subscriberId, subscribedToId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    res.json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ message: "Server error." });
  }
});


// Проверка подписки
router.get('/subscribe/check/:userId', authMiddleware, async (req, res) => {
  const subscriberId = parseInt(req.user.id, 10);
  const subscribedToId = parseInt(req.params.userId, 10);


  try {
    const result = await pool.query(
    'SELECT * FROM subscriptions WHERE subscriber_id = $1 AND subscribed_to_id = $2',
    [subscriberId, subscribedToId]
    );

    res.json({ isSubscribed: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ message: "Server error." });
  }
});

// Получить список пользователей, на которых подписан текущий пользователь
router.get('/subscriptions', authMiddleware, async (req, res) => {
  const subscriberId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email
      FROM subscriptions s
      JOIN users u ON s.subscribed_to_id = u.id
      WHERE s.subscriber_id = $1
    `, [subscriberId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: "Server error." });
  }
});

// Получить список постов пользователей, на которых подписан текущий пользователь
router.get('/subscribe/posts', authMiddleware, async (req, res) => {
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