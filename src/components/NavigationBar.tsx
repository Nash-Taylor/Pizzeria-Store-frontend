import { AppBar, Toolbar, Button, Box, useScrollTrigger, useTheme, useMediaQuery, Menu, MenuItem, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';

interface NavigationBarProps {
  onSectionChange: (section: string) => void;
  onAuthClick: () => void;
}

const NavigationBar = ({ onSectionChange, onAuthClick }: NavigationBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeSection, setActiveSection] = useState('home');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      onSectionChange(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          if (top <= scrollPosition && bottom > scrollPosition) {
            setActiveSection(section.id);
            onSectionChange(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: trigger ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
        boxShadow: trigger ? 1 : 0,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: isMobile ? 1 : 2 }}>
          {sections.map((section) => (
            <Button
              key={section.id}
              color="inherit"
              onClick={() => scrollToSection(section.id)}
              sx={{
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: activeSection === section.id ? '100%' : '0%',
                  height: '2px',
                  backgroundColor: '#e65100',
                  transition: 'width 0.3s ease-in-out',
                },
                '&:hover::after': {
                  width: '100%',
                },
                color: activeSection === section.id ? '#e65100' : 'white',
                fontWeight: activeSection === section.id ? 600 : 400,
                fontSize: isMobile ? '0.8rem' : '1rem',
              }}
            >
              {section.label}
            </Button>
          ))}
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={handleMenu}
                startIcon={<AccountCircle />}
                sx={{
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#e65100',
                    transition: 'width 0.3s ease-in-out',
                  },
                  '&:hover::after': {
                    width: '100%',
                  },
                  color: 'white',
                  fontWeight: 400,
                  fontSize: isMobile ? '0.8rem' : '1rem',
                }}
              >
                {user?.username}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    '& .MuiMenuItem-root': {
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">Email: {user?.email}</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">Phone: {user?.phone}</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">Address: {user?.address}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography variant="body2" color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={onAuthClick}
              sx={{
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#e65100',
                  transition: 'width 0.3s ease-in-out',
                },
                '&:hover::after': {
                  width: '100%',
                },
                color: 'white',
                fontWeight: 400,
                fontSize: isMobile ? '0.8rem' : '1rem',
              }}
            >
              Login/Signup
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar; 