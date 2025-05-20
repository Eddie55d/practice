# Проект Блог

## Задачи

➔ Необходимо создать web-страницу.  
➔ Создать функцию регистрации/входа пользователя  
➔ Создать функцию написания своего поста  
➔ Создать функцию подписки на пользователей  
➔ Создать генерацию списка на основе подписок на пользователей  
➔ Создать функцию просмотра публичных постов  
➔ Создать функцию скрытого поста “только по запросу”  
➔ Создать функцию редактирования/удаления поста  
➔ Предоставить возможность пользователю добавлять и сортировать посты по тегам  
➔ Добавить возможность комментировать посты  
➔ Опишите подробный анализ по выполненной задаче (не менее 7 пунктов)  
➔ Опишите рекомендации по устранению выявленных ошибок в ходе выполнения задачи  
Ответом на задание будет ссылка на репозиторий GitHub, где хранится Ваша  

---

Установка пакетов для сервера  
Перейдите в директорию server и выполните следующие команды:  

```sh
npm init -y
npm install express pg bcrypt jsonwebtoken cors body-parser express-validator
```

express: веб-фреймворк для Node.js.  
pg: клиент для работы с PostgreSQL.  
bcrypt: библиотека для хеширования паролей.  
jsonwebtoken: библиотека для работы с JWT.  
cors: middleware для разрешения кросс-доменных запросов.  
body-parser: middleware для парсинга тела запросов.  
express-validator: библиотека для валидации данных.  

## Скачать реакт и зависимости

```sh
npx create-react-app .
npm install axios react-bootstrap bootstrap react-router-dom
```

axios: библиотека для выполнения HTTP-запросов.  
react-bootstrap: компоненты Bootstrap для React.  
bootstrap: CSS-фреймворк для стилизации.  
react-router-dom: библиотека для маршрутизации в React.  

---

## Структура проекта

blog/  
├── client/                      # Frontend (React)  
│   ├── node_modules/            # Зависимости  
│   ├── public/                  # Статические файлы  
│   │   ├── favicon.ico          # Иконка сайта  
│   │   └── index.html           # Главный HTML-файл  
│   ├── src/                     # Исходный код  
│   │   ├── components/          # Компоненты  
│   │   │   ├── Auth/            # Компоненты аутентификации  
│   │   │   │   ├── Login.js     # Страница входа  
│   │   │   │   └── Register.js  # Страница регистрации  
│   │   │   ├── Posts/           # Компоненты постов  
│   │   │   │   ├── CreatePost.js # Создание поста  
│   │   │   │   ├── PostDetail.js # Детали поста  
│   │   │   │   └── PostList.js   # Список постов  
│   │   │   ├── Navbar.js        # Навигационная панель  
│   │   │   └── Subscription.js  # Компонент подписок  
│   │   ├── App.css              # Стили приложения  
│   │   ├── App.js               # Главный компонент  
│   │   ├── App.test.js          # Тесты  
│   │   ├── index.css            # Глобальные стили  
│   │   ├── index.js             # Точка входа  
│   │   ├── logo.svg             # Логотип  
│   │   ├── reportWebVitals.js   # Метрики производительности  
│   │   └── setupTests.js        # Настройка тестов  
│   ├── .gitignore               # Игнорируемые файлы Git  
│   ├── package-lock.json        # Точные версии зависимостей  
│   ├── package.json             # Зависимости и скрипты  
│   └── README.md                # Описание проекта  
│  
├── server/                      # Backend (Node.js + Express)  
│   ├── node_modules/            # Зависимости  
│   ├── authMiddleware.js        # Middleware аутентификации  
│   ├── authRoutes.js            # Роуты аутентификации  
│   ├── createTables.js          # Скрипт создания таблиц БД  
│   ├── DBconnect.js             # Подключение к БД  
│   ├── index.js                 # Главный файл сервера  
│   ├── initDb.js                # Инициализация БД  
│   ├── package-lock.json        # Точные версии зависимостей  
│   ├── package.json             # Зависимости и скрипты  
│   ├── postRoutes.js            # Роуты постов  
│   ├── subscriptionRoutes.js    # Роуты подписок  
│   ├── .env                     # Переменные окружения  
│   ├── .gitignore               # Игнорируемые файлы Git  
│   └── menu.md                  # Документация API  

---

## Запуск приложения

перед запуском добавить в корень проекта файл .env

```text
JWT_SECRET='your_jwt_secret' // ваш jwt_secret
```
установить PostgresQL и создать учётную запись. Пример пользователя можно взять из файла DBconnect.js

Запуск сервера
В директории server выполните:

```sh
node index.js
```

Запуск клиента
В директории client выполните:

```sh
npm start
```

---

## **Анализ реализации проекта Blog**

---

## **Общая структура проекта**

Проект разделен на две основные части:

- **Frontend**: React-приложение (в папке `client`).
- **Backend**: Node.js + Express API (в папке `server`).

---

## **Анализ выполнения задач**

### **1. Создание веб-страницы (Frontend)**

**Реализация**:

- Используется **React** с функциональными компонентами.
- **React Router** для навигации между страницами.
- **Основные страницы**:
  - `Login.js` / `Register.js` — аутентификация.
  - `PostList.js` — лента постов.
  - `CreatePost.js` — форма создания поста.
  - `PostDetail.js` — просмотр поста с комментариями.
