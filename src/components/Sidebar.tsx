import React from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <ListItem>
            <ListItemText
              primary="La Pizzeria Club"
              secondary={isAuthenticated ? user?.username : 'Guest'}
              primaryTypographyProps={{
                variant: 'h6',
                fontWeight: 'bold',
                color: 'primary',
              }}
            />
          </ListItem>
          <Divider />
        </Box>

        <List>
          <ListItem button onClick={() => handleNavigation('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          {isAuthenticated ? (
            <>
              <ListItem button onClick={() => handleNavigation('/cart')}>
                <ListItemIcon>
                  <CartIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Cart" 
                  secondary={totalItems > 0 ? `${totalItems} items` : undefined}
                />
              </ListItem>

              <ListItem button onClick={() => handleNavigation('/orders')}>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItem>

              <Divider />

              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItem>
            </>
          ) : (
            <ListItem button onClick={() => handleNavigation('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Login / Sign Up" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar; 