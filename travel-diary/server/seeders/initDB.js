const pool = require("../DB");

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Создаем таблицы, если они еще не существуют
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS travels (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                location GEOGRAPHY(POINT, 4326),
                cost DECIMAL(10, 2),
                user_id INTEGER REFERENCES users(id)
            );
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS places_to_visit (
                id SERIAL PRIMARY KEY,
                travel_id INTEGER REFERENCES travels(id),
                name VARCHAR(100) NOT NULL,
                description TEXT,
                is_visited BOOLEAN DEFAULT FALSE,
                location GEOGRAPHY(POINT, 4326)
            );
        `);

    // Добавляем пользователей
    await client.query(`
            INSERT INTO users (username, email, password) 
            VALUES 
                ('ivanov', 'ivanov@example.com', 'password123'),
                ('petrova', 'petrova@example.com', 'qwerty456')
            ON CONFLICT DO NOTHING;
        `);

    // Получаем ID пользователей
    const users = await client.query("SELECT id, username FROM users");
    const userIds = users.rows.reduce((acc, user) => {
      acc[user.username] = user.id;
      return acc;
    }, {});

    // Добавляем путешествия
    const travelsQueries = [
      {
        title: "Отдых в Сочи",
        description: "Черноморское побережье",
        location: "ST_SetSRID(ST_MakePoint(39.7233, 43.5855), 4326)",
        cost: 25000,
        user_id: userIds.ivanov,
      },
      {
        title: "Казань",
        description: "Путешествие по столице Татарстана",
        location: "ST_SetSRID(ST_MakePoint(49.1088, 55.7964), 4326)",
        cost: 18000,
        user_id: userIds.petrova,
      },
      {
        title: "Золотое кольцо",
        description: "Тур по древним городам",
        location: "ST_SetSRID(ST_MakePoint(40.5166, 56.1290), 4326)",
        cost: 35000,
        user_id: userIds.ivanov,
      },
    ];

    const travelIds = {};
    for (const travel of travelsQueries) {
      const result = await client.query(`
                INSERT INTO travels (title, description, location, cost, user_id) 
                VALUES (
                    '${travel.title}',
                    '${travel.description}',
                    ${travel.location},
                    ${travel.cost},
                    ${travel.user_id}
                )
                RETURNING id;
            `);
      travelIds[travel.title] = result.rows[0].id;
    }

    // Добавляем места для посещения
    // Продолжение предыдущего кода

    const placesQueries = [
      {
        travel_id: travelIds["Отдых в Сочи"],
        places: [
          {
            name: "Сочи Парк",
            description: "Тематический парк развлечений",
            is_visited: true,
            location: "ST_SetSRID(ST_MakePoint(39.7300, 43.5855), 4326)",
          },
          {
            name: "Роза Хутор",
            description: "Горнолыжный курорт",
            is_visited: false,
            location: "ST_SetSRID(ST_MakePoint(40.2949, 43.6725), 4326)",
          },
          {
            name: "Дендрарий",
            description: "Парк с экзотическими растениями",
            is_visited: false,
            location: "ST_SetSRID(ST_MakePoint(39.7464, 43.5622), 4326)",
          },
        ],
      },
      {
        travel_id: travelIds["Казань"],
        places: [
          {
            name: "Казанский Кремль",
            description: "Историческая крепость",
            is_visited: true,
            location: "ST_SetSRID(ST_MakePoint(49.1055, 55.7989), 4326)",
          },
          {
            name: "Мечеть Кул-Шариф",
            description: "Главная мечеть Татарстана",
            is_visited: true,
            location: "ST_SetSRID(ST_MakePoint(49.1050, 55.7989), 4326)",
          },
          {
            name: "Башня Сююмбике",
            description: "Падающая башня",
            is_visited: false,
            location: "ST_SetSRID(ST_MakePoint(49.1067, 55.7999), 4326)",
          },
        ],
      },
      {
        travel_id: travelIds["Золотое кольцо"],
        places: [
          {
            name: "Суздаль",
            description: "Город-музей под открытым небом",
            is_visited: false,
            location: "ST_SetSRID(ST_MakePoint(40.4439, 56.4277), 4326)",
          },
          {
            name: "Владимир",
            description: "Золотые ворота",
            is_visited: false,
            location: "ST_SetSRID(ST_MakePoint(40.4066, 56.1290), 4326)",
          },
          {
            name: "Сергиев Посад",
            description: "Троице-Сергиева лавра",
            is_visited: true,
            location: "ST_SetSRID(ST_MakePoint(38.1333, 56.3000), 4326)",
          },
        ],
      },
    ];

    // Добавляем места для посещения
    for (const { travel_id, places } of placesQueries) {
      for (const place of places) {
        await client.query(`
        INSERT INTO places_to_visit (travel_id, name, description, is_visited, location) 
        VALUES (
          ${travel_id},
          '${place.name}',
          '${place.description}',
          ${place.is_visited},
          ${place.location}
        );
      `);
      }
    }

    await client.query("COMMIT");
    console.log("Database initialized with test data");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error initializing database:", error);
  } finally {
    client.release();
  }
}

module.exports = initializeDatabase;
