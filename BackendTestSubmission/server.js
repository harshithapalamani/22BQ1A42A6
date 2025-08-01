const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
require('dotenv').config();

// Clear require cache for logging middleware to pick up latest changes
delete require.cache[require.resolve('../LoggingMiddleware/index')];

// Import custom logging middleware
const Log = require('../LoggingMiddleware/index');
const { CustomLogger } = require('../LoggingMiddleware/index');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize custom logger
const logger = new CustomLogger({
  enableConsole: true // Enable for development
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.expressMiddleware());

// In-memory storage (in production, use a database)
const urlDatabase = new Map();
const clickStats = new Map();

// Helper function to generate shortcode
function generateShortcode(customCode) {
  if (customCode) {
    // Validate custom shortcode
    if (!/^[a-zA-Z0-9]{1,10}$/.test(customCode)) {
      throw new Error('Custom shortcode must be alphanumeric and 1-10 characters long');
    }
    if (urlDatabase.has(customCode)) {
      throw new Error('Custom shortcode already exists');
    }
    return customCode;
  }
  
  // Generate unique shortcode
  let shortcode;
  do {
    shortcode = nanoid(6);
  } while (urlDatabase.has(shortcode));
  
  return shortcode;
}

// Helper function to check if URL is expired
function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}

// CREATE SHORT URL
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // Validation
    if (!url) {
      await Log('backend', 'error', 'controller', 'Missing URL');
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!validUrl.isWebUri(url)) {
      await Log('backend', 'error', 'controller', 'Invalid URL format');
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (validity && (!Number.isInteger(validity) || validity <= 0)) {
      await Log('backend', 'error', 'controller', 'Invalid validity period');
      return res.status(400).json({ error: 'Validity must be a positive integer (minutes)' });
    }

    // Generate shortcode
    const generatedShortcode = generateShortcode(shortcode);
    
    // Calculate expiry
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + validity);

    // Store URL data
    const urlData = {
      originalUrl: url,
      shortcode: generatedShortcode,
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      clicks: 0
    };

    urlDatabase.set(generatedShortcode, urlData);
    clickStats.set(generatedShortcode, []);

    const shortLink = `http://localhost:${PORT}/${generatedShortcode}`;

    await Log('backend', 'info', 'service', `Short URL created: ${generatedShortcode}`);

    res.status(201).json({
      shortLink,
      expiry: expiryDate.toISOString()
    });

  } catch (error) {
    await Log('backend', 'error', 'handler', 'Error creating short URL');
    
    if (error.message.includes('shortcode')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET URL STATISTICS
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    if (!urlDatabase.has(shortcode)) {
      await Log('backend', 'warn', 'service', 'Shortcode not found');
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = urlDatabase.get(shortcode);
    const clicks = clickStats.get(shortcode) || [];

    const response = {
      shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      totalClicks: urlData.clicks,
      clickData: clicks.map(click => ({
        timestamp: click.timestamp,
        source: click.source || 'direct',
        userAgent: click.userAgent,
        ip: click.ip
      }))
    };

    await Log('backend', 'info', 'service', `Stats retrieved: ${shortcode}`);

    res.json(response);

  } catch (error) {
    await Log('backend', 'error', 'handler', 'Error retrieving statistics');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL SHORT URLS (for frontend listing)
app.get('/shorturls', async (req, res) => {
  try {
    const allUrls = Array.from(urlDatabase.values()).map(urlData => ({
      shortcode: urlData.shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      totalClicks: urlData.clicks,
      shortLink: `http://localhost:${PORT}/${urlData.shortcode}`
    }));

    await Log('backend', 'info', 'service', `All URLs retrieved: ${allUrls.length}`);

    res.json(allUrls);

  } catch (error) {
    await Log('backend', 'error', 'handler', 'Error retrieving all URLs');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REDIRECT TO ORIGINAL URL
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;

    if (!urlDatabase.has(shortcode)) {
      await Log('backend', 'warn', 'handler', 'Shortcode not found');
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = urlDatabase.get(shortcode);

    // Check if expired
    if (isExpired(urlData.expiryDate)) {
      await Log('backend', 'warn', 'handler', 'URL expired');
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Record click
    const clickData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      source: req.get('Referer') || 'direct'
    };

    const clicks = clickStats.get(shortcode) || [];
    clicks.push(clickData);
    clickStats.set(shortcode, clicks);

    // Update click count
    urlData.clicks += 1;
    urlDatabase.set(shortcode, urlData);

    await Log('backend', 'info', 'handler', `Redirect success: ${shortcode}`);

    res.redirect(urlData.originalUrl);

  } catch (error) {
    await Log('backend', 'fatal', 'handler', 'Critical redirect error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  await Log('backend', 'info', 'route', 'Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  await Log('backend', 'info', 'service', `Service started on port ${PORT}`);
  console.log(`URL Shortener service running on http://localhost:${PORT}`);
});