- **Стилизация**: CSS-модули и Bootstrap-подобные компоненты.

---

### **2. Функция регистрации/входа (Auth)**

**Реализация**:

- **Frontend**:
  - Формы в `Login.js` и `Register.js`.
  - Отправка данных на `/auth/login` и `/auth/register`.
- **Backend** (`authRoutes.js`):
  - Хеширование паролей (`bcryptjs`).
  - Генерация JWT-токена.
  - Сохранение пользователя в БД.
- **Проверка токена**: Middleware (`authMiddleware.js`).

---

### **3. Функция написания поста**

**Реализация**:

- **Frontend**: `CreatePost.js` — форма с полями `title`, `content`, `tags`.
- **Backend** (`postRoutes.js`):
  - POST-запрос на `/posts`.
  - Сохранение в таблицу `posts`.
  - Обработка тегов (связь many-to-many с таблицей `tags`).

---

### **4. Функция подписки на пользователей**

**Реализация**:

- **Frontend**: `Subscription.js` — кнопка подписки.
- **Backend** (`subscriptionRoutes.js`):
  - POST-запрос на `/subscribe`.
  - Сохранение в таблицу `subscriptions`.

---

### **5. Лента по подпискам**

**Реализация**:

- **Backend**: SQL-запрос с `JOIN` таблиц `posts` и `subscriptions`.
- **Frontend**: Фильтрация постов в `PostList.js`.

---

### **6. Просмотр публичных постов**

**Реализация**:

- **Backend**: Запрос к `/posts` с фильтром `is_private = false`.
- **Frontend**: Отображение в `PostList.js`.

---

### **7. Редактирование/удаление поста**

**Реализация**:

- **Backend**:
  - Проверка авторства (`user_id`).
  - DELETE и PUT запросы.
- **Frontend**: Кнопки в `PostDetail.js`.

---

### **8. Комментирование постов**

**Реализация**:

- **Frontend**: Форма в `PostDetail.js`.
- **Backend**:
  - POST-запрос на `/posts/:id/comments`.
  - Сохранение в таблицу `comments`.

---

## **Работа с базой данных**

**Схема БД**:

- Таблицы: `users`, `posts`, `comments`, `tags`, `subscriptions`.
- **SQL-запросы**: Параметризованные (защита от инъекций).

---

## **Безопасность**

**Плюсы**:

- Хеширование паролей.
- JWT-аутентификация.
- Проверка авторства для редактирования.

**Минусы**:

- Токен в `localStorage`.
- Нет rate-limiting для API.
- Секреты в коде (например, JWT-ключ).

---

## **Итоговый вывод**

**Что сделано**:

- Все базовые функции работают.
- Чистая архитектура (разделение frontend/backend).
- Использование технологий (React, JWT).

**Что требует доработки**:

1. **Безопасность**:
   - Куки вместо `localStorage`.
   - Валидация данных на фронтенде.
2. **UX**:
   - Пагинация и сортировка постов.
3. **Расширение функционала**:
   - Загрузка изображений.
---

## Пример стартового окна приложения после запуска клиентской и серверной части 
![image](https://github.com/user-attachments/assets/2c6a09e2-3445-4b2c-8fd6-6becd7774ce7)

## Компонент Login.js
![image](https://github.com/user-attachments/assets/dd24489a-4fca-4fbd-9c1a-cdb09ca38cca)

## Компонент Register.js
![image](https://github.com/user-attachments/assets/65edc279-7a13-4824-8afc-84430c8f51a2)

## Функционал приветсвия пользователя после логина или регистрации
![image](https://github.com/user-attachments/assets/ee1c4af1-b816-49cd-8ef1-40f9e89eb58f)

![image](https://github.com/user-attachments/assets/78d63247-7915-4596-8e46-49f814f96d9c)

## Компонент PostDetail.js  
![image](https://github.com/user-attachments/assets/6514c044-6485-4c71-96bd-40df0c78ddf0)

## Кнопка подписки и отписки  
![image](https://github.com/user-attachments/assets/3548aba4-ef75-4301-9901-d8683c6c2656)

![image](https://github.com/user-attachments/assets/4a34d8f7-a84b-42d8-a0ce-e60b2895d186)

## Если пользователь является владельцем поста, то появляются кнопки редактирования и удаления  
![image](https://github.com/user-attachments/assets/4b6aef04-d809-413a-8a1b-78a056c1e9ad)

## Компонент создания поста
![image](https://github.com/user-attachments/assets/2e2dfddd-4e76-4d73-bf97-994b97d612d2)

## Приватность поста выставляется при его создании  
![image](https://github.com/user-attachments/assets/7bd0506a-8c6d-4298-8b08-fa4d8b627952)

## Форма редактирования поста
![image](https://github.com/user-attachments/assets/2d6cbba5-aebc-4224-9abf-b9382bc88551)

## Кнопка переключения списка постов с публичных на приватные (только по подписке)
![image](https://github.com/user-attachments/assets/67681211-a65d-42cb-ab71-35623d1d9df4)

## Подтверждение удаления поста
![image](https://github.com/user-attachments/assets/57d51730-8501-4ba4-b1be-8e2eddb721b4)
