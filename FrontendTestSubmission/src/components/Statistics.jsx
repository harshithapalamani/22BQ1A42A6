import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    Launch as LaunchIcon,
    ExpandMore as ExpandMoreIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { urlService } from '../services/api';

const Statistics = ({ logger }) => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        loadAllUrls();
    }, []);

    const loadAllUrls = async () => {
        setLoading(true);
        setError(null);

        try {
            logger.info('Loading all URLs for statistics');
            const data = await urlService.getAllUrls();
            setUrls(data);
            logger.info(`Loaded ${data.length} URLs for statistics`);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to load URLs';
            setError(errorMessage);
            logger.error('Failed to load URLs', { error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const loadUrlDetails = async (shortcode) => {
        try {
            logger.info('Loading detailed statistics', { shortcode });
            const data = await urlService.getUrlStats(shortcode);
            setSelectedUrl(data);
            setDetailsOpen(true);
            logger.info('Detailed statistics loaded', { shortcode, totalClicks: data.totalClicks });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to load URL details';
            setError(errorMessage);
            logger.error('Failed to load URL details', { error: errorMessage, shortcode });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        logger.info('URL copied to clipboard', { url: text });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusChip = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const isExpired = now > expiry;

        return (
            <Chip
                label={isExpired ? 'Expired' : 'Active'}
                color={isExpired ? 'error' : 'success'}
                size="small"
            />
        );
    };

    const getTimeRemaining = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry - now;

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h remaining`;
        if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
        return `${minutes}m remaining`;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Statistics Dashboard
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadAllUrls}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {urls.length === 0 && !loading && !error && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No shortened URLs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create some short URLs first to see statistics here.
                    </Typography>
                </Paper>
            )}

            {urls.length > 0 && (
                <Grid container spacing={3}>
                    {/* Summary Cards */}
                    <Grid xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Total URLs
                                </Typography>
                                <Typography variant="h3">
                                    {urls.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="secondary">
                                    Total Clicks
                                </Typography>
                                <Typography variant="h3">
                                    {urls.reduce((sum, url) => sum + url.totalClicks, 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="success.main">
                                    Active URLs
                                </Typography>
                                <Typography variant="h3">
                                    {urls.filter(url => new Date() <= new Date(url.expiryDate)).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* URLs List */}
                    <Grid xs={12}>
                        <Paper>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    All Shortened URLs
                                </Typography>
                            </Box>

                            {urls.map((url, index) => (
                                <Accordion key={url.shortcode}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                            <Typography variant="subtitle1" sx={{ flexGrow: 1, minWidth: 0 }}>
                                                {url.shortLink}
                                            </Typography>
                                            <Chip
                                                label={`${url.totalClicks} clicks`}
                                                size="small"
                                                color="primary"
                                            />
                                            {getStatusChip(url.expiryDate)}
                                        </Box>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid xs={12}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Original URL:
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ flexGrow: 1, wordBreak: 'break-all' }}
                                                    >
                                                        {url.originalUrl}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => copyToClipboard(url.originalUrl)}
                                                    >
                                                        <CopyIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => window.open(url.originalUrl, '_blank')}
                                                    >
                                                        <LaunchIcon />
                                                    </IconButton>
                                                </Box>
                                            </Grid>

                                            <Grid xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Created: {formatDate(url.createdAt)}
                                                </Typography>
                                            </Grid>

                                            <Grid xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Expires: {formatDate(url.expiryDate)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ({getTimeRemaining(url.expiryDate)})
                                                </Typography>
                                            </Grid>

                                            <Grid xs={12}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => loadUrlDetails(url.shortcode)}
                                                    size="small"
                                                >
                                                    View Detailed Stats
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Detailed Statistics Dialog */}
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detailed Statistics: {selectedUrl?.shortcode}
                </DialogTitle>

                <DialogContent>
                    {selectedUrl && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Original URL:
                                    </Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                        {selectedUrl.originalUrl}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Total Clicks:
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {selectedUrl.totalClicks}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Created:
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(selectedUrl.createdAt)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {selectedUrl.clickData && selectedUrl.clickData.length > 0 ? (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Click History
                                    </Typography>
                                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Timestamp</TableCell>
                                                    <TableCell>Source</TableCell>
                                                    <TableCell>User Agent</TableCell>
                                                    <TableCell>IP Address</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedUrl.clickData.map((click, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {formatDate(click.timestamp)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={click.source}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {click.userAgent || 'Unknown'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {click.ip || 'Unknown'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ) : (
                                <Alert severity="info">
                                    No clicks recorded yet for this URL.
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Statistics;
