# YouTube Transcript API

MCP-compatible server for retrieving YouTube video transcripts.

## Installation

```bash
# Clone repository
git clone <repository-url>
cd youtube-transcript-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Running

```bash
# Development mode
npm run dev

# Production mode
npm start
```

By default, the server runs on port 3000. You can change the port by setting the PORT environment variable in the .env file.

## API Endpoints

### Get Video Transcript

**URL**: `/api/youtube/transcript`
**Method**: `POST`
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

or

```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

**Optional Parameters**:

- `lang`: Language code for transcript (e.g., "en", "ru", "fr")
- `generateIfNotFound`: Boolean indicating whether to generate captions if not found (default: true)

**Successful Response**:

```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "transcript": [
      {
        "text": "Never gonna give you up",
        "start": 15.5,
        "duration": 2.3
      },
      {
        "text": "Never gonna let you down",
        "start": 17.8,
        "duration": 2.1
      }
      // ...
    ],
    "generated": false
  }
}
```

**Errors**:

- 400 Bad Request: Invalid URL or video ID
- 404 Not Found: Video not found or no captions available (and generation disabled)
- 500 Internal Server Error: Server error or caption generation error

## Caption Generation

If captions are not found on YouTube, the server can automatically generate them using speech recognition. For this:

1. Audio is extracted from the video using ytdl-core
2. Audio is converted to WAV format using ffmpeg
3. Speech is recognized using Whisper API

To disable automatic caption generation, set the `generateIfNotFound` parameter to `false`:

```json
{
  "videoId": "dQw4w9WgXcQ",
  "generateIfNotFound": false
}
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/youtube/transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### JavaScript (Fetch API)

```javascript
fetch('http://localhost:3000/api/youtube/transcript', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    videoId: 'dQw4w9WgXcQ',
    lang: 'en', // optional
    generateIfNotFound: true // optional
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## License

ISC 