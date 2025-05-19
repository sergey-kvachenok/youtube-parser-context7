"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const youtube_1 = __importDefault(require("./routes/youtube"));
// Загрузка переменных окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Маршруты
app.use('/api/youtube', youtube_1.default);
// Базовый маршрут для проверки работоспособности
app.get('/', (_req, res) => {
    res.json({ message: 'YouTube Transcript API сервер работает' });
});
// Обработка ошибок
app.use((err, _req, res, _next) => {
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
//# sourceMappingURL=index.js.map