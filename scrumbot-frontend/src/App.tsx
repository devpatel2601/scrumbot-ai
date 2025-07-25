// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link as RouterLink } from 'react-router-dom';

import { CssBaseline, GlobalStyles, useTheme } from '@mui/material';
import { Box, AppBar, Toolbar, Typography, Container, Link, Tabs, Tab } from '@mui/material';

import Dashboard from './pages/Dashboard';
import LogDetails from './pages/LogDetails';
import InsightsPanel from './components/InsightsPanel';
import SprintReport from './components/SprintReport';
import TrendChart from './components/TrendChart';

function App() {
  const theme = useTheme();

  // For tab navigation state:
  const [tabIndex, setTabIndex] = React.useState(0);

  // Map route paths to tab indices
  const pathToIndex: Record<'/' | '/insights' | '/report' | '/trends', number> = {
    '/': 0,
    '/insights': 1,
    '/report': 2,
    '/trends': 3,
  };

  // Sync tab selection with current URL path
  React.useEffect(() => {
    const currentPath = window.location.pathname as '/' | '/insights' | '/report' | '/trends';
    setTabIndex(pathToIndex[currentPath] ?? 0);
  }, [window.location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Router>
      {/* CssBaseline to normalize styles across browsers */}
      <CssBaseline />

      {/* Optional global styles with theme */}
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: theme.palette.background.default,
            margin: 0,
            fontFamily: theme.typography.fontFamily,
          },
          a: {
            textDecoration: 'none',
          },
        }}
      />

      {/* AppBar with tabs navigation */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ScrumBot AI
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            aria-label="navigation tabs"
          >
            <Tab label="Dashboard" component={RouterLink} to="/" />
            <Tab label="Insights" component={RouterLink} to="/insights" />
            <Tab label="Sprint Report" component={RouterLink} to="/report" />
            <Tab label="Trends" component={RouterLink} to="/trends" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Main content container */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs/:id" element={<LogDetails />} />
          <Route path="/insights" element={<InsightsPanel />} />
          <Route path="/report" element={<SprintReport />} />
          <Route path="/trends" element={<TrendChart />} />
        </Routes>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ScrumBot AI
        </Typography>
      </Box>
    </Router>
  );
}

export default App;
