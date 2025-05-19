"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const youtubeController_1 = require("../controllers/youtubeController");
const router = express_1.default.Router();
/**
 * @route   POST /api/youtube/transcript
 * @desc    Получить транскрипцию YouTube видео
 * @access  Public
 */
router.post('/transcript', youtubeController_1.getTranscript);
exports.default = router;
//# sourceMappingURL=youtube.js.map