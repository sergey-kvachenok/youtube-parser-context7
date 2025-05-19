const express = require('express');
const router = express.Router();
const { getTranscript } = require('../controllers/youtubeController');

/**
 * @route   POST /api/youtube/transcript
 * @desc    Получить транскрипцию YouTube видео
 * @access  Public
 */
router.post('/transcript', getTranscript);

module.exports = router; 