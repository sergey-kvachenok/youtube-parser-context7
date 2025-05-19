"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubtitles = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const whisper_node_1 = require("whisper-node");
// Устанавливаем путь к ffmpeg
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
// Временная директория для хранения аудиофайлов
const TEMP_DIR = path_1.default.join(__dirname, '../../temp');
// Создаем временную директорию, если она не существует
if (!fs_1.default.existsSync(TEMP_DIR)) {
    fs_1.default.mkdirSync(TEMP_DIR, { recursive: true });
}
/**
 * Загружает аудио из YouTube видео
 * @param {string} videoId - ID видео YouTube
 * @returns {Promise<string>} - Путь к аудиофайлу
 */
const downloadAudio = async (videoId) => {
    return new Promise((resolve, reject) => {
        const outputPath = path_1.default.join(TEMP_DIR, `${videoId}.wav`);
        // Проверяем, существует ли уже файл
        if (fs_1.default.existsSync(outputPath)) {
            return resolve(outputPath);
        }
        const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
        // Загружаем только аудио поток
        const stream = (0, ytdl_core_1.default)(videoURL, {
            quality: 'lowestaudio',
            filter: 'audioonly'
        });
        // Преобразуем в WAV формат для распознавания речи
        (0, fluent_ffmpeg_1.default)(stream)
            .audioFrequency(16000)
            .audioChannels(1)
            .format('wav')
            .on('error', (err) => {
            console.error('Ошибка при обработке аудио:', err);
            reject(err);
        })
            .on('end', () => {
            console.log(`Аудио сохранено: ${outputPath}`);
            resolve(outputPath);
        })
            .save(outputPath);
    });
};
/**
 * Распознает речь из аудиофайла и создает субтитры
 * @param {string} audioPath - Путь к аудиофайлу
 * @param {string} lang - Код языка для распознавания (опционально)
 * @returns {Promise<Array>} - Массив объектов с транскрипцией
 */
const generateTranscript = async (audioPath, lang = 'auto') => {
    try {
        console.log(`Начинаю распознавание речи для файла: ${audioPath}`);
        // Инициализируем Whisper для распознавания речи
        const whisper = new whisper_node_1.Whisper('base');
        // Распознаем речь
        const result = await whisper.transcribe(audioPath, {
            language: lang === 'auto' ? null : lang,
            output_format: 'json'
        });
        console.log('Распознавание завершено');
        // Преобразуем результат в формат транскрипции
        const transcript = result.segments.map((segment) => ({
            text: segment.text.trim(),
            start: segment.start,
            duration: segment.end - segment.start
        }));
        return transcript;
    }
    catch (error) {
        console.error('Ошибка при распознавании речи:', error);
        throw new Error('Ошибка при генерации субтитров');
    }
};
/**
 * Генерирует субтитры для YouTube видео
 * @param {string} videoId - ID видео YouTube
 * @param {string} lang - Код языка для распознавания (опционально)
 * @returns {Promise<Array>} - Массив объектов с транскрипцией
 */
const generateSubtitles = async (videoId, lang = 'auto') => {
    try {
        // Загружаем аудио
        const audioPath = await downloadAudio(videoId);
        // Генерируем транскрипцию
        const transcript = await generateTranscript(audioPath, lang);
        return transcript;
    }
    catch (error) {
        console.error(`Ошибка при генерации субтитров для видео ${videoId}:`, error);
        throw error;
    }
};
exports.generateSubtitles = generateSubtitles;
//# sourceMappingURL=speechToTextUtils.js.map