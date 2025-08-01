# URL Shortener Backend Service

A microservice for URL shortening with custom logging middleware.

## Features

- Create short URLs with custom or auto-generated shortcodes
- Set custom validity periods (default: 30 minutes)
- Track click statistics and analytics
- Proper error handling and HTTP status codes
- Custom logging middleware integration

## API Endpoints

### Create Short URL

- **POST** `/shorturls`
- **Request Body:**

```json
{
  "url": "https://example.com/very/long/url",
  "validity": 30,
  "shortcode": "abcd1"
}
```

- **Response (201):**

```json
{
  "shortLink": "http://localhost:5000/abcd1",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### Get URL Statistics

- **GET** `/shorturls/:shortcode`
- **Response:** Click statistics and URL details

### Get All URLs

- **GET** `/shorturls`
- **Response:** List of all shortened URLs

### Redirect

- **GET** `/:shortcode`
- **Response:** Redirects to original URL

## Installation & Setup

```bash
npm install
npm start
```

## Development

```bash
npm run dev
```

Server runs on http://localhost:5000
