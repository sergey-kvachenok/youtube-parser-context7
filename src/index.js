const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const youtubeRoutes = require('./routes/youtube');

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/api/youtube', youtubeRoutes);

// Базовый маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Transcript API сервер работает' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 