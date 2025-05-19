const { YoutubeTranscript } = require('youtube-transcript');
const { generateSubtitles } = require('./speechToTextUtils');

/**
 * Извлекает идентификатор видео из URL YouTube
 * @param {string} url - URL видео YouTube
 * @returns {string|null} - Идентификатор видео или null, если не удалось извлечь
 */
const extractVideoId = (url) => {
  if (!url) return null;

  // Поддерживаемые форматы URL:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID

  try {
    let videoId = null;
    
    // Проверяем, является ли входная строка уже идентификатором видео
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    const urlObj = new URL(url);
    
    if (urlObj.hostname === 'youtu.be') {
      // Формат: https://youtu.be/VIDEO_ID
      videoId = urlObj.pathname.substring(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        // Формат: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/v/')) {
        // Форматы: https://www.youtube.com/embed/VIDEO_ID или https://www.youtube.com/v/VIDEO_ID
        videoId = urlObj.pathname.split('/')[2];
      }
    }
    
    // Проверяем, что ID видео имеет правильный формат (обычно 11 символов)
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при извлечении ID видео:', error);
    return null;
  }
};

/**
 * Получает транскрипцию видео по его идентификатору
 * @param {string} videoId - Идентификатор видео YouTube
 * @param {string} [lang] - Код языка для транскрипции (опционально)
 * @param {boolean} [generateIfNotFound=false] - Генерировать субтитры, если не найдены
 * @returns {Promise<Array>} - Массив объектов с транскрипцией
 */
const getTranscriptByVideoId = async (videoId, lang = null, generateIfNotFound = true) => {
  try {
    let options = {};
    if (lang) {
      options.lang = lang;
    }
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, options);
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No captions found');
    }
    
    // Форматируем транскрипцию в структурированный формат
    return transcript.map(item => ({
      text: item.text,
      start: item.offset / 1000, // Конвертируем в секунды
      duration: item.duration / 1000, // Конвертируем в секунды
    }));
    
  } catch (error) {
    console.error(`Ошибка при получении транскрипции для видео ${videoId}:`, error);
    
    // Если субтитры не найдены и включена опция генерации, пытаемся сгенерировать их
    if (error.message === 'No captions found' || 
        error.message.includes('Could not find any transcripts')) {
      
      if (generateIfNotFound) {
        console.log(`Субтитры не найдены для видео ${videoId}, пытаюсь сгенерировать...`);
        try {
          // Используем язык по умолчанию, если не указан
          const generatedTranscript = await generateSubtitles(videoId, lang || 'auto');
          console.log(`Субтитры успешно сгенерированы для видео ${videoId}`);
          return generatedTranscript;
        } catch (genError) {
          console.error(`Не удалось сгенерировать субтитры для видео ${videoId}:`, genError);
          throw new Error('Failed to generate captions');
        }
      } else {
        throw new Error('No captions found');
      }
    }
    
    if (error.message.includes('Video unavailable')) {
      throw new Error('Video unavailable');
    }
    
    throw error;
  }
};

module.exports = {
  extractVideoId,
  getTranscriptByVideoId
}; 