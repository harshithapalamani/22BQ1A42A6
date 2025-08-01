import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import { CustomLogger } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Initialize custom logger for frontend
const logger = new CustomLogger('URL_SHORTENER_FRONTEND');

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    logger.info(`Tab changed to: ${newValue === 0 ? 'URL Shortener' : 'Statistics'}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="URL Shortener" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UrlShortener logger={logger} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Statistics logger={logger} />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;
