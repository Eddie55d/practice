# Кейс-задача: Разработка Web-версии книжного магазина
  
Кейс-задача № 5  
Создать приложение “Дневник путешествий”  

- Необходимо создать web-сайт, используя любой стек технологий Web-разработки  
- Создать пользователя системы  
- Создать для пользователя функцию записи своего путешествия  
- Создать функцию просмотра путешествий других пользователей  
- Добавить 3 из перечисленных функций о путешествии:  
  - Местоположение (с привязной к геопозиции)  
  - Изображение мест  
  - Стоимость путешествия  
  - Места культурного наследия  
  - Места для посещения  
  - Оценка удобства передвижения / безопасности / населенности / растительности  
- Опишите подробный анализ по выполненной задаче (не менее 7 пунктов)  
- Опишите рекомендации по устранению выявленных ошибок в ходе выполнения задачи  
Ответом на задание будет ссылка на репозиторий GitHub, где хранится Ваша программа.  

---

## **Структура проекта**

```text
├── client  
│   ├── public  
│   │   ├── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── AddPlaces.js
│   │   │   ├── AllTravelList.js
│   │   │   ├── CreateTravel.js
│   │   │   ├── Login.js
│   │   │   ├── Menu.js
│   │   │   ├── MyTravelsList.js
│   │   │   ├── Register.js
│   │   │   ├── TravelCard.js
│   │   │   └── TravelDetails.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── index.js
│   ├── package.json
├── server
│   ├── controllers
│   │   └── travelController.js
│   ├── middleware
│   │   └── authMiddleware.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   └── travelRoutes.js
│   ├── seeders
│   │   └── initDB.js
│   ├── config.js
│   ├── DB.js
│   ├── index.js
│   ├── package.json
│   └── .env
└── report.md


```

---

## Анализ проекта "Дневник путешествий"

1. **Стек технологий**:
   - Фронтенд: React.js, React-Bootstrap для UI
   - Бэкенд: Node.js (Express), PostgreSQL для хранения данных
   - Карты: Yandex Maps API
   - Аутентификация: JWT-токены

2. **Реализация пользователей**:
   - Система регистрации/авторизации через JWT
   - Хранение пользователей в PostgreSQL
   - Защищенные маршруты на бэкенде
   - Контекст авторизации на фронтенде

3. **Функционал путешествий**:
   - Создание записей
   - Привязка к геопозиции через Yandex Maps
   - Добавление мест для посещения с координатами
   - Указание стоимости путешествия

4. **Просмотр чужих путешествий**:
   - Общий каталог всех записей

5. **Особенности реализации**:
   - Формы с валидацией
   - Toast-уведомления
   - Адаптивный дизайн

6. **Недостатки/проблемы**:
   - Нет сортировки путешествий
   - Отсутствует пагинация в списках

7. **Возможности улучшения**:
   - Добавление фотографий к местам
   - Комментарии к путешествиям
   - Рейтинги/лайки
   - Экспорт в PDF

## Схема API для "Дневника путешествий"

### 1. **Маршруты аутентификации** (не требуют авторизации)

```text
GET    /login          - Страница входа
POST   /api/auth/login - Авторизация (возвращает JWT токен)

GET    /register       - Страница регистрации
POST   /api/auth/register - Создание нового пользователя
```

### 2. **Маршруты путешествий**

#### Требуют авторизации (`authMiddleware`)

```text
GET    /api/travels/my-travels - Получить путешествия текущего пользователя
POST   /api/travels            - Создать новое путешествие
POST   /api/travels/:id/places - Сохранить места для путешествия
```

#### Доступны без авторизации

```text
GET    /api/travels          - Получить все путешествия (публичные)
GET    /api/travels/:id      - Получить детали путешествия по ID
```

### 3. **Фронтенд-маршруты** (React Router)

```text
/               - Главная страница (список путешествий)
/login          - Страница входа
/register       - Страница регистрации
/my-travels     - Личные путешествия (protected)
/travels/:id    - Детали путешествия
/add-travel     - Создание путешествия (protected)
```

## Фронтенд (React)

### Страницы

- `/` - главная страница
- `/login` - страница входа
- `/register` - страница регистрации
- `/travels` - список путешествий
- `/travels/:id` - детали путешествия
- `/add-travel` - создание путешествия

### Интеграция с картами

- Используется Yandex Maps API через компоненты `<YMaps>`, `<Map>`, `<Placemark>`

### Особенности маршрутизации

1. В бэкенде используется Express Router для организации маршрутов
2. На фронтенде - React Router
3. Все API-маршруты префиксированы `/api`
4. Защищенные маршруты проверяют JWT-токен
5. Для работы с местами используется вложенная маршрутизация (`/travels/:id/places`)

Маршрутная структура проекта следует RESTful-принципам с четким разделением на ресурсы (пользователи, путешествия, места).

## Дополнительные функции

1. **Геопозиция** (react-yandex-map):  

   - Сохранение координат в БД (`latitude`, `longitude`).  
   - Отображение на карте в интерфейсе.

