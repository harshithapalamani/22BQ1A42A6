import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Grid,
    Typography,
    Alert,
    Box,
    Card,
    CardContent,
    IconButton,
    Chip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    ContentCopy as CopyIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { urlService } from '../services/api';

const UrlShortener = ({ logger }) => {
    const [urls, setUrls] = useState([
        { id: 1, url: '', validity: 30, shortcode: '', result: null, loading: false, error: null }
    ]);

    const addUrlField = () => {
        if (urls.length < 5) {
            const newId = Math.max(...urls.map(u => u.id)) + 1;
            setUrls([...urls, {
                id: newId,
                url: '',
                validity: 30,
                shortcode: '',
                result: null,
                loading: false,
                error: null
            }]);
            logger.info(`Added new URL field. Total fields: ${urls.length + 1}`);
        }
    };

    const removeUrlField = (id) => {
        if (urls.length > 1) {
            setUrls(urls.filter(u => u.id !== id));
            logger.info(`Removed URL field. Total fields: ${urls.length - 1}`);
        }
    };

    const updateUrl = (id, field, value) => {
        setUrls(urls.map(u =>
            u.id === id ? { ...u, [field]: value, error: null } : u
        ));
    };

    const validateForm = (urlData) => {
        const errors = [];

        if (!urlData.url.trim()) {
            errors.push('URL is required');
        } else if (!urlService.isValidUrl(urlData.url)) {
            errors.push('Invalid URL format');
        }

        if (urlData.validity && (!Number.isInteger(Number(urlData.validity)) || Number(urlData.validity) <= 0)) {
            errors.push('Validity must be a positive integer');
        }

        if (urlData.shortcode && !/^[a-zA-Z0-9]{1,10}$/.test(urlData.shortcode)) {
            errors.push('Shortcode must be alphanumeric and 1-10 characters long');
        }

        return errors;
    };

    const shortenUrl = async (id) => {
        const urlData = urls.find(u => u.id === id);

        // Client-side validation
        const validationErrors = validateForm(urlData);
        if (validationErrors.length > 0) {
            setUrls(urls.map(u =>
                u.id === id ? { ...u, error: validationErrors.join(', ') } : u
            ));
            logger.error('URL validation failed', { errors: validationErrors, url: urlData.url });
            return;
        }

        // Set loading state
        setUrls(urls.map(u =>
            u.id === id ? { ...u, loading: true, error: null } : u
        ));

        try {
            const requestData = {
                url: urlData.url,
                validity: Number(urlData.validity) || 30,
                ...(urlData.shortcode && { shortcode: urlData.shortcode })
            };

            logger.info('Creating short URL', { requestData });

            const result = await urlService.createShortUrl(requestData);

            setUrls(urls.map(u =>
                u.id === id ? { ...u, loading: false, result, error: null } : u
            ));

            logger.info('Short URL created successfully', { shortLink: result.shortLink });

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to create short URL';
            setUrls(urls.map(u =>
                u.id === id ? { ...u, loading: false, error: errorMessage } : u
            ));

            logger.error('Failed to create short URL', {
                error: errorMessage,
                url: urlData.url,
                statusCode: error.response?.status
            });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        logger.info('Short URL copied to clipboard', { url: text });
    };

    const formatExpiryDate = (expiry) => {
        return new Date(expiry).toLocaleString();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                URL Shortener
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Create up to 5 short URLs simultaneously. Enter your long URLs below and optionally customize the validity period and shortcode.
            </Typography>

            {urls.map((urlData, index) => (
                <Paper key={urlData.id} sx={{ p: 3, mb: 3 }} elevation={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            URL #{index + 1}
                        </Typography>
                        {urls.length > 1 && (
                            <IconButton
                                onClick={() => removeUrlField(urlData.id)}
                                color="error"
                                size="small"
                            >
                                <RemoveIcon />
                            </IconButton>
                        )}
                    </Box>

                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <TextField
                                fullWidth
                                label="Long URL"
                                placeholder="https://example.com/very/long/url"
                                value={urlData.url}
                                onChange={(e) => updateUrl(urlData.id, 'url', e.target.value)}
                                error={!!urlData.error && urlData.error.includes('URL')}
                                helperText={urlData.error && urlData.error.includes('URL') ? urlData.error : ''}
                            />
                        </Grid>

                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Validity (minutes)"
                                type="number"
                                value={urlData.validity}
                                onChange={(e) => updateUrl(urlData.id, 'validity', e.target.value)}
                                error={!!urlData.error && urlData.error.includes('Validity')}
                                helperText="Default: 30 minutes"
                            />
                        </Grid>

                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Custom Shortcode (optional)"
                                placeholder="abcd1"
                                value={urlData.shortcode}
                                onChange={(e) => updateUrl(urlData.id, 'shortcode', e.target.value)}
                                error={!!urlData.error && urlData.error.includes('Shortcode')}
                                helperText="Alphanumeric, 1-10 characters"
                            />
                        </Grid>

                        <Grid xs={12}>
                            <Button
                                variant="contained"
                                onClick={() => shortenUrl(urlData.id)}
                                disabled={urlData.loading}
                                startIcon={<LinkIcon />}
                                size="large"
                            >
                                {urlData.loading ? 'Creating...' : 'Shorten URL'}
                            </Button>
                        </Grid>
                    </Grid>

                    {urlData.error && !urlData.error.includes('URL') && !urlData.error.includes('Validity') && !urlData.error.includes('Shortcode') && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {urlData.error}
                        </Alert>
                    )}

                    {urlData.result && (
                        <Card sx={{ mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    ✅ Short URL Created!
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="body1" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                                        {urlData.result.shortLink}
                                    </Typography>
                                    <IconButton
                                        onClick={() => copyToClipboard(urlData.result.shortLink)}
                                        size="small"
                                        sx={{ color: 'inherit' }}
                                    >
                                        <CopyIcon />
                                    </IconButton>
                                </Box>
                                <Chip
                                    label={`Expires: ${formatExpiryDate(urlData.result.expiry)}`}
                                    size="small"
                                    sx={{ bgcolor: 'success.dark', color: 'white' }}
                                />
                            </CardContent>
                        </Card>
                    )}
                </Paper>
            ))}

            {urls.length < 5 && (
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addUrlField}
                    size="large"
                    sx={{ mb: 2 }}
                >
                    Add Another URL ({urls.length}/5)
                </Button>
            )}
        </Box>
    );
};

export default UrlShortener;
