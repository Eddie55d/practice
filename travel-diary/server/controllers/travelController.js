const pool = require("../DB");

// Функция для проверки существования таблицы
async function tableExists(tableName) {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (err) {
    console.error("Ошибка при проверке таблицы:", err.message);
    return false;
  }
}

exports.getAllTravels = async (req, res) => {
  try {
    const travelsTableExists = await tableExists("travels");
    const placesTableExists = await tableExists("places_to_visit");

    if (!travelsTableExists) {
      return res.status(400).json({ error: "Таблица travels не существует" });
    }

    let query = `
      SELECT 
        t.id, t.title, t.description, t.cost,
        ST_X(t.location::geometry) AS lng,
        ST_Y(t.location::geometry) AS lat,
        u.username
      FROM travels t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `;

    if (placesTableExists) {
      query = `
        SELECT 
          t.id, t.title, t.description, t.cost,
          ST_X(t.location::geometry) AS lng,
          ST_Y(t.location::geometry) AS lat,
          u.username,
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description,
              'is_visited', p.is_visited,
              'lat', ST_Y(p.location::geometry),
              'lng', ST_X(p.location::geometry)
            )
          ) FILTER (WHERE p.id IS NOT NULL) AS places_to_visit
        FROM travels t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN places_to_visit p ON t.id = p.travel_id
        GROUP BY t.id, u.username
        ORDER BY t.created_at DESC
      `;
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTravels = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Executing query for user ID:", userId);

    const query = `
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.cost,
        ST_X(t.location::geometry) AS lng,
        ST_Y(t.location::geometry) AS lat,
        u.username,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'is_visited', p.is_visited,
                'lat', ST_Y(p.location::geometry),
                'lng', ST_X(p.location::geometry)
              )
            )
            FROM places_to_visit p
            WHERE p.travel_id = t.id
          ),
          '[]'::json
        ) AS places_to_visit
      FROM travels t
      JOIN users u ON t.user_id = u.id
      WHERE u.id = $1
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    console.log("Query successful, rows returned:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", {
      message: err.message,
      stack: err.stack,
      query: err.query,
      parameters: err.parameters,
    });

    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              query: err.query,
            }
          : undefined,
    });
  }
};

exports.getTravelById = async (req, res) => {
  try {
    const travelsTableExists = await tableExists("travels");

    if (!travelsTableExists) {
      return res.status(400).json({ error: "Таблица travels не существует" });
    }

    const result = await pool.query(
      `SELECT 
        t.*,
        ST_X(t.location::geometry) AS lng,
        ST_Y(t.location::geometry) AS lat,
        u.username
      FROM travels t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Сохранение мест
exports.savePlaces = async (req, res) => {
  try {
    const { id } = req.params;
    const places = req.body;

    // Валидация данных
    if (!Array.isArray(places)) {
      return res.status(400).json({ error: "Ожидался массив мест" });
    }

    const validPlaces = places.filter((place) => {
      return (
        place.name &&
        place.location &&
        typeof place.location.lng === "number" &&
        typeof place.location.lat === "number" &&
        typeof place.is_visited === "boolean" 
      );
    });

    if (validPlaces.length !== places.length) {
      return res.status(400).json({ error: "Неверный формат данных места" });
    }

    // Начало транзакции
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Удаление существующих мест
      await client.query(
        "DELETE FROM places_to_visit WHERE travel_id = $1",
        [id]
      );

      // Вставка новых мест
      for (const place of validPlaces) {
        await client.query(
          `INSERT INTO places_to_visit 
          (travel_id, name, description, location, is_visited) 
          VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)`,
          [
            id,
            place.name,
            place.description || "",
            place.location.lng,
            place.location.lat,
            place.is_visited
          ]
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Места успешно сохранены" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error saving places:", err);
    res.status(500).json({
      error: "Ошибка сохранения мест",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// Создание нового путешествия
exports.createTravel = async (req, res) => {
  try {
    const { title, description, cost, location, user_id } = req.body;
    
    const result = await pool.query('INSERT INTO travels (title, description, cost, location, user_id) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6) RETURNING *', 
      [title, description, cost, location.lng, location.lat, user_id]);
    
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error('Ошибка создания путешествия');
    }
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка создания путешествия:', err);
    res.status(500).json({ error: 'Ошибка создания путешествия' });
  }
 };
 
