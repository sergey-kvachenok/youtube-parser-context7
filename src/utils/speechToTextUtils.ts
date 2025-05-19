import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Whisper } from 'whisper-node';
import { TranscriptItem, WhisperResult, WhisperSegment } from '../types';
import { getLanguageCode } from './youtubeUtils';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Temporary directory for audio files
const TEMP_DIR = path.join(__dirname, '../../temp');

// Create temporary directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Downloads audio from YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Path to audio file
 */
const downloadAudio = async (videoId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(TEMP_DIR, `${videoId}.wav`);
    
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      return resolve(outputPath);
    }
    
    const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Download only audio stream
    const stream = ytdl(videoURL, { 
      quality: 'lowestaudio',
      filter: 'audioonly' 
    });
    
    // Convert to WAV format for speech recognition
    ffmpeg(stream)
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .on('error', (err: Error) => {
        console.error('Error processing audio:', err);
        reject(err);
      })
      .on('end', () => {
        console.log(`Audio saved: ${outputPath}`);
        resolve(outputPath);
      })
      .save(outputPath);
  });
};

/**
 * Recognizes speech from audio file and creates captions
 * @param {string} audioPath - Path to audio file
 * @param {string} lang - Language code for recognition (optional)
 * @returns {Promise<Array>} - Array of transcript objects
 */
const generateTranscript = async (audioPath: string, lang: string = 'auto'): Promise<TranscriptItem[]> => {
  try {
    console.log(`Starting speech recognition for file: ${audioPath}`);
    
    // Initialize Whisper for speech recognition
    const whisper = new Whisper('base');
    
    // Get language code if it's not 'auto'
    const langCode = lang === 'auto' ? null : getLanguageCode(lang) || null;
    
    // Recognize speech
    const result = await whisper.transcribe(audioPath, {
      language: langCode,
      output_format: 'json'
    }) as WhisperResult;
    
    console.log('Recognition completed');
    
    // Convert result to transcript format
    const transcript = result.segments.map((segment: WhisperSegment) => ({
      text: segment.text.trim(),
      start: segment.start,
      duration: segment.end - segment.start
    }));
    
    return transcript;
  } catch (error) {
    console.error('Error during speech recognition:', error);
    throw new Error('Error generating captions');
  }
};

/**
 * Generates captions for YouTube video
 * @param {string} videoId - YouTube video ID
 * @param {string} lang - Language code for recognition (optional)
 * @returns {Promise<Array>} - Array of transcript objects
 */
export const generateSubtitles = async (videoId: string, lang: string = 'auto'): Promise<TranscriptItem[]> => {
  try {
    // Download audio
    const audioPath = await downloadAudio(videoId);
    
    // Generate transcript
    const transcript = await generateTranscript(audioPath, lang);
    
    return transcript;
  } catch (error) {
    console.error(`Error generating captions for video ${videoId}:`, error);
    throw error;
  }
}; 