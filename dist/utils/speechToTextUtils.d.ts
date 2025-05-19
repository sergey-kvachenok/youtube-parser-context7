import { TranscriptItem } from '../types';
/**
 * Генерирует субтитры для YouTube видео
 * @param {string} videoId - ID видео YouTube
 * @param {string} lang - Код языка для распознавания (опционально)
 * @returns {Promise<Array>} - Массив объектов с транскрипцией
 */
export declare const generateSubtitles: (videoId: string, lang?: string) => Promise<TranscriptItem[]>;
