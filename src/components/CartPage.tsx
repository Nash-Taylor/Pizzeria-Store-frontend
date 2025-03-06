import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removePizza, totalItems, totalPrice, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPizzas, setExpandedPizzas] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (items.length > 0) {
      // Any necessary side effects when items change
    }
  }, [items]);

  const handleQuantityChange = async (pizzaId: string, change: number) => {
    const item = items.find(i => i.id === pizzaId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        try {
          await updateQuantity(pizzaId, newQuantity);
        } catch (error) {
          console.error('Failed to update quantity:', error);
        }
      }
    }
  };

  const handleRemovePizza = async (pizzaId: string) => {
    try {
      await removePizza(pizzaId);
    } catch (error) {
      console.error('Failed to remove pizza:', error);
    }
  };

  const togglePizzaExpansion = (pizzaId: string) => {
    setExpandedPizzas(prev => 
      prev.includes(pizzaId) 
        ? prev.filter(id => id !== pizzaId)
        : [...prev, pizzaId]
    );
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setShowLoginRequired(true);
      return;
    }

    try {
      setIsProcessing(true);
      const orderId = `ORDER-${Date.now()}`; // Generate a single orderId for all items

      // Create order for each ingredient in each pizza
      for (const pizza of items) {
        console.log('Processing pizza:', pizza);
        
        // Use a simple numeric ID for cartItemId
        const cartItemId = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
        
        // Add crust
        if (pizza.crust) {
          console.log('Adding crust to order:', pizza.crust);
          await apiService.createOrder({
            orderId,
            cartItemId,
            ingredientId: pizza.crust.id
          });
        }

        // Add sauces
        for (const sauce of pizza.sauces) {
          console.log('Adding sauce to order:', sauce);
          await apiService.createOrder({
            orderId,
            cartItemId,
            ingredientId: sauce.id
          });
        }

        // Add toppings
        for (const topping of pizza.toppings) {
          console.log('Adding topping to order:', topping);
          await apiService.createOrder({
            orderId,
            cartItemId,
            ingredientId: topping.id
          });
        }
      }
      
      await clearCart();
      setOrderSuccess(true);
      setNotification({
        open: true,
        message: 'Your pizza has been ordered successfully! It will reach your address shortly.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to place order:', error);
      setNotification({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#f8f9fa',
        py: 4,
        px: 2,
      }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Shopping Cart
              </Typography>
              {totalItems > 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/builder')}
                  startIcon={<AddIcon />}
                  sx={{ ml: 2 }}
                >
                  Build Another Pizza
                </Button>
              )}
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/builder')}
                  sx={{ mt: 2 }}
                >
                  Build a Pizza
                </Button>
              </Box>
            ) : (
              <>
                <List>
                  {items.map((pizza) => (
                    <React.Fragment key={pizza.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="h6">{pizza.crust?.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Sauces: {pizza.sauces.map(s => s.name).join(', ')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Toppings: {pizza.toppings.map(t => t.name).join(', ')}
                              </Typography>
                            </Box>
                          }
                          secondary={`$${Number(pizza.totalPrice).toFixed(2)}`}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(pizza.id, -1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 1 }}>{pizza.quantity}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(pizza.id, 1)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleRemovePizza(pizza.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">
                      Total Items: {totalItems}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      Total: ${Number(totalPrice).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Container>

        <Dialog
          open={showLoginRequired}
          onClose={() => setShowLoginRequired(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Login Required</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Please log in or create an account to place your order.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLoginRequired(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowLoginRequired(false);
                navigate('/');
              }} 
              variant="contained" 
              color="primary"
            >
              Go to Login
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={orderSuccess}
          onClose={() => setOrderSuccess(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Order Placed Successfully!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Your order has been placed successfully. Thank you for choosing La Pizzeria Club!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOrderSuccess(false);
                navigate('/orders');
              }} 
              color="primary"
            >
              View Orders
            </Button>
            <Button 
              onClick={() => {
                setOrderSuccess(false);
                navigate('/');
              }} 
              color="primary"
            >
              Continue Shopping
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#f8f9fa',
        py: 4,
        px: 2,
      }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Shopping Cart
              </Typography>
              {totalItems > 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/builder')}
                  startIcon={<AddIcon />}
                  sx={{ ml: 2 }}
                >
                  Build Another Pizza
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Please log in to view your cart
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      bgcolor: '#f8f9fa',
      py: 4,
      px: 2,
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Shopping Cart
            </Typography>
            {totalItems > 0 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/builder')}
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
              >
                Build Another Pizza
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/builder')}
                sx={{ mt: 2 }}
              >
                Build a Pizza
              </Button>
            </Box>
          ) : (
            <>
              <List>
                {items.map((pizza) => (
                  <React.Fragment key={pizza.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="h6">{pizza.crust?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Sauces: {pizza.sauces.map(s => s.name).join(', ')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Toppings: {pizza.toppings.map(t => t.name).join(', ')}
                            </Typography>
                          </Box>
                        }
                        secondary={`$${Number(pizza.totalPrice).toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(pizza.id, -1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{pizza.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(pizza.id, 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleRemovePizza(pizza.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">
                    Total Items: {totalItems}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    Total: ${Number(totalPrice).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Container>

      <Dialog
        open={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Please log in or create an account to place your order.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginRequired(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowLoginRequired(false);
              navigate('/');
            }} 
            variant="contained" 
            color="primary"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={orderSuccess}
        onClose={() => setOrderSuccess(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Placed Successfully!</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your order has been placed successfully. Thank you for choosing La Pizzeria Club!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOrderSuccess(false);
              navigate('/orders');
            }} 
            color="primary"
          >
            View Orders
          </Button>
          <Button 
            onClick={() => {
              setOrderSuccess(false);
              navigate('/');
            }} 
            color="primary"
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage; 