# YouTube Transcript API

MCP-совместимый сервер для получения транскрипций YouTube видео.

## Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd youtube-transcript-api

# Установка зависимостей
npm install

# Создание файла .env
cp .env.example .env
```

## Запуск

```bash
# Режим разработки
npm run dev

# Режим продакшн
npm start
```

По умолчанию сервер запускается на порту 3000. Вы можете изменить порт, установив переменную окружения PORT в файле .env.

## API Endpoints

### Получение транскрипции видео

**URL**: `/api/youtube/transcript`
**Метод**: `POST`
**Content-Type**: `application/json`

**Тело запроса**:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

или

```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

**Опциональные параметры**:

- `lang`: Код языка для транскрипции (например, "en", "ru", "fr")
- `generateIfNotFound`: Булево значение, указывающее, следует ли генерировать субтитры, если они не найдены (по умолчанию: true)

**Успешный ответ**:

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

**Ошибки**:

- 400 Bad Request: Неверный URL или идентификатор видео
- 404 Not Found: Видео не найдено или для него отсутствуют субтитры (и генерация отключена)
- 500 Internal Server Error: Внутренняя ошибка сервера или ошибка генерации субтитров

## Генерация субтитров

Если для видео не найдены субтитры на YouTube, сервер может автоматически сгенерировать их с помощью распознавания речи. Для этого:

1. Аудио извлекается из видео с помощью ytdl-core
2. Аудио преобразуется в формат WAV с помощью ffmpeg
3. Речь распознается с использованием Whisper API

Чтобы отключить автоматическую генерацию субтитров, установите параметр `generateIfNotFound` в `false`:

```json
{
  "videoId": "dQw4w9WgXcQ",
  "generateIfNotFound": false
}
```

## Примеры использования

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
    lang: 'en', // опционально
    generateIfNotFound: true // опционально
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Лицензия

ISC 