import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SecurityIcon from '@mui/icons-material/Security';
import LockResetIcon from '@mui/icons-material/LockReset';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { BRANDING } from '../../config/env';
import { notificationsService } from '../../services/notifications.service';
import { NotificationItem } from '../../types';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  // User menu anchor
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  // Notification menu anchor
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    let isMounted = true;
    notificationsService
      .getNotifications()
      .then((items) => {
        if (isMounted) {
          setNotifications(items);
          setUnreadCount(items.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const getNavItems = (): NavItem[] => {
    if (role === 'ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { label: 'User Accounts', path: '/admin/users', icon: <PeopleIcon /> },
        { label: 'Student Directory', path: '/admin/students', icon: <SchoolIcon /> },
        { label: 'Faculty Directory', path: '/admin/faculty', icon: <PersonOutlineIcon /> },
        { label: 'Academic Structure', path: '/admin/academic', icon: <AccountTreeIcon /> },
        { label: 'Examinations', path: '/admin/examinations', icon: <AssignmentIcon /> },
        { label: 'Results & Release', path: '/admin/results', icon: <AssessmentIcon /> },
        { label: 'Reports & Export', path: '/admin/reports', icon: <BarChartIcon /> },
        { label: 'System Audit Logs', path: '/admin/audit-logs', icon: <SecurityIcon /> },
        { label: 'Profile & Sessions', path: '/admin/profile', icon: <PersonOutlineIcon /> },
      ];
    }
    if (role === 'FACULTY') {
      return [
        { label: 'Dashboard', path: '/faculty/dashboard', icon: <DashboardIcon /> },
        { label: 'Create Examination', path: '/faculty/examinations/create', icon: <AddCircleOutlineIcon /> },
        { label: 'My Examinations', path: '/faculty/examinations', icon: <AssignmentIcon /> },
        { label: 'Import Questions', path: '/faculty/import', icon: <UploadFileIcon /> },
        { label: 'Manual Evaluation', path: '/faculty/evaluations', icon: <RateReviewIcon /> },
        { label: 'Exam Results', path: '/faculty/results', icon: <AssessmentIcon /> },
        { label: 'Reports & Export', path: '/faculty/reports', icon: <BarChartIcon /> },
        { label: 'Profile', path: '/faculty/profile', icon: <PersonOutlineIcon /> },
      ];
    }
    // STUDENT
    return [
      { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardIcon /> },
      { label: 'Available Exams', path: '/student/examinations', icon: <AssignmentIcon /> },
      { label: 'Exam History', path: '/student/history', icon: <HistoryEduIcon /> },
      { label: 'Results & Grades', path: '/student/results', icon: <AssessmentIcon /> },
      { label: 'My Profile', path: '/student/profile', icon: <PersonOutlineIcon /> },
      { label: 'Change Password', path: '/change-password', icon: <LockResetIcon /> },
    ];
  };

  const navItems = getNavItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0D152F', color: '#FFFFFF' }}>
      {/* Top Brand */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1 : 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {collapsed ? (
            <Box component="img" src="/favicon.svg" alt="ExaNova" sx={{ width: 32, height: 32 }} />
          ) : (
            <Logo variant="light" size="small" showTagline />
          )}
        </Box>
        {!isMobile && !collapsed && (
          <IconButton onClick={() => setCollapsed(true)} sx={{ color: '#94A3B8' }} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Role Pill Banner */}
      {!collapsed && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: BRANDING.colors.accent,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                {user?.username}
              </Typography>
              <Chip
                label={role}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: role === 'ADMIN' ? '#EF4444' : role === 'FACULTY' ? '#6246EA' : '#00A896',
                  color: '#FFFFFF',
                  mt: 0.2,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.6 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: collapsed ? 1.5 : 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: active ? 'rgba(0, 168, 150, 0.18)' : 'transparent',
                    color: active ? '#2DD4BF' : '#94A3B8',
                    border: active ? '1px solid rgba(0, 168, 150, 0.35)' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.07)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: active ? '#2DD4BF' : '#94A3B8',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Bottom Logout Button */}
      <Box sx={{ p: 1.5 }}>
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <Button
            fullWidth
            variant="outlined"
            onClick={logout}
            startIcon={!collapsed && <LogoutIcon />}
            sx={{
              color: '#F87171',
              borderColor: 'rgba(248, 113, 113, 0.3)',
              minWidth: collapsed ? 0 : undefined,
              px: collapsed ? 1 : 2,
              py: 0.8,
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#F87171',
              },
            }}
          >
            {collapsed ? <LogoutIcon fontSize="small" /> : 'Sign Out'}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BRANDING.colors.background }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${currentWidth}px)` },
          ml: { md: `${currentWidth}px` },
          bgcolor: '#FFFFFF',
          color: BRANDING.colors.textPrimary,
          borderBottom: `1px solid ${BRANDING.colors.border}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          {/* Mobile hamburger or desktop collapse toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={isMobile ? handleDrawerToggle : () => setCollapsed(!collapsed)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumb / Title */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.85rem' }}>
              <Typography color="inherit" sx={{ fontWeight: 500 }}>
                {role ? `${role.charAt(0) + role.slice(1).toLowerCase()} Portal` : 'Portal'}
              </Typography>
              <Typography color="text.primary" sx={{ fontWeight: 600 }}>
                {navItems.find((n) => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Notifications Icon */}
          <Tooltip title="Notifications">
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ mr: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Popover Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{ sx: { width: 340, maxHeight: 420, p: 0, borderRadius: 2 } }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BRANDING.colors.border}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Notifications ({unreadCount})
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', p: 0 }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No notifications
                  </Typography>
                </Box>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <ListItem
                    key={notif.id}
                    sx={{
                      p: 1.5,
                      bgcolor: notif.isRead ? 'transparent' : 'rgba(0, 168, 150, 0.05)',
                      borderBottom: `1px solid ${BRANDING.colors.border}`,
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        {notif.message}
                      </Typography>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </Menu>

          {/* User Profile Avatar & Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                p: 0.6,
                borderRadius: 2,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: BRANDING.colors.primary,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {role}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{ sx: { width: 220, borderRadius: 2, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BRANDING.colors.border}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  navigate(`/${role?.toLowerCase()}/profile`);
                }}
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  navigate('/change-password');
                }}
                sx={{ py: 1 }}
              >
                <ListItemIcon>
                  <LockResetIcon fontSize="small" />
                </ListItemIcon>
                Change Password
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserMenuAnchor(null);
                  logout();
                }}
                sx={{ color: '#EF4444', py: 1 }}
              >
                <ListItemIcon sx={{ color: '#EF4444' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: currentWidth }, flexShrink: { md: 0 } }}
        aria-label="dashboard navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${currentWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
