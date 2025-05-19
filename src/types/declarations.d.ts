declare module 'fluent-ffmpeg';
declare module 'whisper-node' {
  export class Whisper {
    constructor(model: string);
    transcribe(audioPath: string, options?: {
      language?: string | null;
      output_format?: string;
    }): Promise<any>;
  }
}
declare module 'youtube-transcript' {
  export class YoutubeTranscript {
    static fetchTranscript(videoId: string, options?: {
      lang?: string;
    }): Promise<Array<{
      text: string;
      offset: number;
      duration: number;
    }>>;
  }
}
declare module 'youtube-transcript-api';
declare module '@ffmpeg-installer/ffmpeg' {
  const path: string;
  export default { path };
} 