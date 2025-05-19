import { TranscriptItem } from '../types';
/**
 * Извлекает идентификатор видео из URL YouTube
 * @param {string} url - URL видео YouTube
 * @returns {string|null} - Идентификатор видео или null, если не удалось извлечь
 */
export declare const extractVideoId: (url?: string) => string | null;
interface EnhancedTranscriptItem extends TranscriptItem {
    generated?: boolean;
}
/**
 * Получает транскрипцию видео по его идентификатору
 * @param {string} videoId - Идентификатор видео YouTube
 * @param {string} [lang] - Код языка для транскрипции (опционально)
 * @param {boolean} [generateIfNotFound=false] - Генерировать субтитры, если не найдены
 * @returns {Promise<Array>} - Массив объектов с транскрипцией
 */
export declare const getTranscriptByVideoId: (videoId: string, lang?: string | null, generateIfNotFound?: boolean) => Promise<EnhancedTranscriptItem[]>;
export {};