2. **Стоимость**:  
   - Поле `cost` в таблице `travels`.  

---

## Руководство по развертыванию Travel Diary

### Требования

- **Операционная система**: Linux/macOS

- **Node.js**: версия >= 16.x
- **PostgreSQL**: версия >= 13.x

## Установка PostgreSQL и конфигурации базы данных

### **Установка PostgreSQL**

[Установить по инструкции с официального сайта](https://www.postgresql.org/download/linux/ubuntu/)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

### **Создание роли и базы данных**

- Войдите в PostgreSQL как суперпользователь:

```bash
sudo -u postgres psql
```

- Создайте роль приложения:

```sql
CREATE ROLE admin_travel WITH
  NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT LOGIN NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10;
ALTER ROLE admin_travel WITH PASSWORD 'admin';
```

- Создайте базу данных:

```sql
CREATE DATABASE travel_diary WITH OWNER admin_travel;
```

### **Установка PostGIS**

- Установите PostGIS:

```bash
sudo apt-get install postgis
```

- Активируйте расширение в базе данных:

```sql
\c travel_diary
CREATE EXTENSION postgis;
```

### Настройка проекта

#### 1. **Клонирование репозитория**

```bash
git clone <ссылка_на_репозиторий>
cd travel-diary
```

#### 2. **Настройка окружения**

- Создайте файл `.env` в корне проекта

- Добавьте следующие параметры:

```ini
# Параметры PostgreSQL
DB_USER=admin_travel
DB_PASSWORD=admin
DB_NAME=travel_diary
DB_HOST=localhost  # или IP-адрес сервера БД

# Настройки сервера
PORT=5000
JWT_SECRET=sec_key  # Для аутентификации 
```

#### 3. **Установка зависимостей**

- В директории `client`:

```bash
cd client
npm install
```

- В директории `server`:

```bash
cd server
npm install
```

### Запуск приложения

#### 1. **Запуск сервера**

```bash
cd server
node index.js
```

#### 2. **Запуск клиента**

```bash
cd client
npm start
```

### Примечания

- При первом запуске бэкенда будут загружены начальные тестовые данные

- Убедитесь, что PostgreSQL сервер запущен: `sudo systemctl start postgresql`
- Для остановки приложения используйте `Ctrl+C` в соответствующих консолях

### Проверка работоспособности

- Фронтенд доступен по адресу: <http://localhost:3000>

- Бэкенд доступен по адресу: <http://localhost:5000> (или другой порт, указанный в конфигурации)

### Возможные проблемы

- Если возникают проблемы с подключением к БД, проверьте:
  - Статус PostgreSQL сервера
  - Правильность настроек в `.env`
  - Права доступа пользователя к базе данных

---

## Проверка соответствия требованиям кейса (Требование => Реализация)

**Местоположение** => Поле location (PostGIS)  
**Стоимость** => Поле cost в таблице travels  
**Места для посещения** => Таблица places_to_visit  
**Просмотр чужих записей** => JOIN между travels и users  

```sql
-- После запуска сервера можно проверить наличие тестовых данных в БД
-- Проверка путешествий с координатами
SELECT 
  t.id, 
  t.title, 
  ST_X(t.location::geometry) AS lng, 
  ST_Y(t.location::geometry) AS lat,
  u.username
FROM travels t
JOIN users u ON t.user_id = u.id;

-- Проверка мест с флагом посещения
SELECT 
  p.name,
  p.description,
  p.is_visited,
  t.title AS travel_title
FROM places_to_visit p
JOIN travels t ON p.travel_id = t.id;
```

---

## Графическое представление функционала компонентов

### Главная страница
![image](https://github.com/user-attachments/assets/3cd2e62c-60a4-45be-8ac2-d6b9a4f56079)

### Регистрация пользователя
![image](https://github.com/user-attachments/assets/12201a6e-771e-466e-911c-236103ab3eb4)

### Логин
![image](https://github.com/user-attachments/assets/7baaaadb-c567-4b24-921f-4168b9c3985b)

### Отображение авторизованного пользователя
![image](https://github.com/user-attachments/assets/bbcfb6a4-15e4-4802-8df8-ac34363020a1)

### Детали путешествия с отображением мест
![image](https://github.com/user-attachments/assets/ada1e056-8adf-4df7-ba80-f5aa934ad2c2)

### Создание путешествия
![image](https://github.com/user-attachments/assets/e6e3e1f7-46f8-4f68-b7d6-47cb677162bb)

### Добавление мест
![image](https://github.com/user-attachments/assets/d2bba022-e6b7-42ee-984a-427f79b6a462)
![image](https://github.com/user-attachments/assets/4d3bd0f7-3333-4f17-a12b-5d74166aab80)
![image](https://github.com/user-attachments/assets/346b90a4-c63e-4ae6-be2c-b0287aeecf46)


### Страница путешествий пользователя
![image](https://github.com/user-attachments/assets/db40b2ed-d73e-41f4-9550-42df4f5d5fb0)


