import { YoutubeTranscript } from 'youtube-transcript';
import { TranscriptItem } from '../types';
import { unlink } from 'fs/promises';
import { Whisper } from 'whisper-node';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import youtubeDl from 'youtube-dl-exec';

ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Maps common language names to their ISO codes
 * @param {string} language - Language name or code
 * @returns {string} - Language ISO code
 */
export const getLanguageCode = (language: string | null): string | null => {
  if (!language) return null;
  
  // If already a language code (2-3 characters), return as is
  if (/^[a-z]{2,3}(-[A-Z]{2})?$/.test(language)) {
    return language.toLowerCase();
  }
  
  // Map of common language names to ISO codes
  const languageMap: Record<string, string> = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh',
    'arabic': 'ar',
    'hindi': 'hi',
    'turkish': 'tr',
    'dutch': 'nl',
    'swedish': 'sv',
    'polish': 'pl',
    'vietnamese': 'vi',
    'thai': 'th',
    'indonesian': 'id',
    'greek': 'el',
    'romanian': 'ro',
    'czech': 'cs',
    'hungarian': 'hu',
    'ukrainian': 'uk',
    'hebrew': 'he',
    'finnish': 'fi',
    'danish': 'da',
    'norwegian': 'no'
  };
  
  // Try to find the language code
  const normalizedLanguage = language.toLowerCase();
  return languageMap[normalizedLanguage] || null;
};

/**
 * Extracts video ID from YouTube URL
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Video ID or null if extraction failed
 */
export const extractVideoId = (url?: string): string | null => {
  if (!url) return null;

  // Supported URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID

  try {
    let videoId: string | null = null;
    
    // Check if input string is already a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    const urlObj = new URL(url);
    
    if (urlObj.hostname === 'youtu.be') {
      // Format: https://youtu.be/VIDEO_ID
      videoId = urlObj.pathname.substring(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/v/')) {
        // Formats: https://www.youtube.com/embed/VIDEO_ID or https://www.youtube.com/v/VIDEO_ID
        videoId = urlObj.pathname.split('/')[2];
      }
    }
    
    // Check that video ID has the correct format (usually 11 characters)
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

// Interface for YouTube transcript item
interface YoutubeTranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

async function downloadAudio(videoId: string, outputPath: string): Promise<void> {
  try {
    await youtubeDl(`https://www.youtube.com/watch?v=${videoId}`, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error('Failed to download audio');
  }
}

async function generateCaptions(videoId: string): Promise<TranscriptItem[]> {
  const audioPath = `./temp_${videoId}.mp3`;
  
  try {
    // Download audio
    await downloadAudio(videoId, audioPath);
    
    // Generate transcription
    const whisper = new Whisper('base');
    const result = await whisper.transcribe(audioPath);
    
    // Convert Whisper output to TranscriptItem format
    const transcript: TranscriptItem[] = result.map((segment: any) => ({
      text: segment.text.trim(),
      start: segment.start,
      duration: segment.end - segment.start,
      generated: true
    }));
    
    return transcript;
  } catch (error) {
    console.error('Error generating captions:', error);
    throw new Error('Failed to generate captions');
  } finally {
    // Cleanup: remove temporary audio file
    try {
      await unlink(audioPath);
    } catch (error) {
      console.error('Error removing temporary file:', error);
    }
  }
}

/**
 * Gets video transcript by its ID
 * @param {string} videoId - YouTube video ID
 * @param {string} [lang] - Language code or name for transcript (optional)
 * @param {boolean} [generateIfNotFound=false] - Generate captions if not found
 * @returns {Promise<Array>} - Array of transcript objects
 */
export async function getTranscriptByVideoId(
  videoId: string,
  lang?: string,
  generateIfNotFound: boolean = true
): Promise<TranscriptItem[]> {
  try {
    let options: { lang?: string } = {};
    if (lang) {
      // Convert language name to code if needed
      const langCode = getLanguageCode(lang);
      if (langCode) {
        options.lang = langCode;
      }
    }
    
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, options);
      
      if (!transcript || transcript.length === 0) {
        throw new Error('No captions found');
      }
      
      // Format transcript into structured format
      return transcript.map((item: YoutubeTranscriptItem) => ({
        text: item.text,
        start: item.offset / 1000, // Convert to seconds
        duration: item.duration / 1000, // Convert to seconds
      }));
    } catch (error: any) {
      // Check if error is about language not available
      if (error.message && error.message.includes('No transcripts are available in')) {
        console.log(`Requested language not available for video ${videoId}, trying to fetch available language...`);
        
        // Try to extract available languages from error message
        const availableLanguagesMatch = error.message.match(/Available languages: (.*)/);
        if (availableLanguagesMatch && availableLanguagesMatch[1]) {
          const availableLanguages = availableLanguagesMatch[1].split(', ');
          if (availableLanguages.length > 0) {
            console.log(`Found available languages: ${availableLanguages.join(', ')}`);
            
            // Try to fetch transcript with the first available language
            const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: availableLanguages[0] });
            
            if (transcript && transcript.length > 0) {
              console.log(`Successfully fetched transcript in ${availableLanguages[0]} language`);
              
              // Format transcript into structured format
              return transcript.map((item: YoutubeTranscriptItem) => ({
                text: item.text,
                start: item.offset / 1000, // Convert to seconds
                duration: item.duration / 1000, // Convert to seconds
              }));
            }
          }
        }
        
        // If we couldn't extract available languages or fetch transcript, throw the original error
        throw error;
      }
      
      // If it's not a language error, re-throw
      throw error;
    }
    
  } catch (error: any) {
    console.error(`Error getting transcript for video ${videoId}:`, error);
    
    // If captions not found and generation option is enabled, try to generate them
    if (error.message === 'No captions found' || 
        error.message.includes('Could not find any transcripts')) {
      
      if (generateIfNotFound) {
        console.log(`No captions found for video ${videoId}, trying to generate...`);
        try {
          return await generateCaptions(videoId);
        } catch (genError) {
          console.error(`Failed to generate captions for video ${videoId}:`, genError);
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