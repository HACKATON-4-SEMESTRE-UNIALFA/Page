import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge, // Importando Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  CorporateFare as InstitutionIcon,
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { IToken } from '../../interfaces/token';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import axios from 'axios';

interface IProps {
  children: React.ReactNode;
  isAdmin?: boolean; // Adicionada flag para verificar se o usuário é admin
}

const drawerWidth = 240;

export const LayoutDashboard = ({ children }: IProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calendarMenuAnchor, setCalendarMenuAnchor] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken;

  // Exemplo: Variável para o número de notificações
  const fetchNotificationCount = useCallback(async () => {
    axios
      .get(import.meta.env.VITE_URL + '/notificacoes/visualizadas/' + token.usuario.id, {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      })
      .then((response) => {
        setNotificationCount(response.data.notificacao);
      })
      .catch((error) => {
        console.error('fetchNotificationCount error:', error);
      });
  }, [token.accessToken, token.usuario.id]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  // Itens do menu padrão
  const menuItems = [
    {text: 'Notificações', path: '/notificacoes', icon: <NotificationsActiveRoundedIcon />},
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Reservas', path: '/reservas', icon: <EventRoundedIcon /> },
    { text: 'Ambientes', path: '/ambientes', icon: <InstitutionIcon /> },
  ];

  // Itens do menu exclusivo para admin
  const adminMenuItems = [
    {
      text: 'Calendário',
      icon: <CalendarIcon />,
      children: [
        { text: 'Whitelist', path: '/calendario/whitelist' },
        { text: 'Blacklist', path: '/calendario/blacklist' },
      ],
    },
    { text: 'Usuários', path: '/usuarios', icon: <PersonIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCalendarMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarMenuAnchor(event.currentTarget);
  };

  const handleCalendarMenuClose = () => {
    setCalendarMenuAnchor(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', zIndex: 0 }}>
      <List sx={{ flexGrow: 1 }}>
        {/* Itens padrão */}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemIcon>
                {item.text === 'Notificações' ? (
                  <Badge badgeContent={notificationCount} color="warning">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Itens de Admin */}
        {token.usuario.isAdmin == true &&
          adminMenuItems.map((item) =>
            item.children ? (
              // Dropdown para "Calendário"
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={handleCalendarMenuOpen}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ) : (
              // Itens normais de Admin
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: '1rem' }}>
            Gerenciador de Ambientes - UniAlfa
          </Typography>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/"
            onClick={() => localStorage.clear()}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, zIndex: 0 }}>
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                height: '100%',
              },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                position: 'relative',
                height: '100%',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100%',
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ pl: 3, pr: 3 }}>{children}</Box>
        </Box>
      </Box>

      {/* Dropdown menu for Calendar */}
      <Menu
        anchorEl={calendarMenuAnchor}
        open={Boolean(calendarMenuAnchor)}
        onClose={handleCalendarMenuClose}
        keepMounted
      >
        {adminMenuItems[0].children?.map((item) => (
          <MenuItem
            key={item.text}
            component={RouterLink}
            to={item.path}
            onClick={handleCalendarMenuClose}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
