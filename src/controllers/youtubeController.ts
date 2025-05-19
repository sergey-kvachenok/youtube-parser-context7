import { Response, NextFunction } from 'express';
import { getTranscriptByVideoId, extractVideoId } from '../utils/youtubeUtils';
import { TypedRequestBody, TranscriptRequest, TranscriptItem } from '../types';

// Extend TranscriptItem interface to support generated flag
interface EnhancedTranscriptItem extends TranscriptItem {
  generated?: boolean;
}

/**
 * @desc    Get YouTube video transcript
 * @route   POST /api/youtube/transcript
 * @access  Public
 */
export const getTranscript = async (
  req: TypedRequestBody<TranscriptRequest>, 
  res: Response, 
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { url, videoId, lang, generateIfNotFound = true } = req.body;
    
    if (!url && !videoId) {
      return res.status(400).json({
        success: false,
        error: 'You must provide a video URL or video ID'
      });
    }
    
    // Extract videoId from URL or use provided videoId
    const targetVideoId = videoId || extractVideoId(url);
    
    if (!targetVideoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid video URL or video ID format'
      });
    }
    
    // Get transcript
    const transcript = await getTranscriptByVideoId(targetVideoId, lang, generateIfNotFound);
    
    // Check if subtitles were generated
    const isGenerated = transcript.some((item: EnhancedTranscriptItem) => item.generated === true);
    
    return res.status(200).json({
      success: true,
      data: {
        videoId: targetVideoId,
        transcript,
        generated: isGenerated
      }
    });
    
  } catch (error: any) {
    console.error('Error getting transcript:', error);
    
    // Handle specific errors
    if (error.message === 'No captions found') {
      return res.status(404).json({
        success: false,
        error: 'No captions found for this video'
      });
    }
    
    if (error.message === 'Failed to generate captions') {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate captions for the video'
      });
    }
    
    if (error.message === 'Video unavailable') {
      return res.status(404).json({
        success: false,
        error: 'Video is unavailable or does not exist'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error retrieving transcript',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 