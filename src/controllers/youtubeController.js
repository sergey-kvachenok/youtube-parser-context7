const { getTranscriptByVideoId, extractVideoId } = require('../utils/youtubeUtils');

/**
 * @desc    Получить транскрипцию YouTube видео
 * @route   POST /api/youtube/transcript
 * @access  Public
 */
const getTranscript = async (req, res) => {
  try {
    const { url, videoId, lang, generateIfNotFound = true } = req.body;
    
    if (!url && !videoId) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо предоставить URL видео или идентификатор видео'
      });
    }
    
    // Извлекаем videoId из URL или используем предоставленный videoId
    const targetVideoId = videoId || extractVideoId(url);
    
    if (!targetVideoId) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат URL или идентификатора видео'
      });
    }
    
    // Получаем транскрипцию
    const transcript = await getTranscriptByVideoId(targetVideoId, lang, generateIfNotFound);
    
    return res.status(200).json({
      success: true,
      data: {
        videoId: targetVideoId,
        transcript,
        generated: transcript.generated || false
      }
    });
    
  } catch (error) {
    console.error('Ошибка при получении транскрипции:', error);
    
    // Обработка специфических ошибок
    if (error.message === 'No captions found') {
      return res.status(404).json({
        success: false,
        error: 'Для этого видео не найдены субтитры'
      });
    }
    
    if (error.message === 'Failed to generate captions') {
      return res.status(500).json({
        success: false,
        error: 'Не удалось сгенерировать субтитры для видео'
      });
    }
    
    if (error.message === 'Video unavailable') {
      return res.status(404).json({
        success: false,
        error: 'Видео недоступно или не существует'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Ошибка при получении транскрипции',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTranscript
}; 