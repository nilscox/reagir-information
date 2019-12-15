import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import primary from '@material-ui/core/colors/amber';
import Toolbar from '@material-ui/core/Toolbar';
import { Switch as RouterSwitch, Route } from 'react-router';

import { useUserContext, UserProvider } from 'src/utils/UserContext';

import Reactions from './pages/Reactions';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import Informations from './pages/InformationsList';
import Information from './pages/Information';

import AppBar from './components/AppBar';
import Drawer, { drawerWidth } from './components/Drawer';
import Loader from './components/Loader';

const theme = createMuiTheme({
  palette: {
    primary,
    secondary: { main: '#446' },
  },
});

const Switch: React.FC = () => (
  <RouterSwitch>
    <Route path="/" exact component={Informations} />
    <Route path="/information/:id" component={Information} />
    <Route path="/reactions" component={Reactions} />
    <Route path="/bookmarks" component={Bookmarks} />
    <Route path="/settings" component={Settings} />
  </RouterSwitch>
);

const useStyles = makeStyles(theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
}));

const Dashboard: React.FC = () => {
  const classes = useStyles({});
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = useUserContext();

  const handleDrawerToggle = () => setMobileOpen(open => !open);

  return (
    <ThemeProvider theme={theme}>
      <UserProvider value={{ user, setUser }}>
        <div style={{ height: '100vh' }}>

          <CssBaseline />

          <AppBar handleDrawerToggle={handleDrawerToggle} />

          <Drawer mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

          <main className={classes.content}>

            <Toolbar />

            { user === undefined
              ? <Loader />
              : <Switch />
            }

          </main>

        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default Dashboard;
