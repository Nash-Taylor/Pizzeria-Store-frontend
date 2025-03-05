import { Dialog, DialogTitle, DialogContent, Box, TextField, Button, Tabs, Tab, IconButton, Grid, Alert, CircularProgress } from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [authTab, setAuthTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({
    phone: '',
    address: '',
  });
  const { login, register, error, isLoading, clearError } = useAuth();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)';
    }
    return '';
  };

  const validateAddress = (address: string) => {
    if (address.length < 5) {
      return 'Address must be at least 5 characters long';
    }
    return '';
  };

  const handleAuthTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setAuthTab(newValue);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    });
    setFormErrors({
      phone: '',
      address: '',
    });
    clearError();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate fields as user types
    if (name === 'phone') {
      setFormErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }));
    } else if (name === 'address') {
      setFormErrors(prev => ({
        ...prev,
        address: validateAddress(value)
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // Only close the modal if login was successful
      if (!error) {
        onClose();
      }
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const phoneError = validatePhone(formData.phone);
    const addressError = validateAddress(formData.address);
    
    if (phoneError || addressError || formData.password !== formData.confirmPassword) {
      setFormErrors({
        phone: phoneError,
        address: addressError,
      });
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });
      onClose();
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative',
        }
      }}
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
      keepMounted={false}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500',
          '&:hover': {
            color: 'grey.700',
          }
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle 
        id="auth-modal-title"
        sx={{ textAlign: 'center', pb: 0 }}
      >
        <Tabs
          value={authTab}
          onChange={handleAuthTabChange}
          centered
          aria-label="Authentication tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#e65100',
            },
            '& .Mui-selected': {
              color: '#e65100',
            },
          }}
        >
          <Tab 
            label="Login" 
            aria-label="Login tab"
          />
          <Tab 
            label="Sign Up" 
            aria-label="Sign up tab"
          />
        </Tabs>
      </DialogTitle>

      <DialogContent id="auth-modal-description">
        {error && (
          <Alert 
            severity="error" 
            role="alert"
            sx={{ 
              mt: 2,
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }
            }}
          >
            {error === 'No account found with this email address' && (
              <>
                <span>No account found with this email address.</span>
                <Button 
                  size="small" 
                  onClick={() => setAuthTab(1)}
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'underline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  Sign up instead
                </Button>
              </>
            )}
            {error === 'Incorrect password' && (
              <>
                <span>Incorrect password.</span>
                <Button 
                  size="small" 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, password: '' }));
                    clearError();
                  }}
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'underline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  Try again
                </Button>
              </>
            )}
            {error !== 'No account found with this email address' && 
             error !== 'Incorrect password' && 
             error}
          </Alert>
        )}

        {authTab === 0 ? (
          // Login Form
          <Box 
            component="form" 
            onSubmit={handleLogin} 
            sx={{ mt: 3 }}
            role="form"
            aria-label="Login form"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  error={error === 'No account found with this email address'}
                  helperText={error === 'No account found with this email address' ? 'Please check your email or sign up' : ''}
                  aria-invalid={error === 'No account found with this email address'}
                  aria-describedby={error === 'No account found with this email address' ? 'email-error' : undefined}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  error={error === 'Incorrect password'}
                  helperText={error === 'Incorrect password' ? 'Please check your password' : ''}
                  aria-invalid={error === 'Incorrect password'}
                  aria-describedby={error === 'Incorrect password' ? 'password-error' : undefined}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  aria-label={isLoading ? 'Logging in...' : 'Login'}
                  sx={{ 
                    backgroundColor: '#e65100',
                    '&:hover': { backgroundColor: '#f57c00' },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Sign Up Form
          <Box 
            component="form" 
            onSubmit={handleRegister} 
            sx={{ mt: 3 }}
            role="form"
            aria-label="Sign up form"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  placeholder="+1234567890 or 1234567890"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  variant="outlined"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading || !!formErrors.phone || !!formErrors.address}
                  sx={{ 
                    backgroundColor: '#e65100',
                    '&:hover': { backgroundColor: '#f57c00' },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 