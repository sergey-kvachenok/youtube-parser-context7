import { YoutubeTranscript } from 'youtube-transcript';
import { generateSubtitles } from './speechToTextUtils';
import { TranscriptItem } from '../types';

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

// Extend TranscriptItem interface to support generated flag
interface EnhancedTranscriptItem extends TranscriptItem {
  generated?: boolean;
}

// Interface for YouTube transcript item
interface YoutubeTranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Gets video transcript by its ID
 * @param {string} videoId - YouTube video ID
 * @param {string} [lang] - Language code for transcript (optional)
 * @param {boolean} [generateIfNotFound=false] - Generate captions if not found
 * @returns {Promise<Array>} - Array of transcript objects
 */
export const getTranscriptByVideoId = async (
  videoId: string, 
  lang: string | null = null, 
  generateIfNotFound: boolean = true
): Promise<EnhancedTranscriptItem[]> => {
  try {
    let options: { lang?: string } = {};
    if (lang) {
      options.lang = lang;
    }
    
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
    console.error(`Error getting transcript for video ${videoId}:`, error);
    
    // If captions not found and generation option is enabled, try to generate them
    if (error.message === 'No captions found' || 
        error.message.includes('Could not find any transcripts')) {
      
      if (generateIfNotFound) {
        console.log(`No captions found for video ${videoId}, trying to generate...`);
        try {
          // Use default language if not specified
          const generatedTranscript = await generateSubtitles(videoId, lang || 'auto');
          console.log(`Captions successfully generated for video ${videoId}`);
          
          // Add flag that captions were generated
          return generatedTranscript.map((item: TranscriptItem) => ({
            ...item,
            generated: true
          }));
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