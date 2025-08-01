# URL Shortener Frontend

A responsive React frontend application for the URL Shortener service built with Vite and Material-UI.

## Features

- **URL Shortener Page**: Create up to 5 short URLs simultaneously
- **Statistics Dashboard**: View comprehensive analytics for all shortened URLs
- **Custom Logging**: Frontend logging using localStorage (no console.log)
- **Material-UI Design**: Clean, responsive interface
- **Real-time Validation**: Client-side form validation
- **Click Analytics**: Detailed click tracking and statistics

## Technology Stack

- React 19
- Vite (Build tool)
- Material-UI (UI components)
- Axios (HTTP client)
- Custom logging middleware

## Installation & Setup

```bash
npm install
npm run dev
```

The application will run on http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### URL Shortener Page

- Support for up to 5 concurrent URL submissions
- Input fields for:
  - Long URL (required)
  - Validity period in minutes (optional, default: 30)
  - Custom shortcode (optional, alphanumeric 1-10 chars)
- Real-time client-side validation
- Copy to clipboard functionality
- Visual feedback for successful creation

### Statistics Page

- Dashboard with summary cards (Total URLs, Total Clicks, Active URLs)
- Expandable list of all shortened URLs
- Detailed statistics modal with click history
- Real-time status indicators (Active/Expired)
- Time remaining calculations
- Click analytics with timestamp, source, and user agent data

## API Integration

The frontend integrates with the backend microservice running on http://localhost:5000

### API Endpoints Used:

- `POST /shorturls` - Create short URL
- `GET /shorturls` - Get all URLs
- `GET /shorturls/:shortcode` - Get detailed statistics

## Custom Logging

The application uses a custom logging system that:

- Stores logs in localStorage (no console.log usage)
- Tracks user interactions and API calls
- Maintains log history with timestamps
- Provides different log levels (info, error, warn, debug)

## Architecture

```
src/
├── components/
│   ├── UrlShortener.jsx    # Main URL creation component
│   └── Statistics.jsx      # Statistics dashboard
├── services/
│   └── api.js             # API service layer
├── utils/
│   └── logger.js          # Custom logging utility
└── App.jsx                # Main application component
```

## Usage

1. **Creating Short URLs**:

   - Navigate to URL Shortener tab
   - Enter your long URL
   - Optionally set validity period and custom shortcode
   - Click "Shorten URL"
   - Copy the generated short URL

2. **Viewing Statistics**:
   - Navigate to Statistics tab
   - View summary dashboard
   - Expand individual URLs for details
   - Click "View Detailed Stats" for comprehensive analytics

## Error Handling

The application provides comprehensive error handling for:

- Invalid URL formats
- Network errors
- Server-side validation failures
- Expired URLs
- Duplicate shortcodes

## Responsive Design

The interface is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

Built with Material-UI's responsive grid system and components.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
